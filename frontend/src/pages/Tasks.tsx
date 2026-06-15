import { useEffect, useState } from 'react'
import { clientsApi, dealsApi, tasksApi, usersApi } from '../api'
import type { Client, Deal, Task, User } from '../types'

const empty = { title: '', description: '', client_id: '', deal_id: '', assigned_to: '', due_date: '' }

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const isOverdue = (iso: string | null | undefined) =>
  iso ? new Date(iso) < new Date() : false

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([tasksApi.getAll(), clientsApi.getAll(), dealsApi.getAll(), usersApi.getAll()])
      .then(([t, c, d, u]) => { setTasks(t); setClients(c); setDeals(d); setUsers(u) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (t: Task) => {
    setEditing(t)
    setForm({
      title: t.title,
      description: t.description || '',
      client_id: String(t.client_id || ''),
      deal_id: String(t.deal_id || ''),
      assigned_to: String(t.assigned_to || ''),
      due_date: t.due_date ? t.due_date.slice(0, 16) : '',
    })
    setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      client_id: form.client_id ? Number(form.client_id) : null,
      deal_id: form.deal_id ? Number(form.deal_id) : null,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      due_date: form.due_date || null,
    }
    try {
      if (editing) await tasksApi.update(editing.id, payload)
      else await tasksApi.create(payload)
      setModal(false)
      load()
    } finally { setSaving(false) }
  }

  const toggle = async (id: number) => {
    await tasksApi.complete(id)
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить задачу?')) return
    await tasksApi.remove(id)
    load()
  }

  const visible = tasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  )

  const counts = { all: tasks.length, active: tasks.filter(t => !t.completed).length, done: tasks.filter(t => t.completed).length }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Задачи</h2>
          <p>{counts.active} активных · {counts.done} выполнено</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Добавить задачу
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="filter-tabs">
            {(['all', 'active', 'done'] as const).map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? `Все (${counts.all})` : f === 'active' ? `Активные (${counts.active})` : `Выполненные (${counts.done})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" />Загрузка...</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <p>Задач нет</p>
          </div>
        ) : (
          <div className="task-list">
            {visible.map(t => (
              <div key={t.id} className={`task-item ${t.completed ? 'done' : ''}`}>
                <button className={`task-check ${t.completed ? 'checked' : ''}`} onClick={() => toggle(t.id)} />
                <div className="task-content">
                  <div className="task-title">{t.title}</div>
                  <div className="task-meta">
                    {t.client_name && (
                      <span className="task-meta-item">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t.client_name}
                      </span>
                    )}
                    {t.deal_title && (
                      <span className="task-meta-item">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                        </svg>
                        {t.deal_title}
                      </span>
                    )}
                    {t.assigned_name && (
                      <span className="task-meta-item">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.assigned_name}
                      </span>
                    )}
                    {t.due_date && (
                      <span className={`task-meta-item ${isOverdue(t.due_date) && !t.completed ? 'task-due-overdue' : ''}`}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {fmtDate(t.due_date)}
                        {isOverdue(t.due_date) && !t.completed && ' — просрочено'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn-icon" onClick={() => openEdit(t)}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="btn-icon danger" onClick={() => remove(t.id)}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Редактировать задачу' : 'Новая задача'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Задача *</label>
                <input className="form-control" placeholder="Позвонить клиенту..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
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
                  <label className="form-label">Сделка</label>
                  <select className="form-control" value={form.deal_id} onChange={e => setForm(f => ({ ...f, deal_id: e.target.value }))}>
                    <option value="">Без сделки</option>
                    {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Исполнитель</label>
                  <select className="form-control" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">Не назначен</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Дедлайн</label>
                  <input className="form-control" type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea className="form-control" placeholder="Подробности..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
