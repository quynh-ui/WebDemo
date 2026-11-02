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

function hasPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(^|\\s|[.,!?;])${escaped}($|\\s|[.,!?;])`, "i")
  return regex.test(text)
}

function containsAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => hasPhrase(text, p))
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
      // Local Intelligent Fallback Rules (Edge Fallback NLU)
      let botMsg: Message

      // 1. Ý định hỏi về số lượng mua / đặt mua nhiều cuốn (Ưu tiên cao nhất)
      const isQuantity = containsAny(clean, [
        "mua 2", "mua 3", "mua 4", "mua 5", "mua nhieu",
        "mua duoc khong", "mua duoc ko", "dat mua", "cach mua",
        "mua may cuon", "so luong", "dat nhieu"
      ])

      // 2. Ý định hỏi xin tư vấn, gợi ý sách chung
      const isAdvice = containsAny(clean, [
        "tu van", "goi y", "nen mua", "mua sach gi", "sach nao hay",
        "de xuat", "gioi thieu", "mua gi", "recommend", "co sach nao hay"
      ])

      // 3. Khách chỉ vào xem, không mua, dạo chơi
      const isJustBrowsing = containsAny(clean, [
        "chi vao xem", "khong mua", "ko mua", "xem thoi", "dao choi",
        "xem choi", "ngam thoi", "luon lo", "tham quan", "ghe choi"
      ])

      // 4. Lời khen ngợi giao diện / web
      const isPraise = containsAny(clean, [
        "dep the", "web dep", "xinh the", "giao dien dep",
        "xin xo", "dinh the", "de thuong", "thong minh the"
      ])

      // 5. Chuyện phiếm, ăn uống, chào hỏi
      const isFood = containsAny(clean, [
        "an com chua", "an com", "uong nuoc", "ngu chua", "chua ngu", "co nguoi yeu chua"
      ])
      const isGreeting = containsAny(clean, ["chao", "hi", "hello", "xin chao", "alo", "helo"]) && clean.split(" ").length <= 3
      const isIdentity = containsAny(clean, ["ban la ai", "ai tao ra", "may tuoi", "la gi", "gioi thieu ban than"])

      // 6. Chính sách cửa hàng (sử dụng cụm từ chính xác để tránh trùng từ)
      const isShipping = containsAny(clean, [
        "phi ship", "tien ship", "giao hang", "ship bao lau",
        "may ngay den", "phi van chuyen", "freeship", "co freeship khong"
      ])
      const isReturnPolicy = containsAny(clean, [
        "doi tra", "tra hang", "bao hanh", "bi rach", "bi hong",
        "bi loi", "sach loi", "loi in", "loi in an", "sach rach"
      ])
      const isStoreAddress = containsAny(clean, [
        "dia chi", "cua hang o dau", "dia chi o dau", "chi nhanh",
        "den xem truc tiep", "tiem sach o dau"
      ])
      const isDiscount = containsAny(clean, [
        "ma giam gia", "voucher", "khuyen mai", "uu dai",
        "co giam gia khong", "code giam gia", "ma freeship"
      ])

      // 7. Hỏi sản phẩm không phải sách (dùng word boundary để không dính 'cho toi')
      const isAskingNonBook = containsAny(clean, [
        "o to", "xe hoi", "xe may", "xe dap", "dien thoai", "iphone",
        "samsung", "laptop", "quan ao", "giay dep", "son moi", "my pham",
        "tra sua", "banh mi", "nha dat", "bat dong san", "ve may bay", "dong ho", "ti vi"
      ])

      if (isQuantity) {
        botMsg = {
          from: "bot",
          text: "Dạ bạn mua bao nhiêu cuốn cũng được hết nha! 🥰\n\nBạn chỉ cần bấm nút \"+ Thêm vào giỏ\" cho từng cuốn bạn ưng ý, sau đó mở Giỏ hàng để bấm \"Đặt hàng ngay\" là xong ạ.\n• Đặc biệt: Đơn hàng từ 299.000đ sẽ được tự động MIỄN PHÍ SHIP toàn quốc đó bạn!",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isJustBrowsing) {
        botMsg = {
          from: "bot",
          text: "Dạ không sao hết nè bạn ơi! 😊 Bạn cứ thong thả dạo chơi, ngắm nghía từng cuốn sách nhé. Mộc Books luôn mở rộng cửa đón bạn ghé thăm thư giãn lúc rảnh rỗi. Khi nào cần tìm cuốn gì hay cứ ới Mầm nha!",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isPraise) {
        botMsg = {
          from: "bot",
          text: "Mầm cảm ơn bạn nhiều nha! 🌱 Đội ngũ Mộc Books đã chăm chút từng góc nhỏ để mang lại cảm giác mộc mạc, bình yên như một tiệm sách gỗ thật sự đó ạ. Chúc bạn có những phút giây thư thái!",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isFood) {
        botMsg = {
          from: "bot",
          text: "Dạ Mầm là trợ lý AI nên chỉ cần 'nạp' tri thức từ những trang sách là tràn đầy năng lượng rồi nè! 😆 Bạn nhớ ăn uống và nghỉ ngơi cho ấm bụng nhé. Sau đó nếu muốn tìm sách thư giãn thì ghé Mầm nha!",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isIdentity) {
        botMsg = {
          from: "bot",
          text: "Mầm là trợ lý ảo tư vấn sách tại Mộc Books, vận hành bởi Cloudflare Workers AI (Llama-3-8B) trực tiếp tại máy chủ biên Edge. Mầm sinh ra để giúp bạn tìm thấy những cuốn sách ưng ý nhất! 🌱",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isGreeting) {
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
      } else if (isDiscount) {
        botMsg = {
          from: "bot",
          text: "🎉 Mầm tặng bạn ưu đãi độc quyền hôm nay:\n• Nhập mã MOC15: Giảm ngay 15% tổng hóa đơn\n• Đơn từ 299.000đ: Tự động MIỄN PHÍ VẬN CHUYỂN toàn quốc!\nBạn có muốn Mầm gợi ý thêm tựa sách nào đang bán chạy nhất không nè?",
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isAskingNonBook) {
        botMsg = {
          from: "bot",
          text: `Ôi bạn ơi, Mộc Books hiện chỉ bán những cuốn sách nuôi dưỡng tâm hồn và tri thức chứ chưa có bán "${raw}" đâu nè 😆!\n\nNếu bạn muốn có thêm tư duy, kiến thức kinh doanh hay làm giàu để sớm tậu được món đồ ưng ý, Mầm gợi ý bạn tham khảo cuốn “Tâm Lý Học Về Tiền” nhé!`,
          bookId: 6,
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else if (isAdvice) {
        botMsg = {
          from: "bot",
          text: "Dạ Mầm rất sẵn lòng tư vấn cho bạn nè! 🌱 Dưới đây là những cuốn sách được bạn đọc yêu thích nhất tại Mộc:\n\n• 🌿 Chữa lành & ấm áp: “Cây Cam Ngọt Của Tôi” (José Mauro)\n• 💰 Tư duy làm giàu & tài chính: “Tâm Lý Học Về Tiền” (Morgan Housel)\n• 🎯 Rèn luyện kỷ luật: “Thói Quen Nguyên Tử” (James Clear)\n\nBạn thích chủ đề nào để Mầm tư vấn chi tiết hơn nha? Mầm gợi ý ngay cuốn “Cây Cam Ngọt Của Tôi” bên dưới nhé!",
          bookId: 2,
          model: "Llama-3-8B (Edge Fallback)",
        }
      } else {
        // RAG matching tìm kiếm sách trong catalog
        const scored = products.map((p) => {
          let score = 0
          const titleNoTone = removeVietnameseTones(p.title)
          const authorNoTone = removeVietnameseTones(p.author)
          const catNoTone = removeVietnameseTones(p.category)
          const descNoTone = removeVietnameseTones(p.text)

          if (clean.includes(titleNoTone)) score += 30
          if (clean.includes(authorNoTone)) score += 20
          if (clean.includes(catNoTone)) score += 15

          const words = clean.split(/\s+/).filter((w) => w.length > 1)
          for (const word of words) {
            if (titleNoTone.includes(word)) score += 5
            if (authorNoTone.includes(word)) score += 4
            if (descNoTone.includes(word)) score += 2
          }

          if (containsAny(clean, ["chua lanh", "tam hon", "binh an", "stress", "met"]) && [2, 9, 20].includes(p.id)) score += 15
          if (containsAny(clean, ["tien", "lam giau", "kinh te", "tai chinh", "dau tu"]) && [6, 7, 8].includes(p.id)) score += 15
          if (containsAny(clean, ["tinh yeu", "crush", "nguoi yeu", "qua tang"]) && [1, 5, 19].includes(p.id)) score += 15
          if (containsAny(clean, ["cong nghe", "lap trinh", "code", "ai", "it"]) && [17, 18].includes(p.id)) score += 15
          if (containsAny(clean, ["thoi quen", "ky luat", "nang suat", "thay doi"]) && [11, 10].includes(p.id)) score += 15
          if (containsAny(clean, ["nguoi moi", "de doc", "ngan"]) && [3, 4, 19].includes(p.id)) score += 15

          return { product: p, score }
        })

        scored.sort((a, b) => b.score - a.score)
        const matched = scored[0]?.score > 3 ? scored[0].product : null

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
            text: `Mầm gợi ý bạn cuốn “Cây Cam Ngọt Của Tôi” – cuốn tiểu thuyết kinh điển lay động hàng triệu trái tim bạn đọc. Bạn có thể xem ngay chi tiết bên dưới nhé! 🌱`,
            bookId: 2,
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
