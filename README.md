<p align="center">
  <img src="https://raw.githubusercontent.com/Saytanz0815/acm-brand/main/logo.png" width="120" alt="Annotation Color Memory">
</p>

# Annotation Color Memory

<p align="center">
  <b>重启也不丢的 Zotero 标注颜色</b><br>
  高亮 · 下划线 · 笔记 · 图片，各自记住上次用的颜色
</p>

<p align="center">
  <a href="README_EN.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/Saytanz0815/annotation-color-memory/releases"><img src="https://img.shields.io/github/v/release/Saytanz0815/annotation-color-memory?style=flat-square&label=release" alt="release"></a>
  <img src="https://img.shields.io/badge/Zotero-7%2B-CC2936?style=flat-square&logo=zotero&logoColor=white" alt="Zotero 7+">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"></a>
  <a href="https://github.com/Saytanz0815/annotation-color-memory/stargazers"><img src="https://img.shields.io/github/stars/Saytanz0815/annotation-color-memory?style=flat-square&label=stars" alt="stars"></a>
</p>

---

## Why

Zotero 本身不会持久化标注工具的颜色：切换标签页或重启后就会丢失，团队表示「计划修复」。

本插件在**不锁定原生取色器**的前提下，把上次使用的颜色恢复回来。无网络、无遥测，只写 Zotero 偏好。

## 功能特性

- **按工具分别记忆** — 高亮、下划线、笔记、图片可以用不同颜色
- **打开 PDF 时自动恢复** — 阅读器一开就是上次那套颜色
- **改色即时生效** — 工具栏和选中文字后的弹窗都算
- **不打扰原生界面** — 不阻断、不改写颜色选择 UI
- **本机存储** — 无网络访问，数据只在 Zotero 偏好里

## 环境要求

- Zotero 7 或更高（已测试到 Zotero 10.x 插件 API 范围）

## 安装

1. 下载 [`annotation-color-memory-1.0.4.xpi`](https://github.com/Saytanz0815/annotation-color-memory/releases/latest)（Releases 或 `dist/`）
2. Zotero → **工具 → 插件**（或工具 → 附加组件）
3. 把 `.xpi` 拖进插件窗口，重启 Zotero
4. 手动改一次标注颜色，再重启 — 颜色应被保留

卸载：插件窗口中移除本插件，重启 Zotero。

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

想冻结颜色、不再跟随上次选择：把 `saveLast` 设为 `false`，再自行设置各个颜色键。

## FAQ

**装了之后颜色还是丢？**  
先手动改一次颜色，再重启 Zotero 验证。若仍无效，确认 `extensions.zotero.annotColorMem.enabled` 为 `true`，且 Zotero ≥ 7。

**能不能固定一种颜色，不跟随我后来选的？**  
可以。`saveLast` 设为 `false`，然后写死 `highlight` / `underline` / `note` / `image` 各键。

**为什么不把颜色写进 `user.js`？**  
`user.js` 会在每次启动时覆盖已保存的颜色，和本插件的「记住上次」逻辑冲突。请只用配置编辑器改偏好。

## 开发

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

Windows（PowerShell）：

```powershell
Compress-Archive -Path src/* -DestinationPath dist/annotation-color-memory-1.0.4.xpi
```

开发时临时加载：工具 → 插件 → 齿轮 →「从文件安装插件」。

## 隐私

- 无遥测、无远程请求，不写 Zotero 偏好以外的文件
- 不读取、不上传文献库和 PDF 内容
- 偏好键只使用 `extensions.zotero.annotColorMem.*` 命名空间

## 许可证

MIT，见 [LICENSE](LICENSE)。
