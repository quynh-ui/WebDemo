import React, { FormEvent, useMemo, useState } from "react";

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
  | "book";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 22l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    minus: <path d="M5 12h14" />,
    plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
    spark: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" /><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    truck: <><path d="M3 5h11v12H3z" /><path d="M14 9h4l3 3v5h-7" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.8 3 8.2 7 10 4-1.8 7-5.2 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23.5v-18Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5a3.5 3.5 0 0 1 3.5 3.5v-18Z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

type Product = {
  id: number;
  title: string;
  author: string;
  price: number;
  oldPrice?: number;
  category: string;
  rating: number;
  cover: string;
  text: string;
  tag?: string;
};

const products: Product[] = [
  { id: 1, title: "Ngày Xưa Có Một Chuyện Tình", author: "Nguyễn Nhật Ánh", price: 108000, oldPrice: 135000, category: "Văn học", rating: 4.9, cover: "cover-coral", text: "NGÀY XƯA\nCÓ MỘT\nCHUYỆN TÌNH", tag: "Bán chạy" },
  { id: 2, title: "Cây Cam Ngọt Của Tôi", author: "José Mauro de Vasconcelos", price: 86000, oldPrice: 108000, category: "Tiểu thuyết", rating: 4.8, cover: "cover-cream", text: "CÂY CAM\nNGỌT\nCỦA TÔI" },
  { id: 3, title: "Tâm Lý Học Về Tiền", author: "Morgan Housel", price: 128000, oldPrice: 189000, category: "Kinh tế", rating: 4.9, cover: "cover-green", text: "TÂM LÝ HỌC\nVỀ TIỀN", tag: "-32%" },
  { id: 4, title: "Nhà Giả Kim", author: "Paulo Coelho", price: 79000, category: "Tiểu thuyết", rating: 4.7, cover: "cover-gold", text: "NHÀ\nGIẢ KIM" },
  { id: 5, title: "Muôn Kiếp Nhân Sinh", author: "Nguyên Phong", price: 148000, oldPrice: 168000, category: "Tâm linh", rating: 4.8, cover: "cover-night", text: "MUÔN KIẾP\nNHÂN SINH", tag: "Mới" },
  { id: 6, title: "Không Diệt Không Sinh", author: "Thích Nhất Hạnh", price: 74000, category: "Kỹ năng sống", rating: 4.9, cover: "cover-blue", text: "KHÔNG DIỆT\nKHÔNG SINH" },
  { id: 7, title: "Dám Bị Ghét", author: "Koga Fumitake", price: 96000, oldPrice: 119000, category: "Kỹ năng sống", rating: 4.7, cover: "cover-red", text: "DÁM\nBỊ GHÉT" },
  { id: 8, title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ", author: "Nguyễn Nhật Ánh", price: 68000, category: "Văn học", rating: 4.8, cover: "cover-sky", text: "CHO TÔI XIN\nMỘT VÉ ĐI\nTUỔI THƠ" },
];

const categories = ["Tất cả", "Văn học", "Tiểu thuyết", "Kinh tế", "Kỹ năng sống", "Tâm linh"];
const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + "đ";

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Về trang chủ">
      <span className="logo-mark"><Icon name="book" size={25} /></span>
      <span><b>Mộc</b><em>Books</em></span>
    </button>
  );
}

function Header({
  cartCount,
  onCart,
  onAuth,
  onHome,
  onCatalog,
  query,
  setQuery,
}: {
  cartCount: number;
  onCart: () => void;
  onAuth: () => void;
  onHome: () => void;
  onCatalog: () => void;
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <>
      <div className="topbar">Miễn phí vận chuyển cho đơn hàng từ 299.000đ <span>Khám phá ngay</span></div>
      <header>
        <div className="header-inner">
          <Logo onClick={onHome} />
          <nav>
            <button onClick={onHome}>Trang chủ</button>
            <button onClick={onCatalog}>Kho sách</button>
            <button onClick={onCatalog}>Sách bán chạy</button>
            <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>Về Mộc</button>
          </nav>
          <div className="header-actions">
            <label className="search">
              <Icon name="search" size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tựa sách, tác giả..." />
            </label>
            <button className="icon-button" onClick={onAuth} aria-label="Tài khoản"><Icon name="user" /></button>
            <button className="icon-button cart-button" onClick={onCart} aria-label="Giỏ hàng"><Icon name="bag" /><span>{cartCount}</span></button>
          </div>
        </div>
      </header>
    </>
  );
}

