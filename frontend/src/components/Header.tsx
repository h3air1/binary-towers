import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from './AuthModal'

const NAV = [
  { label: 'Главная',  to: '/' },
  { label: 'О нас',    to: '/about' },
  { label: 'Услуги',   to: '/services' },
  { label: 'Врачи',    to: '/doctors' },
  { label: 'Контакты', to: '/contacts' },
]

const EcgLogo = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.5" stroke="white" strokeWidth="1.4" strokeOpacity="0.55"/>
    <path d="M3.5 12h3.2l1.3-3.5 2.8 7 2-4.5H15l1.2-2 1.2 2h3.1"
      stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (to: string) => to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon"><EcgLogo /></div>
            Binary<span>Clinic</span>
          </Link>

          <nav className="header-nav">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} className={`nav-link ${isActive(n.to) ? 'active' : ''}`}>
                {n.label}
              </Link>
            ))}
            {user && (
              <Link to="/cabinet" className={`nav-link ${isActive('/cabinet') ? 'active' : ''}`}>
                Мой кабинет
              </Link>
            )}
          </nav>

          <div className="header-right">
            {user ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/cabinet')}>
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
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctors')}>Записаться</button>
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
            {NAV.map(n => (
              <Link key={n.to} to={n.to} className={`mobile-nav-link ${isActive(n.to) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}>
                {n.label}
              </Link>
            ))}
            {user
              ? <Link to="/cabinet" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Мой кабинет</Link>
              : <button className="mobile-nav-link" onClick={() => { setShowAuth(true); setMenuOpen(false) }}>Войти / Записаться</button>
            }
          </div>
        )}
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); navigate('/cabinet') }}
        />
      )}
    </>
  )
}
