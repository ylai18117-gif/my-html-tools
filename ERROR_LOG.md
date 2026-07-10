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

## 2026-07-10 — Cloudflare Pages API Key 安全优化

### 问题
- `photowhisper/index.html` 原本在前端用 XOR/Base64 混淆保存 StepFun API Key。
- 前端混淆不是安全方案，懂技术的人仍可从源码还原密钥。

### 修复
- 新增 `functions/api/stepfun.js`，由 Cloudflare Pages Function 读取 `STEPFUN_API_KEY` 密钥并代理请求 StepFun。
- `photowhisper/index.html` 改为请求站内接口 `/api/stepfun`。
- 前端移除了 StepFun API Key 密文和 Authorization header。

### 验证
- 本地静态语法检查通过。
- 部署后需访问 `https://lokmoon.xyz/api/stepfun` 验证函数可用，并测试 PhotoWhisper 图片分析链路。
