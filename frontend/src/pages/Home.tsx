import { useEffect, useState } from 'react'
import { symptomsApi, doctorsApi } from '../api'
import type { Doctor, Slot, Symptom } from '../types'
import { BookingModal } from '../components/BookingModal'
import type { Page } from '../App'

interface Props { setPage: (p: Page) => void }

function SymptomIcon({ name }: { name: string }) {
  const s = (d: string) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
  const map: Record<string, JSX.Element> = {
    'Головная боль': s('M9.5 8.5A3.5 3.5 0 0113 5h-.01A3.5 3.5 0 0116.5 8.5c0 1.404-.826 2.614-2 3.197V14a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2.303C9.326 11.114 8.5 9.904 8.5 8.5zM10 17h4'),
    'Боль в спине': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2"/><line x1="12" y1="6" x2="12" y2="18"/>
        <path d="M9 9h6M9 13h6M9 17h6"/>
      </svg>
    ),
    'Боль в сердце': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        <path d="M8 12h2l1.5-3 2 6 1.5-3H18"/>
      </svg>
    ),
    'Кашель': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6C9 6 6 8.5 6 11.5c0 1.5.6 2.8 1.5 3.8L6 17l2 1 1.5-2c.8.3 1.6.5 2.5.5s1.7-.2 2.5-.5L16 18l2-1-1.5-1.7A5.5 5.5 0 0018 11.5C18 8.5 15 6 12 6z"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    'Температура': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
      </svg>
    ),
    'Боль в животе': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="16" rx="3"/>
        <path d="M9 9c1 1 5 1 6 0M9 13c1 1 5 1 6 0"/>
      </svg>
    ),
    'Аллергия': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    'Проблемы со зрением': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    'Боль в суставах': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20V9a5 5 0 0110 0v2a3 3 0 01-3 3H9"/>
        <circle cx="7" cy="20" r="1" fill="currentColor"/>
        <circle cx="17" cy="9" r="1" fill="currentColor"/>
      </svg>
    ),
    'Стресс и депрессия': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 10h.01M15 10h.01M8 15s1.5-2 4-2 4 2 4 2"/>
        <path d="M9 5.5L7 4M15 5.5l2-1.5"/>
      </svg>
    ),
    'Проблемы с кожей': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
        <circle cx="9" cy="10" r="1" fill="currentColor"/>
        <circle cx="14" cy="8" r="1" fill="currentColor"/>
        <circle cx="15" cy="14" r="1" fill="currentColor"/>
        <circle cx="9" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
    'Боль в горле': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 00-7 7c0 3.4 2.4 6.2 5.6 6.9L10 19l2 2 2-2-.6-3.1C16.6 15.2 19 12.4 19 9a7 7 0 00-7-7z"/>
        <line x1="10" y1="10" x2="14" y2="10"/>
      </svg>
    ),
  }
  return map[name] ?? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DoctorCard({ doctor: d, slots, onBook }: { doctor: Doctor; slots: Slot[]; onBook: (s: Slot) => void }) {
  const [selSlot, setSelSlot] = useState<Slot | null>(null)
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const fmtDateShort = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

  return (
    <div className="doctor-card">
      <div className="doctor-card-top">
        <div className="doctor-avatar">
          {d.photo_url ? <img src={d.photo_url} alt="" /> : d.first_name[0] + d.last_name[0]}
        </div>
        <div className="doctor-info">
          <div className="doctor-name">{d.first_name} {d.last_name}</div>
          <div className="doctor-spec">{d.specialization}</div>
          <div className="doctor-rating">
            <svg viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            {Number(d.rating).toFixed(1)}
            <span>· {d.reviews_count} отзывов</span>
          </div>
          <div className="doctor-exp">Стаж {d.experience_years} лет</div>
        </div>
      </div>

      {d.symptoms.length > 0 && (
        <div className="doctor-symptoms">
          {d.symptoms.slice(0, 4).map(s => (
            <span key={s.id} className="symptom-tag">
              <span className="symptom-tag-icon"><SymptomIcon name={s.name} /></span>
              {s.name}
            </span>
          ))}
          {d.symptoms.length > 4 && <span className="symptom-tag">+{d.symptoms.length - 4}</span>}
        </div>
      )}

      <div className="doctor-slots">
        <div className="slots-label">Ближайшие слоты</div>
        {slots.length === 0 ? (
          <div className="slots-empty">Нет доступных слотов</div>
        ) : (
          <div className="slots-row">
            {slots.map(s => (
              <button key={s.id} className={`slot-btn ${selSlot?.id === s.id ? 'selected' : ''}`}
                onClick={() => setSelSlot(prev => prev?.id === s.id ? null : s)}>
                {fmtDateShort(s.starts_at)} {fmtTime(s.starts_at)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="doctor-card-footer">
        <div className="doctor-price">
          {d.price.toLocaleString('ru-RU')} ₽<span> / приём</span>
        </div>
        <button
          className={`btn btn-sm ${selSlot ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => selSlot && onBook(selSlot)}
          disabled={!selSlot}
        >
          {selSlot ? 'Записаться' : 'Выберите слот'}
        </button>
      </div>
    </div>
  )
}

export function Home({ setPage }: Props) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [docSlots, setDocSlots] = useState<Record<number, Slot[]>>({})
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noSymptomHint, setNoSymptomHint] = useState(false)
  const [searchMsg, setSearchMsg] = useState<'ok' | 'no_results' | 'no_mapping'>('ok')
  const [booking, setBooking] = useState<{ doctor: Doctor; slot: Slot } | null>(null)

  useEffect(() => { symptomsApi.getAll().then(setSymptoms) }, [])

  const toggle = (id: number) => {
    setNoSymptomHint(false)
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const search = async () => {
    if (selected.length === 0) { setNoSymptomHint(true); return }
    setLoading(true)
    setSearched(true)
    setNoSymptomHint(false)
    try {
      const { doctors: docs, message } = await doctorsApi.getAll({ symptoms: selected.join(',') })
      setSearchMsg(message)
      const limited = docs.slice(0, 4)
      setDoctors(limited)
      const slotResults = await Promise.all(limited.map(d => doctorsApi.getSlots(d.id).then(s => [d.id, s] as [number, Slot[]])))
      setDocSlots(Object.fromEntries(slotResults))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="watermark">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="hero-badge">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Лицензированная клиника · Грозный
        </div>
        <h1 className="hero-title">
          Найдите нужного врача<br />
          по вашим <em>симптомам</em>
        </h1>
        <p className="hero-sub">
          Выберите симптомы — мы подберём специалиста и покажем ближайшие свободные слоты
        </p>

        <div className="symptom-card">
          <div className="symptom-title">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20, color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Выберите симптомы
          </div>
          <div className="symptom-grid">
            {symptoms.map(s => (
              <button key={s.id} className={`symptom-chip ${selected.includes(s.id) ? 'selected' : ''}`} onClick={() => toggle(s.id)}>
                <span className="chip-icon"><SymptomIcon name={s.name} /></span>
                {s.name}
              </button>
            ))}
          </div>
          {noSymptomHint && (
            <div className="symptom-hint">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Выберите хотя бы один симптом для поиска врача
            </div>
          )}
          <div className="symptom-actions">
            <span className="selected-count">
              {selected.length > 0 ? <><b>{selected.length}</b> симптом(а) выбрано</> : 'Выберите симптомы выше'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {selected.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={() => { setSelected([]); setSearched(false) }}>Сбросить</button>
              )}
              <button className="btn btn-primary" onClick={search} disabled={loading}>
                {loading ? 'Поиск...' : (
                  <>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Найти врача
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {searched && (
          <section className="section">
            <div className="section-head">
              <div>
                <h2>Подходящие специалисты</h2>
                <p>Найдено {doctors.length} специалист(а) по выбранным симптомам</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setPage('doctors')}>Все врачи →</button>
            </div>

            {loading ? (
              <div className="loading"><div className="spinner" />Подбираем врачей...</div>
            ) : doctors.length === 0 ? (
              <div className="empty">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4>К сожалению, специалистов по данному запросу сейчас нет</h4>
                <p>{searchMsg === 'no_mapping' ? 'По выбранным симптомам нет подходящей специализации' : 'Попробуйте выбрать другие симптомы'}</p>
              </div>
            ) : (
              <div className="doctor-grid">
                {doctors.map(d => (
                  <DoctorCard key={d.id} doctor={d} slots={(docSlots[d.id] || []).slice(0, 3)}
                    onBook={(slot) => setBooking({ doctor: d, slot })} />
                ))}
              </div>
            )}
          </section>
        )}

        {!searched && (
          <>
            <section className="section">
              <div className="section-head">
                <div><h2>Почему выбирают нас</h2></div>
              </div>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon fi-blue">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3>Проверенные специалисты</h3>
                  <p>Все врачи имеют лицензии и подтверждённый опыт работы от 9 до 22 лет</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-mint">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3>Онлайн-запись 24/7</h3>
                  <p>Выбирайте удобное время и записывайтесь без звонков — мгновенное подтверждение</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon fi-yellow">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3>Высокий рейтинг</h3>
                  <p>Средняя оценка врачей 4.8 из 5 на основе реальных отзывов пациентов</p>
                </div>
              </div>
            </section>

            <section className="section" style={{ paddingTop: 0 }}>
              <div className="cta-banner">
                <div className="cta-content">
                  <h2>Готовы к первому визиту?</h2>
                  <p>Запись занимает 2 минуты. Без звонков и очередей.</p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  <button className="btn btn-primary btn-lg" onClick={() => setPage('doctors')}>
                    Записаться к врачу
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={() => setPage('contacts')} style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
                    Связаться с нами
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {booking && (
        <BookingModal
          doctor={booking.doctor}
          slot={booking.slot}
          onClose={() => setBooking(null)}
          onBooked={() => setBooking(null)}
        />
      )}
    </>
  )
}
