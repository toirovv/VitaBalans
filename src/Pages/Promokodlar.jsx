import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function Promokodlar() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadCoupons() {
      try {
        // Use apiFetch so VITE_API_BASE is respected and errors are descriptive
        const res = await apiFetch('/api/coupons')

        if (!res.ok) {
          throw new Error(`Server xato: ${res.status}`)
        }

        const data = await res.json()

        if (!active) return

        // Normalize response shapes: try array or common wrapper fields
        const list = Array.isArray(data)
          ? data
          : (data.items || data.data || data.coupons || [])

        const normalized = (list || []).map(item => {
          // Kritik kuponlar 10,000 so'm, oddiy kuponlar 5,000 so'm
          const isCritical = (item.name || item.code || '').toLowerCase().includes('krit') ||
            (item.description || item.desc || '').toLowerCase().includes('krit') ||
            item.type === 'critical' ||
            item.isCritical === true
          const amount = isCritical ? 10000 : 5000

          return {
            id: item.id ?? item._id ?? item.code ?? Math.random().toString(36).slice(2),
            name: item.name || item.code || 'Nomaʼlum kupon',
            description: item.description || item.desc || '',
            amount: amount,
            isCritical: isCritical,
          }
        })

        setCoupons(normalized)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err)
        setCoupons([])
      } finally {
        active && setLoading(false)
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
              className="card p-4 w-[220px] flex flex-col justify-between"
            >
              <div>
                <strong className="block mb-2">
                  {coupon.name}
                </strong>

                <p className="text-sm text-gray-600 mb-2">
                  {coupon.description}
                </p>

                {coupon.isCritical && (
                  <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded mb-2">
                    Kritik
                  </span>
                )}
                <div className="font-medium text-green-600">
                  {coupon.amount.toLocaleString('uz-UZ')} so'm chegirma
                </div>
              </div>

              <button
                className="btn mt-3"
                onClick={() =>
                  navigator.clipboard?.writeText(coupon.name)
                }
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
