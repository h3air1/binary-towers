import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { doctorsApi, appointmentsApi } from '../api'
import type { Doctor, Slot } from '../types'
import { AuthModal } from './AuthModal'

interface Props {
  doctor: Doctor
  onClose: () => void
  onBooked: () => void
}

const MSK = 'Europe/Moscow'

// YYYY-MM-DD in Moscow timezone — used as grouping key for date tabs
const dateKey = (iso: string) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: MSK }).format(new Date(iso))

// "Вт, 17 июня" — always in Moscow local time
const fmtDateTab = (iso: string) => {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short', day: 'numeric', month: 'long', timeZone: MSK,
  }).formatToParts(d)
  const wd  = parts.find(p => p.type === 'weekday')?.value ?? ''
  const day = parts.find(p => p.type === 'day')?.value ?? ''
  const mon = parts.find(p => p.type === 'month')?.value ?? ''
  return `${wd.charAt(0).toUpperCase() + wd.slice(1)}, ${day} ${mon}`
}

// "12:00" — always in Moscow local time
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: MSK,
  })

export function SlotPickerModal({ doctor, onClose, onBooked }: Props) {
  const { user } = useAuth()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [selected, setSelected] = useState<Slot | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    doctorsApi.getSlots(doctor.id)
      .then((data: Slot[]) => {
        const sorted = [...data].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
        setSlots(sorted)
        if (sorted.length > 0) setActiveDate(dateKey(sorted[0].starts_at))
      })
      .finally(() => setLoading(false))
  }, [doctor.id])

  const byDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const k = dateKey(s.starts_at)
    ;(acc[k] ??= []).push(s)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort().slice(0, 7)
  const slotsForDay = activeDate ? (byDate[activeDate] ?? []) : []

  const handleConfirm = async () => {
    if (!selected) return          // double-guard: no slot = no booking
    if (!user) { setShowAuth(true); return }
    setSubmitting(true)
    try {
      await appointmentsApi.create({ doctor_id: doctor.id, slot_id: selected.id, notes })
      setSuccess(true)
      setTimeout(() => { onBooked(); onClose() }, 2500)
    } catch {
      alert('Ошибка при записи. Попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
  }

  if (showAuth) return <AuthModal onClose={onClose} onSuccess={() => setShowAuth(false)} />

  const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal sp-modal">

        {/* Header */}
        <div className="sp-header">
          <div className="sp-doc-row">
            <div className="sp-doc-avatar">
              {doctor.photo_url ? <img src={doctor.photo_url} alt="" /> : initials}
            </div>
            <div>
              <div className="sp-doc-name">{doctor.last_name} {doctor.first_name}</div>
              <div className="sp-doc-meta">
                {doctor.specialization}
                <span className="sp-sep">·</span>
                {doctor.price.toLocaleString('ru-RU')} ₽ / приём
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sp-body">
          {success ? (
            <div className="success-state">
              <div className="success-check">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3>Вы записаны!</h3>
              <p>Подтверждение придёт на почту. Мы напомним о визите накануне.</p>
              <div className="success-detail" style={{ marginTop: 20 }}>
                <div className="success-detail-row">
                  <span>Врач</span>
                  <b>{doctor.last_name} {doctor.first_name}</b>
                </div>
                <div className="success-detail-row">
                  <span>Дата</span>
                  <b>{selected && fmtDateTab(selected.starts_at)}</b>
                </div>
                <div className="success-detail-row">
                  <span>Время</span>
                  <b>{selected && `${fmtTime(selected.starts_at)} – ${fmtTime(selected.ends_at)}`}</b>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="loading"><div className="spinner" />Загрузка слотов...</div>
          ) : dates.length === 0 ? (
            <div className="empty" style={{ padding: '40px 0' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4>Нет доступных слотов</h4>
              <p>Попробуйте выбрать другого врача</p>
            </div>
          ) : (
            <>
              <div className="sp-section-label">Выберите дату</div>
              <div className="sp-dates">
                {dates.map(dk => (
                  <button
                    key={dk}
                    className={`sp-date-btn${activeDate === dk ? ' active' : ''}`}
                    onClick={() => { setActiveDate(dk); setSelected(null) }}
                  >
                    {fmtDateTab(byDate[dk][0].starts_at)}
                    <span className="sp-date-count">{byDate[dk].length}</span>
                  </button>
                ))}
              </div>

              <div className="sp-section-label" style={{ marginTop: 20 }}>Выберите время</div>
              <div className="sp-time-grid">
                {slotsForDay.map(s => (
                  <button
                    key={s.id}
                    className={`sp-time-btn${selected?.id === s.id ? ' active' : ''}`}
                    onClick={() => setSelected(prev => prev?.id === s.id ? null : s)}
                  >
                    {fmtTime(s.starts_at)}
                  </button>
                ))}
              </div>

              {selected && (
                <div className="sp-confirm">
                  <div className="sp-selected-info">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="15" height="15">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fmtDateTab(selected.starts_at)}, {fmtTime(selected.starts_at)} – {fmtTime(selected.ends_at)}
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label className="form-label">Комментарий к записи <span className="form-optional">необязательно</span></label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Опишите симптомы или цель визита..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      style={{ minHeight: 64, resize: 'none' }}
                    />
                  </div>

                  <div className="sp-actions">
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>Отмена</button>
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting || !selected}>
                      {submitting ? 'Оформляем...' : 'Подтвердить запись'}
                      {!submitting && (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
