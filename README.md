# 🏥 LudyMedsidian

Ludy 的医学知识库 —— 基于 Obsidian + Quartz 构建的数字花园。

📖 **在线访问**: https://ludy258.github.io/LudyMedsidian

## 内容结构

| 板块 | 说明 |
|------|------|
| 📥 00 Inbox | 待整理笔记 |
| 🔬 01 基础医学 | 解剖 / 生理 / 生化 / 病理 / 药理 / 寄生虫 / 病生 |
| 🏥 02 临床医学 | 内科 / 外科 / 妇产 / 儿科 |
| 🔍 03 症状与体征 | 症状鉴别 |
| 🧪 04 检查与检验 | 诊断相关内容 |
| 💊 05 药物 | 药物相关知识 |

## 🤖 AI 辅助声明

本项目的搭建、配置、部署及部分笔记整理过程使用了 AI 工具（Claude）辅助完成。AI 参与的工作包括：
- Quartz 框架的安装与配置
- 网站部署流水线搭建
- 代码与配置文件的编写与优化

所有医学笔记内容由本人整理与审核，AI 仅作为效率工具使用，不参与医学知识的创作与判断。

## 构建与部署

```bash
npm ci           # 安装依赖
npx quartz build # 构建静态站点
npx quartz serve # 本地预览（默认 http://localhost:8080）
```

每次 push 到 `main` 分支，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 技术栈

- [Obsidian](https://obsidian.md/) —— 笔记管理
- [Quartz v4](https://quartz.jzhao.xyz/) —— 静态站点生成器
- GitHub Pages —— 免费托管
