import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../Components/ProductCard'
import products from '../data/products'
import { FaArrowRight, FaLeaf, FaHeart, FaStar, FaShieldAlt, FaSearch } from 'react-icons/fa'

function Home() {
  const [index, setIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = (searchQuery || '').trim()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    navigate(`/catalog?${params.toString()}`)
  }

  // live-first-letter search while typing (optional UX)
  useEffect(() => {
    const q = (searchQuery || '').trim()
    if (!q) {
      setSearchResults(null)
      return
    }
    const first = q.charAt(0).toLowerCase()
    const results = products.filter(p => p.title && p.title.trim().charAt(0).toLowerCase() === first)
    setSearchResults(results)
  }, [searchQuery])

  const features = [
    { icon: <FaLeaf />, title: "100% Tabiiy", desc: "Faqat tabiiy ingredientlar" },
    { icon: <FaHeart />, title: "Sog'liq uchun", desc: "Salomatlik kafolati" },
    { icon: <FaStar />, title: "Premium sifat", desc: "Eng yuqori standartlar" },
    { icon: <FaShieldAlt />, title: "Sertifikatlangan", desc: "Xalqaro sertifikat" },
  ]

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % products.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-slider">
          <div className="slides-wrapper" style={{ transform: `translateX(-${index * 100}%)` }}>
            {products.map((p) => (
              <div className="slide" key={p.id}>
                <div className="hero-content">
                  <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #10b981, #0ea5a3)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    🌿 Yangi kolleksiya
                  </span>
                  <h1>{p.title}</h1>
                  <p>{p.description}</p>
                  <div className="hero-actions">
                    <Link to="/catalog" className="btn primary">
                      Xarid qilish <FaArrowRight />
                    </Link>
                    <Link to="/about" className="btn secondary">
                      Batafsil
                    </Link>
                  </div>
                </div>
                <img src={p.image} className="hero-image" alt={p.title} />
              </div>
            ))}
          </div>

          <div className="hero-dots">
            {products.map((_, i) => (
              <button
                key={i}
                className={"hero-dot" + (i === index ? ' active' : '')}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Section - Below Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)',
        padding: '40px 0'
      }}>
        <div className="container">
          <form onSubmit={handleSearch} className="home-search" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="search-form" style={{ flex: 1, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(16, 185, 129, 0.06)', padding: 4 }}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home-search-input"
              />
            </div>
            
            <Link
              to="/catalog"
              className="btn primary"
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Katalog <FaArrowRight />
            </Link>
          </form>
          {/* Search results on Home (first-letter matching) */}
          {Array.isArray(searchResults) && (
            <section style={{ marginTop: 18 }}>
              <div className="container">
                <h3>Qidiruv natijalari: "{searchQuery.charAt(0).toUpperCase()}"</h3>
                <div className="grid" style={{ marginTop: 12 }}>
                  {searchResults.length ? searchResults.map(p => (
                    <ProductCard key={p.id} product={p} />
                  )) : (
                    <div style={{ padding: 24, color: '#64748b' }}>Hech qanday natija topilmadi.</div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '24px',
                background: '#f8fafc',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#10b981'
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{f.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products (newest first) */}
      <section className="products container">
        <h2>Mahsulotlar</h2>
        <div className="grid">
          {products.slice().reverse().map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <h2>Sog'lom hayot – sizning tanlovingiz!</h2>
          <p>VitaBalans bilan tabiiy vitaminlar va qo'shimchalar orqali sog'lig'ingizni mustahkamlang.</p>
          <Link to="/register" className="btn cta-btn">Hoziroq boshlash</Link>
        </div>
      </section>
    </div>
  )
}

export default Home
