import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// using native fetch in this file for promotions
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'
import { vitaApiUrl } from '../lib/vitaApi'
import { FaTrash, FaPlus, FaMinus, FaTag, FaArrowRight, FaShoppingBag, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa'

// Coupons are provided by backend API; apply as percent (5% or 10%)

function Cart() {
  const { items, remove, updateQty, clear } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState(null) // will hold coupon object from API
  const [loadingPromo, setLoadingPromo] = useState(false)
  const promoCache = React.useRef({})
  const [promoError, setPromoError] = useState('')
  // Robust fetch using native fetch: try code filter first with retries, fall back to full list search
  const fetchPromotionByCode = async (cc) => {
    if (!cc) return null
    const maxAttempts = 2
    const cacheKey = cc.toLowerCase()
    if (promoCache.current[cacheKey]) return promoCache.current[cacheKey]

    const tryNativeFetch = async (url) => {
      let attempt = 0
      let lastErr = null
      while (attempt < maxAttempts) {
        try {
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              // some backends require JSON:API media type or a permissive Accept header
              Accept: 'application/vnd.api+json, application/json, text/plain, */*'
            }
          })
          if (!res.ok) {
            const txt = await res.text().catch(() => '')
            let msg = `HTTP ${res.status}`
            try {
              const j = JSON.parse(txt)
              msg = j?.detail || j?.message || JSON.stringify(j)
            } catch {
              if (txt) msg = txt
            }
            // give a specific hint for 406 errors
            if (res.status === 406) {
              throw new Error(msg + ' — Server refused Accept header.');
            }
            throw new Error(msg)
          }
          const json = await res.json()
          return json
        } catch (err) {
          lastErr = err
          attempt += 1
          if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 200 * attempt))
        }
      }
      throw lastErr
    }

    // 1) Try filter by code (use vitaApiUrl to allow dev proxy and avoid CORS)
    try {
      const url = vitaApiUrl(`/api/v1/payments/promotions/?code=${encodeURIComponent(cc)}`)
      const json = await tryNativeFetch(url)
      const list = json?.data || []
      if (list.length) {
        const found = list[0]
        const attrs = found.attributes || {}
        const isPercent = String(attrs.discount_type || '').toLowerCase() === 'percent'
        const rawVal = Number(attrs.discount_value || 0)
        const promo = {
          id: found.id,
          code: (attrs.code || '').toUpperCase(),
          name: attrs.title || attrs.code,
          amount: isNaN(rawVal) ? 0 : rawVal,
          discountDisplay: attrs.discount_display || '',
          isPercent
        }
        promoCache.current[cacheKey] = promo
        return promo
      }
    } catch (e) {
      console.warn('Filter-by-code failed, falling back:', e?.message || e)
    }

    // 2) Fallback to full list
    const urlAll = vitaApiUrl('/api/v1/payments/promotions/')
    const jsonAll = await tryNativeFetch(urlAll)
    const listAll = jsonAll?.data || []
    const found = listAll.find(item => ((item.attributes || {}).code || '').toLowerCase() === cc.toLowerCase())
    if (found) {
      const attrs = found.attributes || {}
      const isPercent = String(attrs.discount_type || '').toLowerCase() === 'percent'
      const rawVal = Number(attrs.discount_value || 0)
      const promo = {
        id: found.id,
        code: (attrs.code || '').toUpperCase(),
        name: attrs.title || attrs.code,
        amount: isNaN(rawVal) ? 0 : rawVal,
        discountDisplay: attrs.discount_display || '',
        isPercent
      }
      promoCache.current[cacheKey] = promo
      return promo
    }
    return null
  }
  const [showNotification, setShowNotification] = useState(false)

  const subtotal = items.reduce((s, p) => s + p.price * p.qty, 0)
  // discount: API amount 100 dan kichik bo'lsa foiz, aks holda so'm
  const discount = React.useMemo(() => {
    if (!applied) return 0
    const amt = Number(applied.amount) || 0
    if (applied.isPercent) {
      return Math.round(subtotal * amt / 100)
    }
    // absolute amount (so'm)
    return Math.min(Math.round(amt), subtotal)
  }, [applied, subtotal])
  // Shipping logic adjusted for so'm amounts: free over 500,000 so'm, otherwise 15,000 so'm
  const shipping = subtotal > 500000 ? 0 : 15000
  const total = subtotal - discount + shipping

  const apply = async () => {
    const cc = (code || '').trim()
    if (!cc) {
      setPromoError('Promo kod kiriting')
      return
    }
    setPromoError('')
    setLoadingPromo(true)
    try {
      const promo = await fetchPromotionByCode(cc)
      if (!promo) {
        setPromoError('Noto\'g\'ri promo kod')
        setApplied(null)
      } else {
        setApplied(promo)
        setPromoError('')
      }
    } catch (e) {
      console.error('Coupon apply error', e)
      const msg = (e && e.message) || ''
      if (msg.toLowerCase().includes('failed to fetch') || e instanceof TypeError) {
        setPromoError('Tarmoq xatosi: serverga ulanishda muammo. Iltimos internet yoki proxyni tekshiring.')
      } else {
        setPromoError(msg || 'Kuponni tekshirishda xatolik')
      }
    } finally {
      setLoadingPromo(false)
    }
  }

  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) {
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      return
    }
    // Pass applied coupon and computed discount to Checkout so it can initialize with it
    navigate('/checkout', {
      state: {
        items,
        coupon: applied,
        discountAmount: discount,
        subtotal,
        shipping,
        total
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          width: '140px',
          height: '140px',
          margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FaShoppingBag style={{ fontSize: '3.5rem', color: '#10b981' }} />
        </div>
        <h2 style={{ marginBottom: '12px' }}>Savatingiz bo'sh</h2>
        <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
          Ajoyib vitaminlar va qo'shimchalarni ko'rish uchun katalogga o'ting
        </p>
        <Link to="/catalog" className="btn primary">
          Katalogga o'tish <FaArrowRight style={{ marginLeft: '8px' }} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'slideDown 0.3s ease'
        }}>
          <span>⚠️ Buyurtma berish uchun avval platformaga kiring!</span>
          <Link to="/login" style={{
            background: 'white',
            color: '#d97706',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            Kirish
          </Link>
        </div>
      )}

      <h1 style={{ marginBottom: '8px' }}>Savat</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>{items.length} ta mahsulot</p>

      <div className="cart-grid-layout" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Cart Items */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '20px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <span style={{ fontWeight: '600' }}>Mahsulotlar</span>
            <button
              onClick={clear}
              style={{
                color: '#ef4444',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <FaTrash /> Tozalash
            </button>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item-row" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px 0',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <Link to={`/product/${item.id}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                />
              </Link>

              <div style={{ flex: 1 }}>
                <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{item.title}</h4>
                </Link>
                <p style={{ color: '#64748b', margin: 0 }}>{Math.round(item.price).toLocaleString('uz-UZ')} so'm / dona</p>
              </div>

              {/* Quantity Control */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <FaMinus />
                </button>
                <span style={{
                  width: '40px',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <FaPlus />
                </button>
              </div>

              <div className="cart-item-total-price" style={{
                fontWeight: '700',
                fontSize: '1.1rem',
                color: '#10b981',
                minWidth: '80px',
                textAlign: 'right'
              }}>
                {Math.round(item.price * item.qty).toLocaleString('uz-UZ')} so'm
              </div>

              <button
                onClick={() => remove(item.id)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: '100px'
        }}>
          <h3 style={{ marginBottom: '24px' }}>Buyurtma xulosasi</h3>

          {/* Promo Code */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FaTag style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                placeholder="Promo kod"
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <button
              className="btn secondary"
              onClick={apply}
              style={{ padding: '14px 20px' }}
              disabled={loadingPromo}
            >
              {loadingPromo ? 'Tekshirilmoqda...' : "Qo'llash"}
            </button>
          </div>

          {promoError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px' }}>
              {promoError}
            </p>
          )}

          {applied && (
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
              color: '#059669',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '500'
            }}>
              <FaTag /> {applied.isPercent
                ? `${applied.amount}% chegirma qo'llanildi! (-${discount.toLocaleString('uz-UZ')} so'm)`
                : `${applied.amount.toLocaleString('uz-UZ')} so'm chegirma qo'llanildi!`
              }
            </div>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#475569' }}>
              <span>Mahsulotlar</span>
              <span>{Math.round(subtotal).toLocaleString('uz-UZ')} so'm</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#475569' }}>
              <span>Chegirma</span>
              <span style={{ color: discount > 0 ? '#10b981' : 'inherit' }}>
                -{Math.round(discount).toLocaleString('uz-UZ')} so'm
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#475569' }}>
              <span>Yetkazib berish</span>
              <span>
                {shipping === 0 ? (
                  <span style={{ color: '#10b981', fontWeight: '500' }}>Bepul</span>
                ) : (
                  `${Math.round(shipping).toLocaleString('uz-UZ')} so'm`
                )}
              </span>
            </div>

            {subtotal < 500000 && (
              <p style={{
                fontSize: '0.8rem',
                color: '#f59e0b',
                textAlign: 'center',
                padding: '12px',
                background: '#fffbeb',
                borderRadius: '8px',
                marginTop: '8px'
              }}>
                💡 500 000 so'm dan ortiq xarid qilsangiz, yetkazib berish bepul!
              </p>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '20px 0',
              marginTop: '12px',
              borderTop: '2px solid #e2e8f0',
              fontSize: '1.2rem',
              fontWeight: '700'
            }}>
              <span>Jami</span>
              <span style={{ color: '#10b981' }}>{Math.round(total).toLocaleString('uz-UZ')} so'm</span>
            </div>
          </div>

          <button
            className="btn primary"
            onClick={handleCheckout}
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '8px' }}
          >
            Buyurtma berish <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>

          <Link
            to="/catalog"
            className="btn outline"
            style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center' }}
          >
            Xaridni davom ettirish
          </Link>

          {/* Benefits */}
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
            display: 'grid',
            gap: '12px'
          }}>
            {[
              { icon: <FaTruck />, text: 'Tez yetkazib berish' },
              { icon: <FaShieldAlt />, text: 'Xavfsiz to\'lov' },
              { icon: <FaUndo />, text: 'Oson qaytarish' }
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.9rem' }}>
                <span style={{ color: '#10b981' }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 900px) {
          .cart-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .cart-item-row {
            flex-wrap: wrap !important;
            gap: 16px !important;
          }
          .cart-item-row img {
            width: 80px !important;
            height: 80px !important;
          }
          .cart-item-total-price {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Cart
