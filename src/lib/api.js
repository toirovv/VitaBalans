export const API_BASE = import.meta.env.VITE_API_BASE || 'https://fastapi-backend-production-d38d.up.railway.app'

export async function apiFetch(path, opts) {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  let res
  try {
    res = await fetch(url, opts)
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
