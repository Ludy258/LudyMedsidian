import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        repo: "Ludy258/LudyMedsidian",
        repoId: "R_kgDOS9O82w",
        category: "General",
        categoryId: "DIC_kwDOS9O8284C_VGQ",
        mapping: "pathname",
        reactionsEnabled: true,
        inputPosition: "bottom",
        lang: "zh-CN",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/Ludy258/LudyMedsidian",
      "📧 24xzhuo@stu.edu.cn": "mailto:24xzhuo@stu.edu.cn",
      "⚠️ 免责声明": "/disclaimer",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.RecentNotes({ limit: 5, title: "最近更新", showTags: false }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.RecentNotes({ limit: 5, title: "最近更新", showTags: false }),
  ],
}
