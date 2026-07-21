'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

export default function Nav() {
  const path = usePathname()
  const { theme, toggle } = useTheme()

  const tabs = [
    { label: 'Daily',  href: '/daily' },
    { label: 'Weekly', href: '/weekly' },
    { label: 'Monthly', href: '/monthly' },
    { label: 'Yearly',  href: '#', disabled: true },
    { label: 'Life Goals', href: '#', disabled: true },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '14px 28px',
      background: theme === 'dark' ? 'rgba(9,9,15,0.88)' : 'rgba(250,246,240,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--gold)', marginRight: 'auto' }}>
        ✦ Aether
      </div>

      {tabs.map(t => {
        const active = !t.disabled && path.startsWith(t.href)
        return (
          <Link
            key={t.label}
            href={t.href}
            onClick={t.disabled ? (e) => e.preventDefault() : undefined}
            style={{
              background: active ? 'var(--gold-glow)' : 'none',
              border: `1px solid ${active ? 'var(--gold-dim)' : 'transparent'}`,
              borderRadius: 20,
              color: active ? 'var(--gold)' : t.disabled ? 'var(--text-dim)' : 'var(--text-dim)',
              padding: '5px 14px',
              fontSize: 12,
              letterSpacing: 0.5,
              cursor: t.disabled ? 'default' : 'pointer',
              opacity: t.disabled ? 0.35 : 1,
              textDecoration: 'none',
              transition: 'all 0.18s',
            }}
          >
            {t.label}
          </Link>
        )
      })}

      <button
        onClick={toggle}
        style={{
          marginLeft: 8,
          background: 'none',
          border: '1px solid var(--border-light)',
          color: 'var(--text-mid)',
          padding: '5px 12px',
          borderRadius: 20,
          cursor: 'pointer',
          fontSize: 12,
          transition: 'all 0.18s',
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
    </nav>
  )
}
