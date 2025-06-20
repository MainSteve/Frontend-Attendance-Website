export interface Holiday {
  id: number
  name: string
  date: string // ISO date string
  description?: string | null
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface HolidayResponse {
  status: boolean
  message: string
  data: {
    current_page: number
    data: Holiday[]
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
}

export interface SingleHolidayResponse {
  status: boolean
  message: string
  data: {
    holiday: Holiday
    affected_working_hours: any[] | null // Type depends on WorkingHours structure
  }
}

export interface HolidayErrorResponse {
  status: false
  message: string
  errors?: Record<string, string[]>
}

// Request types
export interface CreateHolidayRequest {
  name: string
  date: string // ISO date string
  description?: string
  is_recurring?: boolean
}

export interface UpdateHolidayRequest {
  name?: string
  date?: string // ISO date string
  description?: string
  is_recurring?: boolean
}

// Filter types
export interface HolidayFilters {
  year?: number
  start_date?: string
  end_date?: string
  is_recurring?: boolean
  per_page?: number
  page?: number
}

// Form data types
export interface HolidayFormData {
  name: string
  date: string
  description: string
  is_recurring: boolean
}

export interface HolidayStats {
  total: number
  thisMonth: number
  recurring: number
  upcoming: number
}
