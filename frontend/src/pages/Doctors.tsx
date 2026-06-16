import { useEffect, useState } from 'react'
import { doctorsApi, symptomsApi } from '../api'
import type { Doctor, Symptom } from '../types'
import { SlotPickerModal } from '../components/SlotPickerModal'

function StarRow({ rating }: { rating: number }) {
  const r = Math.round(Number(rating))
  return (
    <span className="doctor-stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 20 20" fill={i <= r ? '#f59e0b' : '#e5e7eb'} width="13" height="13">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="doctor-rating-val">{Number(rating).toFixed(1)}</span>
      <span className="doctor-reviews">{/* populated from reviews_count */}</span>
    </span>
  )
}

function DoctorCard({ doctor: d, onBook }: { doctor: Doctor; onBook: () => void }) {
  return (
    <div className="doctor-card">
      <div className="doctor-card-top">
        <div className="doctor-avatar">
          {d.photo_url ? <img src={d.photo_url} alt="" /> : d.first_name[0] + d.last_name[0]}
        </div>
        <div className="doctor-info">
          <div className="doctor-name">{d.last_name} {d.first_name}</div>
          <div className="doctor-spec">{d.specialization}</div>
          <StarRow rating={d.rating} />
          <div className="doctor-exp">{d.experience_years} лет опыта · {d.reviews_count} отзывов</div>
        </div>
      </div>

      {d.bio && (
        <div className="doctor-bio">
          {d.bio.length > 120 ? d.bio.slice(0, 120) + '…' : d.bio}
        </div>
      )}

      {d.symptoms.length > 0 && (
        <div className="doctor-symptoms">
          {d.symptoms.slice(0, 4).map(s => (
            <span key={s.id} className="symptom-tag">{s.icon} {s.name}</span>
          ))}
        </div>
      )}

      <div className="doctor-card-footer">
        <div className="doctor-price">
          {d.price.toLocaleString('ru-RU')} ₽<span> / приём</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onBook}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Записаться
        </button>
      </div>
    </div>
  )
}

export function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [search, setSearch] = useState('')
  const [filterSymptom, setFilterSymptom] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null)

  const load = async () => {
    setLoading(true)
    const params = filterSymptom ? { symptoms: filterSymptom } : {}
    const { doctors: docs } = await doctorsApi.getAll(params)
    setDoctors(docs)
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
            <input
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14, color: 'var(--ink)', background: 'transparent' }}
              placeholder="Поиск по имени или специализации..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            style={{ padding: '10px 14px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--ink)', background: 'var(--surface)', outline: 'none', cursor: 'pointer' }}
            value={filterSymptom}
            onChange={e => setFilterSymptom(e.target.value)}
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
            <h4>Специалистов по данному запросу не найдено</h4>
            <p>Попробуйте другой симптом или сбросьте фильтр</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {visible.map(d => (
              <DoctorCard key={d.id} doctor={d} onBook={() => setBookingDoctor(d)} />
            ))}
          </div>
        )}
      </div>

      {bookingDoctor && (
        <SlotPickerModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onBooked={() => { setBookingDoctor(null); load() }}
        />
      )}
    </div>
  )
}
