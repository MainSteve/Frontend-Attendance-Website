import { Department } from './Department'

export interface UserType {
  id: number
  email: string
  name: string
  email_verified_at?: Date | string | null
  created_at?: Date | string
  updated_at?: Date | string
  role: 'admin' | 'employee'
  position: string
  department_id: number
  has_photo_profile?: boolean
  photo_profile_url?: string | null
  photo_profile_expires_at?: string | null
  department?: Department | null
}

export interface EmployeeFormData {
  name: string
  email: string
  password?: string
  role: 'admin' | 'employee'
  position: string
  department_id: string
  photo_profile?: File | null
}
