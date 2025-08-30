#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 添加 Node.js 全局变量声明
declare const process: NodeJS.Process;
import { HdcWrapper } from './utils/hdc-wrapper.js';

const server = new Server(
  {
    name: 'hdc-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

const hdc = new HdcWrapper();

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  console.error('🔍 收到请求:', JSON.stringify(request.params, null, 2));
  return {
    tools: [
      {
        name: 'hdc_get_version',
        description: '获取 HDC 工具版本信息',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hdc_list_devices',
        description: '列出所有连接的鸿蒙设备',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hdc_get_device_info',
        description: '获取指定设备的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'hdc_install_app',
        description: '在设备上安装应用',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            appPath: {
              type: 'string',
              description: '应用文件路径 (.hap 文件)',
            },
          },
          required: ['deviceId', 'appPath'],
        },
      },
      {
        name: 'hdc_uninstall_app',
        description: '从设备上卸载应用',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            bundleName: {
              type: 'string',
              description: '应用包名',
            },
          },
          required: ['deviceId', 'bundleName'],
        },
      },
      {
        name: 'hdc_list_apps',
        description: '列出设备上已安装的应用',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'hdc_start_app',
        description: '启动指定应用',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            bundleName: {
              type: 'string',
              description: '应用包名',
            },
            abilityName: {
              type: 'string',
              description: 'Ability 名称 (可选, 默认为 MainAbility)',
            },
          },
          required: ['deviceId', 'bundleName'],
        },
      },
      {
        name: 'hdc_stop_app',
        description: '停止指定应用',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            bundleName: {
              type: 'string',
              description: '应用包名',
            },
          },
          required: ['deviceId', 'bundleName'],
        },
      },
      {
        name: 'hdc_clear_app_data',
        description: '清除应用数据',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            bundleName: {
              type: 'string',
              description: '应用包名',
            },
          },
          required: ['deviceId', 'bundleName'],
        },
      },
      {
        name: 'hdc_push_file',
        description: '将文件推送到设备',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            localPath: {
              type: 'string',
              description: '本地文件路径',
            },
            remotePath: {
              type: 'string',
              description: '设备上的目标路径',
            },
          },
          required: ['deviceId', 'localPath', 'remotePath'],
        },
      },
      {
        name: 'hdc_pull_file',
        description: '从设备拉取文件',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            remotePath: {
              type: 'string',
              description: '设备上的文件路径',
            },
            localPath: {
              type: 'string',
              description: '本地保存路径',
            },
          },
          required: ['deviceId', 'remotePath', 'localPath'],
        },
      },
      {
        name: 'hdc_take_screenshot',
        description: '截取设备屏幕截图',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            savePath: {
              type: 'string',
              description: '截图保存路径',
            },
          },
          required: ['deviceId', 'savePath'],
        },
      },
      {
        name: 'hdc_reboot_device',
        description: '重启设备',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'hdc_get_logs',
        description: '获取设备日志',
        inputSchema: {
          type: 'object',
          properties: {
            deviceId: {
              type: 'string',
              description: '设备连接标识符',
            },
            tag: {
              type: 'string',
              description: '日志标签 (可选)',
            },
            lines: {
              type: 'number',
              description: '要获取的日志行数 (默认100)',
              default: 100,
            },
          },
          required: ['deviceId'],
        },
      },
      {
        name: 'hdc_ui_tool',
        description: `HDC UI模拟操作使用说明`,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hdc_aa_tool',
        description: 'HDC aa工具使用说明',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hdc_bm_tool',
        description: 'HDC bm工具使用说明',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hdc_param_tool',
        description: 'HDC param工具使用说明',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'hdc_hidumper_tool',
        description: 'HDC hidumper工具使用说明',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

//@ts-ignore
server.setRequestHandler(CallToolRequestSchema, async (request: { params: { name: string; arguments: any } }) => {
  const { name, arguments: args } = request.params;
  console.error('🔍 收到请求:', JSON.stringify(request.params, null, 2));
  try {
    switch (name) {
      case 'hdc_get_version':
        const version = await hdc.getVersion();
        return {
          content: [
            {
              type: 'text',
              text: `HDC Version: ${version}`,
            },
          ],
        };

      case 'hdc_list_devices':
        const devices = await hdc.listDevices();
        return {
          content: [
            {
              type: 'text',
              text: devices.length > 0
                ? `Connected devices:\n${devices.map(d => `- ${d.connectKey} (${d.connectionType}) - ${d.status}`).join('\n')}`
                : 'No devices connected',
            },
          ],
        };

      case 'hdc_get_device_info':
        const deviceInfo = await hdc.getDeviceInfo(args.deviceId);
        return {
          content: [
            {
              type: 'text',
              text: `Device Information:\n` +
                `Name: ${deviceInfo.name}\n` +
                `Brand: ${deviceInfo.brand}\n` +
                `Model: ${deviceInfo.model}\n` +
                `Version: ${deviceInfo.version}\n` +
                `API Version: ${deviceInfo.apiVersion}\n` +
                `CPU Architecture: ${deviceInfo.cpuArch}\n` +
                `Resolution: ${deviceInfo.resolution}\n` +
                `IP Address: ${deviceInfo.ipAddress}\n` +
                `Battery: ${deviceInfo.battery}%\n` +
                `Temperature: ${deviceInfo.temperature}°C`,
            },
          ],
        };

      case 'hdc_install_app':
        const installResult = await hdc.installApp(args.deviceId, args.appPath);
        return {
          content: [
            {
              type: 'text',
              text: `Install result: ${installResult}`,
            },
          ],
        };

      case 'hdc_uninstall_app':
        const uninstallResult = await hdc.uninstallApp(args.deviceId, args.bundleName);
        return {
          content: [
            {
              type: 'text',
              text: `Uninstall result: ${uninstallResult}`,
            },
          ],
        };

      case 'hdc_list_apps':
        const apps = await hdc.listApps(args.deviceId);
        return {
          content: [
            {
              type: 'text',
              text: apps.length > 0
                ? `Installed apps:\n${apps.map(app =>
                  `- ${app.bundleName} v${app.version} (${app.label}) ${app.debuggable ? '[Debuggable]' : ''}`
                ).join('\n')}`
                : 'No apps found',
            },
          ],
        };

      case 'hdc_start_app':
        const startResult = await hdc.startApp(args.deviceId, args.bundleName, args.abilityName);
        return {
          content: [
            {
              type: 'text',
              text: `Start app result: ${startResult}`,
            },
          ],
        };

      case 'hdc_stop_app':
        const stopResult = await hdc.stopApp(args.deviceId, args.bundleName);
        return {
          content: [
            {
              type: 'text',
              text: `Stop app result: ${stopResult}`,
            },
          ],
        };

      case 'hdc_clear_app_data':
        const clearResult = await hdc.clearAppData(args.deviceId, args.bundleName);
        return {
          content: [
            {
              type: 'text',
              text: `Clear app data result: ${clearResult}`,
            },
          ],
        };

      case 'hdc_push_file':
        const pushResult = await hdc.pushFile(args.deviceId, args.localPath, args.remotePath);
        return {
          content: [
            {
              type: 'text',
              text: `Push file result: ${pushResult}`,
            },
          ],
        };

      case 'hdc_pull_file':
        const pullResult = await hdc.pullFile(args.deviceId, args.remotePath, args.localPath);
        return {
          content: [
            {
              type: 'text',
              text: `Pull file result: ${pullResult}`,
            },
          ],
        };

      case 'hdc_take_screenshot':
        const screenshotResult = await hdc.takeScreenshot(args.deviceId, args.savePath);
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot saved: ${screenshotResult}`,
            },
          ],
        };

      case 'hdc_reboot_device':
        const rebootResult = await hdc.rebootDevice(args.deviceId);
        return {
          content: [
            {
              type: 'text',
              text: `Reboot result: ${rebootResult}`,
            },
          ],
        };

      case 'hdc_get_logs':
        const logs = await hdc.getLogs(args.deviceId, args.tag, args.lines);
        return {
          content: [
            {
              type: 'text',
              text: `Device logs:\n${logs}`,
            },
          ],
        };

      case 'hdc_ui_tool':
        return {
          content: [
            {
              type: 'text',
              text: `支持操作类型：点击、双击、长按、慢滑、快滑、拖拽、输入文字、KeyEvent

操作命令格式：hdc shell uitest uiInput <操作类型> <参数>

1. click - 模拟单击操作
参数: point_x (必选,点击x坐标), point_y (必选,点击y坐标)
示例: hdc shell uitest uiInput click 100 100

2. doubleClick - 模拟双击操作
参数: point_x (必选,双击x坐标), point_y (必选,双击y坐标)
示例: hdc shell uitest uiInput doubleClick 100 100

3. longClick - 模拟长按操作
参数: point_x (必选,长按x坐标), point_y (必选,长按y坐标)
示例: hdc shell uitest uiInput longClick 100 100

4. fling - 模拟快滑操作
参数: from_x (必选,起点x坐标), from_y (必选,起点y坐标), to_x (必选,终点x坐标), to_y (必选,终点y坐标), swipeVelocityPps_ (可选,速度200-40000px/s,默认600), stepLength (可选,步长,默认距离/50px)
示例: hdc shell uitest uiInput fling 400 400 400 1600 20000

5. swipe - 模拟慢滑操作
参数: from_x (必选,起点x坐标), from_y (必选,起点y坐标), to_x (必选,终点x坐标), to_y (必选,终点y坐标), swipeVelocityPps_ (可选,速度200-40000px/s,默认600)
示例: hdc shell uitest uiInput swipe 10 10 200 200 500

6. drag - 模拟拖拽操作
参数: from_x (必选,起点x坐标), from_y (必选,起点y坐标), to_x (必选,终点x坐标), to_y (必选,终点y坐标), swipeVelocityPps_ (可选,速度200-40000px/s,默认600)
示例: hdc shell uitest uiInput drag 10 10 100 100 500

7. dircFling - 指定方向滑动
参数: direction (可选,方向[0左,1右,2上,3下],默认0), swipeVelocityPps_ (可选,速度), stepLength (可选,步长)
示例: 
- 左滑: hdc shell uitest uiInput dircFling 0 500
- 右滑: hdc shell uitest uiInput dircFling 1 600
- 上滑: hdc shell uitest uiInput dircFling 2
- 下滑: hdc shell uitest uiInput dircFling 3

8. inputText - 输入框输入文本
参数: point_x (必选,输入框x坐标), point_y (必选,输入框y坐标), text (输入文本)
示例: hdc shell uitest uiInput inputText 100 100 hello

9. keyEvent - 实体按键事件
参数: keyID (必选,按键ID), keyID2 (可选,组合键ID)
常用示例:
- 返回主页: hdc shell uitest uiInput keyEvent Home
- 返回上一步: hdc shell uitest uiInput keyEvent Back
- 组合键粘贴: hdc shell uitest uiInput keyEvent 2072 2038

keyEvent映射表: https://docs.openharmony.cn/pages/v4.1/en/application-dev/reference/apis-input-kit/js-apis-keycode.md`,
            },
          ],
        }
      case 'hdc_aa_tool':
        return {
          content: [
            {
              type: 'text',
              text: `aa工具使用说明

- start: 启动Ability
  hdc shell aa start -a {abilityName} -b {bundleName}

- stop-service: 停止服务
  hdc shell aa stop-service

- force-stop: 强制退出应用
  hdc shell aa force-stop {bundleName}

- test: 启动单元测试
  hdc shell aa test -b <bundle-name> -p <package-name> -m <module-name> -r <test-runner> -u <user-id>

- attach: 附加调试器
  hdc shell aa attach

- detach: 分离调试器
  hdc shell aa detach

- appdebug: 启动应用进行调试
  hdc shell aa appdebug -b <bundle-name> -p <process-name> --start --gdb`,
            },
          ],
        };

      case 'hdc_bm_tool':
        return {
          content: [
            {
              type: 'text',
              text: `bm工具使用说明

- install: 安装应用
  hdc shell bm install -p <path> -u <user-id> -r <flags>

- uninstall: 卸载应用
  hdc shell bm uninstall -n <bundle-name> -k

- dump: Dump应用信息
  hdc shell bm dump -n <bundle-name>

- clean: 清除应用数据
  hdc shell bm clean -n <bundle-name> -c <cache|data>

- enable: 启用应用
  hdc shell bm enable -n <bundle-name>

- disable: 禁用应用
  hdc shell bm disable -n <bundle-name>

- get: 获取信息
  hdc shell bm get --udid`,
            },
          ],
        };

      case 'hdc_param_tool':
        return {
          content: [
            {
              type: 'text',
              text: `param工具使用说明

获取设备信息

- const.product.name: 名称
- const.product.brand: Brand
- const.product.model: Model
- const.product.software.version: 系统版本
- const.ohos.apiversion: OS版本
- const.product.cpu.abilist: CPU架构

示例: hdc shell param get const.product.name`,
            },
          ],
        };

      case 'hdc_hidumper_tool':
        return {
          content: [
            {
              type: 'text',
              text: `hidumper工具使用说明

获取系统服务信息

- RenderService: 渲染服务 (包含屏幕信息)
- DisplayManagerService: 显示管理服务
- PowerManagerService: 电源管理服务
- BatteryService: 电池服务
- NetConnManager: 网络连接管理
- MemoryManagerService: 内存管理服务
- StorageManager: 存储管理

示例: hdc shell hidumper -s RenderService -a screen`,
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}