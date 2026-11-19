# 挥动 (Huidong)

基于 [Gesturefy](https://github.com/Robbendebiene/Gesturefy) 的 Firefox 鼠标手势扩展分支（fork），在上游完整手势能力之上，新增了工具栏快捷菜单与 Snap Links 式框选链接功能。

## 功能特性

-   完整继承 Gesturefy 全部鼠标手势能力：轨迹绘制、模式识别、摇杆手势、滚轮手势、命令系统与排除站点
-   工具栏弹出菜单，一键「暂时禁用 / 恢复手势」，禁用时图标显示红色 OFF 角标，状态跨标签页、跨重启持久化
-   彻底版禁用：禁用时移除全部事件监听，连手势轨迹都不再绘制
-   框选链接（Snap Links 风格）：按住触发键 + 左键拖出矩形，框内链接即时粉色高亮，松开后批量处理
-   框选触发键可切换：Ctrl / Alt / Shift + 左键拖拽
-   批量打开方式可选：后台新标签 / 前台新标签 / 新窗口 / 复制全部链接到剪贴板
-   自定义图标：蓝紫渐变圆角矩形 + 白色「挥」字，三尺寸（96/48/32）

## 系统要求

-   Firefox 148.0 及以上
-   构建（可选）：Node.js（运行 rollup）与 Python 3（含 Pillow，仅重新生成图标时需要）

## 构建命令

只有 `core/bundle/content.bundle.js` 是打包产物，其余均为直接加载的 ES 模块。修改 `core/` 下源码后，在仓库根目录执行：

```bash
npx rollup -c tools/rollup.config.mjs
```

重新生成图标：

```bash
python tools/make_icon.py
```

打包 XPI：将仓库内容（不含 `.git`、`tools`、`*.xpi`）压缩为 zip 并改后缀为 `.xpi`，注意剔除 `META-INF/` 与 `mozilla-recommendation.json`。构建细节见 [tools/BUILD.md](tools/BUILD.md)。

## 使用说明

| 功能 | 操作 |
| --- | --- |
| 暂时禁用 / 恢复手势 | 左键点击工具栏图标，点「暂时禁用手势」或「恢复手势」 |
| 打开设置 | 弹出菜单内点「打开设置」 |
| 框选链接 | 按住触发键（默认 Ctrl）+ 左键拖出矩形，松开后批量打开框内链接 |
| 切换触发键 | 弹出菜单「框选链接」区，触发键下拉选 Ctrl / Alt / Shift |
| 切换打开方式 | 弹出菜单「打开方式」下拉：后台新标签 / 前台新标签 / 新窗口 / 复制链接 |
| 开关框选功能 | 弹出菜单「启用框选」开关 |

注意：框选只收集当前 frame 内的链接，跨域 iframe 内的链接不在范围内；手势鼠标键建议保持默认右键，避免与左键框选冲突。

## 技术栈

-   JavaScript（ES Module）+ WebExtensions API（MV2）
-   Rollup 4（仅打包 content script）
-   Python + Pillow（图标生成）

## 目录结构

```
├── manifest.json                     扩展清单（MV2）
├── popup.html / popup.js             工具栏弹出菜单（禁用开关 + 框选配置）
├── core/
│   ├── background.mjs                后台脚本（命令执行、批量打开、角标同步）
│   ├── content.mjs                   content script 入口（各控制器装配）
│   ├── controllers/
│   │   ├── mouse-gesture-controller.mjs    鼠标手势控制器（上游）
│   │   ├── rocker-gesture-controller.mjs   摇杆手势控制器（上游）
│   │   ├── wheel-gesture-controller.mjs    滚轮手势控制器（上游）
│   │   └── link-selector-controller.mjs    框选链接控制器（新增）
│   ├── views/
│   │   ├── mouse-gesture-view/             手势轨迹视图（上游）
│   │   ├── link-selection-view/            框选矩形视图（新增）
│   │   └── popup-command-view/             手势命令弹窗（上游）
│   └── bundle/content.bundle.js            content script 打包产物（rollup）
├── resources/                        图标、字体、默认配置
├── views/                            设置页等（上游）
├── _locales/                         多语言文案
├── tools/                            构建脚本（rollup 配置、图标生成、构建说明）
└── FORK_NOTICE.md                    fork 来源与改动说明
```

## 许可证

本项目是 Gesturefy（GPL-3.0）的衍生作品，基于 [GNU General Public License v3.0](LICENSE) 开源，版权 © 2026 highwindmx。上游版权归 Robbendebiene 及其贡献者所有。

Powered by WorkBuddy
