// API helper - dev va production uchun
const isDev = import.meta.env.DEV

// Backend API URL
const BACKEND_URL = 'https://vita-backend.jprq.live'

// Dev: Vite proxy, Prod: CORS proxy orqali
export function vitaApiUrl(path) {
    if (isDev) {
        return `/vita-api${path}`
    }
    // Production: CORS proxy ishlatamiz
    return `https://corsproxy.io/?${encodeURIComponent(BACKEND_URL + path)}`
}

// Fetch wrapper - API dan ma'lumot olish
export async function vitaFetch(path) {
    const url = vitaApiUrl(path)

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.api+json, application/json',
        },
    })

    if (!res.ok) {
        throw new Error(`Server xato: ${res.status}`)
    }

    return await res.json()
}
