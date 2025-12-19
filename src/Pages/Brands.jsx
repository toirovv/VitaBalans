import React from 'react'

function Brands() {
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h2>Homliik</h2>
      <p style={{ color: '#64748b', maxWidth: 720 }}>
        Bizning platformada homilikk (hamkorlik) qilishni xohlaysizmi? Sizni qo'shishdan xursandmiz.
        Homliik bo'yicha ma'lumot va sherikchilik shartlarini bilish uchun quyidagi formani to'ldiring.
      </p>

      <div style={{ marginTop: 24, maxWidth: 720, display: 'grid', gap: 12 }}>
        <input className="form-input" placeholder="Firma / Ism" />
        <input className="form-input" placeholder="Email" />
        <input className="form-input" placeholder="Telefon" />
        <textarea className="form-input" placeholder="Qisqacha ma'lumot" rows={4} />
        <button className="btn primary" style={{ width: 160 }}>Qo'shilish</button>
      </div>
    </div>
  )
}

export default Brands
