<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.png">
    <img src=".github/assets/logo.png" width="120" alt="Annotation Color Memory">
  </picture>
</p>

<p align="center">
  <b>重启也不丢的 Zotero 标注颜色</b><br>
  高亮 · 下划线 · 笔记 · 图片，各自记住上次用的颜色
</p>

<p align="center">
  <a href="https://github.com/Saytanz0815/annotation-color-memory/releases/latest"><img src="https://img.shields.io/github/v/release/Saytanz0815/annotation-color-memory?style=flat-square&label=release" alt="release"></a>
  <img src="https://img.shields.io/badge/Zotero-7%2B-CC2936?style=flat-square&logo=zotero&logoColor=white" alt="Zotero 7+">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"></a>
  <a href="README_EN.md">English</a>
</p>

---

## 为什么

Zotero 不保留标注工具的颜色：切标签页、重启之后，高亮又回到默认的黄色。

本插件把每个工具上次用的颜色存进 Zotero 偏好，下次打开 PDF 时恢复。不锁定原生取色器，无网络请求。

## 安装

1. 从 [Releases](https://github.com/Saytanz0815/annotation-color-memory/releases/latest) 下载最新 `.xpi`
2. Zotero → 工具 → 插件，把 `.xpi` 拖进窗口
3. 重启 Zotero，改一次标注颜色，再重启确认颜色被保留

从 **1.0.5–1.0.7** 升级：先在插件窗口移除旧版再安装——那几版用了临时 id，与现在的不同，否则会并存两个条目。1.0.4 及更早版本可直接覆盖安装。

## 功能

- 按工具分别记忆：高亮 / 下划线 / 笔记 / 图片可以各自不同色
- 打开 PDF 时自动恢复上次的颜色
- 改色即时生效，工具栏与选中文字后的弹窗都算
- 不阻断、不改写 Zotero 原生界面

## 偏好键

| 键 | 含义 |
|-----|------|
| `extensions.zotero.annotColorMem.enabled` | 总开关，默认 `true` |
| `extensions.zotero.annotColorMem.saveLast` | 跟随上次使用的颜色，默认 `true` |
| `extensions.zotero.annotColorMem.highlight` | 高亮颜色 |
| `extensions.zotero.annotColorMem.underline` | 下划线颜色 |
| `extensions.zotero.annotColorMem.note` | 笔记标注颜色 |
| `extensions.zotero.annotColorMem.image` | 图片标注颜色 |

想固定颜色、不跟随后来的选择：把 `saveLast` 设为 `false`，再自行写入上述颜色键。

## 常见问题

**重启后颜色还是丢？** 确认 `enabled` 与 `saveLast` 为 `true`，改一次颜色后完整退出 Zotero 再打开。

**为什么不把颜色写进 `user.js`？** `user.js` 每次启动都会覆盖偏好，与本插件的「记住上次」逻辑冲突。请用配置编辑器。

## 开发

```
src/
  manifest.json    # 清单
  bootstrap.js     # 启动 / 关闭
  code.js          # 逻辑
```

打包（把 `src/` 打成 zip 即 `.xpi`）：

```bash
cd src && zip -r ../annotation-color-memory.xpi manifest.json bootstrap.js code.js
```

开发时临时加载：工具 → 插件 → 齿轮 →「从文件安装插件」。

## 隐私

- 无遥测、无网络请求，只写 `extensions.zotero.annotColorMem.*`
- 不读取、不上传文献库与 PDF 内容

## 许可

- 软件：[MIT](LICENSE)
- 品牌资产：`.github/assets/` 下的 logo 不适用 MIT，仅可用于指代本项目；不得修改、不得移作他用。详见 [LICENSE](LICENSE) 的 “Brand assets”
- *Zotero* 是 Corporation for Digital Scholarship 的商标；本项目为第三方插件，仅表示兼容
