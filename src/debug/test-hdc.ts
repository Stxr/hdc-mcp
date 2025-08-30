import { HdcWrapper } from '../utils/hdc-wrapper.js';

async function testHdc() {
  console.log('🧪 开始 HDC MCP 调试测试...\n');
  
  const hdc = new HdcWrapper();
  
  try {
    // 测试1: HDC 版本
    console.log('📋 测试1: 获取 HDC 版本');
    const version = await hdc.getVersion();
    console.log(`✅ HDC 版本: ${version}\n`);
    
    // 测试2: 设备列表
    console.log('📋 测试2: 获取设备列表');
    const devices = await hdc.listDevices();
    if (devices.length > 0) {
      console.log('✅ 发现设备:');
      devices.forEach((device, index) => {
        console.log(`  ${index + 1}. ${device.connectKey} (${device.connectionType}) - ${device.status}`);
      });
      console.log();
      
      // 测试3: 获取第一个设备的详细信息
      const firstDevice = devices[0];
      console.log('📋 测试3: 获取设备详细信息');
      const deviceInfo = await hdc.getDeviceInfo(firstDevice.connectKey);
      console.log('✅ 设备信息:');
      console.log(`   名称: ${deviceInfo.name}`);
      console.log(`   品牌: ${deviceInfo.brand}`);
      console.log(`   型号: ${deviceInfo.model}`);
      console.log(`   版本: ${deviceInfo.version}`);
      console.log(`   API版本: ${deviceInfo.apiVersion}`);
      console.log(`   CPU架构: ${deviceInfo.cpuArch}`);
      console.log(`   分辨率: ${deviceInfo.resolution}`);
      console.log(`   IP地址: ${deviceInfo.ipAddress}`);
      console.log(`   电量: ${deviceInfo.battery}%`);
      console.log(`   温度: ${deviceInfo.temperature}°C\n`);
      
      // 测试4: 获取应用列表
      console.log('📋 测试4: 获取已安装应用列表');
      const apps = await hdc.listApps(firstDevice.connectKey);
      if (apps.length > 0) {
        console.log(`✅ 发现 ${apps.length} 个应用:`);
        apps.slice(0, 5).forEach((app, index) => {
          console.log(`   ${index + 1}. ${app.bundleName} v${app.version} (${app.label})`);
        });
        if (apps.length > 5) {
          console.log(`   ... 还有 ${apps.length - 5} 个应用`);
        }
      } else {
        console.log('⚠️  未找到已安装应用');
      }
      console.log();
      
    } else {
      console.log('⚠️  未找到连接的设备');
      console.log('请确保:');
      console.log('1. 设备已通过 USB 连接');
      console.log('2. 已启用开发者模式');
      console.log('3. 运行: hdc list targets 检查连接\n');
    }
    
    console.log('🎉 调试测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查 HDC 是否安装: which hdc');
    console.log('2. 检查设备连接: hdc list targets');
    console.log('3. 重启 HDC 服务: hdc kill -r');
    console.log('4. 检查 SDK 路径设置');
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  testHdc().catch(console.error);
}

export { testHdc };