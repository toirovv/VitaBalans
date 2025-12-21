import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import products, { categories } from '../data/products'

export default function Breadcrumb() {
  const { pathname } = useLocation()

  const parts = useMemo(() => {
    const segs = pathname.split('/').filter(Boolean)
    if (segs.length === 0) return [{ name: 'Bosh sahifa', to: '/' }]

    // always start with home
    const items = [{ name: 'Bosh sahifa', to: '/' }]

    // build rest
    let accum = ''
    segs.forEach((seg, idx) => {
      accum += `/${seg}`
      let name = seg

      // friendly names for known routes
      if (seg === 'catalog') name = 'Katalog'
      if (seg === 'toplam') name = "To'plamlar"
      if (seg === 'product') name = 'Mahsulot'
      if (seg === 'profile') name = 'Profil'

      // if this is an id under /toplam/:id, resolve category name
      if (idx > 0 && seg && seg === segs[idx] && segs[idx - 1] === 'toplam') {
        const cat = categories.find(c => c.id === seg)
        if (cat) name = cat.name
      }

      // if this is an id under /product/:id, resolve product title
      if (idx > 0 && segs[idx - 1] === 'product') {
        const prod = products.find(p => String(p.id) === seg || p.id === seg)
        if (prod) name = prod.title
      }

      // humanize fallback
      if (!['Katalog', "To'plamlar", 'Mahsulot', 'Profil'].includes(name)) {
        name = decodeURIComponent(name).replace(/[-_]/g, ' ')
        name = name.charAt(0).toUpperCase() + name.slice(1)
      }

      items.push({ name, to: accum })
    })

    return items
  }, [pathname])
  // If on home page, don't show breadcrumb
  if (pathname === '/' || pathname === '') return null

  // Show only Home » Current (no intermediate links)
  const showItems = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts

  return (
    <nav style={{ padding: '12px 0', fontSize: '0.95rem' }} aria-label="breadcrumb">
      <div className="container" style={{ display: 'flex', alignItems: 'center' }}>
        {showItems.map((it, i) => (
          <span key={it.to + i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {i === 0 ? (
              <Link to={it.to} style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>{it.name}</Link>
            ) : i === showItems.length - 1 ? (
              <span style={{ color: '#10b981', fontWeight: 700, marginLeft: 8 }}>{it.name}</span>
            ) : null}
            {i === 0 && showItems.length > 1 && (
              <span style={{ color: '#10b981', margin: '0 8px' }}>»</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  )
}
