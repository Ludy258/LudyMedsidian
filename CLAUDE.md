# LudyMedsidian — 项目说明

## 这是什么

医学知识库网站，基于 Obsidian + Quartz v4.5.2 构建。
发布在 https://ludy258.github.io/LudyMedsidian/

## 目录结构

```
LudyMedsidian/
├── content/              ← 网站内容（Markdown 笔记放这里）
│   ├── index.md          ← 首页
│   ├── 00 Inbox/
│   ├── 01 基础医学/      ← 解剖/生理/生化/病理/药理/寄生虫/病生
│   ├── 02 临床医学/      ← 内科/外科/妇产/儿科
│   ├── 03 症状与体征/
│   ├── 04 检查与检验/
│   └── 05 药物/
├── quartz/               ← Quartz 框架（不用动）
├── quartz.config.ts      ← 站点配置（标题、主题、baseUrl 等）
├── quartz.layout.ts      ← 页面布局配置（页脚链接等）
├── .github/workflows/    ← GitHub Actions 自动部署
│   └── deploy.yml        ← 推送 main 分支后自动构建部署到 Pages
└── CLAUDE.md             ← 本文件
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

> **注意**：笔记不要放在 `content/` 根目录（首页除外），按分类放到子目录里。文件名中文没问题，Quartz 会自动处理。

## 配置说明

### 修改网站信息
编辑 `quartz.config.ts`：
- `pageTitle` — 网站标题
- `baseUrl` — 部署域名（当前 `ludy258.github.io/LudyMedsidian`）
- `locale` — 语言（`zh-CN`）
- `theme` — 颜色主题和字体

### 修改页脚
编辑 `quartz.layout.ts` 中的 `footer.links` 对象。

### 修改首页
编辑 `content/index.md`。

## 联系方式

邮箱：24xzhuo@stu.edu.cn（已添加到页脚）

## 技术栈

- Obsidian — 笔记编辑
- Quartz v4 — 静态站点生成
- GitHub Pages — 托管
- GitHub Actions — 自动部署
