// API helper - dev va production uchun
const isDev = import.meta.env.DEV

// Backend API URL (direct backend)
const BACKEND_URL = 'https://vita-backend.jprq.live'

// Always use the real backend URL so responses (promotions/discounts)
// come directly from the source: https://vita-backend.jprq.live
export function vitaApiUrl(path) {
    return `${BACKEND_URL}${path}`
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
        return data
    } catch (error) {
        console.warn('Fetch xato:', error.message)
        return getFallbackData(path)
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
