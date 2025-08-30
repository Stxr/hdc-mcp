# MCP 调试指南

## 调试方法概览

### 1. 日志调试

#### 在代码中添加日志
```typescript
// 在 src/index.ts 中添加调试日志
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.log('🔍 收到请求:', JSON.stringify(request.params, null, 2));
  // ... 现有代码
});
```

#### 启动时启用详细日志
```bash
# 运行 MCP 服务器时启用调试模式
DEBUG=mcp:* npm start

# 或者使用环境变量
NODE_ENV=development npm start
```

### 2. 标准输出调试

#### 测试 MCP 服务器
```bash
# 直接运行服务器
npm run build
npm start

# 测试标准输入输出
echo '{"type":"list_tools"}' | npm start
```

### 3. 使用 MCP Inspector 调试

#### 安装 MCP Inspector
```bash
npm install -g @modelcontextprotocol/inspector
```

#### 启动 Inspector
```bash
# 方法1: 直接启动
npx @modelcontextprotocol/inspector node dist/index.js

# 方法2: 指定环境变量
MCP_DEBUG=true npx @modelcontextprotocol/inspector node dist/index.js
```

#### 访问调试界面
- 打开浏览器访问 `http://localhost:6274`
- 使用 Web 界面测试各个工具

### 4. 单元测试调试

#### 创建测试文件
```typescript
// src/debug/test-hdc.ts
import { HdcWrapper } from '../utils/hdc-wrapper.js';

async function testHdc() {
  const hdc = new HdcWrapper();
  
  try {
    console.log('🔍 测试 HDC 版本...');
    const version = await hdc.getVersion();
    console.log('✅ HDC 版本:', version);
    
    console.log('🔍 测试设备列表...');
    const devices = await hdc.listDevices();
    console.log('✅ 设备列表:', devices);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testHdc();
```

#### 运行测试
```bash
npm run build
node dist/debug/test-hdc.js
```

### 5. Claude Desktop 调试

#### 启用详细日志
在 Claude Desktop 配置中添加日志：

```json
{
  "mcpServers": {
    "hdc": {
      "command": "node",
      "args": ["/Users/txr/mcp/hdc-mcp/dist/index.js"],
      "env": {
        "DEBUG": "mcp:*",
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### 查看 Claude Desktop 日志
```bash
# macOS
~/Library/Logs/Claude/mcp.log

# Windows
%APPDATA%\Claude\logs\mcp.log
```

### 6. VS Code 调试配置

#### 创建 .vscode/launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MCP Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "DEBUG": "mcp:*"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug HDC Wrapper",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/debug/test-hdc.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "preLaunchTask": "npm: build",
      "console": "integratedTerminal"
    }
  ]
}
```

#### 创建 .vscode/tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "build",
      "group": "build",
      "problemMatcher": ["$tsc"]
    }
  ]
}
```

### 7. 常见问题调试

#### HDC 命令未找到
```bash
# 检查 HDC 路径
echo $PATH
which hdc

# 手动设置路径
export HM_SDK_HOME="/path/to/command-line-tools/sdk/default"
export PATH=$PATH:$HM_SDK_HOME/openharmony/toolchains
```

#### 设备连接问题
```bash
# 检查设备连接
hdc list targets

# 重启 HDC 服务
hdc kill -r
```

#### 权限问题
```bash
# 检查文件权限
ls -la dist/index.js
chmod +x dist/index.js
```

### 8. 调试脚本

#### 创建 debug.sh
```bash
#!/bin/bash
echo "🐛 开始调试 HDC MCP 服务器..."

# 检查环境
echo "📋 环境信息:"
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "HDC 路径: $(which hdc || echo '未找到')"

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 测试 HDC 连接
echo "🔍 测试 HDC 连接..."
hdc list targets

# 运行测试
echo "🧪 运行单元测试..."
node dist/debug/test-hdc.js

# 启动调试服务器
echo "🚀 启动调试服务器..."
DEBUG=mcp:* node dist/index.js
```

#### 使脚本可执行
```bash
chmod +x debug.sh
```

### 9. 网络调试

#### 测试网络连接
```bash
# 测试端口转发
curl -X POST http://localhost:6274/api/tools \
  -H "Content-Type: application/json" \
  -d '{"tool":"hdc_list_devices"}'
```

### 10. 性能调试

#### 性能分析
```bash
# 使用 Node.js 内置分析
node --prof dist/index.js

# 生成性能报告
node --prof-process isolate-*.log > profile.txt
```

## 调试最佳实践

1. **从简单开始**：先测试基础功能，再测试复杂功能
2. **分层调试**：先测试 HDC 命令，再测试 MCP 接口
3. **日志记录**：使用详细的日志记录每个步骤
4. **错误处理**：确保所有错误都有清晰的错误消息
5. **环境隔离**：使用不同的环境进行测试

## 调试工具推荐

- **MCP Inspector**: 官方调试工具
- **VS Code**: 内置调试器
- **Console.log**: 简单的日志调试
- **Node.js 调试器**: 使用 `--inspect` 参数
- **Wireshark**: 网络协议分析（高级）

## 获取帮助

如果遇到无法解决的问题：
1. 检查日志文件
2. 查看 HDC 官方文档
3. 提交 GitHub Issue
4. 查看 MCP 社区论坛