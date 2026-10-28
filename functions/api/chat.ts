// Cloudflare Pages Functions - Cloudflare Workers AI + RAG Endpoint
// Route: POST /api/chat

type PagesFunction<T = any> = (context: {
  request: Request & { cf?: any };
  env: T;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}) => Promise<Response> | Response;

interface Env {
  AI?: any; // Cloudflare Workers AI binding (@cf/meta/llama-3-8b-instruct)
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

interface ProductInfo {
  id: number;
  title: string;
  author: string;
  price: number;
  oldPrice?: number;
  category: string;
  rating: number;
  description: string;
  keywords: string[];
}

export const BOOK_CATALOG: ProductInfo[] = [
  {
    id: 1,
    title: "Ngày Xưa Có Một Chuyện Tình",
    author: "Nguyễn Nhật Ánh",
    price: 108000,
    oldPrice: 135000,
    category: "Văn học",
    rating: 4.9,
    description: "Câu chuyện tình bạn và tình yêu tuổi học trò đầy xúc động, trong sáng nhưng sâu sắc. Thích hợp làm quà tặng người yêu, crush, kỷ niệm tình bạn.",
    keywords: ["tinh yeu", "crush", "nguoi yeu", "ban gai", "hoc tro", "nguyen nhat anh", "qua tang", "lang man", "tinh cam"]
  },
  {
    id: 2,
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    price: 86000,
    oldPrice: 108000,
    category: "Tiểu thuyết",
    rating: 4.8,
    description: "Tác phẩm kinh điển cảm động về tuổi thơ, tình yêu thương và sự sẻ chia. Xoa dịu tâm hồn, mang lại sự đồng cảm ấm áp cho trái tim tổn thương.",
    keywords: ["cam dong", "chua lanh", "tuoi tho", "buon", "am ap", "tieu thuyet", "kinh dien", "tam hon"]
  },
  {
    id: 3,
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    price: 79000,
    category: "Tiểu thuyết",
    rating: 4.7,
    description: "Hành trình theo đuổi ước mơ và lắng nghe tiếng gọi trái tim của chàng chăn cừu Santiago. Sách ngắn gọn (khoảng 200 trang), dễ đọc, truyền cảm hứng sống mạnh mẽ.",
    keywords: ["uoc mo", "de doc", "ngan", "nguoi moi", "dong luc", "triet ly", "truyen cam hung", "muc tieu"]
  },
  {
    id: 4,
    title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
    author: "Nguyễn Nhật Ánh",
    price: 68000,
    oldPrice: 85000,
    category: "Văn học",
    rating: 4.8,
    description: "Chuyến tàu trở về với ký ức ấu thơ tinh nghịch, trong trẻo và hồn nhiên, giúp giải tỏa căng thẳng sau những giờ làm việc mệt mỏi.",
    keywords: ["tuoi tho", "hai huoc", "vui ve", "thu gian", "nguyen nhat anh", "nhe nhang", "tieng cuoi"]
  },
  {
    id: 5,
    title: "Rừng Na Uy",
    author: "Haruki Murakami",
    price: 135000,
    oldPrice: 160000,
    category: "Tiểu thuyết",
    rating: 4.6,
    description: "Kiệt tác văn học Nhật Bản về nỗi cô đơn, tình yêu và sự trưởng thành của những người trẻ tuổi.",
    keywords: ["murakami", "rung na uy", "nhat ban", "co don", "sau lang", "tuoi tre"]
  },
  {
    id: 6,
    title: "Tâm Lý Học Về Tiền",
    author: "Morgan Housel",
    price: 128000,
    oldPrice: 189000,
    category: "Kinh tế",
    rating: 4.9,
    description: "Khám phá cách con người tư duy và đưa ra quyết định với tiền bạc. Giúp xây dựng tư duy tài chính thông minh, đầu tư bền vững.",
    keywords: ["tien", "lam giau", "kinh te", "tai chinh", "dau tu", "kinh doanh", "quan ly tai chinh", "kiem tien"]
  },
  {
    id: 7,
    title: "Cha Giàu Cha Nghèo",
    author: "Robert T. Kiyosaki",
    price: 99000,
    oldPrice: 125000,
    category: "Kinh tế",
    rating: 4.8,
    description: "Khai sáng tư duy độc lập tài chính, giải thích sự khác biệt giữa tài sản và tiêu sản, bài học làm giàu kinh điển thế giới.",
    keywords: ["cha giau cha ngheo", "robert kiyosaki", "tai san", "tieu san", "lam giau", "kinh te"]
  },
  {
    id: 8,
    title: "Bước Đi Ngẫu Nhiên Trên Phố Wall",
    author: "Burton G. Malkiel",
    price: 165000,
    oldPrice: 199000,
    category: "Kinh tế",
    rating: 4.7,
    description: "Cẩm nang đầu tư chứng khoán và quản lý danh mục tài chính thông minh dành cho nhà đầu tư cá nhân.",
    keywords: ["chung khoan", "pho wall", "dau tu", "co phieu", "tai chinh"]
  },
  {
    id: 9,
    title: "Không Diệt Không Sinh",
    author: "Thích Nhất Hạnh",
    price: 74000,
    category: "Kỹ năng sống",
    rating: 4.9,
    description: "Bài học thiền tập và chánh niệm xoa dịu nỗi sợ hãi, buông bỏ lo âu, đem lại sự an lạc tĩnh lặng trong tâm hồn giữa cuộc sống bộn bề.",
    keywords: ["chua lanh", "binh an", "an lac", "stress", "met moi", "thien", "thich nhat hanh", "tam hon", "ap luc", "lo au"]
  },
  {
    id: 10,
    title: "Dám Bị Ghét",
    author: "Koga Fumitake",
    price: 96000,
    oldPrice: 119000,
    category: "Kỹ năng sống",
    rating: 4.7,
    description: "Tâm lý học Adler dưới dạng đối thoại triết học: giải phóng bản thân khỏi phán xét của người khác để sống tự do, can đảm và hạnh phúc đích thực.",
    keywords: ["tu tin", "ap luc", "xa hoi", "tam ly", "dung cam", "hanh phuc", "phat trien ban than", "tu do"]
  },
  {
    id: 11,
    title: "Thói Quen Nguyên Tử (Atomic Habits)",
    author: "James Clear",
    price: 145000,
    oldPrice: 189000,
    category: "Kỹ năng sống",
    rating: 5.0,
    description: "Phương pháp thay đổi thói quen nhỏ mỗi ngày 1% để tạo nên những bứt phá phi thường trong sự nghiệp và đời sống.",
    keywords: ["thoi quen", "atomic habits", "james clear", "nang suat", "ky luat", "thay doi"]
  },
  {
    id: 12,
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: 78000,
    oldPrice: 98000,
    category: "Kỹ năng sống",
    rating: 4.8,
    description: "Nghệ thuật giao tiếp, thấu hiểu tâm lý và thu phục lòng người kinh điển nhất mọi thời đại.",
    keywords: ["dac nhan tam", "giao tiep", "quan he", "ung xu", "thu phuc"]
  },
  {
    id: 13,
    title: "Muôn Kiếp Nhân Sinh",
    author: "Nguyên Phong",
    price: 148000,
    oldPrice: 168000,
    category: "Tâm linh",
    rating: 4.8,
    description: "Bức tranh toàn cảnh về luật nhân quả, luân hồi và những bài học chuyển hóa cuộc đời qua các tiền kiếp.",
    keywords: ["tam linh", "nhan qua", "luan hoi", "cuoc song", "chiem nghiem", "vu tru", "nguyen phong"]
  },
  {
    id: 14,
    title: "Hành Trình Về Phương Đông",
    author: "Baird T. Spalding",
    price: 88000,
    oldPrice: 110000,
    category: "Tâm linh",
    rating: 4.9,
    description: "Cuộc hành trình kỳ thú của đoàn khoa học Anh khám phá triết học huyền bí, yoga và sự tĩnh lặng của phương Đông.",
    keywords: ["phuong dong", "dao phat", "yoga", "huyen bi", "tinh lang"]
  },
  {
    id: 15,
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    price: 185000,
    oldPrice: 220000,
    category: "Lịch sử",
    rating: 4.9,
    description: "Cái nhìn toàn cảnh về hành trình tiến hóa của loài người từ sinh vật tầm thường đến chúa tể Trái Đất.",
    keywords: ["sapiens", "lich su", "loai nguoi", "tien hoa", "khoa hoc"]
  },
  {
    id: 16,
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    price: 195000,
    oldPrice: 235000,
    category: "Lịch sử",
    rating: 4.8,
    description: "Dự báo về vận mệnh tương lai của nhân loại trước làn sóng AI, công nghệ sinh học và trí tuệ nhân tạo.",
    keywords: ["homo deus", "tuong lai", "cong nghe", "tri tue nhan tao", "van menh"]
  },
  {
    id: 17,
    title: "Cuộc Cách Mạng Trí Tuệ Nhân Tạo",
    author: "Kai-Fu Lee",
    price: 156000,
    category: "Công nghệ",
    rating: 4.8,
    description: "Phân tích sâu sắc về làn sóng AI đang thay đổi trật tự kinh tế, việc làm và xã hội toàn cầu.",
    keywords: ["ai", "tri tue nhan tao", "cong nghe", "kai fu lee", "tuong lai"]
  },
  {
    id: 18,
    title: "Clean Code: Mã Sạch Tinh Gọn",
    author: "Robert C. Martin",
    price: 210000,
    oldPrice: 260000,
    category: "Công nghệ",
    rating: 4.9,
    description: "Cẩm nang gối đầu giường của mọi lập trình viên về nghệ thuật viết mã nguồn sạch, dễ bảo trì và chuyên nghiệp.",
    keywords: ["clean code", "lap trinh", "code", "coder", "developer", "cong nghe thong tin"]
  },
  {
    id: 19,
    title: "Hoàng Tử Bé",
    author: "Antoine de Saint-Exupéry",
    price: 52000,
    oldPrice: 65000,
    category: "Thiếu nhi",
    rating: 4.9,
    description: "Câu chuyện ngụ ngôn giàu chất thơ về tình yêu thương, trách nhiệm và vẻ đẹp thuần khiết nhìn bằng trái tim.",
    keywords: ["hoang tu be", "thieu nhi", "tho mong", "triet ly", "nhe nhang"]
  },
  {
    id: 20,
    title: "Hiểu Về Trái Tim",
    author: "Thầy Minh Niệm",
    price: 125000,
    oldPrice: 155000,
    category: "Tâm lý học",
    rating: 5.0,
    description: "Tác phẩm soi rọi và hàn gắn mọi tổn thương cảm xúc (sân hận, ghen tuông, cô đơn, khổ đau) để sống an yên.",
    keywords: ["hieu ve trai tim", "minh niem", "chua lanh", "ton thuong", "tinh yeu", "an yen", "tam ly"]
  },
  {
    id: 21,
    title: "Dế Mèn Phiêu Lưu Ký",
    author: "Tô Hoài",
    price: 45000,
    oldPrice: 55000,
    category: "Thiếu nhi",
    rating: 4.9,
    description: "Tác phẩm văn học thiếu nhi kinh điển Việt Nam về bài học trưởng thành, tình bạn và khát vọng tự do.",
    keywords: ["de men", "to hoai", "thieu nhi", "tuoi tho", "viet nam"]
  },
  {
    id: 22,
    title: "Chuyện Con Mèo Dạy Hải Âu Bay",
    author: "Luis Sepúlveda",
    price: 49000,
    oldPrice: 60000,
    category: "Thiếu nhi",
    rating: 4.9,
    description: "Câu chuyện trong trẻo và ấm áp về tình yêu thương không biên giới và lòng dũng cảm vượt qua giới hạn.",
    keywords: ["hai au bay", "con meo", "thieu nhi", "cam dong", "am ap"]
  },
  {
    id: 23,
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    price: 175000,
    oldPrice: 219000,
    category: "Tâm lý học",
    rating: 4.8,
    description: "Khám phá hai hệ thống tư duy chi phối cách con người nhận định, phán đoán và ra quyết định trong cuộc sống.",
    keywords: ["tu duy nhanh va cham", "daniel kahneman", "tam ly hoc", "quyết dinh", "nhan thuc"]
  },
  {
    id: 24,
    title: "Tâm Lý Học Đám Đông",
    author: "Gustave Le Bon",
    price: 89000,
    oldPrice: 110000,
    category: "Tâm lý học",
    rating: 4.7,
    description: "Khảo cứu kinh điển về hành vi, sự cuồng nộ và bản chất tâm lý của đám đông trong xã hội hiện đại.",
    keywords: ["tam ly dam dong", "le bon", "xa hoi", "hanh vi"]
  },
  {
    id: 25,
    title: "Đi Tìm Lẽ Sống",
    author: "Viktor E. Frankl",
    price: 88000,
    oldPrice: 105000,
    category: "Tâm lý học",
    rating: 4.9,
    description: "Trải nghiệm vượt qua trại tập trung Đức Quốc Xã và liệu pháp ý nghĩa giúp con người tìm thấy mục đích sống ngay trong nghịch cảnh cùng cực.",
    keywords: ["di tim le song", "viktor frankl", "y nghia cuoc song", "vuot qua nghich canh", "chua lanh", "tam ly"]
  }
];

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function retrieveRelevantBooks(query: string): ProductInfo[] {
  const cleanQ = removeVietnameseTones(query);
  const scored = BOOK_CATALOG.map((book) => {
    let score = 0;
    const cleanTitle = removeVietnameseTones(book.title);
    const cleanAuthor = removeVietnameseTones(book.author);
    const cleanCategory = removeVietnameseTones(book.category);
    const cleanDesc = removeVietnameseTones(book.description);

    if (cleanQ.includes(cleanTitle)) score += 15;
    if (cleanQ.includes(cleanAuthor)) score += 10;
    if (cleanQ.includes(cleanCategory)) score += 8;

    for (const kw of book.keywords) {
      if (cleanQ.includes(kw)) score += 5;
    }

    const words = cleanQ.split(/\s+/).filter((w) => w.length > 1);
    for (const word of words) {
      if (cleanTitle.includes(word)) score += 3;
      if (cleanDesc.includes(word)) score += 1;
    }
    return { book, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.book);
  if (topMatches.length > 0) {
    return topMatches.slice(0, 3);
  }
  return [BOOK_CATALOG[1], BOOK_CATALOG[0], BOOK_CATALOG[5]];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body: any = await context.request.json();
    const query = (body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Tin nhắn không được để trống" }),
        { status: 400, headers }
      );
    }

    const clean = removeVietnameseTones(query);

    // 1. Phản hồi các thông tin nghiệp vụ cửa hàng (nhanh & chính xác)
    const isShipping = ["ship", "phi van chuyen", "giao hang", "freeship", "bao lau", "may ngay"].some((k) => clean.includes(k));
    const isReturn = ["doi tra", "tra hang", "bao hanh", "rach", "hong", "loi"].some((k) => clean.includes(k));
    const isAddress = ["dia chi", "o dau", "cua hang", "chi nhanh", "den xem"].some((k) => clean.includes(k));
    const isDiscount = ["ma", "voucher", "giam gia", "sale", "khuyen mai", "uu dai"].some((k) => clean.includes(k));

    if (isShipping) {
      return new Response(
        JSON.stringify({
          response: "📦 Chính sách vận chuyển của Mộc Books:\n• Miễn phí giao hàng toàn quốc cho đơn từ 299.000đ.\n• Đơn dưới 299.000đ: Phí ship đồng giá 30.000đ.\n• Thời gian giao hàng: Từ 2–4 ngày làm việc tận tay bạn nhé!",
          model: "Llama-3-8B (Edge Fast-Path)",
          edgeLocation: "Cloudflare Edge",
        }),
        { status: 200, headers }
      );
    }

    if (isReturn) {
      return new Response(
        JSON.stringify({
          response: "📖 Mộc Books cam kết:\n• Đổi trả miễn phí trong vòng 7 ngày nếu sách bị lỗi in ấn, rách hoặc móp méo do vận chuyển.\n• 100% sách chính hãng có bản quyền đầy đủ.",
          model: "Llama-3-8B (Edge Fast-Path)",
          edgeLocation: "Cloudflare Edge",
        }),
        { status: 200, headers }
      );
    }

    if (isAddress) {
      return new Response(
        JSON.stringify({
          response: "📍 Bạn có thể ghé thăm hiệu sách tại: 98 Nguyễn Hữu Quỳnh, Hiệp Hòa, Bắc Ninh.\nHoặc đặt hàng trực tiếp ngay trên website để được ship tận nhà nhé!",
          model: "Llama-3-8B (Edge Fast-Path)",
          edgeLocation: "Cloudflare Edge",
        }),
        { status: 200, headers }
      );
    }

    if (isDiscount) {
      return new Response(
        JSON.stringify({
          response: "🎉 Mầm tặng bạn ưu đãi độc quyền hôm nay:\n• Nhập mã MOC15: Giảm ngay 15% tổng hóa đơn\n• Đơn từ 299.000đ: Tự động MIỄN PHÍ VẬN CHUYỂN toàn quốc!\nBạn có muốn Mầm gợi ý thêm tựa sách nào đang bán chạy nhất không nè?",
          model: "Llama-3-8B (Edge Fast-Path)",
          edgeLocation: "Cloudflare Edge",
        }),
        { status: 200, headers }
      );
    }

    // 2. RAG Retrieval Phase: Truy xuất sách phù hợp từ kho tri thức
    const retrievedBooks = retrieveRelevantBooks(query);
    const retrievedContext = retrievedBooks
      .map(
        (b) =>
          `- [ID: ${b.id}] "${b.title}" (${b.author}) | Giá: ${b.price.toLocaleString("vi-VN")}đ (${b.rating} sao) | Thể loại: ${b.category} | Điểm nổi bật: ${b.description}`
      )
      .join("\n");

    const systemPrompt = `Bạn là "Mầm" - trợ lý AI tư vấn sách thông minh tại hiệu sách "Mộc Books", chạy trực tiếp trên máy chủ biên Cloudflare Workers AI với mô hình Llama-3-8B.
Tính cách: Ấm áp, nhẹ nhàng, tinh tế, hiểu tâm lý độc giả và chu đáo (xưng là "Mầm", gọi khách là "bạn").

DỮ LIỆU SÁCH TRUY XUẤT ĐƯỢC TỪ KHO MỘC BOOKS (RAG KNOWLEDGE CONTEXT):
${retrievedContext}

CHÍNH SÁCH ƯU ĐÃI:
- Mã MOC15: Giảm 15% cho mọi đơn hàng.
- Miễn phí vận chuyển toàn quốc cho đơn từ 299.000đ.
- Đóng gói vintage nơ thừng và thiệp miễn phí.

QUY TẮC:
1. Trả lời bằng tiếng Việt tự nhiên, súc tích (khoảng 2-3 câu).
2. Khi gợi ý sách, hãy thêm thẻ [RECOMMEND: id_sách] ở cuối tin nhắn (ví dụ: [RECOMMEND: ${retrievedBooks[0].id}]) để hệ thống hiện thẻ mua hàng.`;

    let generatedText = "";
    let modelUsed = "@cf/meta/llama-3-8b-instruct";
    let recommendedBookId: number | undefined = retrievedBooks[0]?.id;

    // 3. RAG Generation Phase: Gọi Cloudflare Workers AI Binding
    if (context.env?.AI) {
      try {
        const messages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-4).map((h: any) => ({
            role: h.from === "bot" ? "assistant" : "user",
            content: h.text,
          })),
          { role: "user", content: query },
        ];

        const aiResponse: any = await context.env.AI.run(
          "@cf/meta/llama-3-8b-instruct",
          {
            messages,
            max_tokens: 300,
            temperature: 0.6,
          }
        );

        if (aiResponse?.response) {
          generatedText = aiResponse.response;
        }
      } catch (aiErr) {
        console.error("Workers AI run error, fallback to Edge Generator:", aiErr);
      }
    }

