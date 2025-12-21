import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import products, { categories } from '../data/products'
import ProductCard from '../Components/ProductCard'

export default function ToplamCategory() {
  const { id } = useParams()

  const categoryName = useMemo(() => {
    const found = categories.find(c => c.id === id)
    return found ? found.name : id
  }, [id])

  const filtered = useMemo(() => {
    if (!id || id === 'all') return products
    return products.filter(p => p.category === id)
  }, [id])

  return (
    <div className="container">
      <nav style={{ margin: '18px 0', fontSize: '0.95rem', color: 'var(--primary-600)' }}>
        <Link to="/">Bosh sahifa</Link> » <Link to="/toplam">To'plamlar</Link> » <span style={{ marginLeft: 6 }}>{categoryName}</span>
      </nav>

      <h1 style={{ margin: '8px 0 20px', fontSize: '1.8rem' }}>{categoryName}</h1>

      <section>
        <div
          className="grid"
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 20,
            alignItems: 'start',
            justifyContent: filtered.length <= 2 ? 'center' : 'stretch',
            gridTemplateColumns: filtered.length > 0 && filtered.length <= 2
              ? `repeat(${filtered.length}, 260px)`
              : 'repeat(auto-fill, minmax(220px, 1fr))'
          }}
        >
          {filtered.length ? filtered.map(p => (
            <ProductCard key={p.id} product={p} fixedSize={filtered.length <= 2} />
          )) : (
            <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Bu kategoriyada mahsulotlar mavjud emas.</div>
          )}
        </div>
      </section>
    </div>
  )
}
