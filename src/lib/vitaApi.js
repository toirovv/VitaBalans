// API helper - dev va production uchun to'g'ri URL
const isDev = import.meta.env.DEV

// Netlify _redirects yordamida proxy ishlatiladi (dev va production da)
export const VITA_API_BASE = '/vita-api'

export function vitaApiUrl(path) {
    return `${VITA_API_BASE}${path}`
}

// Fetch wrapper with error handling
export async function vitaFetch(path) {
    const url = vitaApiUrl(path)

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Production da CORS muammolarini hal qilish uchun
            mode: isDev ? 'cors' : 'cors',
        })

        if (!res.ok) {
            throw new Error(`Server xato: ${res.status}`)
        }

        return res.json()
    } catch (error) {
        // CORS yoki network xatoliklari uchun
        console.error('API xatolik:', error)
        throw new Error('Failed to fetch')
    }
}
