import { useNavigate } from 'react-router-dom'

const SERVICES = [
  {
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Первичная консультация',
    desc: 'Осмотр, сбор анамнеза, назначение обследований. Продолжительность 30–45 минут.',
    price: 'от 2 500 ₽',
    color: 'fi-blue',
  },
  {
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'Лабораторная диагностика',
    desc: 'Общий анализ крови и мочи, биохимия, гормоны, ПЦР. Результаты в день сдачи.',
    price: 'от 800 ₽',
    color: 'fi-mint',
  },
  {
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Кардиология',
    desc: 'ЭКГ, холтер-мониторирование, эхокардиография. Лечение заболеваний сердца.',
    price: 'от 3 500 ₽',
    color: 'fi-red',
  },
  {
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: 'Офтальмология',
    desc: 'Проверка зрения, подбор очков и линз, лечение заболеваний глаз.',
    price: 'от 2 000 ₽',
    color: 'fi-yellow',
  },
  {
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Неврология',
    desc: 'Лечение головных болей, нарушений сна, депрессии, вегетативных расстройств.',
    price: 'от 3 000 ₽',
    color: 'fi-purple',
  },
  {
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-4l4 4 4-4M8 8l4-4 4 4" />
      </svg>
    ),
    title: 'Ортопедия',
    desc: 'Лечение заболеваний суставов, позвоночника. Реабилитация после травм.',
    price: 'от 3 200 ₽',
    color: 'fi-teal',
  },
]

export function Services() {
  const navigate = useNavigate()
  return (
    <div className="container">
      <div className="page">
        <div className="section-head" style={{ marginBottom: 40 }}>
          <div>
            <h2>Наши услуги</h2>
            <p>Полный спектр медицинской помощи в одном месте</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctors')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Записаться к врачу
          </button>
        </div>

        <div className="services-grid">
          {SERVICES.map(s => (
            <div key={s.title} className="service-card">
              <div className={`feature-icon ${s.color}`}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="service-price">{s.price}</div>
            </div>
          ))}
        </div>

        <div className="services-note">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Точная стоимость зависит от объёма и сложности. Уточняйте у администратора: <strong>+7 965 953-40-35</strong>
        </div>
      </div>
    </div>
  )
}
