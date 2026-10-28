// src/App.tsx
import React, { FormEvent, useEffect, useMemo, useState } from "react"
import { User, Order } from "./types"
import { AuthModal } from "./AuthModal"
import { Catalog } from "./Catalog"
import { products, categories } from "./data"
import { OrderHistory } from "./OrderHistory"
import { Chatbot } from "./Chatbot"

// 1. GIAO DIỆN ICON (Vẽ toàn bộ Icon SVG)
type IconName =
  | "search"
  | "user"
  | "bag"
  | "arrow"
  | "star"
  | "heart"
  | "close"
  | "minus"
  | "plus"
  | "send"
  | "spark"
  | "check"
  | "truck"
  | "shield"
  | "book"

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l-1 13H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    heart: (
      <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 22l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    plus: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    truck: (
      <>
        <path d="M3 5h11v12H3z" />
        <path d="M14 9h4l3 3v5h-7" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.8 3 8.2 7 10 4-1.8 7-5.2 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23.5v-18Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5a3.5 3.5 0 0 1 3.5 3.5v-18Z" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

// 2. DỮ LIỆU SÁCH & CÔNG CỤ TÍNH TOÁN
type Product = {
  id: number
  title: string
  author: string
  price: number
  oldPrice?: number
  category: string
  rating: number
  cover: string
  text: string
  tag?: string
}

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ"

// 3. GIAO DIỆN ĐIỀU HƯỚNG (Header & Logo)
function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Về trang chủ">
      <span className="logo-mark">
        <Icon name="book" size={25} />
      </span>
      <span>
        <b>Mộc</b>
        <em>Books</em>
      </span>
    </button>
  )
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

function Header({
  cartCount,
  onCart,
  onAuth,
  onHome,
  onCatalog,
  onBestseller,
  onAbout,
  onOrders,
  query,
  setQuery,
  currentUser,
  onLogout,
}: {
  cartCount: number
  onCart: () => void
  onAuth: () => void
  onHome: () => void
  onCatalog: () => void
  onBestseller: () => void
  onAbout: () => void
  onOrders: () => void
  query: string
  setQuery: (value: string) => void
  currentUser: User | null
  onLogout: () => void
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  const synonyms: Record<string, string[]> = {
    "hoat hinh": ["thiếu nhi", "hoàng tử bé", "dế mèn", "hải âu"],
    "truyen tranh": ["thiếu nhi", "tuổi thơ"],
    "tai chinh": ["kinh tế", "tiền", "phố wall", "giàu"],
    "chua lanh": ["tâm linh", "kỹ năng sống", "không diệt", "trái tim"],
  }

  const searchSuggestions = useMemo(() => {
    const rawTerm = query.trim()
    if (!rawTerm) return []

    const cleanTerm = removeVietnameseTones(rawTerm)
    let relatedTerms = [cleanTerm]

    Object.keys(synonyms).forEach((key) => {
      if (cleanTerm.includes(key) || key.includes(cleanTerm)) {
        relatedTerms = [
          ...relatedTerms,
          ...synonyms[key].map(removeVietnameseTones),
        ]
      }
    })

    return products
      .filter((p) => {
        const titleNoTone = removeVietnameseTones(p.title)
        const authorNoTone = removeVietnameseTones(p.author)
        const catNoTone = removeVietnameseTones(p.category)
        const textNoTone = removeVietnameseTones(p.text)

        return relatedTerms.some(
          (term) =>
            titleNoTone.includes(term) ||
            authorNoTone.includes(term) ||
            catNoTone.includes(term) ||
            textNoTone.includes(term)
        )
      })
      .slice(0, 5)
  }, [query])

  return (
    <>
      <div className="topbar">
        Miễn phí vận chuyển cho đơn hàng từ 299.000đ <span>Khám phá ngay</span>
      </div>
      <header>
        <div className="header-inner">
          <Logo onClick={onHome} />
          <nav>
            <button type="button" onClick={onHome}>
              Trang chủ
            </button>
            <button type="button" onClick={onCatalog}>
              Kho sách
            </button>
            <button type="button" onClick={onBestseller}>
              Sách bán chạy
            </button>
            <button type="button" onClick={onAbout}>
              Về Mộc
            </button>
            {/* NÚT ĐƠN HÀNG NẰM CẠNH VỀ MỘC */}
            <button type="button" onClick={onOrders}>
              Đơn hàng
            </button>
          </nav>

          <div className="header-actions">
            <div style={{ position: "relative" }}>
              <label className="search">
                <Icon name="search" size={18} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
                  placeholder="Tìm tựa sách, tác giả, thể loại..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("")
                      setShowDropdown(false)
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0 6px",
                      color: "#888",
                      fontSize: "14px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </label>

              {showDropdown && query.trim().length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    background: "#ffffff",
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    border: "1px solid #e8e6dc",
                    zIndex: 999,
                    overflow: "hidden",
                    minWidth: "320px",
                  }}
                >
                  {searchSuggestions.length > 0 ? (
                    <div>
                      <div
                        style={{
                          padding: "8px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#888",
                          background: "#faf9f5",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        Gợi ý tác phẩm phù hợp
                      </div>
                      {searchSuggestions.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            setQuery(book.title)
                            setShowDropdown(false)
                            onCatalog()
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f3f2ec",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f7f6f0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffffff")
                          }
                        >
                          <div
                            className={`book-cover ${book.cover}`}
                            style={{
                              width: "32px",
                              height: "44px",
                              borderRadius: "3px",
                              flexShrink: 0,
                            }}
                          />
                          <div
                            style={{ flex: 1, minWidth: 0, textAlign: "left" }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1f3026",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {book.title}
                            </div>
                            <div style={{ fontSize: "11px", color: "#666" }}>
                              {book.author} •{" "}
                              <span style={{ color: "#df6b43" }}>
                                {book.category}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#df6b43",
                            }}
                          >
                            {money(book.price)}
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          setShowDropdown(false)
                          onCatalog()
                        }}
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#df6b43",
                          background: "#faf9f5",
                          cursor: "pointer",
                        }}
                      >
                        Xem tất cả kết quả cho "{query}" →
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#888",
                      }}
                    >
                      Không tìm thấy cuốn sách nào khớp với từ khóa "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentUser ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  Chào, {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Đăng xuất"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#df6b43",
                    cursor: "pointer",
                    fontSize: "12px",
                    textDecoration: "underline",
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                className="icon-button"
                onClick={onAuth}
                aria-label="Tài khoản"
                type="button"
              >
                <Icon name="user" />
              </button>
            )}

            <button
              className="icon-button cart-button"
              onClick={onCart}
              aria-label="Giỏ hàng"
              type="button"
            >
              <Icon name="bag" />
              <span>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

