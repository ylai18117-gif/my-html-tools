# MyHtml 埋点事件表

> Firebase Analytics (GA4) · Measurement ID: `G-8FQ9DRDJ6T`
>
> 所有页面自动采集 `page_view`、`session_start`、`first_visit`、`user_engagement` 等 GA4 内置事件，下表仅列出自定义事件。

---

## 导航主页 · `index.html`

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `nav_card_click` | 用户点击任意导航卡片 | `card` 卡片ID, `target` 跳转地址 | 核心转化入口 |
| `auth_gate_shown` | 密码验证弹窗弹出 | `target` 目标地址 | 被密码拦截的用户数 |
| `auth_success` | 密码验证通过 | — | 验证成功率 |
| `auth_fail` | 密码验证失败 | — | 错误次数，判断是否需优化提示 |

---

## PhotoWhisper · `photowhisper/index.html`

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `pw_upload` | 用户上传照片 | — | 核心功能使用率 |
| `pw_demo_click` | 用户点击示例照片 | `type` portrait/street/scenic | 示例吸引力 |
| `pw_analysis_complete` | AI 分析成功返回结果 | `source` ai | 分析成功率 |
| `pw_analysis_error` | AI 分析失败 | `error` 错误信息 | 失败归因 |
| `pw_tab_switch` | 切换分析维度 Tab | `tab` pose/angle/light/comp/env/settings | 各维度关注度 |
| `pw_diagram_switch` | 切换场景还原图 | `view` top/side | 俯/侧视图偏好 |
| `pw_comp_toggle` | 开关构图叠加线 | `visible` true/false | 构图辅助使用率 |
| `pw_history_view` | 打开历史记录面板 | — | 历史功能使用率 |
| `pw_checklist_save` | 复制拍摄清单 | — | 清单实用性验证 |

---

## AI 图片工坊 · `aiimage/index.html`

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `ai_model_switch` | 切换 AI 模型 | `model` gpt-image-2 / gemini-3.1-flash-image | 模型偏好 |
| `ai_mode_switch` | 切换生成模式 | `mode` t2i/i2i | 文生图 vs 图生图占比 |
| `ai_send` | 用户点击发送 | `model`, `mode` | 核心使用频次 |
| `ai_image_attach` | 添加参考图片 | `count` 本次添加张数 | 图生图使用率 |
| `ai_generate_complete` | 图片生成成功 | `model`, `mode` | 生成成功率 |
| `ai_history_view` | 打开历史面板 | — | 历史功能使用率 |
| `ai_reuse_prompt` | 从历史记录重新生成 | — | 历史记录价值验证 |

---

## QR 广告落地页 · `qr/qr_home.html`

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `qr_download_click` | 点击下载按钮 | `section` hero/cta | 核心转化事件，区分按钮位置 |
| `qr_scroll` | 页面滚动到指定深度 | `depth` 25/50/75/100 | 内容吸引力，每档只触发一次 |

---

## 数据看盘 · `dashboard/QR数据看盘.html`

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `page_view` | 页面加载（GA4 内置） | — | 看板访问频次 |

> 数据看盘为内部工具页面，目前仅采集 page_view，后续可按需增加 Tab 切换、导入导出等事件。

---

## 关键指标看板建议

在 Firebase Analytics 控制台建议创建以下自定义看板：

| 指标 | 计算方式 | 意义 |
|------|---------|------|
| 导航转化率 | `nav_card_click` / `page_view(index)` | 用户从导航页进入子页面的比例 |
| 密码通过率 | `auth_success` / (`auth_success` + `auth_fail`) | 密码设计合理性 |
| PhotoWhisper 分析成功率 | `pw_analysis_complete` / (`pw_analysis_complete` + `pw_analysis_error`) | AI 服务稳定性 |
| AI 工坊人均生成次数 | `ai_send` / UV | 用户粘性 |
| QR 落地页下载率 | `qr_download_click` / `page_view(qr)` | 广告页转化效果 |
| QR 页面内容触达率 | `qr_scroll(depth=75)` / `page_view(qr)` | 用户是否看到了 CTA |
