// ============================================================
// Vercel Edge Middleware — Supabase 邮箱注册登录
//
// 需在 Vercel Dashboard 设置环境变量:
//   SUPABASE_URL       ← 项目 URL（https://xxx.supabase.co）
//   SUPABASE_ANON_KEY  ← anon/public 密钥
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ""

// --- Cookie 工具 ---

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

// --- JWT 工具 ---

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

// --- 登录页 HTML ---

function loginPage(redirect?: string): string {
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
      width: 380px;
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
    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 20px;
      border-bottom: 2px solid #e8eaed;
    }
    .tab {
      flex: 1;
      text-align: center;
      padding: 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: #5f6368;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
      background: none;
      border-top: none;
      border-left: none;
      border-right: none;
    }
    .tab.active {
      color: #1a73e8;
      border-bottom-color: #1a73e8;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
      color: #3c4043;
    }
    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #dadce0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
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
      margin-top: 4px;
      transition: background 0.2s;
    }
    button:hover { background: #1557b0; }
    button:disabled {
      background: #9aa0a6;
      cursor: not-allowed;
    }
    .msg {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .msg.error { display: block; background: #fce8e6; color: #c5221f; }
    .msg.success { display: block; background: #e6f4ea; color: #1e8e3e; }
    .msg.loading { display: block; background: #e8f0fe; color: #1a73e8; }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #9aa0a6;
    }
    .form { display: none; }
    .form.active { display: block; }
    .forgot {
      text-align: right;
      font-size: 12px;
      margin-top: 4px;
    }
    .forgot a {
      color: #1a73e8;
      text-decoration: none;
      cursor: pointer;
    }
    .forgot a:hover { text-decoration: underline; }
    .info-line {
      font-size: 13px;
      color: #5f6368;
      margin-bottom: 16px;
      text-align: center;
    }
    .info-line a {
      color: #1a73e8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔒 LudyMedsidian</h1>
    <p class="sub">医学知识库 — 登录以继续</p>

    <div id="message" class="msg"></div>

    <div class="tabs" role="tablist">
      <button class="tab active" data-tab="login" role="tab">登录</button>
      <button class="tab" data-tab="signup" role="tab">注册</button>
    </div>

    <!-- 登录表单 -->
    <div id="form-login" class="form active">
      <div class="form-group">
        <label for="login-email">邮箱</label>
        <input type="email" id="login-email" placeholder="your@email.com" autofocus>
      </div>
      <div class="form-group">
        <label for="login-password">密码</label>
        <input type="password" id="login-password" placeholder="输入密码">
      </div>
      <div class="forgot">
        <a id="forgot-link">忘记密码？</a>
      </div>
      <button id="login-btn">登录</button>
      <div class="info-line" style="margin-top:16px">
        没有账号？<a id="switch-to-signup">注册</a>
      </div>
    </div>

    <!-- 注册表单 -->
    <div id="form-signup" class="form">
      <div class="form-group">
        <label for="signup-email">邮箱</label>
        <input type="email" id="signup-email" placeholder="your@email.com">
      </div>
      <div class="form-group">
        <label for="signup-password">密码</label>
        <input type="password" id="signup-password" placeholder="至少 6 位">
      </div>
      <button id="signup-btn">注册</button>
      <div class="info-line" style="margin-top:16px">
        已有账号？<a id="switch-to-login">登录</a>
      </div>
    </div>

    <!-- 忘记密码表单 -->
    <div id="form-forgot" class="form">
      <div class="form-group">
        <label for="forgot-email">邮箱</label>
        <input type="email" id="forgot-email" placeholder="your@email.com">
      </div>
      <button id="forgot-btn">发送重置链接</button>
      <div class="info-line" style="margin-top:16px">
        <a id="switch-to-login2">返回登录</a>
      </div>
    </div>

    <div class="footer">LudyMedsidian &copy; ${new Date().getFullYear()}</div>
  </div>

  <script>
    const SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)}
    const ANON_KEY = ${JSON.stringify(SUPABASE_ANON_KEY)}
    const REDIRECT = ${JSON.stringify(redirect || "/")}

    const $ = (id) => document.getElementById(id)
    const msg = $("message")

    function showMsg(text, type) {
      msg.textContent = text
      msg.className = "msg " + type
    }

    function hideMsg() {
      msg.className = "msg"
    }

    // Tab 切换
    function switchTab(tab) {
      document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab))
      document.querySelectorAll(".form").forEach(f => f.classList.remove("active"))
      $("form-" + tab).classList.add("active")
      hideMsg()
    }

    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab))
    })
    $("switch-to-signup").addEventListener("click", () => switchTab("signup"))
    $("switch-to-login").addEventListener("click", () => switchTab("login"))
    $("switch-to-login2").addEventListener("click", () => switchTab("login"))
    $("forgot-link").addEventListener("click", () => switchTab("forgot"))

    // Supabase REST API 调用
    async function supabaseAuth(endpoint, body) {
      const res = await fetch(SUPABASE_URL + "/auth/v1/" + endpoint, {
        method: "POST",
        headers: {
          "apikey": ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.msg || data.error_description || data.error || "请求失败")
      return data
    }

    // 保存 session 到 cookie
    function saveSession(accessToken, refreshToken, expiresIn) {
      const maxAge = expiresIn || 3600
      document.cookie = "sb-access-token=" + encodeURIComponent(accessToken) + "; path=/; max-age=" + maxAge + "; SameSite=Lax; Secure"
      if (refreshToken) {
        document.cookie = "sb-refresh-token=" + encodeURIComponent(refreshToken) + "; path=/; max-age=" + (maxAge * 2) + "; SameSite=Lax; Secure"
      }
    }

    // 登录
    $("login-btn").addEventListener("click", async () => {
      const email = $("login-email").value.trim()
      const password = $("login-password").value
      if (!email || !password) { showMsg("请填写邮箱和密码", "error"); return }

      showMsg("登录中...", "loading")
      $("login-btn").disabled = true

      try {
        const data = await supabaseAuth("token?grant_type=password", { email, password })
        saveSession(data.access_token, data.refresh_token, data.expires_in)
        window.location.href = REDIRECT
      } catch (e) {
        if (e.message.includes("Email not confirmed")) {
          showMsg("邮箱尚未验证，请检查收件箱（含垃圾邮件）", "error")
        } else if (e.message.includes("Invalid login credentials")) {
          showMsg("邮箱或密码错误", "error")
        } else {
          showMsg("登录失败: " + e.message, "error")
        }
        $("login-btn").disabled = false
      }
    })

    // 注册
    $("signup-btn").addEventListener("click", async () => {
      const email = $("signup-email").value.trim()
      const password = $("signup-password").value
      if (!email || !password) { showMsg("请填写邮箱和密码", "error"); return }
      if (password.length < 6) { showMsg("密码至少 6 位", "error"); return }

      showMsg("注册中...", "loading")
      $("signup-btn").disabled = true

      try {
        const redirectTo = window.location.origin + "/static/callback.html"
        const data = await supabaseAuth("signup", {
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        })
        if (data.user?.identities?.length === 0) {
          showMsg("该邮箱已被注册", "error")
        } else {
          showMsg("注册成功！请检查邮箱（含垃圾邮件）完成验证", "success")
        }
        $("signup-btn").disabled = false
      } catch (e) {
        showMsg("注册失败: " + e.message, "error")
        $("signup-btn").disabled = false
      }
    })

    // 忘记密码
    $("forgot-btn").addEventListener("click", async () => {
      const email = $("forgot-email").value.trim()
      if (!email) { showMsg("请填写邮箱", "error"); return }

      showMsg("发送中...", "loading")
      $("forgot-btn").disabled = true

      try {
        const redirectTo = window.location.origin + "/static/callback.html"
        await supabaseAuth("recover", {
          email,
          options: { redirectTo },
        })
        showMsg("重置链接已发送，请检查邮箱", "success")
        $("forgot-btn").disabled = false
      } catch (e) {
        showMsg("发送失败: " + e.message, "error")
        $("forgot-btn").disabled = false
      }
    })

    // 回车提交
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return
      const active = document.querySelector(".form.active")
      if (!active) return
      if (active.id === "form-login") $("login-btn").click()
      else if (active.id === "form-signup") $("signup-btn").click()
      else if (active.id === "form-forgot") $("forgot-btn").click()
    })
  </script>
</body>
</html>`
}

// --- Middleware 主函数 ---

export async function middleware(request: Request): Promise<Response | void> {
  const url = new URL(request.url)
  const { pathname } = url

  // 1) 静态资源放行（带文件扩展名的请求）
  if (/\.\w+$/.test(pathname)) return

  // 2) 登录页
  if (pathname === "/login") {
    const redirect = url.searchParams.get("redirect") || undefined
    return new Response(loginPage(redirect), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  // 3) 检查认证 cookie
  const token = getCookie(request, "sb-access-token")
  if (token) {
    const payload = decodeJwtPayload(token)
    if (payload && typeof payload.exp === "number" && payload.exp * 1000 > Date.now()) {
      return // 已认证
    }
  }

  // 4) 未认证 → 重定向到登录页
  const loginUrl = new URL("/login", url.origin)
  loginUrl.searchParams.set("redirect", pathname)
  return Response.redirect(loginUrl, 302)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
