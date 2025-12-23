import React from 'react'
import ProductCard from '../Components/ProductCard'
import useProducts from '../hooks/useProducts'
import { Link } from 'react-router-dom'

export default function ProductsRailway() {
  const { products, loading, error, lastUrl } = useProducts()

  return (
    <div className="container" style={{ padding: '24px' }}>
      <nav style={{ marginBottom: 12 }}>
        <Link to="/">Bosh sahifa</Link> » <span style={{ marginLeft: 6 }}>Railway mahsulotlar</span>
      </nav>

      <h1 style={{ margin: '12px 0 20px' }}>Mahsulotlar (Railway)</h1>

      {loading && <div className="card p-4">Yuklanmoqda...</div>}
      {!loading && error && <div className="card p-4 text-red-600">Xato: {error.message}</div>}
      {!loading && !error && (!products || products.length === 0) && (
        <div className="card p-4">Mahsulot topilmadi. So'rov URL: <strong>{lastUrl}</strong></div>
      )}

      {!loading && !error && Array.isArray(products) && (
        <div className="grid" style={{ marginTop: 12 }}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
