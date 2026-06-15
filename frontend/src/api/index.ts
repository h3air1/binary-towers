import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

export const clientsApi = {
  getAll: (params?: object) => http.get('/clients', { params }).then(r => r.data),
  create: (data: object) => http.post('/clients', data).then(r => r.data),
  update: (id: number, data: object) => http.put(`/clients/${id}`, data).then(r => r.data),
  remove: (id: number) => http.delete(`/clients/${id}`).then(r => r.data),
}

export const dealsApi = {
  getAll: (params?: object) => http.get('/deals', { params }).then(r => r.data),
  getStats: () => http.get('/deals/stats').then(r => r.data),
  create: (data: object) => http.post('/deals', data).then(r => r.data),
  update: (id: number, data: object) => http.put(`/deals/${id}`, data).then(r => r.data),
  remove: (id: number) => http.delete(`/deals/${id}`).then(r => r.data),
}

export const tasksApi = {
  getAll: (params?: object) => http.get('/tasks', { params }).then(r => r.data),
  create: (data: object) => http.post('/tasks', data).then(r => r.data),
  update: (id: number, data: object) => http.put(`/tasks/${id}`, data).then(r => r.data),
  complete: (id: number) => http.patch(`/tasks/${id}/complete`).then(r => r.data),
  remove: (id: number) => http.delete(`/tasks/${id}`).then(r => r.data),
}

export const usersApi = {
  getAll: () => http.get('/users').then(r => r.data),
  create: (data: object) => http.post('/users', data).then(r => r.data),
  update: (id: number, data: object) => http.put(`/users/${id}`, data).then(r => r.data),
  remove: (id: number) => http.delete(`/users/${id}`).then(r => r.data),
}