// 4. GIAO DIỆN THẺ SẢN PHẨM & BÌA SÁCH
function BookCover({
  product,
  large = false,
}: {
  product: Product
  large?: boolean
}) {
  return (
    <div className={`book-cover ${product.cover} ${large ? "large" : ""}`}>
      <div className="cover-rule" />
      <small>{product.author}</small>
      <strong>
        {product.text.split("\n").map((line) => (
          <span key={line}>{line}</span>
        ))}
      </strong>
      <div className="cover-symbol">
        <Icon name="spark" size={large ? 34 : 25} />
      </div>
    </div>
  )
}

function ProductCard({
  product,
  onAdd,
  onBuyNow,
}: {
  product: Product
  onAdd: (id: number) => void
  onBuyNow: (id: number) => void
}) {
  const [liked, setLiked] = useState(false)
  return (
    <article
      className="product-card"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div className="cover-wrap">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button
          className={`like ${liked ? "active" : ""}`}
          onClick={() => setLiked(!liked)}
          type="button"
          aria-label="Yêu thích"
        >
          <Icon name="heart" size={18} />
        </button>
        <BookCover product={product} />
      </div>

      <div className="rating" style={{ marginTop: "12px" }}>
        <Icon name="star" size={14} /> {product.rating}{" "}
        <span>(120+ đánh giá)</span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.author}</p>

      <div className="price" style={{ marginBottom: "14px" }}>
        <b>{money(product.price)}</b>
        {product.oldPrice && <del>{money(product.oldPrice)}</del>}
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          title="Thêm vào giỏ hàng"
          onClick={() => onAdd(product.id)}
          style={{
            width: "42px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f1f0e8",
            border: "1px solid #dcd9cd",
            borderRadius: "6px",
            cursor: "pointer",
            color: "#1f3026",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e4e2d5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f0e8")}
        >
          <Icon name="bag" size={18} />
        </button>

        <button
          type="button"
          onClick={() => onBuyNow(product.id)}
          style={{
            flex: 1,
            height: "38px",
            background: "#df6b43",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(223, 107, 67, 0.25)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#c85932")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#df6b43")}
        >
          Mua ngay
        </button>
      </div>
    </article>
  )
}

// 5. TRANG CHỦ (Home Page)
function Home({
  onAdd,
  onBuyNow,
  onCatalog,
}: {
  onAdd: (id: number) => void
  onBuyNow: (id: number) => void
  onCatalog: () => void
}) {
  const [activeCategory, setActiveCategory] = useState("Tất cả")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredProducts = useMemo(() => {
    return activeCategory === "Tất cả"
      ? products
      : products.filter((p) => p.category === activeCategory)
  }, [activeCategory])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const visible = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  function handleSelectCategory(cat: string) {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Mỗi trang sách, một chân trời mới</span>
          <h1>
            Đọc để <em>chạm</em>
            <br />
            vào những điều
            <br />
            chưa từng biết.
          </h1>
          <p>
            Hàng ngàn tựa sách được tuyển chọn, đưa bạn đến gần hơn với tri
            thức, cảm xúc và những câu chuyện diệu kỳ.
          </p>
          <div className="hero-buttons">
            <button className="button primary" onClick={onCatalog} type="button">
              Khám phá kho sách <Icon name="arrow" />
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() =>
                document
                  .getElementById("bestseller")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Xem sách bán chạy
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <b>12K+</b>
              <span>Tựa sách</span>
            </div>
            <div>
              <b>8K+</b>
              <span>Độc giả</span>
            </div>
            <div>
              <b>4.9/5</b>
              <span>Đánh giá</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
            alt="Một hiệu sách ấm áp với nhiều độc giả"
            loading="eager"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
            }}
          />
          <div className="hero-note">
            <Icon name="spark" />
            <span>
              <b>Gợi ý hôm nay</b>Đọc chậm, sống sâu hơn.
            </span>
          </div>
          <div className="image-label">
            Không gian cho
            <br />
            người yêu sách
          </div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <span>
            <Icon name="truck" />
          </span>
          <p>
            <b>Giao hàng toàn quốc</b>
            <small>Nhanh chóng, an toàn</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="shield" />
          </span>
          <p>
            <b>Sách chính hãng</b>
            <small>Cam kết 100% bản quyền</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="book" />
          </span>
          <p>
            <b>Đổi trả dễ dàng</b>
            <small>Trong vòng 7 ngày</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="spark" />
          </span>
          <p>
            <b>Tư vấn tận tâm</b>
            <small>Chọn đúng cuốn sách bạn cần</small>
          </p>
        </div>
      </section>

      <section className="section" id="bestseller">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Được độc giả yêu thích</span>
            <h2>Sách nổi bật tuần này</h2>
          </div>
          <button className="text-button" onClick={onCatalog} type="button">
            Xem tất cả <Icon name="arrow" size={18} />
          </button>
        </div>

        <div
          className="category-tabs"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => handleSelectCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={onAdd}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "32px",
            }}
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1))
                document
                  .getElementById("bestseller")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #dcd9cd",
                background: currentPage === 1 ? "#f1f0e8" : "#fff",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                color: "#1f3026",
                fontWeight: 600,
              }}
            >
              ← Trang trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => {
                  setCurrentPage(page)
                  document
                    .getElementById("bestseller")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border:
                    page === currentPage
                      ? "1px solid #1f3026"
                      : "1px solid #dcd9cd",
                  background: page === currentPage ? "#1f3026" : "#fff",
                  color: page === currentPage ? "#fff" : "#1f3026",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                document
                  .getElementById("bestseller")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #dcd9cd",
                background: currentPage === totalPages ? "#f1f0e8" : "#fff",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                color: "#1f3026",
                fontWeight: 600,
              }}
            >
              Trang sau →
            </button>
          </div>
        )}
      </section>

      <section className="quote-section" id="about">
        <div className="quote-art">
          <BookCover product={products[4] || products[0]} large />
          <div className="mini-book">
            <BookCover product={products[1] || products[0]} />
          </div>
        </div>
        <div className="quote-copy">
          <span className="eyebrow">Mộc chọn cho bạn</span>
          <blockquote>
            “Một cuốn sách hay trên giá sách là một người bạn dù quay lưng lại
            nhưng vẫn là bạn tốt.”
          </blockquote>
          <p>
            Mỗi cuốn sách tại Mộc đều được chọn bằng sự trân trọng dành cho tác
            giả và người đọc. Chúng tôi tin rằng đúng cuốn sách, đúng thời điểm
            có thể thay đổi một cuộc đời.
          </p>
          <button className="button dark" onClick={onCatalog} type="button">
            Khám phá tuyển tập <Icon name="arrow" />
          </button>
        </div>
      </section>

      <section className="newsletter">
        <div>
          <span className="eyebrow">Thư từ Mộc</span>
          <h2>
            Nhận những câu chuyện hay
            <br />
            mỗi tuần.
          </h2>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Email của bạn" required />
          <button className="button primary" type="submit">
            Đăng ký
          </button>
        </form>
      </section>
    </main>
  )
}

