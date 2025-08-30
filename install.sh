#!/bin/bash

echo "🚀 正在安装 HDC MCP 服务器..."

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js (版本 >= 18)"
    exit 1
fi

# 检查 npm 是否已安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 正在安装依赖..."
npm install

# 构建项目
echo "🔨 正在构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

# 检查 HDC 是否可用
echo "🔍 正在检查 HDC 工具..."
if command -v hdc &> /dev/null; then
    echo "✅ HDC 工具已找到"
    hdc -v
else
    echo "⚠️  HDC 工具未找到"
    echo "请确保 OpenHarmony SDK 已安装，并将 hdc 添加到 PATH"
    echo "或设置 HM_SDK_HOME 环境变量"
fi

echo ""
echo "🎉 安装完成！"
echo "使用方法："
echo "1. 独立运行: npm start"
echo "2. 与 Claude Desktop 集成: 将 claude_desktop_config.json.example 复制到配置文件"
echo "3. 查看 README.md 获取详细使用说明"