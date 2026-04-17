import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './' // ← ここを '/hokubu-map/' から './' に書き換えます
})