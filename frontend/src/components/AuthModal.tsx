import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ onClose, onSuccess }: Props) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setError('')
    if (!form.email || !form.password) return setError('Заполните все поля')
    if (tab === 'register' && !form.full_name) return setError('Введите ваше имя')
    setLoading(true)
    try {
      if (tab === 'login') await login({ email: form.email, password: form.password })
      else await register({ email: form.email, password: form.password, full_name: form.full_name, phone: form.phone })
      onSuccess?.()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

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
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Вход</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Регистрация</button>
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Ваше имя</label>
              <input className="form-control" placeholder="Иван Петров" value={form.full_name} onChange={set('full_name')} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="ivan@example.com" value={form.email} onChange={set('email')} />
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input className="form-control" placeholder="+7 999 000 00 00" value={form.phone} onChange={set('phone')} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-control" type="password" placeholder="Минимум 6 символов" value={form.password} onChange={set('password')}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          {error && <p className="form-error">{error}</p>}
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
