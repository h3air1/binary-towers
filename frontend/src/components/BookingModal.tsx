import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentsApi } from '../api'
import type { Doctor, Slot } from '../types'
import { AuthModal } from './AuthModal'

interface Props {
  doctor: Doctor
  slot: Slot
  onClose: () => void
  onBooked: () => void
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

export function BookingModal({ doctor, slot, onClose, onBooked }: Props) {
  const { user } = useAuth()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAuth, setShowAuth] = useState(!user)

  const book = async () => {
    setLoading(true)
    try {
      await appointmentsApi.create({ doctor_id: doctor.id, slot_id: slot.id, notes })
      setSuccess(true)
      setTimeout(() => { onBooked(); onClose() }, 2500)
    } catch {
      alert('Ошибка при записи. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  if (showAuth) return <AuthModal onClose={onClose} onSuccess={() => setShowAuth(false)} />

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Запись на приём</h3>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="success-state">
              <div className="success-check">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3>Вы записаны!</h3>
              <p>Мы отправим напоминание за день до приёма</p>
              <div className="success-detail">
                <div className="success-detail-row">
                  <span>Врач</span>
                  <b>{doctor.first_name} {doctor.last_name}</b>
                </div>
                <div className="success-detail-row">
                  <span>Дата</span>
                  <b>{fmtDate(slot.starts_at)}</b>
                </div>
                <div className="success-detail-row">
                  <span>Время</span>
                  <b>{fmtTime(slot.starts_at)} — {fmtTime(slot.ends_at)}</b>
                </div>
                <div className="success-detail-row">
                  <span>Стоимость</span>
                  <b>{doctor.price.toLocaleString('ru-RU')} ₽</b>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="success-detail" style={{ marginBottom: 20 }}>
                <div className="success-detail-row">
                  <span>Врач</span>
                  <b>{doctor.first_name} {doctor.last_name}</b>
                </div>
                <div className="success-detail-row">
                  <span>Специализация</span>
                  <b>{doctor.specialization}</b>
                </div>
                <div className="success-detail-row">
                  <span>Дата</span>
                  <b>{fmtDate(slot.starts_at)}</b>
                </div>
                <div className="success-detail-row">
                  <span>Время</span>
                  <b>{fmtTime(slot.starts_at)} — {fmtTime(slot.ends_at)}</b>
                </div>
                <div className="success-detail-row">
                  <span>Стоимость</span>
                  <b>{doctor.price.toLocaleString('ru-RU')} ₽</b>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Опишите жалобы (необязательно)</label>
                <textarea className="form-control" rows={3} placeholder="Опишите симптомы или цель визита..."
                  value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 80 }} />
              </div>
            </>
          )}
        </div>
        {!success && (
          <div className="modal-footer">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Отмена</button>
            <button className="btn btn-primary" onClick={book} disabled={loading}>
              {loading ? 'Запись...' : 'Подтвердить запись'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
