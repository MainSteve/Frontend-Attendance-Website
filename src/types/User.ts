import { Department } from './Department';
export interface UserType {
  id: number
  email: string
  name: string
  email_verified_at?: Date
  created_at: Date
  updated_at: Date
  role: 'admin' | 'employee'
  position: string
  department_id: number
  has_photo_profile: boolean
  photo_profile_url?: string | null
  department?: Department | null;
}
