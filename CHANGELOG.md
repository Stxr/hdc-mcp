# 更新日志 (Changelog)

## [0.0.5] - 2025-8-31

### 新增
- 为所有HDC工具添加详细的命令示例说明
- 在工具描述中添加对应的HDC命令格式，方便用户和AI理解使用方法

### 改进的工具描述
- `hdc_get_version`: 添加 `hdc -v` 命令示例
- `hdc_get_device_info`: 添加 `hdc -t <deviceId> shell param get <参数>` 命令示例
- `hdc_install_app`: 添加 `hdc -t <deviceId> install <appPath>` 命令示例
- `hdc_uninstall_app`: 添加 `hdc -t <deviceId> uninstall <bundleName>` 命令示例
- `hdc_list_apps`: 添加 `hdc -t <deviceId> shell bm dump -a` 命令示例
- `hdc_start_app`: 添加 `hdc -t <deviceId> shell aa start -b <bundleName> -a <abilityName>` 命令示例
- `hdc_stop_app`: 添加 `hdc -t <deviceId> shell aa force-stop <bundleName>` 命令示例
- `hdc_clear_app_data`: 添加 `hdc -t <deviceId> shell bm clean -n <bundleName> -c data` 命令示例
- `hdc_push_file`: 添加 `hdc -t <deviceId> file send <localPath> <remotePath>` 命令示例
- `hdc_pull_file`: 添加 `hdc -t <deviceId> file recv <remotePath> <localPath>` 命令示例
- `hdc_take_screenshot`: 添加 `hdc -t <deviceId> snapshot-display <savePath>` 命令示例
- `hdc_reboot_device`: 添加 `hdc -t <deviceId> target boot` 命令示例
- `hdc_get_logs`: 添加 `hdc -t <deviceId> shell hilog` 命令示例

## [0.0.2] - 2025-8-31

### 新增
- 添加 `.npmignore` 文件，优化npm发布时的文件包含策略
- 在 `package.json` 中添加 `files` 字段，明确指定需要发布的文件和目录

### 变更
- 优化 `package.json` 中的 `bin` 字段配置，修正可执行文件路径
- 调整npm包发布配置，确保只上传必要的运行文件

### 技术改进
- 减少npm包体积，从完整项目到仅包含编译后的必要文件
- 提高发布效率，排除源代码、配置文件和开发依赖

### 文件变更
- 新增: `.npmignore`
- 修改: `package.json` (添加files字段和优化bin配置)