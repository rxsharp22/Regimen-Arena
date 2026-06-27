import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoVisualsDir = resolve(__dirname, '../assets/visuals')
const publicVisualsDir = resolve(__dirname, 'public/assets/visuals')

function syncVisualAssets() {
  if (!existsSync(repoVisualsDir)) return
  mkdirSync(publicVisualsDir, { recursive: true })
  cpSync(repoVisualsDir, publicVisualsDir, {
    recursive: true,
    filter: (src) => !src.endsWith('.md'),
  })
}

function visualAssetsPlugin() {
  return {
    name: 'sync-visual-assets',
    buildStart() {
      syncVisualAssets()
    },
    configureServer() {
      syncVisualAssets()
    },
  }
}

export default defineConfig({
  plugins: [visualAssetsPlugin(), react(), tailwindcss()],
  base: '/',
})
