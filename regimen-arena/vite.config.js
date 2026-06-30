import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const repoVisualsDir = resolve(repoRoot, 'assets/visuals')
const publicVisualsDir = resolve(__dirname, 'public/assets/visuals')

const EXPECTED_SPRITE_FILES = [
  'nafcillin-sprite.png',
  'oxacillin-sprite.png',
  'Bactrim-sprite.png',
]

function syncVisualAssets() {
  if (!existsSync(repoVisualsDir)) return
  mkdirSync(publicVisualsDir, { recursive: true })
  cpSync(repoVisualsDir, publicVisualsDir, {
    recursive: true,
    filter: (src) => !src.endsWith('.md'),
  })
}

function warnMissingSprites() {
  const missing = EXPECTED_SPRITE_FILES.filter(
    (file) => !existsSync(resolve(repoVisualsDir, file))
  )
  if (missing.length > 0) {
    console.warn(
      `[sync-visual-assets] Missing sprite files in assets/visuals/: ${missing.join(', ')}. ` +
        'Add them to stop placeholder initials and enable Vite-bundled URLs.'
    )
  }
}

function visualAssetsPlugin() {
  return {
    name: 'sync-visual-assets',
    buildStart() {
      syncVisualAssets()
      warnMissingSprites()
    },
    configureServer() {
      syncVisualAssets()
      warnMissingSprites()
    },
  }
}

export default defineConfig({
  plugins: [visualAssetsPlugin(), react(), tailwindcss()],
  base: '/',
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
