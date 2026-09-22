# Annotation Color Memory

<p align="center">
  <b>中文</b> · <a href="README_EN.md">English</a>
</p>

记住每个 Zotero PDF 标注工具（高亮、下划线、笔记、图片）上次使用的颜色，重启后依然保留。

Zotero 本身不会持久化标注工具的颜色，切换标签页或重启后就会丢失，团队表示“计划修复”。本插件在不锁定原生取色器的前提下，把这些颜色恢复回来。

## 功能特性

- 按工具分别记忆（高亮、下划线、笔记、图片可以用不同颜色）
- 打开 PDF 阅读器时恢复上次使用的颜色
- 改色即时生效（工具栏和选中文字后的弹窗都算）
- 不阻断、不改写原生颜色界面
- 无网络访问，只把数据存在 Zotero 偏好里

## 环境要求

- Zotero 7 或更高版本（已测试到 Zotero 10.x 的插件 API 范围）

## 安装

1. 下载 `annotation-color-memory-1.0.4.xpi`（在 Releases 或 `dist/` 目录里）。
2. 在 Zotero 中打开 **工具 → 插件**（或 工具 → 附加组件）。
3. 把 `.xpi` 文件拖到插件窗口上。
4. 重启 Zotero。
5. 先手动改一次标注颜色，再重启 Zotero，颜色应当被保留。

卸载：在插件窗口中移除该插件，然后重启 Zotero。

## 偏好设置

需要时打开配置编辑器（设置 → 高级 → 配置编辑器）：

| 键 | 含义 |
|-----|---------|
| `extensions.zotero.annotColorMem.enabled` | 总开关（默认 `true`） |
| `extensions.zotero.annotColorMem.saveLast` | 是否跟随上次使用的颜色（默认 `true`） |
| `extensions.zotero.annotColorMem.highlight` | 上次使用的高亮颜色 |
| `extensions.zotero.annotColorMem.underline` | 上次使用的下划线颜色 |
| `extensions.zotero.annotColorMem.note` | 上次使用的笔记标注颜色 |
| `extensions.zotero.annotColorMem.image` | 上次使用的图片标注颜色 |

想冻结颜色，不再跟随上次选择：把 `saveLast` 设为 `false`，然后自己设置各个颜色键。

不要把颜色键写进 `user.js`，那样会在每次启动时覆盖已保存的颜色。

## 开发

目录结构：

```
src/
  manifest.json    # Zotero 扩展清单
  bootstrap.js     # 启动 / 关闭
  code.js          # 逻辑
```

打包 `.xpi`（把 `src/` 打成 zip）：

```bash
cd src
zip -r ../annotation-color-memory-1.0.4.xpi manifest.json bootstrap.js code.js
```

在 Windows（PowerShell）上：

```powershell
Compress-Archive -Path src/* -DestinationPath dist/annotation-color-memory-1.0.4.xpi
```

开发时临时加载：工具 → 插件 → 齿轮 → “从文件安装插件”。

## 隐私

- 无遥测、无远程请求，不写 Zotero 偏好以外的文件。
- 不读取、不上传文献库和 PDF 内容。
- 偏好键只使用 `extensions.zotero.annotColorMem.*` 命名空间。

## 许可证

MIT，见 [LICENSE](LICENSE)。
