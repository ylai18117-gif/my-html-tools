# MyHtml — 个人网页工具集合

一组纯前端单页面工具，部署在个人域名 `https://lokmoon.xyz` 下日常使用。全部使用原生 HTML/CSS/JavaScript 构建，零依赖，开箱即用。

- **部署平台**：Cloudflare Pages
- **GitHub 仓库**：`ylai18117-gif/my-html-tools`
- **线上域名**：`https://lokmoon.xyz`

## 子项目

### PhotoWhisper — AI 拍照拆解助手

> 上传一张好照片，AI 帮你逆向还原拍摄现场

- **AI 视觉分析**：接入 StepFun step-3.7-flash 多模态模型，自动识别拍摄技法
- **六维度拆解**：被拍人姿势、摄影师机位、光线分析、构图法则、环境条件、手机设置
- **场景还原图**：SVG 俯视图 + 侧视图，直观展示拍摄位置关系
- **构图叠加层**：九宫格 + 主体标记，可手动开关
- **拍摄清单**：一键复制可执行的拍摄步骤
- **历史记录**：localStorage + IndexedDB 持久化，随时回顾

`photowhisper/index.html`

---

### AI 图片工坊 — ChatGPT & Gemini 图片生成

> 对话式 AI 图片生成，支持文生图和图生图

- **双模型**：ChatGPT (gpt-image-2) + Gemini (gemini-3.1-flash-image) 一键切换
- **文生图 & 图生图**：纯文字描述生成，或上传参考图引导风格
- **多图参考**：最多支持 16 张参考图（ChatGPT FormData 模式）
- **并发请求**：每条消息独立 Promise，可同时发起多个生成任务
- **全页拖放**：任意位置拖入图片自动添加到参考图
- **生成历史**：IndexedDB 存原图 + localStorage 存缩略图/元数据，支持重新生成和下载
- **密码保护**：XOR + Base64 + DJB2 哈希客户端验证

`aiimage/index.html`

---

### QR Scan Max 广告落地页

> QR 扫描 App 的产品宣传页

- 功能展示、Google Play 下载引导、应用截图
- 独立页面，无返回导航（广告落地页标准设计）

`qr/qr_home.html`

---

### 数据看盘 — QR 业务数据看板

> 本地数据可视化看板，支持每日数据录入和趋势分析

- 三 Tab 布局：总览 / 商业化 / 用户漏斗
- Chart.js 图表可视化
- 数据导入导出（CSV/Excel）
- 密码保护

`dashboard/QR数据看盘.html`

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 前端 | 原生 HTML + CSS + JS | 零框架，单文件，零构建 |
| AI 视觉 | StepFun step-3.7-flash | 多模态思考模型，JSON 结构化输出 |
| AI 生图 | DMXAPI (OpenAI 兼容) | gpt-image-2 + gemini-3.1-flash-image |
| 存储 | localStorage + IndexedDB | 元数据+缩略图 / 原图分离存储 |
| 安全 | XOR + Base64 + DJB2 | 客户端密码/密钥混淆（非加密） |
| 统计 | Firebase Analytics (GA4) | 自定义事件埋点，全页面覆盖 |

## 本地运行

由于浏览器 CORS 策略，`file://` 协议无法调用外部 API。请通过 HTTP 服务器访问：

```bash
# Python 3
python -m http.server 8080 --directory .

# Node.js (npx)
npx serve .

# 然后访问 http://localhost:8080
```

## 目录结构

```
├── index.html              ← 导航主页（暗色卡片入口）
├── aiimage/
│   └── index.html          ← AI 图片工坊
├── photowhisper/
│   └── index.html          ← PhotoWhisper 拍照助手
├── qr/
│   ├── qr_home.html        ← QR 广告落地页
│   └── img/                ← 广告页图片资源
├── dashboard/
│   ├── QR数据看盘.html      ← 数据看板（密码保护）
│   ├── QR数据分析与商业化探索.md
│   ├── QR用户漏斗.xlsx
│   └── 混变商业化模型-公式手册.md
├── .gitignore
└── README.md
```

## 部署

整个目录可直接部署到任意静态托管服务：

- **Cloudflare Pages**：连接 GitHub 仓库 `ylai18117-gif/my-html-tools`，根目录部署（当前使用）
- **自定义域名**：`https://lokmoon.xyz`
- **GitHub Pages**：推送到 `gh-pages` 分支
- **Vercel / Netlify**：拖拽上传或 Git 集成

## License

MIT
