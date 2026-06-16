import { Link } from 'react-router-dom'

const EcgLogo = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.5" stroke="white" strokeWidth="1.4" strokeOpacity="0.55"/>
    <path d="M3.5 12h3.2l1.3-3.5 2.8 7 2-4.5H15l1.2-2 1.2 2h3.1"
      stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo"><EcgLogo /></div>
          <span className="footer-copy">© 2026 BinaryClinic — Медицинский центр, Грозный</span>
        </div>
        <nav className="footer-links">
          <Link className="footer-link" to="/about">О нас</Link>
          <Link className="footer-link" to="/services">Услуги</Link>
          <Link className="footer-link" to="/contacts">Контакты</Link>
        </nav>
        <div className="footer-contact">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="footer-copy">+7 965 953-40-35 · info@binary-clinic.ru</span>
        </div>
      </div>
    </footer>
  )
}
