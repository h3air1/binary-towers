import { useState } from 'react'

const NAME_RE = /^[a-zA-Zа-яёА-ЯЁ\s\-]{2,}$/

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  const local = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits
  if (local.length === 0) return ''
  let r = '+7 ('
  if (local.length <= 3) return r + local
  r += local.slice(0, 3) + ') '
  if (local.length <= 6) return r + local.slice(3)
  r += local.slice(3, 6) + '-'
  if (local.length <= 8) return r + local.slice(6)
  r += local.slice(6, 8) + '-' + local.slice(8, 10)
  return r
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

interface FormState { name: string; phone: string; comment: string }
interface FormErrors { name?: string; phone?: string; comment?: string }

const PHONE_RE = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
const MAX = { name: 60, comment: 500 }

function validate(f: FormState): FormErrors {
  const e: FormErrors = {}
  if (!f.name.trim()) e.name = 'Введите ваше имя'
  else if (!NAME_RE.test(f.name.trim())) e.name = 'Только буквы, минимум 2 символа'
  else if (f.name.length > MAX.name) e.name = `Максимум ${MAX.name} символов`

  if (!f.phone) e.phone = 'Введите номер телефона'
  else if (!PHONE_RE.test(f.phone)) e.phone = 'Формат: +7 (XXX) XXX-XX-XX'

  if (f.comment.length > MAX.comment) e.comment = `Максимум ${MAX.comment} символов`
  return e
}

export function Contacts() {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', comment: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = k === 'phone' ? formatPhone(e.target.value) : e.target.value
    setForm(f => ({ ...f, [k]: raw }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const submit = () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const safe = {
      name: escapeHtml(form.name.trim()),
      phone: form.phone,
      comment: escapeHtml(form.comment.trim()),
    }
    console.log('Form payload (sanitized):', safe)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 800)
  }

  const info = [
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Телефон', value: '+7 965 953-40-35',
      sub: 'Пн–Пт: 8:00–20:00, Сб–Вс: 9:00–16:00',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email', value: 'info@binary-clinic.ru',
      sub: 'Ответ в течение 2 часов в рабочее время',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Адрес', value: 'г. Грозный, пр. Путина, 1',
      sub: 'Вход со стороны центрального парка',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Часы работы', value: 'Пн–Пт: 8:00–20:00',
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

            {submitted ? (
              <div className="contact-success">
                <div className="success-check">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4>Заявка отправлена!</h4>
                <p>Мы свяжемся с вами по номеру<br /><strong>{form.phone}</strong></p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}
                  onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', comment: '' }) }}>
                  Отправить ещё
                </button>
              </div>
            ) : (
              <>
                <div className="form-group" style={{ marginTop: 20 }}>
                  <label className="form-label">
                    Ваше имя <span className="form-required">*</span>
                  </label>
                  <input
                    className={`form-control ${errors.name ? 'form-control-error' : ''}`}
                    placeholder="Иван Иванов"
                    value={form.name}
                    onChange={set('name')}
                    maxLength={MAX.name + 5}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Телефон <span className="form-required">*</span>
                  </label>
                  <input
                    className={`form-control ${errors.phone ? 'form-control-error' : ''}`}
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={set('phone')}
                    maxLength={18}
                  />
                  {errors.phone
                    ? <span className="field-error">{errors.phone}</span>
                    : <span className="form-hint">Только цифры, формат +7 (XXX) XXX-XX-XX</span>
                  }
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Комментарий
                    <span className="form-optional"> (необязательно)</span>
                    <span className="char-counter" style={{ color: form.comment.length > MAX.comment ? 'var(--red)' : 'var(--muted-2)' }}>
                      {form.comment.length}/{MAX.comment}
                    </span>
                  </label>
                  <textarea
                    className={`form-control ${errors.comment ? 'form-control-error' : ''}`}
                    rows={4}
                    placeholder="Опишите ваш вопрос..."
                    value={form.comment}
                    onChange={set('comment')}
                    maxLength={MAX.comment + 50}
                    style={{ minHeight: 90, resize: 'vertical' }}
                  />
                  {errors.comment && <span className="field-error">{errors.comment}</span>}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  onClick={submit}
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />Отправка...</>
                  ) : (
                    <>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Отправить заявку
                    </>
                  )}
                </button>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
