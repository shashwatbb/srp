import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** GitHub Pages uses `/<repo>/`; CI sets `VITE_BASE_PATH` (see `.github/workflows`). */
function viteBase(): string {
  const raw = process.env.VITE_BASE_PATH?.trim()
  if (!raw) return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

export default defineConfig({
  base: viteBase(),
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    /** Use next free port if 5173 is taken so `npm run dev:keep` does not exit */
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
})
