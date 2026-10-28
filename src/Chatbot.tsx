// src/Chatbot.tsx
import React, { useState } from "react"
import { products } from "./data"

type Message = {
  from: "bot" | "user"
  text: string
  bookId?: number
  model?: string
  edgeLocation?: string
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ"

export function Chatbot({
  onAdd,
  onCheckout,
}: {
  onAdd: (id: number) => void
  onCheckout: () => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Chào bạn, mình là Mầm – trợ lý tư vấn tại Mộc Books 🌱\nĐược vận hành bởi Cloudflare Workers AI (Llama-3-8B) trên máy chủ biên Edge. Bạn đang tìm sách theo thể loại, tác giả, hay cần hỏi về ưu đãi, phí vận chuyển hôm nay cứ nhắn cho Mầm nhé!",
      model: "Llama-3-8B Edge",
    },
  ])
  const suggestions = [
    "🎁 Sách tặng người yêu",
    "🌿 Sách chữa lành tâm hồn",
    "💰 Tư duy tài chính làm giàu",
    "🚚 Phí vận chuyển bao nhiêu?",
  ]

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { from: "user", text: text.trim() }
    const raw = text.trim()
    const clean = removeVietnameseTones(raw)

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: raw,
          history: messages.slice(-4),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const botMsg: Message = {
          from: "bot",
          text: data.response || "Mầm rất vui được hỗ trợ bạn!",
          bookId: data.bookId,
          model: data.model || "Llama-3-8B",
          edgeLocation: data.edgeLocation,
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        throw new Error("Edge API Error")
      }
    } catch {
      // Local Intelligent Fallback Rules (offline/fallback mode)
      const nonBookKeywords = [
        "o to", "xe hoi", "xe may", "xe dap", "dien thoai", "iphone", "laptop",
        "quan ao", "giay dep", "son moi", "my pham", "tra sua", "banh mi",
        "nha dat", "bat dong san", "ve may bay"
      ]
      const isAskingNonBook = nonBookKeywords.some((k) => clean.includes(k))
      const greetings = ["chao", "hi", "hello", "xin chao", "alo", "helo"]
      const isGreeting = greetings.some((g) => clean === g || clean.startsWith(g + " "))
      const isShipping = ["ship", "phi van chuyen", "giao hang", "freeship", "bao lau", "may ngay"].some((k) => clean.includes(k))
      const isReturnPolicy = ["doi tra", "tra hang", "bao hanh", "rach", "hong", "loi"].some((k) => clean.includes(k))
      const isStoreAddress = ["dia chi", "o dau", "cua hang", "chi nhanh", "den xem"].some((k) => clean.includes(k))

      let botMsg: Message

      if (isAskingNonBook) {
        botMsg = {
          from: "bot",
          text: `Ôi bạn ơi, Mộc Books hiện chỉ bán những cuốn sách nuôi dưỡng tâm hồn và tri thức chứ chưa có bán "${raw}" đâu nè 😆!\n\nNếu bạn muốn có thêm tư duy, kiến thức kinh doanh hay làm giàu để sớm tậu được món đồ ưng ý, Mầm gợi ý bạn tham khảo cuốn “Tâm Lý Học Về Tiền” nhé!`,
          bookId: 6,
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isGreeting && clean.split(" ").length <= 3) {
        botMsg = {
          from: "bot",
          text: "Mầm chào bạn nha! Hôm nay bạn muốn tìm tựa sách thư giãn, sách kỹ năng sống, hay đang tìm một cuốn sách thật hay để làm quà tặng?",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isShipping) {
        botMsg = {
          from: "bot",
          text: "📦 Chính sách vận chuyển của Mộc Books:\n• Miễn phí giao hàng toàn quốc cho đơn từ 299.000đ.\n• Đơn dưới 299.000đ: Phí ship đồng giá 30.000đ.\n• Thời gian giao hàng: Từ 2–4 ngày làm việc tận tay bạn nhé!",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isReturnPolicy) {
        botMsg = {
          from: "bot",
          text: "📖 Mộc Books cam kết:\n• Đổi trả miễn phí trong vòng 7 ngày nếu sách bị lỗi in ấn, rách hoặc móp méo do vận chuyển.\n• 100% sách chính hãng có bản quyền đầy đủ.",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isStoreAddress) {
        botMsg = {
          from: "bot",
          text: "📍 Bạn có thể ghé thăm hiệu sách tại: 98 Nguyễn Hữu Quỳnh, Hiệp Hòa, Bắc Ninh.\nHoặc đặt hàng trực tiếp ngay trên website để được ship tận nhà nhé!",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else {
        const matched = products.find((p) => {
          const titleNoTone = removeVietnameseTones(p.title)
          const authorNoTone = removeVietnameseTones(p.author)
          const catNoTone = removeVietnameseTones(p.category)
          const descNoTone = removeVietnameseTones(p.text)

          return (
            titleNoTone.includes(clean) ||
            authorNoTone.includes(clean) ||
            catNoTone.includes(clean) ||
            descNoTone.includes(clean)
          )
        })

        if (matched) {
          botMsg = {
            from: "bot",
            text: `Mầm gợi ý ngay cho bạn cuốn “${matched.title}” của tác giả ${matched.author} nè! Cuốn này được độc giả đánh giá rất cao (${matched.rating}/5 ⭐) với giá ưu đãi chỉ ${money(matched.price)}. Bạn có thể thêm vào giỏ ngay bên dưới nhé!`,
            bookId: matched.id,
            model: "Llama-3-8B (Edge Fallback)",
          }
        } else {
          botMsg = {
            from: "bot",
            text: `Mầm chưa tìm thấy cuốn sách nào khớp với từ khóa "${raw}". Bạn thử tìm theo tên tác giả (như Nguyễn Nhật Ánh, Haruki Murakami...) hoặc thể loại như "Tâm linh", "Kinh tế", "Kỹ năng sống" xem sao nha!`,
            model: "Llama-3-8B (Edge Fallback)",
          }
        }
      }

      setMessages((prev) => [...prev, botMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatbot">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="bot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
                <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <b>Mầm tư vấn sách</b>
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.22)",
                    color: "#ffe082",
                    fontSize: "9px",
                    padding: "2px 6px",
                    borderRadius: "99px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                  }}
                >
                  ⚡ Workers AI
                </span>
              </div>
              <span style={{ fontSize: "10px", color: "#b9d8c4", display: "flex", alignItems: "center", gap: "4px" }}>
                <i /> Llama-3-8B · Cloudflare Edge
              </span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Đóng chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
              </svg>
            </button>
          </div>
          <div className="messages">
            {messages.map((m, index) => {
              const book = m.bookId
                ? products.find((p) => p.id === m.bookId)
                : undefined
              return (
                <div key={index} className={`message ${m.from}`}>
                  <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                  {m.from === "bot" && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "9px",
                        color: "#7e8f83",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>⚡ Cloudflare Edge</span>
                      {m.model && <span>• {m.model.replace("@cf/meta/", "")}</span>}
                    </div>
                  )}
                  {book && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        background: "white",
                        borderRadius: "8px",
                        border: "1px solid #dcd9cd",
                        color: "#1f3026",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "6px",
                        }}
                      >
                        <b style={{ fontSize: "12px" }}>{book.title}</b>
                        <span
                          style={{
                            color: "#df6b43",
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          {money(book.price)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onAdd(book.id)}
                          style={{
                            flex: 1,
                            height: "30px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#f1f0e8",
                            border: "1px solid #cfcec4",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          + Thêm vào giỏ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAdd(book.id)
                            onCheckout()
                            setOpen(false)
                          }}
                          style={{
                            flex: 1,
                            height: "30px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#df6b43",
                            color: "white",
                            border: 0,
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {loading && (
              <div
                className="message bot"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#30513d",
                  background: "#eaf3ec",
                  border: "1px dashed #9bc3a7",
                  fontSize: "11px",
                  borderRadius: "10px",
                  padding: "9px 12px",
                }}
              >
                <span style={{ fontSize: "14px" }}>✨</span>
                <span>Mầm đang suy nghĩ với Llama-3-8B tại Cloudflare Edge...</span>
              </div>
            )}
          </div>
          <div className="suggestions">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? "Mầm đang suy nghĩ..." : "Hỏi Mầm về sách, phí ship, địa chỉ..."}
            />
            <button aria-label="Gửi" disabled={loading || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </div>
      )}
      <button className="chat-trigger" onClick={() => setOpen(!open)}>
        <span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
              </>
            ) : (
              <>
                <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
                <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
              </>
            )}
          </svg>
        </span>
        {!open && <b>Nhờ Mầm tư vấn</b>}
      </button>
    </div>
  )
}
