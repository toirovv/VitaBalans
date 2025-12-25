// API helper - dev va production uchun
const isDev = import.meta.env.DEV

// Backend API URL
const BACKEND_URL = 'https://vita-backend.jprq.live'

// Dev: Vite proxy, Prod: to'g'ridan-to'g'ri API
export function vitaApiUrl(path) {
    if (isDev) {
        return `/vita-api${path}`
    }
    // Production: to'g'ridan-to'g'ri API + allorigins proxy
    return `https://api.allorigins.win/get?url=${encodeURIComponent(BACKEND_URL + path)}`
}

// Fetch wrapper
export async function vitaFetch(path) {
    const url = vitaApiUrl(path)

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!res.ok) {
            console.warn('API xato:', res.status)
            return getFallbackData(path)
        }

        const data = await res.json()

        // allorigins proxy "contents" ichida JSON string qaytaradi
        if (!isDev && data.contents) {
            try {
                return JSON.parse(data.contents)
            } catch (e) {
                console.warn('JSON parse xato:', e)
                return getFallbackData(path)
            }
        }

        return data
    } catch (error) {
        console.warn('Fetch xato:', error.message)
        return getFallbackData(path)
    }
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
                        description: 'Yangi mijozlar uchun maxsus taklif',
                        discount_type: 'percent',
                        discount_value: 15,
                        discount_display: '15%',
                        is_active: true,
                        is_featured: false,
                        category: { id: 2, name: 'Yangi', color: '#3b82f6' }
                    }
                },
                {
                    id: '3',
                    attributes: {
                        code: 'SALOMATLIK',
                        title: '20% chegirma',
                        description: 'Salomatlik uchun vitamin komplekslari',
                        discount_type: 'percent',
                        discount_value: 20,
                        discount_display: '20%',
                        is_active: true,
                        is_featured: true,
                        category: { id: 1, name: 'Chegirma', color: '#10b981' }
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
                                description: 'Vitaminlar organizmimiz uchun juda muhim. Bu maqolada vitaminlarning turlari va foydalari haqida bilib olasiz.'
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
                                title: 'Immunitetni mustahkamlash yo\'llari',
                                description: 'Immunitet tizimini qanday kuchaytirish mumkin? Foydali maslahatlar.'
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
                                title: 'Qishda sog\'lom qolish sirlari',
                                description: 'Sovuq kunlarda organizmni qanday himoya qilish kerak?'
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
