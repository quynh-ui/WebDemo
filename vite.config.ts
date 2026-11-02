import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

import siteConfiguration from "./.figma/make/site.json"

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === "development"

  return {
    base: process.env.FIGMA_PUBLIC_URL
      ? `${process.env.FIGMA_PUBLIC_URL}/`
      : "./",
    build: {
      sourcemap: emitSourcemaps ? "inline" : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      figmaSiteConfiguration(siteConfiguration),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: "/src/**/*.stories.{ts,tsx,js,jsx}" }),
      cloudflareWorkersAiDevPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      host: process.env.FIGMA_DEV_SERVER_HOST || "0.0.0.0",
      port: parseInt(process.env.PORT || "8443"),
      strictPort: true,
      watch: {
        ignored: ["**/.figma/**"],
      },
    },
    preview: {
      host: process.env.FIGMA_DEV_SERVER_HOST || "0.0.0.0",
      port: parseInt(process.env.PORT || "8443"),
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, "") || ""
  }
  function escapeHtmlText(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }
  function replaceHtmlCommentSlot(
    html: string,
    slotName: string,
    content: string,
  ): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ""
  const favicon = config.icons?.icon ?? ""
  const socialImage = config.openGraph?.image ?? ""
  const language = sanitizeHtmlValue(config.language) || "en"
  const googleAnalyticsId = sanitizeHtmlValue(
    config.analytics?.googleAnalyticsId,
  )
  const headStart = config.customScripts?.headStart ?? ""
  const headEnd = config.customScripts?.headEnd ?? ""
  const bodyStart = config.customScripts?.bodyStart ?? ""
  const bodyEnd = config.customScripts?.bodyEnd ?? ""
  const robotsTxt =
    config.robots?.index === false ? "User-agent: *\nDisallow: /\n" : ""

  return {
    name: "figma-site-configuration",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split("?")[0] !== "/robots.txt")
          return next()

        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, "figma:lang", language)
        result = replaceHtmlCommentSlot(
          result,
          "figma:title",
          escapeHtmlText(title),
        )
        result = replaceHtmlCommentSlot(result, "figma:head-start", headStart)
        result = replaceHtmlCommentSlot(result, "figma:head-end", headEnd)
        result = replaceHtmlCommentSlot(result, "figma:body-start", bodyStart)
        result = replaceHtmlCommentSlot(result, "figma:body-end", bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({
            tag: "meta",
            attrs: { name: "description", content: description },
            injectTo: "head",
          })
        }
        if (config.robots?.index === false) {
          tags.push({
            tag: "meta",
            attrs: { name: "robots", content: "noindex, nofollow" },
            injectTo: "head",
          })
        }
        if (favicon) {
          tags.push({
            tag: "link",
            attrs: { rel: "icon", href: favicon },
            injectTo: "head",
          })
        }
        if (title) {
          tags.push({
            tag: "meta",
            attrs: { property: "og:title", content: title },
            injectTo: "head",
          })
        }
        if (description) {
          tags.push({
            tag: "meta",
            attrs: { property: "og:description", content: description },
            injectTo: "head",
          })
        }
        if (socialImage) {
          tags.push(
            {
              tag: "meta",
              attrs: { property: "og:image", content: socialImage },
              injectTo: "head",
            },
            {
              tag: "meta",
              attrs: { name: "twitter:card", content: "summary_large_image" },
              injectTo: "head",
            },
            {
              tag: "meta",
              attrs: { name: "twitter:image", content: socialImage },
              injectTo: "head",
            },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: "script",
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: "head",
            },
            {
              tag: "script",
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: "head",
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: "style",
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: "head",
            },
            {
              tag: "a",
              attrs: { class: "figma-bypass-link", href: "#root" },
              children: "Skip to content",
              injectTo: "body-prepend",
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: "figma-error-overlay-replay",
    apply: "serve",
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (
        ...args: any[]
      ) => void
      server.ws.send = (((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === "error") {
            lastError = (payload as object)
          } else if (type === "update" || type === "full-reload") {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send)

      server.ws.on("connection", (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  const hadRefreshBoundary = new Map<string, boolean>()
  let sendFullReload: (() => void) | null = null

  return {
    name: "figma-react-refresh-boundary-fallback",
    apply: "serve",
    enforce: "post",
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: "full-reload", path: "*" })
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes("/node_modules/"))
        return null

      const moduleId = id.split("?")[0] ?? id
      const hasRefreshBoundary = code.includes("registerExportsForReactRefresh")
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: {
  storiesGlob: string | string[]
}): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob)
    ? options.storiesGlob
    : [options.storiesGlob]
  const ROUTE = "/.figma/make/kit.html"
  const VIRTUAL_ID = "virtual:figma-stories"
  const RESOLVED_ID = "\0" + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: "figma-make-kit",
    apply: "serve",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ""
        if (url.split("?")[0] !== ROUTE) return next()

        try {
          res.setHeader("Content-Type", "text/html")
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}


function cloudflareWorkersAiDevPlugin(): Plugin {
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

  return {
    name: "cloudflare-workers-ai-dev",
    configureServer(server) {
      server.middlewares.use("/api/chat", (req, res) => {
        if (req.method === "POST") {
          let body = ""
          req.on("data", (chunk: any) => {
            body += chunk
          })
          req.on("end", () => {
            try {
              const data = JSON.parse(body || "{}")
              const raw = (data.message || "").trim()
              const clean = removeVietnameseTones(raw)
              let response = ""
              let bookId: number | undefined

              if (containsAny(clean, ["mua 2", "mua 3", "mua 4", "mua 5", "mua nhieu", "mua duoc khong", "mua duoc ko", "dat mua", "cach mua", "mua may cuon", "so luong"])) {
                response = "Dạ bạn mua bao nhiêu cuốn cũng được hết nha! 🥰\n\nBạn chỉ cần bấm nút \"+ Thêm vào giỏ\" cho từng cuốn bạn ưng ý, sau đó mở Giỏ hàng để bấm \"Đặt hàng ngay\" là xong ạ.\n• Đặc biệt: Đơn hàng từ 299.000đ sẽ được tự động MIỄN PHÍ SHIP toàn quốc đó bạn!"
              } else if (containsAny(clean, ["chi vao xem", "khong mua", "ko mua", "xem thoi", "dao choi", "xem choi", "ngam thoi", "luon lo", "tham quan"])) {
                response = "Dạ không sao hết nè bạn ơi! 😊 Bạn cứ thong thả dạo chơi, ngắm nghía từng cuốn sách nhé. Mộc Books luôn mở rộng cửa đón bạn ghé thăm thư giãn lúc rảnh rỗi. Khi nào cần tìm cuốn gì hay cứ ới Mầm nha!"
              } else if (containsAny(clean, ["dep the", "web dep", "xinh the", "giao dien dep", "xin xo", "dinh the"])) {
                response = "Mầm cảm ơn bạn nhiều nha! 🌱 Đội ngũ Mộc Books đã chăm chút từng góc nhỏ để mang lại cảm giác mộc mạc, bình yên như một tiệm sách gỗ thật sự đó ạ. Chúc bạn có những phút giây thư thái!"
              } else if (containsAny(clean, ["phi ship", "tien ship", "giao hang", "ship bao lau", "may ngay den", "phi van chuyen", "freeship"])) {
                response = "📦 Chính sách vận chuyển của Mộc Books:\n• Miễn phí giao hàng toàn quốc cho đơn từ 299.000đ.\n• Đơn dưới 299.000đ: Phí ship đồng giá 30.000đ.\n• Thời gian giao hàng: Từ 2–4 ngày làm việc tận tay bạn nhé!"
              } else if (containsAny(clean, ["doi tra", "tra hang", "bao hanh", "bi rach", "bi hong", "bi loi", "sach loi", "loi in"])) {
                response = "📖 Mộc Books cam kết:\n• Đổi trả miễn phí trong vòng 7 ngày nếu sách bị lỗi in ấn, rách hoặc móp méo do vận chuyển.\n• 100% sách chính hãng có bản quyền đầy đủ."
              } else if (containsAny(clean, ["dia chi", "cua hang o dau", "dia chi o dau", "chi nhanh"])) {
                response = "📍 Bạn có thể ghé thăm hiệu sách tại: 98 Nguyễn Hữu Quỳnh, Hiệp Hòa, Bắc Ninh.\nHoặc đặt hàng trực tiếp ngay trên website để được ship tận nhà nhé!"
              } else if (containsAny(clean, ["ma giam gia", "voucher", "khuyen mai", "uu dai", "co giam gia khong"])) {
                response = "🎉 Mầm tặng bạn ưu đãi hôm nay:\n• Nhập mã MOC15: Giảm ngay 15% tổng hóa đơn\n• Đơn từ 299.000đ: Miễn phí vận chuyển toàn quốc!\nBạn có muốn Mầm gợi ý thêm tựa sách hay nào không nè?"
              } else if (containsAny(clean, ["o to", "xe hoi", "xe may", "xe dap", "dien thoai", "iphone", "samsung", "laptop", "quan ao", "giay dep", "son moi", "my pham", "tra sua", "banh mi"])) {
                response = `Ôi bạn ơi, Mộc Books hiện chỉ bán những cuốn sách nuôi dưỡng tâm hồn và tri thức chứ chưa có bán "${raw}" đâu nè 😆!\n\nNếu bạn muốn có thêm tư duy, kiến thức kinh doanh hay làm giàu để sớm tậu được món đồ ưng ý, Mầm gợi ý bạn tham khảo cuốn “Tâm Lý Học Về Tiền” nhé!`
                bookId = 6
              } else if (containsAny(clean, ["tu van", "goi y", "nen mua", "mua sach gi", "sach nao hay", "de xuat", "gioi thieu", "mua gi", "recommend"])) {
                response = "Dạ Mầm rất sẵn lòng tư vấn cho bạn nè! 🌱 Dưới đây là những cuốn sách được bạn đọc yêu thích nhất tại Mộc:\n\n• 🌿 Chữa lành & ấm áp: “Cây Cam Ngọt Của Tôi” (José Mauro)\n• 💰 Tư duy làm giàu: “Tâm Lý Học Về Tiền” (Morgan Housel)\n• 🎯 Rèn luyện kỷ luật: “Thói Quen Nguyên Tử” (James Clear)\n\nBạn thích chủ đề nào để Mầm tư vấn chi tiết hơn nha? Mầm gợi ý ngay cuốn “Cây Cam Ngọt Của Tôi” bên dưới nhé!"
                bookId = 2
              } else if (containsAny(clean, ["chua lanh", "buon", "stress", "met", "ap luc", "binh an"])) {
                response = "Mầm hiểu những lúc tâm trạng cần một chốn bình yên 🌱. Mầm gợi ý bạn cuốn “Không Diệt Không Sinh Đừng Sợ Hãi” (Thích Nhất Hạnh) hoặc “Cây Cam Ngọt Của Tôi”. Từng trang sách như một tách trà ấm xoa dịu đi những âu lo thường nhật của bạn."
                bookId = 9
              } else if (containsAny(clean, ["tien", "giau", "kinh te", "tai chinh", "dau tu", "kinh doanh"])) {
                response = "Đầu tư cho tư duy tài chính luôn là khoản sinh lời bền vững nhất! Mầm xin gợi ý ngay cuốn “Tâm Lý Học Về Tiền” của tác giả Morgan Housel – phân tích tâm lý tài chính sâu sắc, đang có ưu đãi 32% tại Mộc."
                bookId = 6
              } else if (containsAny(clean, ["tinh yeu", "crush", "nguoi yeu", "qua tang", "ban gai"])) {
                response = "Một cuốn sách chứa đầy kỷ niệm và sự tinh tế chính là món quà tuyệt vời nhất! Mầm gợi ý cuốn “Ngày Xưa Có Một Chuyện Tình” của Nguyễn Nhật Ánh. Mộc hỗ trợ bạn gói quà vintage nơ thừng và tặng thiệp miễn phí nhé!"
                bookId = 1
              } else if (containsAny(clean, ["an com chua", "an com", "uong nuoc"])) {
                response = "Dạ Mầm xin chào bạn! Mầm là trợ lý AI chỉ cần 'nạp' tri thức từ sách là tràn đầy năng lượng rồi nè 😊 Bạn nhớ nạp năng lượng ăn uống nghỉ ngơi trước nhé! Sau đó, nếu cần một cuốn sách hay để thư giãn, ghé Mầm nha!"
                bookId = 2
              } else {
                response = "Dạ Mầm rất vui được hỗ trợ bạn! Dựa trên câu hỏi, Mầm gợi ý cuốn sách kinh điển “Cây Cam Ngọt Của Tôi” – tác phẩm sưởi ấm hàng triệu trái tim độc giả Mộc Books."
                bookId = 2
              }

              res.setHeader("Content-Type", "application/json; charset=utf-8")
              res.end(
                JSON.stringify({
                  response,
                  bookId,
                  model: "@cf/meta/llama-3-8b-instruct",
                  edgeLocation: "Local Dev (Cloudflare Workers AI Simulator)",
                  retrievedBooks: bookId ? [bookId] : [1, 2],
                })
              )
            } catch (e: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } else {
          res.statusCode = 200
          res.end()
        }
      })
    },
  }
}
