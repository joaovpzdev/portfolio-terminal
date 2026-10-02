import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

// `npm run preview` usa os mesmos headers da Vercel, regra por regra (pega erro de CSP antes do deploy)
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
const headerRules = vercel.headers.map((r) => ({ match: new RegExp(`^${r.source}$`), headers: r.headers }))

const vercelHeaders = () => ({
  name: 'vercel-headers',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = (req.url ?? '/').split('?')[0]
      for (const rule of headerRules) {
        if (rule.match.test(path)) for (const h of rule.headers) res.setHeader(h.key, h.value)
      }
      next()
    })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelHeaders()],
  server: {
    // WSL: se o projeto estiver em /mnt/c, o watcher precisa de polling
    watch: { usePolling: process.env.VITE_POLLING === '1' },
  },
  // Sem data: URIs no build: a CSP só aceita arquivos do próprio domínio
  build: { assetsInlineLimit: 0 },
  test: {
    environment: 'node',
  },
})
