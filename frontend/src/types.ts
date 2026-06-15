export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

export interface Client {
  id: number
  name: string
  email?: string
  phone?: string
  company?: string
  status: 'lead' | 'active' | 'inactive'
  assigned_to?: number | null
  assigned_name?: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: number
  title: string
  client_id?: number | null
  client_name?: string
  amount: string | number
  stage: 'new' | 'negotiation' | 'won' | 'lost'
  assigned_to?: number | null
  assigned_name?: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description?: string | null
  client_id?: number | null
  client_name?: string
  deal_id?: number | null
  deal_title?: string
  assigned_to?: number | null
  assigned_name?: string
  due_date?: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface DealStats {
  stage: string
  count: string
  total_amount: string
}
