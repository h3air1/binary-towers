export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: 'patient' | 'admin'
}

export interface Symptom {
  id: number
  name: string
  icon: string
}

export interface Slot {
  id: number
  doctor_id: number
  starts_at: string
  ends_at: string
  is_booked: boolean
}

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  bio?: string
  photo_url?: string
  experience_years: number
  price: number
  rating: number
  reviews_count: number
  email?: string
  phone?: string
  symptoms: Symptom[]
  slots?: Slot[]
}

export interface Appointment {
  id: number
  doctor_id: number
  doctor_name: string
  specialization: string
  photo_url?: string
  slot_id: number
  starts_at: string
  ends_at: string
  status: 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
}
