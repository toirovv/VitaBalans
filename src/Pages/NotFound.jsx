import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 820 }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 12 }}>404 — Sahifa topilmadi</h1>
        <p style={{ color: '#64748b', marginBottom: 20 }}>Kechirasiz, siz qidirgan manzil mavjud emas yoki o'zgartirilgan.</p>
        <div style={{ margin: '20px 0' }}>
          <img src="https://thumbs.dreamstime.com/b/page-not-found-error-hand-drawn-ghost-doodle-vector-illustration-internet-connection-trouble-concept-105206287.jpg" alt="404" style={{ maxWidth: 420, width: '100%', opacity: 0.95 }} />
        </div>
        <Link to="/" className="btn primary" style={{ display: 'inline-block', marginTop: 8 }}>Bosh sahifaga qaytish</Link>
      </div>
    </div>
  )
}
