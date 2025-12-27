const isDev = import.meta.env.DEV
// In dev use the Vite proxy prefix '/api' (vite.config.js proxy maps /api -> api.vita-balans.uz)
export const API_BASE = isDev ? (import.meta.env.VITE_API_BASE || '/api') : (import.meta.env.VITE_API_BASE || 'https://fastapi-backend-production-d38d.up.railway.app')

export async function apiFetch(path, opts) {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  let res
  try {
    // Ensure a permissive Accept header by default to avoid backend rejecting requests
    const headers = Object.assign({ Accept: 'application/json, application/vnd.api+json, text/plain, */*' }, opts && opts.headers)
    res = await fetch(url, Object.assign({}, opts || {}, { headers }))
  } catch (e) {
    const err = new Error(`Network error fetching ${url}: ${e.message}. Is the backend running and accessible? Check VITE_API_BASE and CORS.`)
    err.cause = e
    err.url = url
    throw err
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('text/html')) {
    const text = await res.text()
    const snippet = text.slice(0, 240).replace(/\s+/g, ' ')
    const err = new Error(`Expected JSON from ${url} but received HTML. Check VITE_API_BASE. Response starts with: ${snippet}`)
    err.url = url
    err.status = res.status
    throw err
  }

  return res
}
