import { execSync, spawn } from 'child_process';
import * as commandExists from 'command-exists';

// 添加 Node.js 全局变量声明
declare const process: NodeJS.Process;

export interface HdcDevice {
  connectKey: string;
  connectionType: 'USB' | 'TCP';
  status: 'Connected' | 'Disconnected';
  deviceName?: string;
}

export interface HdcAppInfo {
  bundleName: string;
  version: string;
  label: string;
  debuggable: boolean;
}

export interface DeviceInfo {
  name: string;
  brand: string;
  model: string;
  version: string;
  apiVersion: string;
  cpuArch: string;
  resolution: string;
  ipAddress: string;
  battery: number;
  temperature: number;
}

export interface UIOperationResult {
  success: boolean;
  message: string;
  x?: number;
  y?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  text?: string;
}

export class HdcWrapper {
  private hdcPath: string;

  constructor() {
    this.hdcPath = this.findHdcPath();
  }

  private findHdcPath(): string {
    try {
      // 尝试从环境变量中查找 hdc
      const result = execSync('which hdc', { encoding: 'utf8' });
      return result.trim();
    } catch {
      // 尝试常见路径
      const commonPaths = [
        '/usr/local/bin/hdc',
        '/opt/command-line-tools/sdk/default/openharmony/toolchains/hdc',
        process.env.HM_SDK_HOME ? `${process.env.HM_SDK_HOME}/openharmony/toolchains/hdc` : '',
      ].filter(Boolean);

      for (const path of commonPaths) {
        try {
          if (commandExists.sync(path)) {
            return path;
          }
        } catch {
          continue;
        }
      }

      throw new Error('HDC not found. Please install OpenHarmony SDK and add hdc to PATH');
    }
  }

