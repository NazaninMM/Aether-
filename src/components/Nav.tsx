'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import styles from './Nav.module.css'

export default function Nav() {
  const path = usePathname()
  const { theme, toggle } = useTheme()

  const tabs = [
    { label: 'Daily',  href: '/daily' },
    { label: 'Weekly', href: '/weekly' },
    { label: 'Monthly', href: '/monthly' },
    { label: 'Yearly',  href: '/yearly' },
    { label: 'Life Goals', href: '/life-goals' },
  ]

  return (
    <nav
      className={styles.nav}
      style={{ background: theme === 'dark' ? 'rgba(9,9,15,0.88)' : 'rgba(250,246,240,0.92)' }}
    >
      <div className={styles.brand}>
        ✦ Aether
      </div>

      <div className={styles.links}>
        {tabs.map(t => {
          const active = path.startsWith(t.href)
          return (
            <Link
              key={t.label}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              className={`${styles.link} ${active ? styles.active : ''}`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      <button
        onClick={toggle}
        className={styles.themeButton}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
    </nav>
  )
}
