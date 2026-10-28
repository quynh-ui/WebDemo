// src/OrderHistory.tsx
import React from "react"
import { Order } from "./types"

const money = (val: number) =>
  new Intl.NumberFormat("vi-VN").format(val) + "đ"

// BẮT BUỘC PHẢI CÓ CHỮ "export" Ở ĐÂY:
export function OrderHistory({
  orders,
  onHome,
  onCatalog,
}: {
  orders: Order[]
  onHome: () => void
  onCatalog: () => void
}) {
  return (
    <main style={{ maxWidth: "860px", margin: "40px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #e8e6dc",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#df6b43", fontWeight: 700 }}>
            Tài khoản
          </span>
          <h1 style={{ fontSize: "24px", margin: "4px 0 0", color: "#1f3026" }}>
            Lịch sử đơn hàng ({orders ? orders.length : 0})
          </h1>
        </div>
        <button
          type="button"
          onClick={onCatalog}
          style={{
            background: "#df6b43",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Khám phá thêm sách →
        </button>
      </div>

      {!orders || orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: "10px",
            border: "1px solid #e8e6dc",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📦</div>
          <h3 style={{ margin: "0 0 8px", color: "#1f3026" }}>Bạn chưa có đơn hàng nào</h3>
          <p style={{ color: "#777", marginBottom: "20px" }}>Những cuốn sách hay vẫn đang chờ đón bạn.</p>
          <button
            type="button"
            onClick={onCatalog}
            style={{
              background: "#1f3026",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#fff",
                borderRadius: "10px",
                border: "1px solid #e8e6dc",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                <div>
                  <b>Đơn #{order.id}</b>
                  <div style={{ fontSize: "12px", color: "#888" }}>{order.createdAt}</div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: order.payment === "bank" ? "#137333" : "#d9381e",
                  }}
                >
                  {order.payment === "bank" ? "VietQR (Đã chuyển khoản)" : "COD (Thanh toán khi nhận)"}
                </span>
              </div>

              <div style={{ padding: "12px 0" }}>
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: "6px 0",
                      fontSize: "14px",
                    }}
                  >
                    <span>
                      {item.title} x{item.quantity}
                    </span>
                    <b>{money(item.price * item.quantity)}</b>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <div>
                  Giao đến: {order.address} ({order.phone})
                </div>
                <div>
                  Tổng tiền: <b style={{ color: "#df6b43", fontSize: "16px" }}>{money(order.total)}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}