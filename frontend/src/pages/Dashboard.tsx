import { useEffect, useState } from 'react'
import { clientsApi, dealsApi, tasksApi } from '../api'
import type { Client, DealStats, Task } from '../types'

const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'М ₸'
    : n >= 1000 ? (n / 1000).toFixed(0) + 'K ₸'
    : n + ' ₸'

const STAGE_LABELS: Record<string, string> = {
  new: 'Новые',
  negotiation: 'Переговоры',
  won: 'Выиграно',
  lost: 'Потеряно',
}
const STAGE_COLORS: Record<string, string> = {
  new: '#9ca3af',
  negotiation: '#f59e0b',
  won: '#22c55e',
  lost: '#ef4444',
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<DealStats[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      clientsApi.getAll(),
      dealsApi.getStats(),
      tasksApi.getAll({ completed: 'false' }),
    ]).then(([c, s, t]) => {
      setClients(c)
      setStats(s)
      setTasks(t)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" />Загрузка...</div>

  const totalRevenue = stats
    .filter(s => s.stage === 'won')
    .reduce((a, s) => a + parseFloat(s.total_amount), 0)

  const totalDeals = stats.reduce((a, s) => a + parseInt(s.count), 0)
  const maxCount = Math.max(...stats.map(s => parseInt(s.count)), 1)

  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date())

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Дашборд</h2>
          <p>Обзор вашей CRM системы</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Всего клиентов</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalDeals}</div>
            <div className="stat-label">Активных сделок</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Задач в работе {overdueTasks.length > 0 && <span style={{color:'#dc2626'}}>({overdueTasks.length} просрочено)</span>}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{fmt(totalRevenue)}</div>
            <div className="stat-label">Выручка (выигранные)</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h3>Последние клиенты</h3>
          </div>
          <div className="table-wrap">
            {clients.length === 0 ? (
              <div className="empty-state"><p>Нет клиентов</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Компания</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.slice(0, 6).map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">{c.name[0]}</div>
                          <div>
                            <div className="td-name">{c.name}</div>
                            <div className="td-muted">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{c.company || '—'}</td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Воронка продаж</h3></div>
          <div className="card-body">
            {stats.length === 0 ? (
              <div className="empty-state"><p>Нет сделок</p></div>
            ) : (
              <div className="stage-bar">
                {['new', 'negotiation', 'won', 'lost'].map(stage => {
                  const s = stats.find(x => x.stage === stage)
                  const count = s ? parseInt(s.count) : 0
                  const amount = s ? parseFloat(s.total_amount) : 0
                  return (
                    <div key={stage} className="stage-row">
                      <div className="stage-name">{STAGE_LABELS[stage]}</div>
                      <div className="stage-track">
                        <div
                          className="stage-fill"
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            background: STAGE_COLORS[stage],
                          }}
                        />
                      </div>
                      <div className="stage-val">{count} шт · {fmt(amount)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    lead: ['badge badge-blue', 'Лид'],
    active: ['badge badge-green', 'Активный'],
    inactive: ['badge badge-gray', 'Неактивный'],
  }
  const [cls, label] = map[status] ?? ['badge badge-gray', status]
  return <span className={cls}>{label}</span>
}
