import { useEffect, useState } from 'react'
import { clientsApi, dealsApi, usersApi } from '../api'
import type { Client, Deal, User } from '../types'

const STAGES = ['new', 'negotiation', 'won', 'lost'] as const
type Stage = typeof STAGES[number]

const STAGE_LABELS: Record<Stage, string> = { new: 'Новые', negotiation: 'Переговоры', won: 'Выиграно', lost: 'Потеряно' }
const STAGE_DOT: Record<Stage, string> = { new: 'dot-gray', negotiation: 'dot-yellow', won: 'dot-green', lost: 'dot-red' }
const STAGE_BADGE: Record<Stage, string> = { new: 'badge-gray', negotiation: 'badge-yellow', won: 'badge-green', lost: 'badge-red' }

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'М ₸'
    : n >= 1000 ? (n / 1000).toFixed(0) + 'K ₸'
    : n + ' ₸'

const empty = { title: '', client_id: '', amount: '', stage: 'new', assigned_to: '', notes: '' }

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([dealsApi.getAll(), clientsApi.getAll(), usersApi.getAll()])
      .then(([d, c, u]) => { setDeals(d); setClients(c); setUsers(u) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = (stage: Stage = 'new') => {
    setEditing(null)
    setForm({ ...empty, stage })
    setModal(true)
  }

  const openEdit = (d: Deal) => {
    setEditing(d)
    setForm({ title: d.title, client_id: String(d.client_id || ''), amount: String(d.amount), stage: d.stage, assigned_to: String(d.assigned_to || ''), notes: d.notes || '' })
    setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = { ...form, client_id: form.client_id ? Number(form.client_id) : null, amount: Number(form.amount) || 0, assigned_to: form.assigned_to ? Number(form.assigned_to) : null }
    try {
      if (editing) await dealsApi.update(editing.id, payload)
      else await dealsApi.create(payload)
      setModal(false)
      load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить сделку?')) return
    await dealsApi.remove(id)
    load()
  }

  const byStage = (stage: Stage) => deals.filter(d => d.stage === stage)
  const stageTotal = (stage: Stage) => byStage(stage).reduce((a, d) => a + parseFloat(String(d.amount)), 0)

  if (loading) return <div className="loading"><div className="spinner" />Загрузка...</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Сделки</h2>
          <p>{deals.length} сделок в работе</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdd()}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Добавить сделку
        </button>
      </div>

      <div className="kanban">
        {STAGES.map(stage => (
          <div key={stage} className="kanban-col">
            <div className="kanban-col-header">
              <div className="kanban-col-title">
                <span className={`kanban-dot ${STAGE_DOT[stage]}`} />
                {STAGE_LABELS[stage]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="kanban-count">{byStage(stage).length}</span>
                <button className="btn-icon" title="Добавить" onClick={() => openAdd(stage)} style={{ padding: '3px' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            {byStage(stage).length > 0 && (
              <div style={{ padding: '6px 10px 0', fontSize: 11.5, color: 'var(--text-sm)', fontWeight: 600 }}>
                {fmt(stageTotal(stage))}
              </div>
            )}
            <div className="kanban-cards">
              {byStage(stage).map(d => (
                <div key={d.id} className="kanban-card">
                  <div className="kanban-card-title">{d.title}</div>
                  <div className="kanban-card-meta">
                    {d.client_name && <span>👤 {d.client_name}</span>}
                    {d.assigned_name && <span>🧑‍💼 {d.assigned_name}</span>}
                  </div>
                  <div className="kanban-card-footer">
                    <div className="kanban-card-amount">{fmt(parseFloat(String(d.amount)))}</div>
                    <div className="kanban-card-actions">
                      <button className="btn-icon" onClick={() => openEdit(d)}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="btn-icon danger" onClick={() => remove(d.id)}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {byStage(stage).length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: 'var(--text-sm)' }}>
                  Нет сделок
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Редактировать сделку' : 'Новая сделка'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Название *</label>
                <input className="form-control" placeholder="Контракт на поставку..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Клиент</label>
                  <select className="form-control" value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                    <option value="">Без клиента</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Сумма (₸)</label>
                  <input className="form-control" type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Стадия</label>
                  <select className="form-control" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Менеджер</label>
                  <select className="form-control" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">Не назначен</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Заметки</label>
                <textarea className="form-control" placeholder="Детали сделки..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
