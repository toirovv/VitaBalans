// API helper - dev va production uchun to'g'ri URL
const isDev = import.meta.env.DEV

// Dev da proxy, production da to'g'ridan-to'g'ri URL
export const VITA_API_BASE = isDev
    ? '/vita-api'  // Vite proxy orqali
    : 'https://vita-backend.jprq.live'

export function vitaApiUrl(path) {
    return `${VITA_API_BASE}${path}`
}

// Fetch wrapper - API dan ma'lumot olish
export async function vitaFetch(path) {
    const url = vitaApiUrl(path)
    console.log('Fetching from:', url)  // Debug

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.api+json, application/json',
        },
    })

    console.log('Response status:', res.status)  // Debug

    if (!res.ok) {
        throw new Error(`Server xato: ${res.status}`)
    }

    const data = await res.json()
    console.log('API data:', data)  // Debug
    return data
}

