// src/Catalog.tsx
import React, { useMemo, useState } from "react"
import { Product } from "./types"
import { products, categories } from "./data" // <-- LẤY DỮ LIỆU TỰ ĐỘNG TỪ DATA

const formatMoney = (val: number) =>
  new Intl.NumberFormat("vi-VN").format(val) + "đ"

// Bìa sách
function CatalogBookCover({ product }: { product: Product }) {
  return (
    <div className={`book-cover ${product.cover}`}>
      <div className="cover-rule" />
      <small>{product.author}</small>
      <strong>
        {product.text.split("\n").map((line, idx) => (
          <span key={idx}>{line}</span>
        ))}
      </strong>
    </div>
  )
}

// Thẻ sản phẩm
function CatalogProductCard({
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
    <article className="product-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="cover-wrap">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button
          className={`like ${liked ? "active" : ""}`}
          onClick={() => setLiked(!liked)}
          type="button"
          aria-label="Yêu thích"
        >
          ♥
        </button>
        <CatalogBookCover product={product} />
      </div>

      <div className="rating" style={{ marginTop: "12px" }}>
        ★ {product.rating} <span>(120+ đánh giá)</span>
      </div>
      <h3>{product.title}</h3>
      <p>{product.author}</p>
      
      <div className="price" style={{ marginBottom: "14px" }}>
        <b>{formatMoney(product.price)}</b>
        {product.oldPrice && <del>{formatMoney(product.oldPrice)}</del>}
      </div>

      {/* Cụm nút thao tác gọn gàng dưới cùng */}
      <div style={{ marginTop: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
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
            fontSize: "16px",
            flexShrink: 0
          }}
        >
          🛒
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
          }}
        >
          Mua ngay
        </button>
      </div>
    </article>
  )
}

// Component Kho Sách chính
export function Catalog({
  onAdd,
  query = "",
}: {
  onAdd: (id: number) => void
  query?: string
}) {
  const [category, setCategory] = useState("Tất cả")
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured")

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchCategory = category === "Tất cả" || p.category === category
      const term = (query || "").toLowerCase().trim()
      return (
        matchCategory &&
        (p.title.toLowerCase().includes(term) ||
          p.author.toLowerCase().includes(term))
      )
    })

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => b.rating - a.rating)
    }

    return list
  }, [category, query, sortBy])

  return (
    <main className="catalog-page section" style={{ paddingTop: "24px" }}>
      {/* Thanh tiêu đề & công cụ sắp xếp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "16px",
          marginBottom: "24px",
          borderBottom: "1px solid #e8e6dc",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#df6b43",
              fontWeight: 700,
            }}
          >
            Kho sách Mộc Books
          </span>
          <h2 style={{ fontSize: "22px", margin: "4px 0 0", color: "#1f3026", fontWeight: 700 }}>
            Tất cả tác phẩm
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Hiển thị <b>{filtered.length}</b> cuốn sách
          </span>
          <select
            aria-label="Sắp xếp"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #dcd9cd",
              background: "#fff",
              fontSize: "13px",
              cursor: "pointer",
              outline: "none",
              color: "#1f3026",
              fontWeight: 500,
            }}
          >
            <option value="featured">✨ Nổi bật nhất</option>
            <option value="price-asc">💵 Giá: Thấp đến cao</option>
            <option value="price-desc">💎 Giá: Cao đến thấp</option>
            <option value="rating">⭐ Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Cột thể loại bên trái & lưới sách bên phải */}
      <div className="catalog-layout">
        <aside>
          <h3>Thể loại</h3>
          {categories.map((c) => {
            const count =
              c === "Tất cả"
                ? products.length
                : products.filter((p) => p.category === c).length
            return (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
                type="button"
              >
                {c}
                <span>{count}</span>
              </button>
            )
          })}
        </aside>

        <div>
          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((p) => (
                <CatalogProductCard key={p.id} product={p} onAdd={onAdd} />
              ))}
            </div>
          ) : (
            <div className="empty" style={{ textAlign: "center", padding: "60px 20px" }}>
              <h3 style={{ color: "#1f3026" }}>Chưa tìm thấy cuốn sách phù hợp</h3>
              <p style={{ color: "#666" }}>Thử tìm với từ khóa hoặc thể loại khác nhé.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}