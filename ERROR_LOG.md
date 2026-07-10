# ERROR_LOG

## 2026-07-10 — 误把 PhotoHtml 链接到 photomax 仓库

### 问题
- 将 `D:/AIPlace/Qorde/PhotoHtml` 错误链接并推送到了 `ylai18117-gif/photomax`。
- `photomax` 实际是另一个项目，不应该作为 PhotoHtml / MyHtml 工具集合站仓库。
- 期间还错误地把 `photomax` 默认分支改成了 `main`。

### 已修复
- 已将 `ylai18117-gif/photomax` 默认分支恢复为 `master`。
- 已删除误推到 `ylai18117-gif/photomax` 的 `main` 分支。
- PhotoHtml 将改为单独新建仓库部署，域名使用 `https://lokmoon.xyz`。

### 后续要求
- 不再复用 `photomax` 仓库。
- PhotoHtml 必须使用独立仓库部署。
