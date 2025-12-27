// Small, safe ESM helper for Vita API requests
export const isDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV)

export function vitaApiUrl(path) {
  return isDev ? `/vita-api${path}` : path
}

export async function vitaFetch(path, { timeout = 7000, fetchImpl = fetch } = {}) {
  const url = vitaApiUrl(path)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/vnd.api+json, application/json, text/plain, */*' },
      signal: controller.signal
    })
    clearTimeout(timer)
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      let msg = `HTTP ${res.status}`
      try { const j = JSON.parse(txt); msg = j?.detail || j?.message || JSON.stringify(j) } catch { if (txt) msg = txt }
      if (res.status === 406) msg = msg + '  Server rejected Accept header.'
      throw new Error(msg)
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err && err.name === 'AbortError') throw new Error("Tarmoq so'rovi vaqti tugadi. Iltimos, qayta urinib ko'ring.")
    const msg = err && err.message ? err.message : String(err)
    throw new Error(`Tarmoq xatosi: ${msg}`)
  }
}

export function getFallbackData(path) {
  if (path.includes('articles')) {
    return {
      data: [
        {
          id: '1',
          attributes: {
            translations: { en: { title: "Vitaminlar haqida muhim ma'lumotlar", description: 'Vitaminlar organizmimiz uchun juda muhim.' } },
            thumbnail: '/assets/images/VitaBalansLogo.jpg',
            date: '2024-12-20',
            category: [{ id: 1, name: 'Salomatlik', translations: { en: { name: 'Salomatlik' } } }]
          }
        }
      ]
    }
  }
  return { data: [] }
}
