import { useEffect, useState } from 'react'
import { symptomsApi, doctorsApi } from '../api'
import type { Doctor, Slot, Symptom } from '../types'
import { BookingModal } from '../components/BookingModal'

type Page = 'home' | 'doctors' | 'cabinet'

interface Props { setPage: (p: Page) => void }

export function Home({ setPage }: Props) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [docSlots, setDocSlots] = useState<Record<number, Slot[]>>({})
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<{ doctor: Doctor; slot: Slot } | null>(null)

  useEffect(() => { symptomsApi.getAll().then(setSymptoms) }, [])

  const toggle = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const search = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = selected.length ? { symptoms: selected.join(',') } : {}
      const docs: Doctor[] = await doctorsApi.getAll(params)
      setDoctors(docs)
      const slotResults = await Promise.all(docs.map(d => doctorsApi.getSlots(d.id).then(s => [d.id, s] as [number, Slot[]])))
      setDocSlots(Object.fromEntries(slotResults))
    } finally {
      setLoading(false) }
  }

  return (
    <>
      {/* HERO */}
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
          Лицензированная клиника · Алматы
        </div>
        <h1 className="hero-title">
          Найдите нужного врача<br />
          по вашим <em>симптомам</em>
        </h1>
        <p className="hero-sub">
          Выберите симптомы — мы подберём специалиста и покажем ближайшие свободные слоты
        </p>

        {/* SYMPTOM SELECTOR */}
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
                <span>{s.icon}</span> {s.name}
              </button>
            ))}
          </div>
          <div className="symptom-actions">
            <span className="selected-count">
              {selected.length > 0 ? <><b>{selected.length}</b> симптом(а) выбрано</> : 'Или найдите всех врачей'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {selected.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={() => setSelected([])}>Сбросить</button>
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
        {/* SEARCH RESULTS */}
        {searched && (
          <section className="section">
            <div className="section-head">
              <div>
                <h2>{selected.length > 0 ? 'Подходящие специалисты' : 'Все врачи клиники'}</h2>
                <p>Найдено {doctors.length} специалист(а)</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setPage('doctors')}>Все врачи →</button>
            </div>

            {loading ? (
              <div className="loading"><div className="spinner" />Подбираем врачей...</div>
            ) : doctors.length === 0 ? (
              <div className="empty">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4>Врачи не найдены</h4>
                <p>Попробуйте выбрать другие симптомы</p>
              </div>
            ) : (
              <div className="doctor-grid">
                {doctors.map(d => {
                  const slots = (docSlots[d.id] || []).slice(0, 3)
                  return (
                    <DoctorCard key={d.id} doctor={d} slots={slots}
                      onBook={(slot) => setBooking({ doctor: d, slot })} />
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* FEATURES */}
        {!searched && (
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
            <span key={s.id} className="symptom-tag">{s.icon} {s.name}</span>
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
          {d.price.toLocaleString('ru-RU')} ₸
          <span> / приём</span>
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
