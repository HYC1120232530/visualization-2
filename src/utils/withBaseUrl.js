/**
 * 在 GitHub Pages 等子路径部署下，将站点内资源路径拼到 import.meta.env.BASE_URL 下。
 * @param {string} path - 不以 / 开头则视为相对站点根，例如 'x' 或 'worldbank-csv/a.csv'
 */
export function withBaseUrl(path) {
  const p = path.startsWith('/') ? path.slice(1) : path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${p}`
}
