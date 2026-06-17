import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "LudyMedsidian",
    pageTitleSuffix: " | 医学笔记",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "goatcounter",
    },
    locale: "zh-CN",
    baseUrl: "ludy258.github.io/LudyMedsidian",
    ignorePatterns: ["private", "templates", ".obsidian", "**/.*"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Noto Sans SC",
        body: "Noto Sans SC",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#f7f8fa",
          lightgray: "#e8eaed",
          gray: "#9aa0a6",
          darkgray: "#5f6368",
          dark: "#202124",
          secondary: "#1a73e8",
          tertiary: "#34a853",
          highlight: "rgba(26, 115, 232, 0.08)",
          textHighlight: "#fbbc0488",
        },
        darkMode: {
          light: "#1e1e2e",
          lightgray: "#2e2e3e",
          gray: "#6c7086",
          darkgray: "#cdd6f4",
          dark: "#f5f5f5",
          secondary: "#89b4fa",
          tertiary: "#a6e3a1",
          highlight: "rgba(137, 180, 250, 0.15)",
          textHighlight: "#f9e2af88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
