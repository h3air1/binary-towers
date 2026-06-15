import { useEffect, useState } from 'react'
import { appointmentsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Appointment } from '../types'

const STATUS_LABEL: Record<string, string> = { confirmed: 'Подтверждён', completed: 'Завершён', cancelled: 'Отменён' }
const STATUS_CLS: Record<string, string> = { confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

export function Cabinet() {
  const { user, logout } = useAuth()
  const [appts, setAppts] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    appointmentsApi.getMy().then(setAppts).finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = appts.filter(a => a.starts_at && new Date(a.starts_at) > now && a.status !== 'cancelled')
  const past = appts.filter(a => !a.starts_at || new Date(a.starts_at) <= now || a.status === 'cancelled')

  const list = tab === 'upcoming' ? upcoming : past

  if (!user) return null

  return (
    <div className="container">
      <div className="page">
        <div className="section-head" style={{ marginBottom: 32 }}>
          <h2>Личный кабинет</h2>
        </div>

        <div className="cabinet-grid">
          {/* SIDEBAR */}
          <div className="cabinet-sidebar">
            <div className="cabinet-avatar">{user.full_name[0]}</div>
            <div className="cabinet-name">{user.full_name}</div>
            <div className="cabinet-email">{user.email}</div>

            {user.phone && (
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{user.phone}</div>
            )}

            <hr className="divider" style={{ margin: '20px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--muted)' }}>Всего записей</span>
                <b>{appts.length}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--muted)' }}>Предстоящих</span>
                <b style={{ color: 'var(--primary)' }}>{upcoming.length}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--muted)' }}>Завершённых</span>
                <b style={{ color: 'var(--green)' }}>{past.filter(a => a.status === 'completed').length}</b>
              </div>
            </div>

            <hr className="divider" style={{ margin: '20px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Результаты анализов</div>
              {['Общий анализ крови', 'Биохимия', 'ОАМ'].map(name => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                  <span>{name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--line)', padding: '2px 7px', borderRadius: 6 }}>PDF</span>
                </div>
              ))}
            </div>

            <hr className="divider" style={{ margin: '20px 0' }} />
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: 'var(--red)' }} onClick={logout}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </div>

          {/* MAIN */}
          <div className="cabinet-main">
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button className={`btn btn-sm ${tab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('upcoming')}>
                Предстоящие ({upcoming.length})
              </button>
              <button className={`btn btn-sm ${tab === 'past' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('past')}>
                История ({past.length})
              </button>
            </div>

            {loading ? (
              <div className="loading"><div className="spinner" />Загрузка...</div>
            ) : list.length === 0 ? (
              <div className="empty">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h4>{tab === 'upcoming' ? 'Нет предстоящих записей' : 'История пуста'}</h4>
                <p>Запишитесь к врачу на главной странице</p>
              </div>
            ) : (
              <div className="appt-list">
                {list.map(a => {
                  const d = a.starts_at ? new Date(a.starts_at) : null
                  return (
                    <div key={a.id} className="appt-card">
                      {d && (
                        <div className="appt-date-box">
                          <div className="appt-date-day">{d.getDate()}</div>
                          <div className="appt-date-mon">{d.toLocaleDateString('ru-RU', { month: 'short' })}</div>
                        </div>
                      )}
                      <div className="appt-info" style={{ flex: 1 }}>
                        <div className="appt-doctor">{a.doctor_name}</div>
                        <div className="appt-spec">{a.specialization}</div>
                        {d && (
                          <div className="appt-time">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fmtDate(a.starts_at)} · {fmtTime(a.starts_at)} — {fmtTime(a.ends_at)}
                          </div>
                        )}
                      </div>
                      <span className={`badge ${STATUS_CLS[a.status] || 'badge-gray'}`} style={{ alignSelf: 'flex-start' }}>
                        {STATUS_LABEL[a.status] || a.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
