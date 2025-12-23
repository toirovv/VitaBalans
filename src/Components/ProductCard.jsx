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
  const [imgError, setImgError] = useState(false)
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
    // Fly-to-cart animation
    try {
      const img = document.querySelector(`#prod-img-${product.id}`)
      const cart = document.getElementById('cart-link')
      if (img && cart) {
        const imgRect = img.getBoundingClientRect()
        const cartRect = cart.getBoundingClientRect()

        const clone = img.cloneNode(true)
        clone.style.position = 'fixed'
        clone.style.left = `${imgRect.left}px`
        clone.style.top = `${imgRect.top}px`
        clone.style.width = `${imgRect.width}px`
        clone.style.height = `${imgRect.height}px`
        clone.style.transition = 'transform 1100ms cubic-bezier(.18,.86,.2,1), opacity 1100ms'
        clone.style.zIndex = 9999
        clone.classList.add('fly-img')
        document.body.appendChild(clone)

        const dx = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2)
        const dy = cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2)
        const scale = 0.14

        requestAnimationFrame(() => {
          clone.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(10deg)`
          clone.style.opacity = '0.9'
        })

        setTimeout(() => {
          clone.remove()
          // cart bounce
          cart.classList.add('cart-bounce')
          setTimeout(() => cart.classList.remove('cart-bounce'), 700)
        }, 1200)
      }
    } catch (err) {
      // fail silently
      console.error(err)
    }
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
          display: 'flex',
          flexDirection: 'column'
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
        {/* Top-left badges: category / sale */}
        {product.category && (
          <div className="badge-category" style={{ position: 'absolute', left: 12, top: 12, background: 'rgba(255,255,255,0.9)', padding: '6px 8px', borderRadius: 10, fontSize: 12, color: '#065f46', fontWeight: 700 }}>
            {product.category}
          </div>
        )}
        {/* Sale badge (top-right) - use discount from API */}
        {product.discountPercent > 0 && (
          <div className="badge-sale">-{product.discountPercent}%</div>
        )}

        {/* Product Image */}
        <div className="card-image-wrapper product-image" style={{ padding: compact ? 6 : 8 }}>
          <img
            id={`prod-img-${product.id}`}
            src={!imgError && product.image ? product.image : '/assets/images/VitaBalansLogo.jpg'}
            alt={product.title}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: compact ? 160 : 200,
              objectFit: compact ? 'cover' : 'contain',
              borderRadius: 12,
              display: 'block',
            }}
          />
        </div>

        {/* Product Info */}
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <h3 className="card-title" style={compact ? { fontSize: '0.95rem', marginBottom: 6 } : {}}>{product.title}</h3>
          </div>

          <p className="card-description" style={{
            fontSize: compact ? '0.85rem' : '0.95rem',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginTop: 0
          }}>{product.description}</p>

          <div className="rating" aria-hidden style={{ margin: '8px 0', color: '#f59e0b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
            <span style={{ color: '#64748b', marginLeft: 4 }}>{product.rating ? product.rating.toFixed(1) : '—'}</span>
          </div>

          <div className="old-price" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
