import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('clinic_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const authApi = {
  register: (data: object) => http.post('/auth/register', data).then(r => r.data),
  login: (data: object) => http.post('/auth/login', data).then(r => r.data),
  me: () => http.get('/auth/me').then(r => r.data),
}

export const doctorsApi = {
  getAll: (params?: object) => http.get('/doctors', { params }).then(r => r.data),
  getSlots: (id: number) => http.get(`/doctors/${id}/slots`).then(r => r.data),
}

export const symptomsApi = {
  getAll: () => http.get('/symptoms').then(r => r.data),
}

export const appointmentsApi = {
  create: (data: object) => http.post('/appointments', data).then(r => r.data),
  getMy: () => http.get('/appointments/my').then(r => r.data),
}
