import React, { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'

function ProductCard({ product, fixedSize = false, compact = false }) {
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')
  const [notificationInCard, setNotificationInCard] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 480 : false)
  const { add } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  // Prices in `products.js` are stored in so'm (integer). Display as localized UZS.

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      setNotificationMsg('Xarid qilish uchun avval platformaga kiring!')
      const showInPlace = !isMobile // on mobile show top-fixed toast, on desktop show in-card
      setNotificationInCard(showInPlace)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }
    add(product)
    setNotificationMsg('Mahsulot savatga qo\'shildi')
    setNotificationInCard(true)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 1500)
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 480)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // rating is available on product when needed

  return (
    <>
      <Link
        to={`/product/${product.id}`}
        className={`card product-card ${compact ? 'compact' : ''}`}
        style={{
          textDecoration: 'none',
          ...(fixedSize ? { minWidth: 260, maxWidth: 260, minHeight: 420 } : {}),
          ...(compact && !fixedSize ? { minWidth: 180, maxWidth: 220, minHeight: 360 } : {})
        }}
      >
        {/* Notification (in-card) */}
        {showNotification && (
          <div className={`vb-toast in-card ${notificationInCard ? 'in-place' : 'at-top'}`} role="status">
            <span>{notificationMsg}</span>
            {!user && (
              <Link to="/login" className="vb-toast-cta">Kirish</Link>
            )}
          </div>
        )}
        {/* Sale badge (top-left) - compute percent when oldPrice exists */}
        {(() => {
          const hasDiscount = product.oldPrice && product.oldPrice > product.price
          const discountPct = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null
          if (product.discountLabel) return <div className="badge-sale">{product.discountLabel}</div>
          if (discountPct) return <div className="badge-sale">-{discountPct}%</div>
          return null
        })()}

        {/* Product Image */}
        <div className="card-image-wrapper product-image" style={{ padding: compact ? 6 : 8 }}>
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: '100%',
              objectFit: compact ? 'cover' : 'contain',
              borderRadius: 12,
              display: 'block',
              maxHeight: compact ? 160 : 'none'
            }}
          />
        </div>

        {/* Product Info */}
        <div className="card-body">
          <h3 className="card-title" style={compact ? { fontSize: '0.95rem', marginBottom: 6 } : {}}>{product.title}</h3>

          <p className="card-description" style={compact ? { fontSize: '0.85rem', color: 'var(--text-secondary)', height: 36, overflow: 'hidden' } : {}}>{product.description}</p>

          <div className="rating" aria-hidden style={{ margin: '8px 0', color: '#64748b', fontSize: '0.9rem' }}>
            {product.rating ? `${product.rating.toFixed(1)} / 5` : '—'}
          </div>

          <div className="old-price">
            {product.oldPrice ? (
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{Math.round(product.oldPrice).toLocaleString('uz-UZ')} so'm</span>
            ) : null}
            {/* Always show availability so user can see if product is in stock */}
            <span className={`availability ${product.available ? 'available' : 'unavailable'}`} style={{ marginLeft: product.oldPrice ? 12 : 0 }}>
              {product.available ? 'Mavjud' : 'Mavjud emas'}
            </span>
          </div>

          <div className="price" style={compact ? { fontSize: '0.95rem', marginTop: 6 } : {}}>{Math.round(product.price).toLocaleString('uz-UZ')} so'm</div>

          <div className="card-footer">
            <button
              className={`btn primary full-width ${product.available ? '' : 'disabled'}`}
              onClick={handleAdd}
              style={compact ? { padding: '7px 10px', fontSize: '0.83rem' } : { padding: '8px 12px', fontSize: '0.85rem' }}
              disabled={!product.available}
            >
              {product.available ? "Savatga qo'shish" : 'Mavjud emas'}
            </button>
          </div>
        </div>
      </Link>

      {/* Inline animation removed to prevent in-card popups */}
    </>
  )
}

export default ProductCard
