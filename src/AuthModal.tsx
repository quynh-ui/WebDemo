// src/AuthModal.tsx
import React, { FormEvent, useState } from "react"
import { User } from "./types"

// Icon đóng và icon check dùng riêng trong modal
function ModalIcon({ name }: { name: "close" | "check" | "arrow" }) {
  if (name === "close") {
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 6 12 12" /><path d="m18 6-12 12" />
      </svg>
    )
  }
  if (name === "check") {
    return (
      <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 4 4L19 6" />
      </svg>
    )
  }
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m14 7 5 5-5 5" />
    </svg>
  )
}

export function AuthModal({
  onClose,
  onLoginSuccess,
}: {
  onClose: () => void
  onLoginSuccess: (user: User) => void
}) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    const savedUsers: User[] = JSON.parse(
      localStorage.getItem("moc_users") || "[]"
    )

    if (mode === "register") {
      const existing = savedUsers.find((u) => u.email === email)
      if (existing) {
        setError("Email này đã được sử dụng. Vui lòng đăng nhập!")
        return
      }

      const newUser: User = { name, email, password }
      savedUsers.push(newUser)
      localStorage.setItem("moc_users", JSON.stringify(savedUsers))
      localStorage.setItem("moc_current_user", JSON.stringify({ name, email }))

      onLoginSuccess({ name, email })
      onClose() // <--- ĐÓNG LUÔN MODAL TẠI ĐÂY
    } else {
      const user = savedUsers.find(
        (u) => u.email === email && u.password === password
      )
      if (!user) {
        setError("Email hoặc mật khẩu không chính xác!")
        return
      }

      localStorage.setItem(
        "moc_current_user",
        JSON.stringify({ name: user.name, email: user.email })
      )
      onLoginSuccess({ name: user.name, email: user.email })
      onClose() // <--- ĐÓNG LUÔN MODAL TẠI ĐÂY
    }
  }

  return (
    <div className="overlay auth-overlay" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} type="button">
          <ModalIcon name="close" />
        </button>

        {success ? (
          <div className="auth-success">
            <span style={{ display: "inline-flex", justifyContent: "center", marginBottom: "12px" }}>
              <ModalIcon name="check" />
            </span>
            <h2>Chào mừng bạn đến với Mộc</h2>
            <p>Đăng nhập thành công! Tài khoản đã sẵn sàng để cùng bạn khám phá những trang sách mới.</p>
            <button className="button primary full" onClick={onClose} type="button">
              Bắt đầu khám phá
            </button>
          </div>
        ) : (
          <>
            <div className="auth-heading">
              <span className="eyebrow">
                {mode === "login" ? "Chào mừng trở lại" : "Gia nhập cộng đồng Mộc"}
              </span>
              <h2>{mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}</h2>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login")
                  setError("")
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register")
                  setError("")
                }}
              >
                Đăng ký
              </button>
            </div>

            {error && (
              <div style={{ color: "#d9383a", fontSize: "13px", padding: "8px 12px", background: "#fde8e8", borderRadius: "6px", marginBottom: "12px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Họ và tên
                  <input
                    required
                    placeholder="Tên của bạn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  required
                  type="email"
                  placeholder="ban@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Mật khẩu
                <input
                  required
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {mode === "login" && (
                <div className="form-meta">
                  <label>
                    <input type="checkbox" defaultChecked /> Ghi nhớ tôi
                  </label>
                  <button type="button">Quên mật khẩu?</button>
                </div>
              )}
              <button className="button primary full" type="submit">
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"} <ModalIcon name="arrow" />
              </button>
            </form>
            <p className="auth-policy">
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật của Mộc.
            </p>
          </>
        )}
      </div>
    </div>
  )
}