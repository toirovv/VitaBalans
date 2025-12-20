import React from 'react'

export default function Loader({ message = 'Yuklanmoqda...' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.28)', zIndex: 9999 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 18, borderRadius: 12, background: 'rgba(255,255,255,0.98)', boxShadow: '0 18px 50px rgba(2,6,23,0.12)', minWidth: 260 }}>
        <div style={{ position: 'relative', width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="84" height="84" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="spinnerGrad" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="65%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" stroke="#eef2ff" strokeWidth="10" fill="none" />
            <path d="M90 50a40 40 0 0 0-80 0" stroke="url(#spinnerGrad)" strokeWidth="10" strokeLinecap="round" fill="none">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="0.9s" repeatCount="indefinite" />
            </path>
          </svg>

          <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: 999, background: '#16a34a', transformOrigin: 'center', animation: 'orbit 1.2s linear infinite' }} />
          <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: 999, background: '#f59e0b', transformOrigin: 'center', animation: 'orbit 1.2s linear infinite', animationDelay: '0.12s' }} />
          <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: 999, background: '#06b6d4', transformOrigin: 'center', animation: 'orbit 1.2s linear infinite', animationDelay: '0.24s' }} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: '#064e3b' }}>{message}</div>

        <style>{`
          @keyframes orbit{
            0%{transform:translate(32px,0) scale(.9); opacity: .9}
            50%{transform:translate(0,-32px) scale(1.05); opacity: 1}
            100%{transform:translate(-32px,0) scale(.9); opacity: .9}
          }
        `}</style>
      </div>
    </div>
  )
}
