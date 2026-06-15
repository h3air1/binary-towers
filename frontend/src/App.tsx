import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Doctors } from './pages/Doctors'
import { Cabinet } from './pages/Cabinet'
import { AuthModal } from './components/AuthModal'

type Page = 'home' | 'doctors' | 'cabinet'

function AppContent() {
  const { user } = useAuth()
  const [page, setPage] = useState<Page>('home')
  const [showAuth, setShowAuth] = useState(false)

  const goTo = (p: Page) => {
    if (p === 'cabinet' && !user) { setShowAuth(true); return }
    setPage(p)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header page={page} setPage={goTo} />
      <main style={{ flex: 1 }}>
        {page === 'home' && <Home setPage={goTo} />}
        {page === 'doctors' && <Doctors />}
        {page === 'cabinet' && user && <Cabinet />}
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-copy">© 2026 BinaryClinic — Медицинский центр, Алматы</span>
          <span className="footer-copy">+7 (727) 000-00-00 · info@binary-clinic.kz</span>
        </div>
      </footer>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setPage('cabinet') }} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
