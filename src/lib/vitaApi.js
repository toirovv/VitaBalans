const isDev = import.meta.env.DEV

// Backend API URL (direct backend host used by proxy)
const BACKEND_URL = 'https://vita-backend.jprq.live'

export function vitaApiUrl(path) {
    if (isDev) return `/vita-api${path}` // Vite dev proxy
    return path // production: call relative path (expect serverless proxy at /api/...)
}

// Fetch wrapper that sends a permissive Accept header and returns parsed JSON
export async function vitaFetch(path, { timeout = 7000 } = {}) {
    const url = vitaApiUrl(path)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.api+json, application/json, text/plain, */*',
            },
            signal: controller.signal
        })

        clearTimeout(timer)

        if (!res.ok) {
            const txt = await res.text().catch(() => '')
            let msg = `HTTP ${res.status}`
            try {
                const j = JSON.parse(txt)
                msg = j?.detail || j?.message || JSON.stringify(j)
            } catch {
                if (txt) msg = txt
            }
            // Friendly hint for 406
            if (res.status === 406) msg = msg + ' — Server Accept sarlavhasini qoniqtirmadi.'
            console.warn('API error:', res.status, msg)
            throw new Error(msg)
        }

        const data = await res.json()
        return data
    } catch (error) {
        clearTimeout(timer)
        // Normalize AbortError
        if (error && error.name === 'AbortError') {
            throw new Error("Tarmoq so'rovi vaqti tugadi. Iltimos, qayta urinib ko'ring.")
        }
        // Map common network failures to friendlier message
        const msg = (error && error.message) ? error.message : String(error)
        throw new Error(`Tarmoq xatosi: ${msg}`)
    }
}

// Fallback ma'lumotlar
function getFallbackData(path) {
    if (path.includes('articles')) {
        return {
            data: [
                {
                    id: '1',
                    attributes: {
                        translations: {
                            en: {
                                title: "Vitaminlar haqida muhim ma'lumotlar",
                                description: "Vitaminlar organizmimiz uchun juda muhim. Bu maqolada vitaminlarning turlari va foydalari haqida bilib olasiz."
                            }
                        },
                        thumbnail: '/assets/images/VitaBalansLogo.jpg',
                        date: '2024-12-20',
                        category: [{ id: 1, name: 'Salomatlik', translations: { en: { name: 'Salomatlik' } } }]
                    }
                },
                {
                    id: '2',
                    attributes: {
                        translations: {
                            en: {
                                title: "Immunitetni mustahkamlash yo'llari",
                                description: "Immunitet tizimini qanday kuchaytirish mumkin? Foydali maslahatlar."
                            }
                        },
                        thumbnail: '/assets/images/VitaBalansLogo.jpg',
                        date: '2024-12-18',
                        category: [{ id: 2, name: 'Maslahatlar', translations: { en: { name: 'Maslahatlar' } } }]
                    }
                },
                {
                    id: '3',
                    attributes: {
                        translations: {
                            en: {
                                title: "Qishda sog'lom qolish sirlari",
                                description: "Sovuq kunlarda organizmni qanday himoya qilish kerak?"
                            }
                        },
                        thumbnail: '/assets/images/VitaBalansLogo.jpg',
                        date: '2024-12-15',
                        category: [{ id: 1, name: 'Salomatlik', translations: { en: { name: 'Salomatlik' } } }]
                    }
                }
            ]
        }
    }
    return { data: [] }
}

export { getFallbackData }
