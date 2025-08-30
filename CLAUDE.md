# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an HDC MCP Server - a Model Context Protocol (MCP) server for HDC (OpenHarmony Device Connector) tools. It provides a bridge between MCP clients (like Claude Desktop) and OpenHarmony devices, allowing remote control and debugging of HarmonyOS devices.

## Key Features

- Device connection management (list, query devices)
- Application management (install, uninstall, start, stop apps)
- File transfer (push, pull files)
- Screen capture
- Device information retrieval
- Device reboot
- Log retrieval
- UI automation (click, swipe, input text, etc.)

## Architecture

- **Main Entry Point**: `src/index.ts` - Implements the MCP server using `@modelcontextprotocol/sdk`
- **Core Logic**: `src/utils/hdc-wrapper.ts` - Wraps HDC commands and provides a clean API
- **Test File**: `src/debug/test-hdc.ts` - Contains debugging and testing utilities

The server exposes HDC functionality as MCP tools that can be called remotely.

## Common Development Commands

```bash
# Install dependencies
npm install

# Build the project (compile TypeScript to JavaScript)
npm run build

# Development mode (watch for changes)
npm run dev

# Start the server
npm start

# Run tests
npm test
```

## Debugging

A comprehensive debug script is available:
```bash
./debug.sh
```

This script:
1. Checks environment and dependencies
2. Builds the project
3. Verifies HDC connection
4. Runs unit tests
5. Provides multiple debugging modes

## Key Components

### HdcWrapper Class (`src/utils/hdc-wrapper.ts`)
- Encapsulates all HDC command execution
- Handles device detection and command routing
- Provides structured return types for device info, apps, etc.
- Includes extensive UI automation methods (click, swipe, drag, etc.)

### MCP Server (`src/index.ts`)
- Defines all available tools in the `ListToolsRequestSchema` handler
- Maps tool calls to HdcWrapper methods in the `CallToolRequestSchema` handler
- Returns structured responses with proper error handling

## Integration

To use with Claude Desktop, add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "hdc": {
      "command": "node",
      "args": ["/path/to/hdc-mcp/dist/index.js"]
    }
  }
}
```

## Requirements

1. OpenHarmony SDK with `hdc` command available in PATH
2. Node.js >= 18
3. Connected OpenHarmony device with developer mode enabled