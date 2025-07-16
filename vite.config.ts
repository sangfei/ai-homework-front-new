import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    https: {
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/zhifei.site.pem')),
      key: fs.readFileSync(path.resolve(__dirname, './ssl/zhifei.site.key'))
    }
  }
})