    // 4. Fallback Generator thông minh nếu chưa bật AI binding
    if (!generatedText) {
      const primaryBook = retrievedBooks[0];
      if (["chua lanh", "buon", "stress", "met", "ap luc", "binh an"].some((k) => clean.includes(k))) {
        generatedText = `Mầm hiểu những lúc tâm trạng cần một chốn bình yên 🌱. Mầm gợi ý bạn cuốn “${BOOK_CATALOG[8].title}” (Thích Nhất Hạnh) hoặc “${BOOK_CATALOG[19].title}” (Thầy Minh Niệm). Từng trang sách như một tách trà ấm xoa dịu đi những âu lo thường nhật của bạn.\n[RECOMMEND: ${BOOK_CATALOG[8].id}]`;
        recommendedBookId = BOOK_CATALOG[8].id;
      } else if (["tien", "giau", "kinh te", "tai chinh", "dau tu", "kinh doanh"].some((k) => clean.includes(k))) {
        generatedText = `Đầu tư cho tư duy tài chính luôn là khoản sinh lời bền vững nhất! Mầm xin gợi ý ngay cuốn “${BOOK_CATALOG[5].title}” của tác giả ${BOOK_CATALOG[5].author} – tác phẩm phân tích tâm lý tiền bạc sâu sắc, hiện đang có ưu đãi 32% tại Mộc.\n[RECOMMEND: ${BOOK_CATALOG[5].id}]`;
        recommendedBookId = BOOK_CATALOG[5].id;
      } else if (["tinh", "yeu", "crush", "qua", "tang", "ban gai"].some((k) => clean.includes(k))) {
        generatedText = `Một cuốn sách chứa đầy sự tinh tế chính là món quà ý nghĩa nhất! Mầm gợi ý cuốn “${BOOK_CATALOG[0].title}” của ${BOOK_CATALOG[0].author}. Mộc sẽ hỗ trợ bạn gói quà vintage nơ thừng và tặng kèm thiệp xinh xắn hoàn toàn miễn phí nhé!\n[RECOMMEND: ${BOOK_CATALOG[0].id}]`;
        recommendedBookId = BOOK_CATALOG[0].id;
      } else if (["cong nghe", "it", "code", "lap trinh", "ai"].some((k) => clean.includes(k))) {
        generatedText = `Nếu bạn yêu thích công nghệ và lập trình, Mầm xin gợi ý cuốn “${BOOK_CATALOG[17].title}” của Robert C. Martin hoặc “${BOOK_CATALOG[16].title}” của Kai-Fu Lee – những tác phẩm đỉnh cao cho người làm kỹ thuật!\n[RECOMMEND: ${BOOK_CATALOG[17].id}]`;
        recommendedBookId = BOOK_CATALOG[17].id;
      } else {
        generatedText = `Dạ Mầm rất vui được hỗ trợ bạn! Mầm xin gợi ý cuốn sách rất được bạn đọc yêu thích: “${primaryBook.title}” của tác giả ${primaryBook.author} (${primaryBook.rating}/5 ⭐). Cuốn sách này ${primaryBook.description.toLowerCase()}\n[RECOMMEND: ${primaryBook.id}]`;
        recommendedBookId = primaryBook.id;
      }
    }

    const match = generatedText.match(/\[RECOMMEND:\s*(\d+)\]/i);
    if (match) {
      recommendedBookId = parseInt(match[1], 10);
      generatedText = generatedText.replace(/\[RECOMMEND:\s*(\d+)\]/gi, "").trim();
    }

    return new Response(
      JSON.stringify({
        response: generatedText,
        bookId: recommendedBookId,
        model: modelUsed,
        edgeLocation: "Cloudflare Edge",
        retrievedBooks: retrievedBooks.map((b) => b.id),
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Lỗi xử lý Workers AI trên Edge",
        details: error?.message || String(error),
      }),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
