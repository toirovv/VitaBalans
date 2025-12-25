// API helper - dev va production uchun
const isDev = import.meta.env.DEV

// Dev: Vite proxy, Prod: to'g'ridan-to'g'ri yoki proxy
export const VITA_API_BASE = isDev
    ? '/vita-api'
    : '/vita-api' // Netlify/Vercel proxy

export function vitaApiUrl(path) {
    return `${VITA_API_BASE}${path}`
}

// Zaxira ma'lumotlar
const FALLBACK_PROMOTIONS = {
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

const FALLBACK_ARTICLES = {
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
                        description: 'Immunitet tizimini qanday kuchaytirish mumkin? Foydali maslahatlar va tavsiyalar.'
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
                        title: 'Qishda sog\'lom qolish',
                        description: 'Sovuq kunlarda organizmni qanday himoya qilish kerak? Muhim vitaminlar.'
                    }
                },
                thumbnail: '/assets/images/VitaBalansLogo.jpg',
                date: '2024-12-15',
                category: [{ id: 1, name: 'Salomatlik', translations: { en: { name: 'Salomatlik' } } }]
            }
        }
    ]
}

// Fetch wrapper - xato bo'lsa fallback qaytaradi
export async function vitaFetch(path) {
    const url = vitaApiUrl(path)

    try {
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
    } catch (error) {
        console.warn('API xato, zaxira ma\'lumotlar ishlatilmoqda:', error.message)

        // Fallback qaytarish
        if (path.includes('promotions')) {
            return FALLBACK_PROMOTIONS
        }
        if (path.includes('articles')) {
            return FALLBACK_ARTICLES
        }

        return { data: [] }
    }
}
