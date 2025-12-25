import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaTag, FaBookmark } from 'react-icons/fa'

export default function BlogDetail() {
    const { id } = useParams()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let active = true

        async function loadBlog() {
            try {
                const res = await fetch('/vita-api/api/v1/articles/')

                if (!res.ok) {
                    throw new Error(`Server xato: ${res.status}`)
                }

                const json = await res.json()

                if (!active) return

                const list = json.data || []
                const found = list.find(item => item.id === id)

                if (found) {
                    const attrs = found.attributes || {}
                    const trans = attrs.translations?.en || {}
                    const firstCategory = attrs.category?.[0]

                    setBlog({
                        id: found.id,
                        title: trans.title || 'Nomaʼlum maqola',
                        subtitle: trans.description?.slice(0, 150) + '...' || '',
                        content: trans.description || '',
                        image: attrs.thumbnail || '/assets/images/VitaBalansLogo.jpg',
                        date: attrs.date || new Date().toISOString().split('T')[0],
                        category: firstCategory?.translations?.en?.name || firstCategory?.name || 'Umumiy',
                        tags: attrs.tags || []
                    })
                } else {
                    setBlog(null)
                }

                setError(null)
            } catch (err) {
                if (!active) return
                setError(err)
                setBlog(null)
            } finally {
                if (active) setLoading(false)
            }
        }

        loadBlog()

        return () => {
            active = false
        }
    }, [id])

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const day = date.getDate()
        const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']
        return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`
    }

    if (loading) {
        return (
            <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ color: '#64748b', marginTop: '16px' }}>Yuklanmoqda...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Xatolik yuz berdi</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>{error.message}</p>
                <Link to="/blog" className="btn primary">
                    Blogga qaytish
                </Link>
            </div>
        )
    }

    if (!blog) {
        return (
            <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                <h1>Maqola topilmadi</h1>
                <Link to="/blog" className="btn primary" style={{ marginTop: '20px' }}>
                    Blogga qaytish
                </Link>
            </div>
        )
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            {/* Top Navigation */}
            <div className="container" style={{ padding: '20px 24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Link
                        to="/blog"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#0f172a',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        <FaArrowLeft />
                        Orqaga
                    </Link>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        <FaBookmark />
                        Saqlash
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div style={{
                width: '100%',
                maxHeight: '400px',
                overflow: 'hidden'
            }}>
                <img
                    src={blog.image}
                    alt={blog.title}
                    style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover'
                    }}
                    onError={(e) => {
                        e.target.src = '/assets/images/VitaBalansLogo.jpg'
                    }}
                />
            </div>

            {/* Content */}
            <div className="container" style={{ padding: '40px 24px 80px' }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    marginTop: '-60px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Title */}
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        marginBottom: '24px',
                        lineHeight: '1.3'
                    }}>
                        {blog.title}
                    </h1>

                    {/* Category Tag */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '32px'
                    }}>
                        <FaTag />
                        {blog.category}
                    </div>

                    {/* Main Content */}
                    <div style={{
                        color: '#374151',
                        fontSize: '1rem',
                        lineHeight: '1.8',
                        marginBottom: '40px'
                    }}>
                        {blog.content.split('\n\n').map((paragraph, index) => (
                            <p key={index} style={{ marginBottom: '20px' }}>
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {/* Date */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        marginTop: '40px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <FaClock />
                        <span>Qo'shilgan: {formatDate(blog.date)}</span>
                    </div>
                </div>

                {/* Back Button */}
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Link to="/blog" className="btn outline">
                        ← Barcha maqolalarga qaytish
                    </Link>
                </div>
            </div>
        </div>
    )
}