function BookCover({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className={`book-cover ${product.cover} ${large ? "large" : ""}`}>
      <div className="cover-rule" />
      <small>{product.author}</small>
      <strong>{product.text.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
      <div className="cover-symbol"><Icon name="spark" size={large ? 34 : 25} /></div>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (id: number) => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="product-card">
      <div className="cover-wrap">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button className={`like ${liked ? "active" : ""}`} onClick={() => setLiked(!liked)} aria-label="Yêu thích"><Icon name="heart" size={18} /></button>
        <BookCover product={product} />
        <button className="quick-add" onClick={() => onAdd(product.id)}>Thêm vào giỏ</button>
      </div>
      <div className="rating"><Icon name="star" size={14} /> {product.rating} <span>(120+ đánh giá)</span></div>
      <h3>{product.title}</h3>
      <p>{product.author}</p>
      <div className="price"><b>{money(product.price)}</b>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div>
    </article>
  );
}

function Home({ onAdd, onCatalog }: { onAdd: (id: number) => void; onCatalog: () => void }) {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const visible = activeCategory === "Tất cả" ? products.slice(0, 4) : products.filter((p) => p.category === activeCategory).slice(0, 4);
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Mỗi trang sách, một chân trời mới</span>
          <h1>Đọc để <em>chạm</em><br />vào những điều<br />chưa từng biết.</h1>
          <p>Hàng ngàn tựa sách được tuyển chọn, đưa bạn đến gần hơn với tri thức, cảm xúc và những câu chuyện diệu kỳ.</p>
          <div className="hero-buttons">
            <button className="button primary" onClick={onCatalog}>Khám phá kho sách <Icon name="arrow" /></button>
            <button className="text-button" onClick={() => document.getElementById("bestseller")?.scrollIntoView({ behavior: "smooth" })}>Xem sách bán chạy</button>
          </div>
          <div className="hero-stats">
            <div><b>12K+</b><span>Tựa sách</span></div>
            <div><b>8K+</b><span>Độc giả</span></div>
            <div><b>4.9/5</b><span>Đánh giá</span></div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1790847330065-a50300cbd574?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200" alt="Một hiệu sách ấm áp với nhiều độc giả" />
          <div className="hero-note"><Icon name="spark" /><span><b>Gợi ý hôm nay</b>Đọc chậm, sống sâu hơn.</span></div>
          <div className="image-label">Không gian cho<br />người yêu sách</div>
        </div>
      </section>

      <section className="benefits">
        <div><span><Icon name="truck" /></span><p><b>Giao hàng toàn quốc</b><small>Nhanh chóng, an toàn</small></p></div>
        <div><span><Icon name="shield" /></span><p><b>Sách chính hãng</b><small>Cam kết 100% bản quyền</small></p></div>
        <div><span><Icon name="book" /></span><p><b>Đổi trả dễ dàng</b><small>Trong vòng 7 ngày</small></p></div>
        <div><span><Icon name="spark" /></span><p><b>Tư vấn tận tâm</b><small>Chọn đúng cuốn sách bạn cần</small></p></div>
      </section>

      <section className="section" id="bestseller">
        <div className="section-heading">
          <div><span className="eyebrow">Được độc giả yêu thích</span><h2>Sách nổi bật tuần này</h2></div>
          <button className="text-button" onClick={onCatalog}>Xem tất cả <Icon name="arrow" size={18} /></button>
        </div>
        <div className="category-tabs">
          {categories.slice(0, 5).map((category) => (
            <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>
        <div className="product-grid">{visible.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}</div>
      </section>

      <section className="quote-section" id="about">
        <div className="quote-art">
          <BookCover product={products[4]} large />
          <div className="mini-book"><BookCover product={products[1]} /></div>
        </div>
        <div className="quote-copy">
          <span className="eyebrow">Mộc chọn cho bạn</span>
          <blockquote>“Một cuốn sách hay trên giá sách là một người bạn dù quay lưng lại nhưng vẫn là bạn tốt.”</blockquote>
          <p>Mỗi cuốn sách tại Mộc đều được chọn bằng sự trân trọng dành cho tác giả và người đọc. Chúng tôi tin rằng đúng cuốn sách, đúng thời điểm có thể thay đổi một cuộc đời.</p>
          <button className="button dark" onClick={onCatalog}>Khám phá tuyển tập <Icon name="arrow" /></button>
        </div>
      </section>

      <section className="newsletter">
        <div><span className="eyebrow">Thư từ Mộc</span><h2>Nhận những câu chuyện hay<br />mỗi tuần.</h2></div>
        <form onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="Email của bạn" required /><button className="button primary">Đăng ký</button></form>
      </section>
    </main>
  );
}

function Catalog({ onAdd, query }: { onAdd: (id: number) => void; query: string }) {
  const [category, setCategory] = useState("Tất cả");
  const filtered = useMemo(() => products.filter((p) => {
    const matchCategory = category === "Tất cả" || p.category === category;
    const term = query.toLowerCase();
    return matchCategory && (p.title.toLowerCase().includes(term) || p.author.toLowerCase().includes(term));
  }), [category, query]);
  return (
    <main className="catalog-page section">
      <div className="catalog-hero"><span className="eyebrow">Kho sách của Mộc</span><h1>Tìm cuốn sách dành cho bạn</h1><p>Từ những câu chuyện làm rung động trái tim đến tri thức giúp bạn trưởng thành mỗi ngày.</p></div>
      <div className="catalog-layout">
        <aside><h3>Thể loại</h3>{categories.map((c) => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}<span>{c === "Tất cả" ? products.length : products.filter((p) => p.category === c).length}</span></button>)}</aside>
        <div>
          <div className="catalog-tools"><p>Hiển thị <b>{filtered.length}</b> cuốn sách</p><select aria-label="Sắp xếp"><option>Nổi bật nhất</option><option>Giá thấp đến cao</option><option>Mới nhất</option></select></div>
          {filtered.length ? <div className="product-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}</div> : <div className="empty"><Icon name="search" size={40} /><h3>Chưa tìm thấy cuốn sách phù hợp</h3><p>Thử tìm với từ khóa hoặc thể loại khác nhé.</p></div>}
        </div>
      </div>
    </main>
  );
}

function CartDrawer({ cart, onClose, onQuantity, onCheckout }: { cart: Record<number, number>; onClose: () => void; onQuantity: (id: number, delta: number) => void; onCheckout: () => void }) {
  const items = products.filter((p) => cart[p.id]);
  const subtotal = items.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="cart-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-title"><div><span>Giỏ hàng</span><small>{items.length} sản phẩm</small></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div>
        <div className="cart-items">
          {items.length === 0 ? <div className="empty"><Icon name="bag" size={44} /><h3>Giỏ hàng đang trống</h3><p>Những cuốn sách hay vẫn đang chờ bạn.</p></div> : items.map((p) => (
            <div className="cart-item" key={p.id}>
              <BookCover product={p} />
              <div className="cart-info"><h4>{p.title}</h4><p>{p.author}</p><b>{money(p.price)}</b><div className="quantity"><button onClick={() => onQuantity(p.id, -1)}><Icon name="minus" size={15} /></button><span>{cart[p.id]}</span><button onClick={() => onQuantity(p.id, 1)}><Icon name="plus" size={15} /></button></div></div>
            </div>
          ))}
        </div>
        {items.length > 0 && <div className="cart-summary"><div><span>Tạm tính</span><b>{money(subtotal)}</b></div><small>Phí vận chuyển sẽ được tính ở bước thanh toán</small><button className="button primary full" onClick={onCheckout}>Tiến hành thanh toán <Icon name="arrow" /></button><button className="continue" onClick={onClose}>Tiếp tục mua sắm</button></div>}
      </aside>
    </div>
  );
}

function Checkout({ cart, onSuccess }: { cart: Record<number, number>; onSuccess: () => void }) {
  const [payment, setPayment] = useState("cod");
  const [done, setDone] = useState(false);
  const items = products.filter((p) => cart[p.id]);
  const subtotal = items.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  const shipping = subtotal >= 299000 ? 0 : 30000;
  function submit(e: FormEvent) { e.preventDefault(); setDone(true); onSuccess(); }
  if (done) return <main className="success-page"><span className="success-icon"><Icon name="check" size={42} /></span><span className="eyebrow">Đặt hàng thành công</span><h1>Cảm ơn bạn đã chọn Mộc.</h1><p>Đơn hàng <b>#MOC24816</b> đã được xác nhận. Chúng tôi sẽ gửi sách đến bạn trong 2–4 ngày làm việc.</p><button className="button primary" onClick={() => window.location.reload()}>Tiếp tục khám phá</button></main>;
  return (
    <main className="checkout-page section">
      <div className="checkout-heading"><span className="eyebrow">Thanh toán an toàn</span><h1>Hoàn tất đơn hàng</h1></div>
      <form className="checkout-grid" onSubmit={submit}>
        <div className="checkout-form">
          <section><h2><span>1</span>Thông tin giao hàng</h2><div className="field-grid"><label>Họ và tên<input required placeholder="Nguyễn Văn An" /></label><label>Số điện thoại<input required type="tel" placeholder="090 123 4567" /></label><label className="wide">Email<input required type="email" placeholder="ban@email.com" /></label><label className="wide">Địa chỉ<input required placeholder="Số nhà, tên đường" /></label><label>Tỉnh / Thành phố<select required><option>TP. Hồ Chí Minh</option><option>Hà Nội</option><option>Đà Nẵng</option></select></label><label>Quận / Huyện<select required><option>Chọn quận / huyện</option><option>Quận 1</option><option>Quận 3</option></select></label></div></section>
          <section><h2><span>2</span>Phương thức thanh toán</h2><label className={`payment-option ${payment === "cod" ? "active" : ""}`}><input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} /><span><b>Thanh toán khi nhận hàng</b><small>Thanh toán bằng tiền mặt khi sách được giao tới.</small></span></label><label className={`payment-option ${payment === "bank" ? "active" : ""}`}><input type="radio" name="payment" checked={payment === "bank"} onChange={() => setPayment("bank")} /><span><b>Chuyển khoản ngân hàng</b><small>Quét mã QR hoặc chuyển khoản nhanh 24/7.</small></span></label></section>
        </div>
        <aside className="order-summary"><h2>Đơn hàng của bạn</h2>{items.map((p) => <div className="order-item" key={p.id}><BookCover product={p} /><div><b>{p.title}</b><small>Số lượng: {cart[p.id]}</small></div><strong>{money(p.price * cart[p.id])}</strong></div>)}<div className="costs"><p><span>Tạm tính</span><b>{money(subtotal)}</b></p><p><span>Phí vận chuyển</span><b>{shipping ? money(shipping) : "Miễn phí"}</b></p><div><span>Tổng cộng</span><strong>{money(subtotal + shipping)}</strong></div></div><button className="button primary full" type="submit">Đặt hàng <Icon name="arrow" /></button><small className="secure"><Icon name="shield" size={16} /> Thông tin của bạn luôn được bảo mật</small></aside>
      </form>
    </main>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [success, setSuccess] = useState(false);
  return (
    <div className="overlay auth-overlay" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}><Icon name="close" /></button>
        <Logo onClick={onClose} />
        {success ? <div className="auth-success"><span><Icon name="check" size={32} /></span><h2>Chào mừng bạn đến với Mộc</h2><p>Tài khoản đã sẵn sàng để cùng bạn khám phá những trang sách mới.</p><button className="button primary full" onClick={onClose}>Bắt đầu khám phá</button></div> : <>
          <div className="auth-heading"><span className="eyebrow">{mode === "login" ? "Chào mừng trở lại" : "Gia nhập cộng đồng Mộc"}</span><h2>{mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}</h2></div>
          <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Đăng nhập</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Đăng ký</button></div>
          <form onSubmit={(e) => { e.preventDefault(); setSuccess(true); }}>
            {mode === "register" && <label>Họ và tên<input required placeholder="Tên của bạn" /></label>}
            <label>Email<input required type="email" placeholder="ban@email.com" /></label>
            <label>Mật khẩu<input required type="password" placeholder="Tối thiểu 8 ký tự" /></label>
            {mode === "login" && <div className="form-meta"><label><input type="checkbox" /> Ghi nhớ tôi</label><button type="button">Quên mật khẩu?</button></div>}
            <button className="button primary full">{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"} <Icon name="arrow" /></button>
          </form>
          <p className="auth-policy">Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật của Mộc.</p>
        </>}
      </div>
    </div>
  );
}

type Message = { from: "bot" | "user"; text: string };
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: "Chào bạn, mình là Mầm. Hôm nay bạn muốn tìm một cuốn sách như thế nào?" }]);
  const suggestions = ["Sách chữa lành", "Truyện tình cảm", "Sách cho người mới đọc"];
  function send(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text }, { from: "bot", text: text.toLowerCase().includes("tình") ? "Nếu thích một câu chuyện tình dịu dàng, mình gợi ý “Ngày Xưa Có Một Chuyện Tình”. Đây là cuốn được độc giả Mộc đánh giá 4.9/5." : "Dựa trên điều bạn chia sẻ, mình nghĩ “Cây Cam Ngọt Của Tôi” sẽ là lựa chọn thật ấm áp. Bạn cũng có thể thử “Cho Tôi Xin Một Vé Đi Tuổi Thơ” nhé." }]);
    setInput("");
  }
  return (
    <div className="chatbot">
      {open && <div className="chat-window">
        <div className="chat-header"><div className="bot-avatar"><Icon name="spark" /></div><div><b>Mầm tư vấn sách</b><span><i /> Đang trực tuyến</span></div><button onClick={() => setOpen(false)}><Icon name="close" /></button></div>
        <div className="messages">{messages.map((m, index) => <div key={index} className={`message ${m.from}`}>{m.text}</div>)}</div>
        <div className="suggestions">{suggestions.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Hỏi Mầm về sách..." /><button aria-label="Gửi"><Icon name="send" size={18} /></button></form>
      </div>}
      <button className="chat-trigger" onClick={() => setOpen(!open)}><span><Icon name={open ? "close" : "spark"} /></span>{!open && <b>Nhờ Mầm tư vấn</b>}</button>
    </div>
  );
}

