import React, { useEffect, useState } from 'react'
import { vitaFetch } from '../lib/vitaApi'

export default function Promokodlar() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadCoupons() {
      try {
        console.log('Loading promotions...')
        const json = await vitaFetch('/api/v1/payments/promotions/')
        console.log('Promotions API response:', json)

        if (!active) return

        const list = json.data || []
        console.log('Promotions list:', list)

        const normalized = list.map(item => {
          const attrs = item.attributes || {}
          const isPercent = attrs.discount_type === 'percent'

          return {
            id: item.id,
              code: attrs.code || '',
            name: attrs.title || attrs.code || 'Nomaʼlum kupon',
            description: attrs.description || '',
            subtitle: attrs.subtitle || '',
            discountValue: attrs.discount_value || 0,
            discountDisplay: attrs.discount_display || '',
            isPercent: isPercent,
            validFrom: attrs.valid_from,
            validTo: attrs.valid_to,
            isActive: attrs.is_active,
            isFeatured: attrs.is_featured,
            category: attrs.category,
          }
        })

        setCoupons(normalized)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err)
        setCoupons([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadCoupons()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4 text-sm">
        <a href="/" className="text-blue-600">Bosh sahifa</a> » Promokodlar
      </nav>

      <h1 className="text-2xl font-semibold mb-4">Promokodlar</h1>

      {loading && (
        <div className="card p-4">Yuklanmoqda...</div>
      )}

      {!loading && error && (
        <div className="card p-4 text-red-600">
          Xatolik: {error.message}
        </div>
      )}

      {!loading && !error && coupons.length === 0 && (
        <div className="card p-4">Kupon topilmadi</div>
      )}

      {!loading && !error && coupons.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {coupons.map(coupon => (
            <div
              key={coupon.id}
              className={`card p-4 w-[260px] flex flex-col justify-between ${!coupon.isActive ? 'opacity-60' : ''}`}
              style={{ borderLeft: coupon.category?.color ? `4px solid ${coupon.category.color}` : undefined }}
            >
              <div>
                {coupon.isFeatured && (
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded mb-2">
                    ⭐ Tavsiya etilgan
                  </span>
                )}

                <strong className="block mb-1 text-lg">
                  {coupon.code}
                </strong>

                <p className="text-sm text-gray-500 mb-2">
                  {coupon.name}
                </p>

                {coupon.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {coupon.description}
                  </p>
                )}

                {coupon.category && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded mb-2"
                    style={{
                      backgroundColor: coupon.category.color + '20',
                      color: coupon.category.color
                    }}
                  >
                    {coupon.category.name}
                  </span>
                )}

                <div className="font-bold text-xl text-green-600 mt-2">
                  {coupon.discountDisplay} chegirma
                </div>

                {!coupon.isActive && (
                  <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded mt-2">
                    Faol emas
                  </span>
                )}
              </div>

              <button
                className="btn mt-3"
                onClick={() => navigator.clipboard?.writeText(coupon.code)}
              >
                Nusxa olish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
