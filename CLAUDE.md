# LudyMedsidian — 项目说明

## 这是什么

医学知识库网站，基于 Obsidian + Quartz v4.5.2 构建。
发布在 https://ludy258.github.io/LudyMedsidian/

## 目录结构

```
LudyMedsidian/
├── content/                ← 网站内容（Markdown 笔记放这里）
│   ├── index.md            ← 首页
│   ├── disclaimer.md       ← 免责声明
│   ├── 00 Inbox/
│   ├── 01 基础医学/        ← 解剖/生理/生化/病理/药理/寄生虫/病生
│   ├── 02 临床医学/        ← 内科/外科/妇产/儿科
│   ├── 03 症状与体征/
│   ├── 04 检查与检验/
│   └── 05 药物/
├── quartz/                 ← Quartz 框架（不用动）
├── quartz.config.ts        ← 站点配置（标题、主题、baseUrl、统计等）
├── quartz.layout.ts        ← 页面布局配置（页脚、侧边栏、评论区等）
├── CLAUDE.md               ← 本文件（项目说明，Claude Code 自动读取）
└── .github/workflows/
    └── deploy.yml          ← GitHub Actions 自动部署
```

## 常见操作

### 本地预览
```bash
npx quartz build --serve
# 浏览器打开 http://localhost:8080
```

### 更新网站
```bash
cd "D:/Obsidian上传/LudyMedsidian"
git add -A
git commit -m "更新说明"
git push
# 等几分钟 GitHub Actions 自动部署
```

### 添加新笔记
把 `.md` 文件复制到 `content/` 下对应的分类目录，提交推送即可。
笔记按分类放到子目录里，文件名用中文没问题。

### 关闭单篇笔记的评论区
在该笔记 frontmatter 加一行：`comments: false`

## 配置说明（编辑 quartz.config.ts）

| 字段 | 说明 |
|------|------|
| `pageTitle` | 网站标题 |
| `baseUrl` | 部署域名 |
| `locale` | 语言（`zh-CN`） |
| `theme` | 颜色主题和字体 |
| `analytics` | 流量统计（GoatCounter） |

### 修改页脚
编辑 `quartz.layout.ts` 中的 `footer.links` 对象。

### 修改首页
编辑 `content/index.md`。

## 已启用的网站功能

- **📊 流量统计** — GoatCounter（面板：https://ludy258.goatcounter.com）
- **🕐 最近更新** — 页面右侧显示最近修改的 5 篇笔记
- **💬 评论区** — giscus（基于 GitHub Discussions）
- **📡 RSS 订阅**
- **🔍 全文搜索**
- **🌐 中文本地化**
- **🌙 暗色/亮色模式**
- **⚠️ 免责声明页面**（页脚链接 + 首页提示）
- **📧 联系邮箱**（页脚展示）
- **🤖 AI 辅助声明**（首页 + README）

## 待办（上线前需要做）

### 1️⃣ 评论区激活
去 https://github.com/apps/giscus 安装 giscus App 到 LudyMedsidian 仓库。

### 2️⃣ GoatCounter 统计激活
去邮箱确认 GoatCounter 的验证邮件。

## 项目历史

| 日期 | 事件 |
|------|------|
| 2026-06-17 | 初始搭建：Quartz v4 + vault 导入 + GitHub Pages 部署 |
| 2026-06-17 | 添加首页、联系邮箱、GoatCounter 统计 |
| 2026-06-17 | 添加最近更新、giscus 评论区 |
| 2026-06-17 | 添加免责声明页面 |
| 2026-06-17 | 添加 AI 辅助声明 |

## 联系方式

邮箱：24xzhuo@stu.edu.cn（已添加到页脚）

## 技术栈

- Obsidian — 笔记管理
- Quartz v4 — 静态站点生成器
- GitHub Pages — 托管
- GitHub Actions — 自动部署
- GoatCounter — 流量统计
- giscus — 评论区
