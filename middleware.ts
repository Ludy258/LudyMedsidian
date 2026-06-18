// ============================================================
// Vercel Edge Middleware — 全站密码保护
// 使用标准 Web API，无需额外依赖
//
// 在 Vercel Dashboard 设置环境变量：
//   SITE_PASSWORD  ← 网站访问密码
//   AUTH_SECRET    ← 任意随机字符串，用于 session 签名
// ============================================================

const SITE_PASSWORD = process.env.SITE_PASSWORD || ""
const AUTH_SECRET = process.env.AUTH_SECRET || ""

// --- Base64URL 工具 ---

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ""
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlToBytes(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  const bin = atob(str)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

// --- HMAC-SHA256 签名 ---

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  )
  return toBase64Url(sig)
}

// --- Cookie 工具（标准 Web API）---

function getCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie")
  if (!raw) return
  for (const pair of raw.split(";")) {
    const idx = pair.indexOf("=")
    if (idx < 1) continue
    if (pair.substring(0, idx).trim() === name) {
      try {
        return decodeURIComponent(pair.substring(idx + 1).trim())
      } catch {
        return pair.substring(idx + 1).trim()
      }
    }
  }
}

function setCookie(
  res: Response,
  name: string,
  value: string,
  opts: { httpOnly?: boolean; secure?: boolean; sameSite?: string; path?: string; maxAge?: number } = {},
): void {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]
  if (opts.httpOnly) parts.push("HttpOnly")
  if (opts.secure) parts.push("Secure")
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  if (opts.path) parts.push(`Path=${opts.path}`)
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`)
  res.headers.append("Set-Cookie", parts.join("; "))
}

// --- 登录页 HTML ---

function loginPage(error?: string, redirect?: string): string {
  const errorMsg =
    error === "1"
      ? "密码错误，请重试"
      : error === "config"
        ? "系统配置错误，请联系管理员"
        : ""

  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - LudyMedsidian</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f7f8fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #202124;
    }
    .card {
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      width: 360px;
      max-width: 90vw;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #1a73e8;
    }
    .sub {
      font-size: 14px;
      color: #5f6368;
      margin-bottom: 24px;
    }
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #3c4043;
    }
    input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #dadce0;
      border-radius: 8px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input[type="password"]:focus {
      border-color: #1a73e8;
      box-shadow: 0 0 0 2px rgba(26,115,232,0.15);
    }
    button {
      width: 100%;
      padding: 10px;
      background: #1a73e8;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 20px;
      transition: background 0.2s;
    }
    button:hover { background: #1557b0; }
    button:active { background: #174ea6; }
    .error {
      background: #fce8e6;
      color: #c5221f;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #9aa0a6;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔒 LudyMedsidian</h1>
    <p class="sub">医学知识库 — 请输入密码以继续</p>
    ${errorMsg ? `<div class="error">${errorMsg}</div>` : ""}
    <form method="POST" action="/login">
      ${redirect ? `<input type="hidden" name="redirect" value="${redirect.replace(/"/g, "&quot;")}">` : ""}
      <label for="password">密码</label>
      <input type="password" id="password" name="password" placeholder="输入网站密码" autofocus required>
      <button type="submit">进入网站</button>
    </form>
    <div class="footer">LudyMedsidian &copy; ${year}</div>
  </div>
</body>
</html>`
}

// --- Middleware 主函数 ---

export async function middleware(request: Request): Promise<Response | void> {
  const url = new URL(request.url)
  const { pathname } = url

  // 1) 静态资源放行（带文件扩展名的请求）
  if (/\.\w+$/.test(pathname)) return

  // 2) 登录页处理
  if (pathname === "/login") {
    if (request.method === "POST") return handleLogin(request)
    const error = url.searchParams.get("error") || undefined
    const redirect = url.searchParams.get("redirect") || undefined
    return new Response(loginPage(error, redirect), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  // 3) 检查认证 cookie
  const cookie = getCookie(request, "auth")
  if (cookie && (await verifyToken(cookie))) return

  // 4) 未认证 → 重定向到登录页
  const loginUrl = new URL("/login", url.origin)
  loginUrl.searchParams.set("redirect", pathname)
  return Response.redirect(loginUrl, 302)
}

// --- 登录表单处理 ---

async function handleLogin(request: Request): Promise<Response> {
  const text = await request.text()
  const params = new URLSearchParams(text)
  const password = params.get("password") || ""
  const redirect = params.get("redirect") || "/"

  if (!SITE_PASSWORD || !AUTH_SECRET) {
    console.error("缺少环境变量: SITE_PASSWORD 或 AUTH_SECRET")
    return Response.redirect(new URL("/login?error=config", request.url), 302)
  }

  if (password !== SITE_PASSWORD) {
    return Response.redirect(new URL("/login?error=1", request.url), 302)
  }

  // 创建 7 天有效期的 session token
  const exp = BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const buf = new ArrayBuffer(8)
  new DataView(buf).setBigUint64(0, exp)
  const payload = toBase64Url(buf)
  const token = `${payload}.${await sign(payload, AUTH_SECRET)}`

  const res = Response.redirect(new URL(redirect, request.url), 302)
  setCookie(res, "auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}

// --- Token 验证 ---

async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [payload, signature] = parts
  try {
    const exp = Number(new DataView(base64UrlToBytes(payload).buffer).getBigUint64(0))
    if (exp <= Date.now()) return false
    const expected = await sign(payload, AUTH_SECRET)
    return signature === expected
  } catch {
    return false
  }
}

// --- Middleware 匹配规则 ---

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
