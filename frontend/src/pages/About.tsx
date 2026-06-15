export function About() {
  const stats = [
    { value: '12+', label: 'Лет на рынке' },
    { value: '6', label: 'Специалистов' },
    { value: '3 200', label: 'Пациентов' },
    { value: '4.8★', label: 'Средний рейтинг' },
  ]

  const team = [
    { role: 'Главный врач', name: 'Магомедов А.Р.', desc: 'Кандидат медицинских наук, 22 года практики' },
    { role: 'Операционный директор', name: 'Хасанова Л.К.', desc: 'Организация и контроль качества медицинских услуг' },
    { role: 'Руководитель IT', name: 'Ахмадов Т.М.', desc: 'Цифровизация и безопасность медицинских данных' },
  ]

  return (
    <div className="container">
      <div className="page">
        <div className="about-hero">
          <div className="about-badge">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            О клинике
          </div>
          <h1 className="about-title">BinaryClinic — <br />медицина нового уровня</h1>
          <p className="about-sub">
            Современный медицинский центр в Грозном. Мы объединяем лучших специалистов, передовые технологии
            и заботу о каждом пациенте в одном месте.
          </p>
        </div>

        <div className="stats-row">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="about-section">
          <div className="about-text-block">
            <h2>Наша миссия</h2>
            <p>
              Мы верим, что качественная медицинская помощь должна быть доступной и прозрачной.
              Наша платформа позволяет выбрать врача по симптомам, записаться онлайн в любое время
              и получить профессиональную консультацию без лишних звонков и ожидания.
            </p>
            <p>
              BinaryClinic — это не просто клиника. Это экосистема, где пациент находится в центре
              всех процессов: от первичной записи до получения результатов анализов в личном кабинете.
            </p>
          </div>
          <div className="about-values">
            {[
              { icon: '🔬', title: 'Доказательная медицина', desc: 'Все решения основаны на актуальных клинических протоколах и международных стандартах' },
              { icon: '🔒', title: 'Конфиденциальность', desc: 'Данные пациентов защищены шифрованием и никогда не передаются третьим лицам' },
              { icon: '⚡', title: 'Скорость', desc: 'Запись за 2 минуты, результаты анализов — в день готовности, без ожидания на почту' },
            ].map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <div>
                  <h4>{v.title}</h4>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="team-section">
          <h2>Руководство клиники</h2>
          <div className="team-grid">
            {team.map(m => (
              <div key={m.name} className="team-card">
                <div className="team-avatar">{m.name[0]}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
