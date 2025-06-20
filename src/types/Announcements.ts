// src/types/Announcements.ts

export interface AnnouncementDepartment {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface AnnouncementCreatorDepartment {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface AnnouncementCreator {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  role: 'admin' | 'employee'
  position: string | null
  department_id: number | null
  department: AnnouncementCreatorDepartment | null
}

export interface Announcement {
  id: number
  title: string
  content: string
  importance_level: number
  importance_level_text: string
  created_by: number
  expires_at: string
  expires_at_human: string
  days_remaining: number
  is_active: boolean
  is_valid: boolean
  created_at: string
  updated_at: string
  departments: AnnouncementDepartment[]
  creator: AnnouncementCreator
}

// Paginated response for admin list
export interface AnnouncementsPaginatedResponse {
  data: Announcement[]
  current_page: number
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

// Simple response for my-department endpoint
export interface AnnouncementsResponse {
  data: Announcement[]
}

// Single announcement response
export interface SingleAnnouncementResponse {
  data: Announcement
}

export interface AnnouncementSummary {
  total: number
  active: number
  expired: number
  critical: number
  byImportance: {
    low: number
    medium: number
    high: number
  }
}

export type ImportanceLevel = 1 | 2 | 3

export interface ImportanceLevelConfig {
  label: string
  color: string
  bgColor: string
  textColor: string
  icon: string
}

// Request types for API calls
export interface CreateAnnouncementRequest {
  title: string
  content: string
  importance_level: ImportanceLevel
  department_ids: number[]
  is_active?: boolean
}

export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
  importance_level?: ImportanceLevel
  department_ids?: number[]
  is_active?: boolean
}

// Filter types for admin list
export interface AnnouncementFilters {
  show_all?: boolean
  department_ids?: number[]
  importance_level?: ImportanceLevel
  per_page?: number
  page?: number
}

// Form data types
export interface AnnouncementFormData {
  title: string
  content: string
  importance_level: ImportanceLevel
  department_ids: number[]
  is_active: boolean
}

// Statistics response
export interface AnnouncementStatistics {
  total_announcements: number
  active_announcements: number
  expired_announcements: number
  by_importance: {
    low: number
    medium: number
    high: number
  }
  by_department: Array<{
    department: string
    total: number
  }>
}

// Error response
export interface AnnouncementErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
