import { useEffect, useState } from 'react'
import { usersApi } from '../api'
import type { User } from '../types'

const ROLES = ['admin', 'manager', 'sales']
const ROLE_LABELS: Record<string, string> = { admin: 'Администратор', manager: 'Менеджер', sales: 'Продажи' }
const ROLE_CLS: Record<string, string> = { admin: 'badge-indigo', manager: 'badge-blue', sales: 'badge-green' }

const empty = { name: '', email: '', role: 'manager' }

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    usersApi.getAll().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email, role: u.role }); setModal(true) }

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    try {
      if (editing) await usersApi.update(editing.id, form)
      else await usersApi.create(form)
      setModal(false)
      load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить сотрудника?')) return
    await usersApi.remove(id)
    load()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Сотрудники</h2>
          <p>{users.length} пользователей в системе</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Добавить сотрудника
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" />Загрузка...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p>Сотрудников нет</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Добавлен</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{u.name[0]}</div>
                        <div className="td-name">{u.name}</div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_CLS[u.role] || 'badge-gray'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="td-muted">
                      {new Date(u.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn-icon" onClick={() => openEdit(u)}>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="btn-icon danger" onClick={() => remove(u.id)}>
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
              <h3>{editing ? 'Редактировать сотрудника' : 'Новый сотрудник'}</h3>
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
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" placeholder="ivan@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Роль</label>
                <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.name.trim() || !form.email.trim()}>
                {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
