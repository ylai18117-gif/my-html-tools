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


## 2026-07-10 — AI 图片工坊历史详情图片串到最新记录

### 问题
- AI 图片工坊生成历史列表中，多条历史卡片缩略图显示不同。
- 点击任意历史记录进入详情后，详情大图却显示最新一条记录的图片。
- 这是重复出现的历史记录串图问题，必须修复并做专项验证。

### 修复
- 根因：历史图片用 `msg-1/msg-2...` 作为 IndexedDB key；页面刷新后计数器归零，新生成记录会复用旧 ID，导致 IndexedDB 原图被覆盖，旧历史详情读取到最新图。
- 新增 `makeHistId()` 生成全局唯一历史 ID，不再使用会重置的消息 ID。
- 新增 `imageKey` 字段，详情页和下载都按记录自己的 `imageKey` 读取原图。
- 对已有重复 ID 的历史记录做兼容迁移：检测到重复 ID 时改成唯一 ID，并回退使用该卡片自己的 thumbnail，避免继续读取被覆盖的最新原图。


## 2026-07-10 — AI 图片工坊生成失败后重试/继续输入仍失败 + 缺少 favicon

### 问题
- 朋友使用 `https://lokmoon.xyz/aiimage/` 时，ChatGPT 图生图多次显示 `Failed to fetch`。
- 点击失败卡片的“重试”后仍失败，并且失败后继续在输入框输入提示词也无法恢复，通常需要刷新页面。
- 浏览器标签页标题旁显示默认图标，不够美观。

### 修复
- 新增 `functions/api/dmxapi/[[path]].js`，将 AI 图片工坊的 DMXAPI 请求改为同源 Cloudflare Pages Function 代理，减少浏览器端 CORS/Failed to fetch 问题。
- 失败时不再删除 `requestParams`，保留 prompt、图片、模型和模式，点击“重试”会直接用原参数重新请求。
- 新输入发送会使用新的请求 ID，不受旧失败卡片影响。
- 添加 AI 图片工坊 favicon，浏览器标签页不再显示默认地球图标。