// 7. GIAO DIỆN GIỎ HÀNG (Cart Drawer)
function CartDrawer({
  cart,
  onClose,
  onQuantity,
  onRemove,
  onCheckout,
}: {
  cart: Record<number, number>
  onClose: () => void
  onQuantity: (id: number, delta: number) => void
  onRemove: (id: number) => void
  onCheckout: () => void
}) {
  const items = products.filter((p) => cart[p.id])
  const subtotal = items.reduce((sum, p) => sum + p.price * cart[p.id], 0)

  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="cart-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-title">
          <div>
            <span>Giỏ hàng</span>
            <small>{items.length} sản phẩm</small>
          </div>
          <button className="icon-button" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty">
              <Icon name="bag" size={44} />
              <h3>Giỏ hàng đang trống</h3>
              <p>Những cuốn sách hay vẫn đang chờ bạn.</p>
            </div>
          ) : (
            items.map((p) => (
              <div
                className="cart-item"
                key={p.id}
                style={{ position: "relative" }}
              >
                <BookCover product={p} />
                <div className="cart-info" style={{ flex: 1 }}>
                  <h4>{p.title}</h4>
                  <p>{p.author}</p>
                  <b>{money(p.price)}</b>

                  <div className="quantity">
                    <button type="button" onClick={() => onQuantity(p.id, -1)}>
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{cart[p.id]}</span>
                    <button type="button" onClick={() => onQuantity(p.id, 1)}>
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  title="Xóa cuốn này"
                  onClick={() => onRemove(p.id)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "none",
                    border: "none",
                    color: "#a09e93",
                    cursor: "pointer",
                    padding: "4px",
                    fontSize: "14px",
                    lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#d9383a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#a09e93")
                  }
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-summary">
            <div>
              <span>Tạm tính</span>
              <b>{money(subtotal)}</b>
            </div>
            <small>Phí vận chuyển sẽ được tính ở bước thanh toán</small>
            <button
              className="button primary full"
              onClick={onCheckout}
              type="button"
            >
              Tiến hành thanh toán <Icon name="arrow" />
            </button>
            <button className="continue" onClick={onClose} type="button">
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

// 8. TRANG THANH TOÁN (Checkout)
interface Province {
  code: number
  name: string
}
interface District {
  code: number
  name: string
}
interface Ward {
  code: number
  name: string
}

function Checkout({
  cart,
  onSuccess,
  onHome,
  onSaveOrder,
}: {
  cart: Record<number, number>
  onSuccess: () => void
  onHome: () => void
  onSaveOrder: (order: Order) => void
}) {
  const [payment, setPayment] = useState<"cod" | "bank">("cod")
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [streetAddress, setStreetAddress] = useState("")

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data: Province[]) => {
        setProvinces(data)
        if (data.length > 0) setSelectedProvince(data[0])
      })
      .catch((err) => console.error("Lỗi nạp tỉnh thành:", err))
  }, [])

  useEffect(() => {
    if (!selectedProvince) return
    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const dList: District[] = data.districts || []
        setDistricts(dList)
        setSelectedDistrict(dList.length > 0 ? dList[0] : null)
      })
      .catch((err) => console.error("Lỗi nạp quận huyện:", err))
  }, [selectedProvince])

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([])
      setSelectedWard(null)
      return
    }
    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const wList: Ward[] = data.wards || []
        setWards(wList)
        setSelectedWard(wList.length > 0 ? wList[0] : null)
      })
      .catch((err) => console.error("Lỗi nạp phường xã:", err))
  }, [selectedDistrict])

  const items = products.filter((p) => cart[p.id])
  const subtotal = items.reduce((sum, p) => sum + p.price * cart[p.id], 0)
  const shipping = subtotal >= 299000 || subtotal === 0 ? 0 : 30000
  const grandTotal = subtotal + shipping

  const fullAddress = `${streetAddress ? streetAddress + ", " : ""}${
    selectedWard?.name ? selectedWard.name + ", " : ""
  }${selectedDistrict?.name ? selectedDistrict.name + ", " : ""}${
    selectedProvince?.name || ""
  }`

  function submit(e: FormEvent) {
    e.preventDefault()
    const randomCode = "MOC" + Math.floor(100000 + Math.random() * 900000)
    setOrderId(randomCode)

    const newOrder: Order = {
      id: randomCode,
      createdAt: new Date().toLocaleString("vi-VN"),
      name,
      phone,
      email,
      address: fullAddress,
      payment,
      items: items.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        quantity: cart[p.id],
        cover: p.cover,
      })),
      subtotal,
      shipping,
      total: grandTotal,
    }

    onSaveOrder(newOrder)
    setDone(true)
    onSuccess()
  }

  if (done) {
    return (
      <main
        className="success-page section"
        style={{ textAlign: "center", padding: "60px 20px" }}
      >
        <span
          className="success-icon"
          style={{
            display: "inline-block",
            marginBottom: "16px",
            color: "#2d6a4f",
          }}
        >
          <Icon name="check" size={54} />
        </span>
        <span
          className="eyebrow"
          style={{ color: "#df6b43", fontWeight: 700, letterSpacing: "1px" }}
        >
          Đặt hàng thành công
        </span>
        <h1 style={{ fontSize: "28px", margin: "12px 0", color: "#1f3026" }}>
          Cảm ơn {name} đã đặt sách tại Mộc!
        </h1>
        <p
          style={{
            color: "#666",
            maxWidth: "540px",
            margin: "0 auto 24px",
            lineHeight: "1.6",
          }}
        >
          Đơn hàng <b>#{orderId}</b> đã được tiếp nhận.<br />
          Địa chỉ giao hàng:{" "}
          <b style={{ color: "#1f3026" }}>{fullAddress}</b> (SĐT: <b>{phone}</b>
          ).
        </p>
        <button
          className="button primary"
          onClick={onHome}
          type="button"
          style={{ padding: "12px 28px", fontSize: "15px" }}
        >
          Tiếp tục khám phá sách <Icon name="arrow" />
        </button>
      </main>
    )
  }

  return (
    <main className="checkout-page section">
      <div className="checkout-heading">
        <span className="eyebrow">Thanh toán an toàn</span>
        <h1>Hoàn tất đơn hàng</h1>
      </div>
      <form className="checkout-grid" onSubmit={submit}>
        <div className="checkout-form">
          <section>
            <h2>
              <span>1</span>Thông tin giao hàng
            </h2>
            <div className="field-grid">
              <label>
                Họ và tên người nhận *
                <input
                  required
                  placeholder="Nhập họ và tên..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Số điện thoại người nhận *
                <input
                  required
                  type="tel"
                  placeholder="Ví dụ: 0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="wide">
                Email nhận thông báo
                <input
                  type="email"
                  placeholder="email@example.com (không bắt buộc)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label>
                Tỉnh / Thành phố *
                <select
                  required
                  value={selectedProvince?.code || ""}
                  onChange={(e) => {
                    const prov = provinces.find(
                      (p) => p.code === Number(e.target.value)
                    )
                    setSelectedProvince(prov || null)
                  }}
                >
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quận / Huyện *
                <select
                  required
                  value={selectedDistrict?.code || ""}
                  onChange={(e) => {
                    const dist = districts.find(
                      (d) => d.code === Number(e.target.value)
                    )
                    setSelectedDistrict(dist || null)
                  }}
                >
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="wide">
                Phường / Xã *
                <select
                  required
                  value={selectedWard?.code || ""}
                  onChange={(e) => {
                    const w = wards.find(
                      (item) => item.code === Number(e.target.value)
                    )
                    setSelectedWard(w || null)
                  }}
                >
                  {wards.length === 0 ? (
                    <option value="">(Đang nạp phường/xã...)</option>
                  ) : (
                    wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="wide">
                Địa chỉ chi tiết (Số nhà, tên đường, ngõ xóm...) *
                <input
                  required
                  placeholder="Ví dụ: Số 12 ngõ 45, phố..."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section>
            <h2>
              <span>2</span>Phương thức thanh toán
            </h2>
            <label
              className={`payment-option ${
                payment === "cod" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
              />
              <span>
                <b>Thanh toán khi nhận hàng (COD)</b>
                <small>Thanh toán tiền mặt khi shipper giao sách tới nơi.</small>
              </span>
            </label>

            <label
              className={`payment-option ${
                payment === "bank" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === "bank"}
                onChange={() => setPayment("bank")}
              />
              <span>
                <b>Chuyển khoản trực tuyến qua VietQR</b>
                <small>
                  Quét mã QR qua ứng dụng ngân hàng xác nhận đơn nhanh.
                </small>
              </span>
            </label>

            {payment === "bank" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#f9f8f3",
                  borderRadius: "10px",
                  border: "1px dashed #df6b43",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    fontWeight: 600,
                    color: "#1f3026",
                    fontSize: "14px",
                  }}
                >
                  Quét mã QR để thanh toán:
                </p>
                <img
                  src={`https://api.vietqr.io/image/970422-0987654321-compact2.jpg?amount=${grandTotal}&addInfo=MOCBOOKS%20THANHTOAN&accountName=MOC%20BOOKS`}
                  alt="Mã QR Chuyển Khoản"
                  style={{
                    width: "220px",
                    height: "auto",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "10px",
                    lineHeight: "1.5",
                  }}
                >
                  Ngân hàng: <b>MB Bank (Quân Đội)</b> • STK:{" "}
                  <b>0987654321</b>
                  <br />
                  Chủ TK: <b>MỘC BOOKS</b> • Số tiền:{" "}
                  <b style={{ color: "#df6b43" }}>{money(grandTotal)}</b>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="order-summary">
          <h2>Đơn hàng của bạn</h2>
          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              marginBottom: "16px",
            }}
          >
            {items.map((p) => (
              <div className="order-item" key={p.id}>
                <BookCover product={p} />
                <div>
                  <b>{p.title}</b>
                  <small>Số lượng: {cart[p.id]}</small>
                </div>
                <strong>{money(p.price * cart[p.id])}</strong>
              </div>
            ))}
          </div>

          <div className="costs">
            <p>
              <span>Tạm tính</span>
              <b>{money(subtotal)}</b>
            </p>
            <p>
              <span>Phí vận chuyển</span>
              <b>{shipping ? money(shipping) : "Miễn phí"}</b>
            </p>
            <div>
              <span>Tổng thanh toán</span>
              <strong style={{ color: "#df6b43", fontSize: "20px" }}>
                {money(grandTotal)}
              </strong>
            </div>
          </div>

          <button
            className="button primary full"
            type="submit"
            disabled={items.length === 0}
          >
            {payment === "bank"
              ? "Tôi đã chuyển khoản - Xác nhận đặt hàng"
              : "Xác nhận đặt hàng"}{" "}
            <Icon name="arrow" />
          </button>
          <small className="secure">
            <Icon name="shield" size={16} /> Thông tin và giao dịch luôn được bảo mật
          </small>
        </aside>
      </form>
    </main>
  )
}

