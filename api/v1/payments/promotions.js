export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const BACKEND = 'https://vita-backend.jprq.live'

  try {
    // Construct target URL by forwarding original path + query
    // req.url contains the path and query string (e.g. /api/v1/payments/promotions?code=...)
    const target = `${BACKEND}${req.url}`

    // Forward only safe headers (authorization if present)
    const headers = {}
    if (req.headers && req.headers.authorization) headers.Authorization = req.headers.authorization

    const backendRes = await fetch(target, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.api+json, application/json, text/plain, */*',
        ...headers
      }
    })

    const text = await backendRes.text()
    // Set CORS header (optional) so external clients can call this proxy if needed
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', backendRes.headers.get('Content-Type') || 'application/json')
    res.status(backendRes.status).send(text)
  } catch (e) {
    console.error('Proxy error:', e)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(502).json({ error: 'Proxy error', detail: e?.message || String(e) })
  }
}
