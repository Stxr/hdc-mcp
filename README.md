# HDC MCP Server

一个基于 Model Context Protocol (MCP) 的鸿蒙设备调试工具服务器，封装了 HDC (OpenHarmony Device Connector) 的核心功能。

## 功能特性

- 🔍 设备连接管理（列出、查询设备）
- 📱 应用管理（安装、卸载、启动、停止应用）
- 📁 文件传输（推送、拉取文件）
- 📸 屏幕截图
- 🔧 设备信息获取
- 🔄 设备重启
- 📝 日志获取

## 安装

### 前提条件

1. 安装 OpenHarmony SDK，确保 `hdc` 命令可用
2. 安装 Node.js (版本 >= 18)

### 使用mcp
```bash
{
  "mcpServers": {
    "hdc": {
      "command": "npx",
      "args": ["-y","hdc-mcp"],
    }
  }
}
```
# 感谢
- [awesome-hdc](https://github.com/codematrixer/awesome-hdc/blob/master/README.md)