import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 允许 cpolar.top 等内网穿透域名访问开发服务器
  server: {
    host: '0.0.0.0',
    port: 5179,
    allowedHosts: ['.cpolar.top', 'www.jflai.online'],
  },
})
