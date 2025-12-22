import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories } from '../data/products'
import products from '../data/products'
import ProductCard from '../Components/ProductCard'

export default function Toplam() {
  const [selected, setSelected] = useState('all')
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('https://api.vita-balans.uz/coupons')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        setCoupons(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!mounted) return
        setCoupons([])
      })
      .finally(() => mounted && setLoadingCoupons(false))

    return () => { mounted = false }
  }, [])


  const nav = useNavigate()

  const goToCategory = (catId) => {
    nav(`/toplam/${encodeURIComponent(catId)}`)
  }

  return (
    <div className="container">
      <nav style={{ margin: '18px 0', fontSize: '0.95rem', color: 'var(--primary-600)' }}>
        <a href="/">Bosh sahifa</a> » <span style={{ marginLeft: 6 }}>To'plamlar</span>
      </nav>

      <h1 style={{ margin: '8px 0 20px', fontSize: '1.6rem' }}>To'plamlar</h1>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Kuponlar</h2>
        {loadingCoupons ? (
          <div className="card" style={{ padding: 12 }}>Yuklanmoqda...</div>
        ) : coupons.length === 0 ? (
          <div className="card" style={{ padding: 12 }}>Kupon topilmadi</div>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {coupons.map(c => (
              <div key={c.id} className="card product-card" style={{ padding: 12, minWidth: 220 }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: 6 }}>{c.name}</strong>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'pre-line' }}>{c.description}</div>
                  <div style={{ fontSize: '0.95rem' }}>{c.type === 'percent' ? `${c.amount}% chegirma` : `${c.amount} so'm`}</div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => navigator.clipboard && navigator.clipboard.writeText(c.name)}>Nusxa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid" style={{ gap: 24 }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            role="button"
            tabIndex={0}
            onClick={() => goToCategory(cat.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goToCategory(cat.id)}
            className={`card product-card`}
            style={{
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 160,
              textAlign: 'left'
            }}
          >
            <div>
              <h3 className="card-title" style={{ margin: '0 0 8px' }}>{cat.name}</h3>
              <p className="card-description" style={{ margin: 0, color: 'var(--text-secondary)' }}>{(products.filter(p => cat.id === 'all' ? true : p.category === cat.id)).length} ta mahsulot</p>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" style={{ padding: '8px 12px' }} onClick={(e) => { e.stopPropagation(); goToCategory(cat.id); }}>Ko'rish</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