function Footer({ onCatalog }: { onCatalog: () => void }) {
  return <footer><div className="footer-main"><div><Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /><p>Gìn giữ tình yêu sách, nuôi dưỡng những tâm hồn rộng mở.</p></div><div><h4>Khám phá</h4><button onClick={onCatalog}>Kho sách</button><button onClick={onCatalog}>Sách mới</button><button onClick={onCatalog}>Sách bán chạy</button></div><div><h4>Hỗ trợ</h4><button>Hướng dẫn mua hàng</button><button>Chính sách đổi trả</button><button>Liên hệ</button></div><div><h4>Ghé thăm Mộc</h4><p>35 Nguyễn Bỉnh Khiêm, Quận 1<br />TP. Hồ Chí Minh</p><p>hello@mocbooks.vn<br />028 7300 2486</p></div></div><div className="footer-bottom">© 2025 Mộc Books. Mọi quyền được bảo lưu.<span>Đọc một trang, mở một thế giới.</span></div></footer>;
}

export default function App() {
  const [view, setView] = useState<"home" | "catalog" | "checkout">("home");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [query, setQuery] = useState("");
  const cartCount = Object.values(cart).reduce((sum, value) => sum + value, 0);

  function go(next: typeof view) { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function add(id: number) { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); setCartOpen(true); }
  function quantity(id: number, delta: number) { setCart((c) => { const next = { ...c, [id]: (c[id] || 0) + delta }; if (next[id] <= 0) delete next[id]; return next; }); }

  return (
    <div>
      <Header
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onAuth={() => setAuthOpen(true)}
        onHome={() => go("home")}
        onCatalog={() => go("catalog")}
        query={query}
        setQuery={(value) => {
          setQuery(value);
          if (value && view !== "catalog") go("catalog");
        }}
      />

      {view === "home" && <Home onAdd={add} onCatalog={() => go("catalog")} />}
      {view === "catalog" && <Catalog onAdd={add} query={query} />}
      {view === "checkout" && <Checkout cart={cart} onSuccess={() => setCart({})} />}

      <Footer onCatalog={() => go("catalog")} />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onQuantity={quantity}
          onCheckout={() => {
            setCartOpen(false);
            go("checkout");
          }}
        />
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <Chatbot />
    </div>
  );
}