  private executeCommand(command: string, deviceId?: string): string {
    const fullCommand = deviceId ? `${this.hdcPath} -t ${deviceId} ${command}` : `${this.hdcPath} ${command}`;
    try {
      return execSync(fullCommand, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
      throw new Error(`HDC command failed: ${error}`);
    }
  }

  async getVersion(): Promise<string> {
    return this.executeCommand('-v');
  }

  async listDevices(): Promise<HdcDevice[]> {
    const output = this.executeCommand('list targets -v');
    const lines = output.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return {
        connectKey: parts[0],
        connectionType: parts[1] as 'USB' | 'TCP',
        status: parts[2] as 'Connected' | 'Disconnected',
        deviceName: parts[3] || undefined
      };
    });
  }

  async getDeviceInfo(deviceId: string): Promise<DeviceInfo> {
    const commands = {
      name: 'shell param get const.product.name',
      brand: 'shell param get const.product.brand',
      model: 'shell param get const.product.model',
      version: 'shell param get const.product.software.version',
      apiVersion: 'shell param get const.ohos.apiversion',
      cpuArch: 'shell param get const.product.cpu.abilist',
      resolution: 'shell hidumper -s RenderService -a screen',
      ipAddress: 'shell ifconfig wlan0',
      battery: 'shell hidumper -s BatteryService -a -i',
      temperature: 'shell hidumper -s BatteryService -a -i'
    };

    const results: Partial<DeviceInfo> = {};

    try {
      results.name = this.executeCommand(commands.name, deviceId);
      results.brand = this.executeCommand(commands.brand, deviceId);
      results.model = this.executeCommand(commands.model, deviceId);
      results.version = this.executeCommand(commands.version, deviceId);
      results.apiVersion = this.executeCommand(commands.apiVersion, deviceId);
      results.cpuArch = this.executeCommand(commands.cpuArch, deviceId);
      
      // 解析分辨率
      const resolutionOutput = this.executeCommand(commands.resolution, deviceId);
      const resolutionMatch = resolutionOutput.match(/(\d+)x(\d+)/);
      results.resolution = resolutionMatch ? `${resolutionMatch[1]}x${resolutionMatch[2]}` : 'Unknown';

      // 解析IP地址
      const ipOutput = this.executeCommand(commands.ipAddress, deviceId);
      const ipMatch = ipOutput.match(/inet addr:(\d+\.\d+\.\d+\.\d+)/);
      results.ipAddress = ipMatch ? ipMatch[1] : 'Unknown';

      // 解析电池信息
      const batteryOutput = this.executeCommand(commands.battery, deviceId);
      const batteryMatch = batteryOutput.match(/capacity:\s*(\d+)/);
      const tempMatch = batteryOutput.match(/temperature:\s*(\d+)/);
      results.battery = batteryMatch ? parseInt(batteryMatch[1]) : 0;
      results.temperature = tempMatch ? parseInt(tempMatch[1]) / 10 : 0;

    } catch (error) {
      throw new Error(`Failed to get device info: ${error}`);
    }

    return results as DeviceInfo;
  }

  async installApp(deviceId: string, appPath: string): Promise<string> {
    return this.executeCommand(`install ${appPath}`, deviceId);
  }

  async uninstallApp(deviceId: string, bundleName: string): Promise<string> {
    return this.executeCommand(`uninstall ${bundleName}`, deviceId);
  }

  async listApps(deviceId: string): Promise<HdcAppInfo[]> {
    const output = this.executeCommand('shell bm get -a', deviceId);
    const lines = output.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      const parts = line.split(/\s+/);
      return {
        bundleName: parts[0],
        version: parts[1],
        label: parts[2],
        debuggable: parts[3] === 'true'
      };
    });
  }

  async startApp(deviceId: string, bundleName: string, abilityName?: string): Promise<string> {
    const ability = abilityName || 'MainAbility';
    return this.executeCommand(`shell aa start -b ${bundleName} -a ${ability}`, deviceId);
  }

  async stopApp(deviceId: string, bundleName: string): Promise<string> {
    return this.executeCommand(`shell aa force-stop ${bundleName}`, deviceId);
  }

  async clearAppData(deviceId: string, bundleName: string): Promise<string> {
    return this.executeCommand(`shell bm clean ${bundleName} -d`, deviceId);
  }

  async pushFile(deviceId: string, localPath: string, remotePath: string): Promise<string> {
    return this.executeCommand(`file send ${localPath} ${remotePath}`, deviceId);
  }

  async pullFile(deviceId: string, remotePath: string, localPath: string): Promise<string> {
    return this.executeCommand(`file recv ${remotePath} ${localPath}`, deviceId);
  }

  async takeScreenshot(deviceId: string, savePath: string): Promise<string> {
    return this.executeCommand(`shell hdc screenrecord -f ${savePath}`, deviceId);
  }

  async getUIHierarchy(deviceId: string): Promise<string> {
    return this.executeCommand('shell uiautomation dump', deviceId);
  }

  async rebootDevice(deviceId: string): Promise<string> {
    return this.executeCommand('target boot', deviceId);
  }

  async getLogs(deviceId: string, tag?: string, lines: number = 100): Promise<string> {
    const logCommand = tag ? `shell hidumper -s ${tag}` : `shell hidumper`;
    return this.executeCommand(`${logCommand} | tail -${lines}`, deviceId);
  }

  // UI模拟操作方法
  async click(deviceId: string, x: number, y: number): Promise<string> {
    return this.executeCommand(`shell uitest uiInput click ${x} ${y}`, deviceId);
  }

  async doubleClick(deviceId: string, x: number, y: number): Promise<string> {
    return this.executeCommand(`shell uitest uiInput doubleClick ${x} ${y}`, deviceId);
  }

  async longClick(deviceId: string, x: number, y: number): Promise<string> {
    return this.executeCommand(`shell uitest uiInput longClick ${x} ${y}`, deviceId);
  }

  async swipe(deviceId: string, fromX: number, fromY: number, toX: number, toY: number, velocity: number = 600): Promise<string> {
    return this.executeCommand(`shell uitest uiInput swipe ${fromX} ${fromY} ${toX} ${toY} ${velocity}`, deviceId);
  }

  async fling(deviceId: string, fromX: number, fromY: number, toX: number, toY: number, velocity: number = 600, stepLength?: number): Promise<string> {
    const stepParam = stepLength ? ` ${stepLength}` : '';
    return this.executeCommand(`shell uitest uiInput fling ${fromX} ${fromY} ${toX} ${toY} ${velocity}${stepParam}`, deviceId);
  }

  async drag(deviceId: string, fromX: number, fromY: number, toX: number, toY: number, velocity: number = 600): Promise<string> {
    return this.executeCommand(`shell uitest uiInput drag ${fromX} ${fromY} ${toX} ${toY} ${velocity}`, deviceId);
  }

  async dircFling(deviceId: string, direction: 0 | 1 | 2 | 3, velocity: number = 600, stepLength?: number): Promise<string> {
    const stepParam = stepLength ? ` ${stepLength}` : '';
    return this.executeCommand(`shell uitest uiInput dircFling ${direction} ${velocity}${stepParam}`, deviceId);
  }

  async inputText(deviceId: string, x: number, y: number, text: string): Promise<string> {
    return this.executeCommand(`shell uitest uiInput inputText ${x} ${y} "${text}"`, deviceId);
  }

  async keyEvent(deviceId: string, keyId: number, keyId2?: number): Promise<string> {
    const keyParam = keyId2 ? ` ${keyId2}` : '';
    return this.executeCommand(`shell uitest uiInput keyEvent ${keyId}${keyParam}`, deviceId);
  }

  // 常用快捷操作
  async swipeLeft(deviceId: string, velocity: number = 600): Promise<string> {
    return this.dircFling(deviceId, 0, velocity);
  }

  async swipeRight(deviceId: string, velocity: number = 600): Promise<string> {
    return this.dircFling(deviceId, 1, velocity);
  }

  async swipeUp(deviceId: string, velocity: number = 600): Promise<string> {
    return this.dircFling(deviceId, 2, velocity);
  }

  async swipeDown(deviceId: string, velocity: number = 600): Promise<string> {
    return this.dircFling(deviceId, 3, velocity);
  }

  async goHome(deviceId: string): Promise<string> {
    return this.keyEvent(deviceId, 3); // Home键
  }

  async goBack(deviceId: string): Promise<string> {
    return this.keyEvent(deviceId, 4); // Back键
  }

  async paste(deviceId: string): Promise<string> {
    return this.keyEvent(deviceId, 2072, 2038); // 粘贴组合键
  }
}