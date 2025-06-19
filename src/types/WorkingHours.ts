export interface WorkingHourUser {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  created_at: string
  updated_at: string
}

export interface UsersResponse {
  status: boolean
  message: string
  data: User[]
}

export interface WorkingHourSchedule {
  id: number
  start_time: string
  end_time: string
  duration_minutes: number
}

export interface WorkingHoursSchedule {
  monday: WorkingHourSchedule | null
  tuesday: WorkingHourSchedule | null
  wednesday: WorkingHourSchedule | null
  thursday: WorkingHourSchedule | null
  friday: WorkingHourSchedule | null
  saturday: WorkingHourSchedule | null
  sunday: WorkingHourSchedule | null
}

export interface WorkingHoursData {
  user: WorkingHourUser
  schedule: WorkingHoursSchedule
}

export interface WorkingHoursResponse {
  status: boolean
  message: string
  data: WorkingHoursData
}

// Working Hours List for admin
export interface WorkingHour {
  id: number
  user_id: number
  day_of_week: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
  user: WorkingHourUser
}

export interface WorkingHoursPaginationLinks {
  url: string | null
  label: string
  active: boolean
}

export interface WorkingHoursListData {
  current_page: number
  data: WorkingHour[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: WorkingHoursPaginationLinks[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface WorkingHoursListResponse {
  status: boolean
  message: string
  data: WorkingHoursListData
}

// Payload types for API calls
export interface SchedulePayload {
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
}

export interface CreateWorkingHoursPayload {
  users: number[]
  schedules: SchedulePayload[]
  check_holidays?: boolean
}

export interface UpdateWorkingHoursPayload {
  schedules: SchedulePayload[]
  replace_all?: boolean
}

// Holiday types
export interface Holiday {
  id: number
  name: string
  date: string
  description: string
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface HolidayPaginationLinks {
  url: string | null
  label: string
  active: boolean
}

export interface HolidaysData {
  current_page: number
  data: Holiday[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: HolidayPaginationLinks[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface HolidaysResponse {
  status: boolean
  message: string
  data: HolidaysData
}

// Combined types for the weekly schedule display
export interface WeeklyScheduleDay {
  date: Date
  dateString: string
  dayName: string
  dayNameIndonesian: string
  startTime: string | null
  endTime: string | null
  duration: string | null
  isHoliday: boolean
  holidayInfo: Holiday | null
  isWorkDay: boolean
  status: 'working' | 'holiday' | 'off' | 'weekend'
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

// Local state types for WorkSchedules component
export interface LocalSchedule {
  start: string
  end: string
}

export interface LocalScheduleState {
  monday: LocalSchedule
  tuesday: LocalSchedule
  wednesday: LocalSchedule
  thursday: LocalSchedule
  friday: LocalSchedule
  saturday: LocalSchedule
  sunday: LocalSchedule
}
