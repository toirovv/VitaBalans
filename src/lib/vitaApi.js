// API helper - dev va production uchun
const isDev = import.meta.env.DEV

// Backend API URL
const BACKEND_URL = 'https://vita-backend.jprq.live'

// CORS proxy URLs - birinchisi ishlamasa ikkinchisidan foydalanish
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url='
]

// Dev: Vite proxy, Prod: CORS proxy orqali
export function vitaApiUrl(path, proxyIndex = 0) {
    if (isDev) {
        return `/vita-api${path}`
    }
    // Production: CORS proxy ishlatamiz
    const proxy = CORS_PROXIES[proxyIndex] || CORS_PROXIES[0]
    return `${proxy}${encodeURIComponent(BACKEND_URL + path)}`
}

// Fetch wrapper - xato bo'lsa fallback qaytaradi
export async function vitaFetch(path) {
    // Production da bir nechta proxy sinab ko'rish
    if (!isDev) {
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            try {
                const url = vitaApiUrl(path, i)
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/vnd.api+json, application/json',
                    },
                })

                if (res.ok) {
                    return await res.json()
                }
            } catch (e) {
                console.warn(`Proxy ${i} failed:`, e.message)
            }
        }
        // Barcha proxy ishlamasa fallback qaytarish
        return getFallbackData(path)
    }

    // Dev rejim
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

// Fallback ma'lumotlar
function getFallbackData(path) {
    if (path.includes('promotions')) {
        return {
            data: [
                {
                    id: '1',
                    attributes: {
                        code: 'VITA10',
                        title: '10% chegirma',
                        description: 'Barcha mahsulotlarga 10% chegirma',
                        discount_type: 'percent',
                        discount_value: 10,
                        discount_display: '10%',
                        is_active: true,
                        is_featured: true,
                        category: { id: 1, name: 'Chegirma', color: '#10b981' }
                    }
                },
                {
                    id: '2',
                    attributes: {
                        code: 'YANGI2024',
                        title: '15% chegirma',
                        description: 'Yangi mijozlar uchun',
                        discount_type: 'percent',
                        discount_value: 15,
                        discount_display: '15%',
                        is_active: true,
                        is_featured: false,
                        category: { id: 2, name: 'Yangi', color: '#3b82f6' }
                    }
                }
            ]
        }
    }
    if (path.includes('articles')) {
        return {
            data: [
                {
                    id: '1',
                    attributes: {
                        translations: {
                            en: {
                                title: 'Vitaminlar haqida muhim ma\'lumotlar',
                                description: 'Vitaminlar organizmimiz uchun juda muhim.'
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
                                title: 'Immunitetni mustahkamlash',
                                description: 'Immunitet tizimini qanday kuchaytirish mumkin?'
                            }
                        },
                        thumbnail: '/assets/images/VitaBalansLogo.jpg',
                        date: '2024-12-18',
                        category: [{ id: 2, name: 'Maslahatlar', translations: { en: { name: 'Maslahatlar' } } }]
                    }
                }
            ]
        }
    }
    return { data: [] }
}
