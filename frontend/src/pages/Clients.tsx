import { useEffect, useState } from 'react'
import { clientsApi, usersApi } from '../api'
import type { Client, User } from '../types'

const STATUS_OPTIONS = ['lead', 'active', 'inactive']
const STATUS_LABELS: Record<string, string> = { lead: 'Лид', active: 'Активный', inactive: 'Неактивный' }
const STATUS_CLS: Record<string, string> = { lead: 'badge-blue', active: 'badge-green', inactive: 'badge-gray' }

const empty = { name: '', email: '', phone: '', company: '', status: 'lead', assigned_to: '', notes: '' }

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([clientsApi.getAll(), usersApi.getAll()])
      .then(([c, u]) => { setClients(c); setUsers(u) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status, assigned_to: String(c.assigned_to || ''), notes: c.notes || '' })
    setModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = { ...form, assigned_to: form.assigned_to ? Number(form.assigned_to) : null }
    try {
      if (editing) await clientsApi.update(editing.id, payload)
      else await clientsApi.create(payload)
      setModal(false)
      load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить клиента?')) return
    await clientsApi.remove(id)
    load()
  }

  const visible = clients.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q)
      || (c.company || '').toLowerCase().includes(q)
      || (c.email || '').toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Клиенты</h2>
          <p>{clients.length} клиентов в базе</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Добавить клиента
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-input">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input placeholder="Поиск по имени, компании, email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-tabs">
            {['all', ...STATUS_OPTIONS].map(s => (
              <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s === 'all' ? 'Все' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" />Загрузка...</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p>Клиенты не найдены</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Компания</th>
                  <th>Телефон</th>
                  <th>Статус</th>
                  <th>Менеджер</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{c.name[0]}</div>
                        <div>
                          <div className="td-name">{c.name}</div>
                          <div className="td-muted">{c.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.company || '—'}</td>
                    <td>{c.phone || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_CLS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </td>
                    <td>{c.assigned_name || '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-icon" title="Редактировать" onClick={() => openEdit(c)}>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="btn-icon danger" title="Удалить" onClick={() => remove(c.id)}>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Редактировать клиента' : 'Новый клиент'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Имя *</label>
                <input className="form-control" placeholder="Иван Петров" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" placeholder="ivan@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон</label>
                  <input className="form-control" placeholder="+7 999 000 00 00" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Компания</label>
                  <input className="form-control" placeholder="ООО Пример" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Статус</label>
                  <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Менеджер</label>
                <select className="form-control" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                  <option value="">Не назначен</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Заметки</label>
                <textarea className="form-control" placeholder="Дополнительная информация..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.name.trim()}>
                {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