// 11. CHÂN TRANG (Footer)
function Footer({ onCatalog }: { onCatalog: () => void }) {
  return (
    <footer>
      <div className="footer-main">
        <div>
          <Logo
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
          <p>Gìn giữ tình yêu sách, nuôi dưỡng những tâm hồn rộng mở.</p>
        </div>
        <div>
          <h4>Khám phá</h4>
          <button onClick={onCatalog}>Kho sách</button>
          <button onClick={onCatalog}>Sách mới</button>
          <button onClick={onCatalog}>Sách bán chạy</button>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <button>Hướng dẫn mua hàng</button>
          <button>Chính sách đổi trả</button>
          <button>Liên hệ</button>
        </div>
        <div>
          <h4>Ghé thăm Mộc</h4>
          <p>
            98 Nguyễn Hữu Quỳnh, Hiệp Hòa
            <br />
            Bắc Ninh
          </p>
          <p>
            hello@mocbooks.vn
            <br />
            028 7300 2486
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 Mộc Books. Mọi quyền được bảo lưu.
        <span>Đọc một trang, mở một thế giới.</span>
      </div>
    </footer>
  )
}

// 12. ĐIỀU PHỐI CHÍNH (App Component)
export default function App() {
  const [view, setView] = useState<"home" | "catalog" | "checkout" | "orders">(
    "home"
  )

  // Đọc giỏ hàng từ localStorage
  const [cart, setCart] = useState<Record<number, number>>(() => {
    try {
      const savedCart = localStorage.getItem("moc_cart")
      return savedCart ? JSON.parse(savedCart) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("moc_cart", JSON.stringify(cart))
    } catch (e) {
      console.error(e)
    }
  }, [cart])

  // Quản lý và lưu trữ Lịch sử đơn hàng
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("moc_orders")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("moc_orders", JSON.stringify(orders))
    } catch (e) {
      console.error(e)
    }
  }, [orders])

  function handleSaveOrder(order: Order) {
    setOrders((prev) => [order, ...prev])
  }

  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [query, setQuery] = useState("")

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("moc_current_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  function handleLogout() {
    localStorage.removeItem("moc_current_user")
    setCurrentUser(null)
  }

  const cartCount = Object.values(cart).reduce((sum, value) => sum + value, 0)

  function go(next: typeof view) {
    setView(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function add(id: number) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
    setCartOpen(true)
  }

  function buyNow(id: number) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
    setCartOpen(false)
    go("checkout")
  }

  function quantity(id: number, delta: number) {
    setCart((c) => {
      const next = { ...c, [id]: (c[id] || 0) + delta }
      if (next[id] <= 0) delete next[id]
      return next
    })
  }

  function removeItem(id: number) {
    setCart((c) => {
      const next = { ...c }
      delete next[id]
      return next
    })
  }

  function scrollToElement(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  function handleGoBestseller() {
    if (view !== "home") {
      setView("home")
      setTimeout(() => scrollToElement("bestseller"), 100)
    } else {
      scrollToElement("bestseller")
    }
  }

  function handleGoAbout() {
    if (view !== "home") {
      setView("home")
      setTimeout(() => scrollToElement("about"), 100)
    } else {
      scrollToElement("about")
    }
  }

  return (
    <div>
      <Header
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onAuth={() => setAuthOpen(true)}
        onHome={() => go("home")}
        onCatalog={() => go("catalog")}
        onBestseller={handleGoBestseller}
        onAbout={handleGoAbout}
        onOrders={() => go("orders")}
        query={query}
        setQuery={(value) => {
          setQuery(value)
          if (value && view !== "catalog") go("catalog")
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {view === "home" && (
        <Home
          onAdd={add}
          onBuyNow={buyNow}
          onCatalog={() => go("catalog")}
        />
      )}

      {view === "catalog" && (
        <Catalog
          onAdd={add}
          onBuyNow={buyNow}
          query={query}
        />
      )}

      {view === "orders" && (
        <OrderHistory
          orders={orders}
          onHome={() => go("home")}
          onCatalog={() => go("catalog")}
        />
      )}

      {view === "checkout" && (
        <Checkout
          cart={cart}
          onHome={() => go("home")}
          onSaveOrder={handleSaveOrder}
          onSuccess={() => {
            setCart({})
            localStorage.removeItem("moc_cart")
          }}
        />
      )}

      <Footer onCatalog={() => go("catalog")} />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onQuantity={quantity}
          onRemove={removeItem}
          onCheckout={() => {
            setCartOpen(false)
            go("checkout")
          }}
        />
      )}

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user)
            setAuthOpen(false)
          }}
        />
      )}

      <Chatbot
        onAdd={add}
        onCheckout={() => {
          setCartOpen(false)
          go("checkout")
        }}
      />
    </div>
  )
}