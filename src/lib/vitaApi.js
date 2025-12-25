// API helper - dev va production uchun to'g'ri URL
// Dev da Vite proxy, Production da Netlify _redirects orqali proxy

// Har ikkala muhitda ham /vita-api prefiksi ishlatiladi
// Dev: Vite proxy orqali https://vita-backend.jprq.live ga yo'naltiriladi
// Prod: Netlify _redirects orqali https://vita-backend.jprq.live ga yo'naltiriladi
export const VITA_API_BASE = '/vita-api'

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

