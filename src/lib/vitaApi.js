// API helper - dev va production uchun to'g'ri URL
const isDev = import.meta.env.DEV

// Production da to'g'ridan-to'g'ri API, dev da proxy
export const VITA_API_BASE = isDev
    ? '/vita-api'
    : 'https://vita-backend.jprq.live'

export function vitaApiUrl(path) {
    return `${VITA_API_BASE}${path}`
}

// Fetch wrapper with error handling
export async function vitaFetch(path) {
    const url = vitaApiUrl(path)
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Server xato: ${res.status}`)
    }

    return res.json()
}
