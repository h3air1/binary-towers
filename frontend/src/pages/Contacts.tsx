export function Contacts() {
  const info = [
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Телефон',
      value: '+7 965 953-40-35',
      sub: 'Пн–Пт: 8:00–20:00, Сб–Вс: 9:00–16:00',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'info@binary-clinic.ru',
      sub: 'Ответ в течение 2 часов в рабочее время',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Адрес',
      value: 'г. Грозный, пр. Путина, 1',
      sub: 'Вход со стороны центрального парка',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Часы работы',
      value: 'Пн–Пт: 8:00–20:00',
      sub: 'Сб–Вс: 9:00–16:00. Праздники — уточняйте',
    },
  ]

  return (
    <div className="container">
      <div className="page">
        <div className="section-head" style={{ marginBottom: 40 }}>
          <div>
            <h2>Контакты</h2>
            <p>Мы всегда на связи — выберите удобный способ обращения</p>
          </div>
        </div>

        <div className="contacts-layout">
          <div className="contacts-info">
            {info.map(item => (
              <div key={item.label} className="contact-card">
                <div className="contact-icon fi-blue">{item.icon}</div>
                <div>
                  <div className="contact-label">{item.label}</div>
                  <div className="contact-value">{item.value}</div>
                  <div className="contact-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contacts-form-block">
            <h3>Оставьте заявку</h3>
            <p>Перезвоним в течение 15 минут в рабочее время</p>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Ваше имя</label>
              <input className="form-control" placeholder="Иван Иванов" />
            </div>
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input className="form-control" placeholder="+7 (___) ___-__-__" />
            </div>
            <div className="form-group">
              <label className="form-label">Комментарий</label>
              <textarea className="form-control" rows={3} placeholder="Опишите ваш вопрос..." style={{ minHeight: 80, resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Отправить заявку
            </button>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
