// ============================================================
// Vercel Edge Middleware — Clerk 邮箱注册登录
//
// 需要安装: npm install @clerk/nextjs
// 需在 Vercel Dashboard 设置环境变量:
//   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  ← Clerk 公钥
//   CLERK_SECRET_KEY                   ← Clerk 密钥
// ============================================================

import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware()

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
