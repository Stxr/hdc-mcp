#!/bin/bash

echo "🐛 HDC MCP 调试工具"
echo "=================="

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查环境
echo -e "${BLUE}📋 环境检查${NC}"
echo "Node.js 版本: $(node --version 2>/dev/null || echo '未安装')"
echo "npm 版本: $(npm --version 2>/dev/null || echo '未安装')"
echo "HDC 路径: $(which hdc 2>/dev/null || echo '未找到')"
echo ""

# 检查依赖
echo -e "${BLUE}📦 检查依赖${NC}"
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo -e "${RED}❌ package.json 不存在${NC}"
    exit 1
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules 已安装"
else
    echo -e "${YELLOW}⚠️  node_modules 未找到，正在安装...${NC}"
    npm install
fi

echo ""

# 构建项目
echo -e "${BLUE}🔨 构建项目${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 构建成功${NC}"
else
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi

echo ""

# 检查 HDC 连接
echo -e "${BLUE}🔍 检查 HDC 连接${NC}"
if command -v hdc &> /dev/null; then
    echo "✅ HDC 命令可用"
    echo "HDC 版本: $(hdc -v 2>/dev/null || echo '无法获取版本')"
    
    echo ""
    echo -e "${BLUE}📱 连接设备${NC}"
    devices=$(hdc list targets 2>/dev/null || echo "")
    if [ -n "$devices" ]; then
        echo "✅ 已连接设备:"
        echo "$devices"
    else
        echo -e "${YELLOW}⚠️  未找到连接的设备${NC}"
        echo "请确保:"
        echo "1. 设备已通过 USB 连接"
        echo "2. 已启用开发者模式"
        echo "3. 运行: hdc list targets 检查"
    fi
else
    echo -e "${RED}❌ HDC 未找到${NC}"
    echo "请安装 OpenHarmony SDK 并配置环境变量"
fi

echo ""

# 运行单元测试
echo -e "${BLUE}🧪 运行单元测试${NC}"
if [ -f "dist/debug/test-hdc.js" ]; then
    node dist/debug/test-hdc.js
else
    echo -e "${YELLOW}⚠️  测试文件未找到，正在构建...${NC}"
    npm run build
    node dist/debug/test-hdc.js
fi

echo ""

# 启动调试服务器
echo -e "${BLUE}🚀 启动调试服务器${NC}"
echo "正在启动 MCP 调试服务器..."
echo "按 Ctrl+C 停止"
echo ""

# 提供多种调试选项
echo -e "${BLUE}调试选项:${NC}"
echo "1. 标准调试模式: npm start"
echo "2. 详细日志模式: DEBUG=mcp:* npm start"
echo "3. 使用 MCP Inspector: npx @modelcontextprotocol/inspector node dist/index.js"
echo ""

# 询问用户选择
echo -e "${BLUE}请选择调试模式:${NC}"
echo "1) 标准模式"
echo "2) 详细日志模式"
echo "3) MCP Inspector"
echo "4) 退出"
echo ""

read -p "选择 [1-4]: " choice

case $choice in
    1)
        echo -e "${GREEN}启动标准模式...${NC}"
        npm start
        ;;
    2)
        echo -e "${GREEN}启动详细日志模式...${NC}"
        DEBUG=mcp:* npm start
        ;;
    3)
        echo -e "${GREEN}启动 MCP Inspector...${NC}"
        npx @modelcontextprotocol/inspector node dist/index.js
        ;;
    4)
        echo "👋 退出调试"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选择，退出${NC}"
        exit 1
        ;;
esac