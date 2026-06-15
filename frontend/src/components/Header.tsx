import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from './AuthModal'
import type { Page } from '../App'

interface Props {
  page: Page
  setPage: (p: Page) => void
}

export function Header({ page, setPage }: Props) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const nav: { label: string; page: Page }[] = [
    { label: 'Главная', page: 'home' },
    { label: 'О нас', page: 'about' },
    { label: 'Услуги', page: 'services' },
    { label: 'Врачи', page: 'doctors' },
    { label: 'Контакты', page: 'contacts' },
  ]

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <button className="logo" onClick={() => setPage('home')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <div className="logo-icon">
              {/* Pixel cross: 5 squares = medical cross; top-right dimmed = binary "0" */}
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="9.5" y="2"    width="5" height="5" rx="1.2" fill="white"/>
                <rect x="2"   y="9.5"  width="5" height="5" rx="1.2" fill="white"/>
                <rect x="9.5" y="9.5"  width="5" height="5" rx="1.2" fill="white"/>
                <rect x="17"  y="9.5"  width="5" height="5" rx="1.2" fill="white"/>
                <rect x="9.5" y="17"   width="5" height="5" rx="1.2" fill="white"/>
                <rect x="17"  y="2"    width="5" height="5" rx="1.2" fill="white" fillOpacity="0.3"/>
              </svg>
            </div>
            Binary<span>Clinic</span>
          </button>

          <nav className="header-nav">
            {nav.map(n => (
              <button key={n.page} className={`nav-link ${page === n.page ? 'active' : ''}`} onClick={() => setPage(n.page)}>
                {n.label}
              </button>
            ))}
            {user && (
              <button className={`nav-link ${page === 'cabinet' ? 'active' : ''}`} onClick={() => setPage('cabinet')}>
                Мой кабинет
              </button>
            )}
          </nav>

          <div className="header-right">
            {user ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage('cabinet')}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.full_name.split(' ')[0]}
                </button>
                <button className="btn btn-outline btn-sm" onClick={logout}>Выйти</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(true)}>Войти</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>Записаться</button>
              </>
            )}
            <button className="burger" onClick={() => setMenuOpen(v => !v)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {nav.map(n => (
              <button key={n.page} className={`mobile-nav-link ${page === n.page ? 'active' : ''}`}
                onClick={() => { setPage(n.page); setMenuOpen(false) }}>
                {n.label}
              </button>
            ))}
            {user && (
              <button className={`mobile-nav-link ${page === 'cabinet' ? 'active' : ''}`}
                onClick={() => { setPage('cabinet'); setMenuOpen(false) }}>
                Мой кабинет
              </button>
            )}
            {!user && (
              <button className="mobile-nav-link" onClick={() => { setShowAuth(true); setMenuOpen(false) }}>
                Войти / Зарегистрироваться
              </button>
            )}
          </div>
        )}
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
