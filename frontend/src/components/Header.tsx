import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from './AuthModal'

type Page = 'home' | 'doctors' | 'cabinet'

interface Props {
  page: Page
  setPage: (p: Page) => void
}

export function Header({ page, setPage }: Props) {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <button className="logo" onClick={() => setPage('home')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <div className="logo-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            Binary<span>Clinic</span>
          </button>

          <nav className="header-nav">
            <button className={`nav-link ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>Главная</button>
            <button className={`nav-link ${page === 'doctors' ? 'active' : ''}`} onClick={() => setPage('doctors')}>Врачи</button>
            {user && <button className={`nav-link ${page === 'cabinet' ? 'active' : ''}`} onClick={() => setPage('cabinet')}>Мой кабинет</button>}
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
          </div>
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
