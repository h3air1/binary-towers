import { useEffect, useState } from 'react'
import { doctorsApi, symptomsApi } from '../api'
import type { Doctor, Slot, Symptom } from '../types'
import { BookingModal } from '../components/BookingModal'

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
const fmtDateShort = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

function DoctorCard({ doctor: d, slots, onBook }: { doctor: Doctor; slots: Slot[]; onBook: (s: Slot) => void }) {
  const [selSlot, setSelSlot] = useState<Slot | null>(null)
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
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'var(--yellow)' }}>
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {Number(d.rating).toFixed(1)}
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {d.reviews_count} отзывов</span>
          </div>
          <div className="doctor-exp">Стаж {d.experience_years} лет</div>
        </div>
      </div>
      {d.bio && (
        <div style={{ padding: '0 24px 14px', fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
          {d.bio.length > 110 ? d.bio.slice(0, 110) + '…' : d.bio}
        </div>
      )}
      {d.symptoms.length > 0 && (
        <div className="doctor-symptoms">
          {d.symptoms.slice(0, 4).map(s => (
            <span key={s.id} className="symptom-tag">{s.icon} {s.name}</span>
          ))}
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

export function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [docSlots, setDocSlots] = useState<Record<number, Slot[]>>({})
  const [search, setSearch] = useState('')
  const [filterSymptom, setFilterSymptom] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<{ doctor: Doctor; slot: Slot } | null>(null)

  const load = async () => {
    setLoading(true)
    const params = filterSymptom ? { symptoms: filterSymptom } : {}
    const { doctors: docs } = await doctorsApi.getAll(params)
    setDoctors(docs)
    const slotResults = await Promise.all(docs.map(d => doctorsApi.getSlots(d.id).then(s => [d.id, s] as [number, Slot[]])))
    setDocSlots(Object.fromEntries(slotResults))
    setLoading(false)
  }

  useEffect(() => { symptomsApi.getAll().then(setSymptoms) }, [])
  useEffect(() => { load() }, [filterSymptom])

  const visible = doctors.filter(d =>
    !search || `${d.first_name} ${d.last_name} ${d.specialization}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container">
      <div className="page">
        <div className="section-head" style={{ marginBottom: 24 }}>
          <div>
            <h2>Врачи клиники</h2>
            <p>Найдено {visible.length} специалист(а)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', flex: 1, minWidth: 200 }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: 'var(--muted)', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14, color: 'var(--ink)', background: 'transparent' }}
              placeholder="Поиск по имени или специализации..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            style={{ padding: '10px 14px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--ink)', background: 'var(--surface)', outline: 'none', cursor: 'pointer' }}
            value={filterSymptom} onChange={e => setFilterSymptom(e.target.value)}
          >
            <option value="">Все симптомы</option>
            {symptoms.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" />Загрузка врачей...</div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h4>К сожалению, специалистов по данному запросу сейчас нет</h4>
            <p>Попробуйте выбрать другой симптом или сбросить фильтр</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {visible.map(d => (
              <DoctorCard key={d.id} doctor={d} slots={(docSlots[d.id] || []).slice(0, 3)}
                onBook={(slot) => setBooking({ doctor: d, slot })} />
            ))}
          </div>
        )}
      </div>

      {booking && (
        <BookingModal
          doctor={booking.doctor} slot={booking.slot}
          onClose={() => setBooking(null)}
          onBooked={() => { setBooking(null); load() }}
        />
      )}
    </div>
  )
}
