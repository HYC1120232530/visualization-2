/**
 * GitHub Pages 对不存在的路径返回 404；复制 index.html 为 404.html，
 * 使直接访问/刷新子路由时仍能加载 SPA（由 Vue Router 接管）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const indexHtml = path.join(dist, 'index.html')
const notFoundHtml = path.join(dist, '404.html')

if (!fs.existsSync(indexHtml)) {
  console.warn('[copy-github-pages-spa-fallback] dist/index.html 不存在，已跳过。')
  process.exit(0)
}

fs.copyFileSync(indexHtml, notFoundHtml)
console.log(`[copy-github-pages-spa-fallback] 已写入 ${notFoundHtml}`)
