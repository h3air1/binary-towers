import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const NAME_RE = /^[a-zA-Zа-яёА-ЯЁ\s\-]{2,}$/
const PHONE_RE = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
const PASSWORD_RE = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

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

function validate(tab: 'login' | 'register', form: Record<string, string>): string {
  if (!EMAIL_RE.test(form.email)) return 'Некорректный email адрес (example@domain.com)'
  if (!form.password) return 'Введите пароль'
  if (tab === 'register') {
    if (!form.full_name.trim()) return 'Введите ваше имя'
    if (!NAME_RE.test(form.full_name.trim())) return 'Имя: только буквы, минимум 2 символа'
    if (form.phone && !PHONE_RE.test(form.phone)) return 'Телефон: формат +7 (XXX) XXX-XX-XX'
    if (!PASSWORD_RE.test(form.password)) return 'Пароль: мин. 8 символов, нужна цифра и спецсимвол (!@#$...)'
  }
  return ''
}

export function AuthModal({ onClose, onSuccess }: Props) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = k === 'phone' ? formatPhone(e.target.value) : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    if (error) setError('')
  }

  const switchTab = (t: 'login' | 'register') => { setTab(t); setError(''); setForm({ email: '', password: '', full_name: '', phone: '' }) }

  const submit = async () => {
    const err = validate(tab, form)
    if (err) { setError(err); return }
    setLoading(true)
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register({ email: form.email, password: form.password, full_name: form.full_name.trim(), phone: form.phone || undefined })
      }
      onSuccess?.()
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Ошибка. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const passStrength = (p: string) => {
    if (!p) return null
    const score = [p.length >= 8, /\d/.test(p), /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p), p.length >= 12].filter(Boolean).length
    if (score <= 1) return { label: 'Слабый', cls: 'strength-weak' }
    if (score === 2) return { label: 'Средний', cls: 'strength-medium' }
    if (score === 3) return { label: 'Хороший', cls: 'strength-good' }
    return { label: 'Отличный', cls: 'strength-strong' }
  }

  const strength = tab === 'register' ? passStrength(form.password) : null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{tab === 'login' ? 'Войти в кабинет' : 'Регистрация'}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Вход</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Регистрация</button>
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Ваше имя <span className="form-required">*</span></label>
              <input className="form-control" placeholder="Иван Иванов" value={form.full_name} onChange={set('full_name')} />
              <span className="form-hint">Только буквы, минимум 2 символа</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email <span className="form-required">*</span></label>
            <input className="form-control" type="email" placeholder="ivan@example.com" value={form.email} onChange={set('email')} />
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Телефон <span className="form-optional">(необязательно)</span></label>
              <input className="form-control" type="tel" placeholder="+7 (___) ___-__-__"
                value={form.phone} onChange={set('phone')} maxLength={18} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Пароль <span className="form-required">*</span></label>
            <div className="input-wrap">
              <input className="form-control" type={showPass ? 'text' : 'password'}
                placeholder={tab === 'register' ? 'Мин. 8 символов, цифра и спецсимвол' : 'Введите пароль'}
                value={form.password} onChange={set('password')}
                onKeyDown={e => e.key === 'Enter' && submit()} />
              <button className="input-eye" type="button" onClick={() => setShowPass(v => !v)}>
                {showPass
                  ? <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
            {strength && (
              <div className="pass-strength">
                <div className={`pass-bar ${strength.cls}`} />
                <span className="pass-label">{strength.label}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="form-error-box">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  )
}
