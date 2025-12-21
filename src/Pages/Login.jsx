import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import logo from '../assets/images/VitaBalansLogo.jpg'
import { AuthContext } from '../contexts/AuthContext'

function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, '')
    // if user pastes full number with country code, strip leading 998
    if (digits.startsWith('998')) digits = digits.slice(3)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  const handlePhoneChange = (e) => {
    const raw = e.target.value
    const formatted = formatPhone(raw)
    setPhone(formatted)
  }

  const allowedPrefixes = ['90','93','99','98','91','97','95','94']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone || !password) {
      setError("Iltimos, barcha maydonlarni to'ldiring")
      return
    }
    const digits = phone.replace(/\D/g, '')
    // expect 9 digits after the +998 country code
    if (digits.length !== 9) {
      setError("Iltimos, to'liq telefon raqamini kiriting (+998 (XX) XXX XX XX)")
      return
    }

    // validate operator prefix
    if (!allowedPrefixes.includes(digits.slice(0,2))) {
      setError('Iltimos, Oʻzbekiston operator raqamlarini kiriting (90,93,99,98,91,97,95,94)')
      return
    }

    const phoneNorm = '+998 ' + digits
    // If phone isn't registered, show clear notification
    const users = JSON.parse(localStorage.getItem('vb_users') || '[]')
    const exists = users.find(u => u.phone === phoneNorm)
    if (!exists) {
      setError("Bu telefon ro'yxatdan o'tmagan")
      return
    }

    // enforce exact 8-char password
    if (password.length !== 8) {
      setError("Parol aniq 8 ta belgidan iborat bo'lishi kerak")
      return
    }
    try {
      const res = await login({ phone: phoneNorm, password })
      if (!res || !res.ok) {
        setError(res?.message || 'Kirishda xatolik')
        return
      }
      try { sessionStorage.setItem('justLoggedIn', '1') } catch (e) {}
      // Notify server about login (non-blocking)
      try {
        fetch('http://localhost:3001/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: `login-${Date.now()}`,
            when: Date.now(),
            customer: { firstName: res.user?.name || '', phone: phoneNorm },
            items: [],
            total: 0
          })
        }).catch(() => {})
      } catch (e) {}

      navigate('/profile')
    } catch (err) {
      setError('Tarmoqqa ulanishda xatolik')
    }
  }

  return (
    <div className="auth-page no-logo">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <Link to="/" style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={logo}
            alt="VitaBalans"
            className="auth-logo"
            style={{
              width: 'min(160px, 28vw)',
              height: 'auto',
              borderRadius: '16px',
              boxShadow: '0 18px 40px rgba(16, 185, 129, 0.16)',
              marginBottom: '32px',
              objectFit: 'contain',
              background: 'white',
              padding: 6
            }}
          />
        </Link>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>VitaBalans ga xush kelibsiz!</h2>
        <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: 1.7 }}>
          Sog'lom hayot yo'lida sizga yordam berish uchun tabiiy vitaminlar
          va qo'shimchalar kolleksiyasini kashf eting.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        <div className="auth-form">
          {/* Logo for mobile */}
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
            <img
              src={logo}
              alt="VitaBalans"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px'
              }}
              className="mobile-logo"
            />
          </Link>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Kirish</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Hisobingizga kiring</p>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Telefon raqami
              </label>
                <div style={{ display: 'flex', gap: '0' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 12px',
                      background: '#f3f4f6',
                    borderRadius: '12px 0 0 12px',
                    border: '2px solid #e5e7eb',
                    borderRight: 'none',
                    minWidth: '86px',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}>
                     <img style={{width:20,height:12,objectFit:'cover'}} src="https://img.freepik.com/premium-photo/republic-uzbekistan-national-fabric-flag-textile-background-symbol-world-asian-country_113767-2072.jpg?semt=ais_hybrid&w=740&q=80" alt="uz" />
                      <span style={{ fontWeight: '600', color: '#374151', marginLeft:6, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>+998</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(XX) XXX XX XX"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={14}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0 12px 12px 0',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    autoComplete="tel"
                    required
                  />
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Parol
              </label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '1rem'
                }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  autoComplete="current-password"
                  maxLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot" style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '500' }}>
                Parolni unutdingizmi?
              </Link>
            </div>

            <button
              type="submit"
              className="btn primary"
              aria-label="Kirish"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                borderRadius: '12px'
              }}
            >
              Kirish
            </button>
          </form>

          {/* social login removed per request */}

          <p style={{
            textAlign: 'center',
            marginTop: '24px',
            color: '#6b7280'
          }}>
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" style={{ color: '#10b981', fontWeight: '600' }}>
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        /* mobile / small-screen tweaks for auth pages */
        @media (max-width: 900px) {
          .mobile-logo { display: block !important; }
          .auth-left img { width: 100px; height: 100px; }
          .auth-left h2 { font-size: 1.25rem; }
          .auth-left p { font-size: 0.95rem; }
          .auth-form h2 { font-size: 1.25rem; }
          .auth-form p { font-size: 0.9rem; }
          /* make phone and small labels easier to read at small widths */
          #phone, input[name="phone"] { font-size: 0.95rem; }
        }
        @media (min-width: 901px) {
          .mobile-logo { display: none; }
        }
      `}</style>
    </div>
  )
}

export default Login
