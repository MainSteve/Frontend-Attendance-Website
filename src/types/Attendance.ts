type SortByField = 'created_at' | 'clock_type' | 'method' | 'location'
type ClockMethod = 'manual' | 'qr_code' | null

// Enhanced TaskLog interface to match API response
export interface TaskLog {
  id: number
  description: string
  photo_url: string | null
  created_at: string
  has_photo: boolean // From API response
  photo_expires_at?: string // Photo URL expiration time
}

// Enhanced AttendanceRecord to match API response
export interface AttendanceRecord {
  id: number
  user_id: number
  clock_type: 'in' | 'out'
  location: string
  method: 'manual' | 'qr_code'
  created_at: string
  updated_at?: string // Optional: Add if your API returns this
  task_logs: TaskLog[]
}

export interface WorkDuration {
  hours: number
  minutes: number
  total_minutes: number
}

export interface TodayAttendanceData {
  attendances: AttendanceRecord[]
  work_duration: WorkDuration | null
  task_logs: TaskLog[]
}

export interface TodayAttendanceResponse {
  status: boolean
  message: string
  data: TodayAttendanceData
}

export interface AttendancePaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface AttendanceListData {
  current_page: number
  data: AttendanceRecord[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: AttendancePaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface AttendanceListResponse {
  status: boolean
  message: string
  data: AttendanceListData
}

export interface ClockInOutData {
  clock_type: 'in' | 'out'
  location?: string // nullable, max 255 chars, defaults to 'Remote' on backend
  method: 'manual' | 'qr_code'
}

export interface ClockInOutResponse {
  status: boolean
  message: string
  data: AttendanceRecord
}

// Validation error structure from Laravel
export interface ValidationErrors {
  clock_type?: string[]
  location?: string[]
  method?: string[]
}

// Specific error responses for clock in/out
export interface ClockInOutErrorResponse {
  status: false
  message: string
  errors?: ValidationErrors
}

// Business logic error messages
export type ClockInOutErrorMessages =
  | 'You have already clocked in today'
  | 'You must clock in before you can clock out'
  | 'You have already clocked out today'
  | 'Validation failed'

// Enhanced attendance record for single record view (matches API response exactly)
export interface DetailedAttendanceRecord extends AttendanceRecord {
  task_logs: TaskLog[]
  task_logs_count: number
  photos_count: number
}

// API response for single attendance record
export interface AttendanceDetailResponse {
  status: boolean
  message: string
  data: DetailedAttendanceRecord
}

// Error response for single attendance record
export interface AttendanceDetailErrorResponse {
  status: false
  message: string // e.g., "Attendance record not found"
}

// TASK LOG MANAGEMENT TYPES

// Request types for task log operations
export interface AddTaskLogRequest {
  description: string // required, max 1000 chars
  photo?: File // optional image file (jpeg,png,jpg,webp, max 5MB)
}

export interface UpdateTaskLogRequest {
  description?: string // optional, max 1000 chars
  photo?: File // optional image file (jpeg,png,jpg,webp, max 5MB)
}

// Response types for task log operations
export interface TaskLogOperationResponse {
  status: boolean
  message: string
  data: TaskLogResponseData
}

export interface TaskLogResponseData {
  id: number
  user_id: number
  attendance_id: number
  description: string
  photo_url: string | null // Temporary URL (24h expiry)
  created_at: string
  has_photo: boolean
  // For update operations
  updated_fields?: string[]
  photo_expires_at?: string
  // For admin users
  user?: {
    id: number
    name: string
  }
}

export interface DeleteTaskLogResponse {
  status: boolean
  message: string
  data: {
    deleted_task_log_id: number
    had_photo: boolean
    deleted_by: number
  }
}

// Error responses for task log operations
export interface TaskLogErrorResponse {
  status: false
  message: string
  errors?: {
    description?: string[]
    photo?: string[]
  }
  error?: string // For server errors
}

// Combined response types
export type AddTaskLogApiResponse =
  | TaskLogOperationResponse
  | TaskLogErrorResponse
export type UpdateTaskLogApiResponse =
  | TaskLogOperationResponse
  | TaskLogErrorResponse
export type DeleteTaskLogApiResponse =
  | DeleteTaskLogResponse
  | TaskLogErrorResponse

// Hook parameters
export interface UseTaskLogMutationsOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  invalidateKeys?: string[] // SWR keys to invalidate after mutations
}

// Complete response type for single attendance record
export type AttendanceDetailApiResponse =
  | AttendanceDetailResponse
  | AttendanceDetailErrorResponse

// Query parameter interfaces
export interface AttendanceQueryParams {
  // Date filters (mutually exclusive)
  days?: number
  from_date?: string // YYYY-MM-DD format
  to_date?: string // YYYY-MM-DD format
  date?: string // YYYY-MM-DD format

  // Other filters
  clock_type?: 'in' | 'out'
  method?: 'manual' | 'qr_code'
  location?: string

  // Sorting
  sort_by?: SortByField
  sort_direction?: 'asc' | 'desc'

  // Pagination
  per_page?: number
  page?: number
}

export interface UseAttendanceListParams {
  // All query params are optional
  days?: number
  from_date?: string
  to_date?: string
  date?: string
  clock_type?: 'in' | 'out'
  method?: 'manual' | 'qr_code'
  location?: string
  sort_by?: SortByField
  sort_direction?: 'asc' | 'desc'
  per_page?: number
  page?: number

  // Hook-specific options
  enabled?: boolean // Whether to automatically fetch
  revalidateOnFocus?: boolean
}

export interface UseAttendanceSummaryParams {
  month?: number
  year?: number
  enabled?: boolean
}

// Computed types for UI
export interface AttendanceSummary {
  present: number
  late: number
  absent: number
  leave: number
  totalDays: number
}

export interface ClockStatus {
  clockedIn: boolean
  clockInTime: string | null
  clockOutTime: string | null
  canClockOut: boolean
  workDuration: WorkDuration | null
}

// Error response interface
export interface ApiErrorResponse {
  status: false
  message: string
  errors?: Record<string, string[]>
}

// Attendance Report Types
export interface AttendanceReportQueryParams {
  start_date: string // YYYY-MM-DD format - required
  end_date: string // YYYY-MM-DD format - required
  include_task_logs?: boolean // defaults to true
  filter_clock_type?: 'in' | 'out'
  filter_method?: 'manual' | 'qr_code'
  filter_location?: string
  user_id?: number // Only for admins
}

export interface UseAttendanceReportParams extends AttendanceReportQueryParams {
  enabled?: boolean
  revalidateOnFocus?: boolean
}

// Holiday information
export interface HolidayInfo {
  id: number
  name: string
  description: string
  is_recurring: boolean
}

// Leave information
export interface LeaveInfo {
  id: number
  type: 'izin' | 'sakit' | 'cuti'
  reason: string
  start_date: string
  end_date: string
  duration: number // days
}

// Scheduled hours information
export interface ScheduledHours {
  start_time: string // HH:mm:ss
  end_time: string // HH:mm:ss
  duration_minutes: number
  hours_formatted: string // "H:mm"
}

// Daily attendance record for reports
export interface DailyAttendanceRecord {
  date: string // YYYY-MM-DD
  day_of_week: string
  clock_in: string | null // timestamp
  clock_out: string | null // timestamp
  clock_in_method: ClockMethod
  clock_out_method: ClockMethod
  location: string | null
  total_hours: number
  total_minutes: number
  hours_formatted: string // "H:mm"
  is_holiday: boolean
  holiday_info: HolidayInfo | null
  is_leave: boolean
  leave_info: LeaveInfo | null
  scheduled_hours: ScheduledHours | null
  task_logs: TaskLog[]
  task_logs_count: number
}

// Report user information
export interface ReportUser {
  id: number
  name: string
  email: string
  role: string
  position: string | null
  department: {
    id: number
    name: string
  } | null
}

// Date range summary
export interface DateRangeSummary {
  start_date: string
  end_date: string
  total_days: number
  weekdays: number
  weekends: number
  holidays: number
  work_days: number
}

// Leave count by type
export interface LeaveCountByType {
  izin: number
  sakit: number
  cuti: number
}

// Attendance summary
export interface AttendanceReportSummary {
  present_days: number
  absent_days: number
  leave_days: number
  leave_by_type: LeaveCountByType
  attendance_rate: string // percentage with %
}

// Work hours summary
export interface WorkHoursSummary {
  total_hours: number
  total_minutes: number
  hours_formatted: string
}

export interface WorkHoursDifference {
  total_minutes: number
  hours_formatted: string // includes +/- sign
  type: 'overtime' | 'undertime' | 'exact'
}

export interface WorkHoursReportSummary {
  scheduled: WorkHoursSummary
  actual: WorkHoursSummary
  difference: WorkHoursDifference
  average_hours_per_day: number
}

// Leave quota information
export interface LeaveQuotaSummary {
  year: number
  total: number
  used: number
  remaining: number
  percentage_used: number
}

// Complete report summary
export interface ReportSummary {
  date_range: DateRangeSummary
  attendance: AttendanceReportSummary
  work_hours: WorkHoursReportSummary
  leave_quota: LeaveQuotaSummary
}

// Complete report data
export interface AttendanceReportData {
  user: ReportUser
  daily_records: DailyAttendanceRecord[]
  summary: ReportSummary
  generated_at: string
}

// API response for attendance report
export interface AttendanceReportResponse {
  status: boolean
  message: string
  data: AttendanceReportData
}

// Error response for report validation
export interface AttendanceReportErrorResponse {
  status: false
  message: string
  errors?: {
    start_date?: string[]
    end_date?: string[]
    include_task_logs?: string[]
    filter_clock_type?: string[]
    filter_method?: string[]
    filter_location?: string[]
    user_id?: string[]
  }
}

// Generic API response wrapper
export type ApiResponse<T> =
  | {
      status: true
      message: string
      data: T
    }
  | ApiErrorResponse

// Utility types for computed properties
export type TaskLogWithComputedProps = TaskLog & {
  task_title: string // Computed task title for display
}

export type AttendanceRecordWithComputedProps = AttendanceRecord & {
  is_recent: boolean // Computed: within last 24 hours
  duration_from_now: string // Computed: "2 hours ago"
}

export interface WorkDuration {
  hours: number
  minutes: number
  total_minutes: number
}

export interface TodayAttendanceData {
  attendances: AttendanceRecord[]
  work_duration: WorkDuration | null
  task_logs: TaskLog[]
}

export interface TodayAttendanceResponse {
  status: boolean
  message: string
  data: TodayAttendanceData
}

export interface AttendancePaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface AttendanceListData {
  current_page: number
  data: AttendanceRecord[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: AttendancePaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface AttendanceListResponse {
  status: boolean
  message: string
  data: AttendanceListData
}

export interface ClockInOutData {
  clock_type: 'in' | 'out'
  location?: string // nullable, max 255 chars, defaults to 'Remote' on backend
  method: 'manual' | 'qr_code'
}

export interface ClockInOutResponse {
  status: boolean
  message: string
  data: AttendanceRecord
}

// Validation error structure from Laravel
export interface ValidationErrors {
  clock_type?: string[]
  location?: string[]
  method?: string[]
}

// Specific error responses for clock in/out
export interface ClockInOutErrorResponse {
  status: false
  message: string
  errors?: ValidationErrors
}

// Enhanced attendance record for single record view (includes task logs)
export interface DetailedAttendanceRecord extends AttendanceRecord {
  task_logs: TaskLog[]
  task_logs_count: number
  photos_count: number
}

// API response for single attendance record
export interface AttendanceDetailResponse {
  status: boolean
  message: string
  data: DetailedAttendanceRecord
}

// Error response for single attendance record
export interface AttendanceDetailErrorResponse {
  status: false
  message: string // e.g., "Attendance record not found"
}

// TASK LOG MANAGEMENT TYPES

// Request types for task log operations
export interface AddTaskLogRequest {
  description: string // required, max 1000 chars
  photo?: File // optional image file (jpeg,png,jpg,webp, max 5MB)
}

export interface UpdateTaskLogRequest {
  description?: string // optional, max 1000 chars
  photo?: File // optional image file (jpeg,png,jpg,webp, max 5MB)
}

// Response types for task log operations
export interface TaskLogOperationResponse {
  status: boolean
  message: string
  data: TaskLogResponseData
}

export interface TaskLogResponseData {
  id: number
  user_id: number
  attendance_id: number
  description: string
  photo_url: string | null // Temporary URL (24h expiry)
  created_at: string
  has_photo: boolean
  // For update operations
  updated_fields?: string[]
  photo_expires_at?: string
  // For admin users
  user?: {
    id: number
    name: string
  }
}

export interface DeleteTaskLogResponse {
  status: boolean
  message: string
  data: {
    deleted_task_log_id: number
    had_photo: boolean
    deleted_by: number
  }
}

// Error responses for task log operations
export interface TaskLogErrorResponse {
  status: false
  message: string
  errors?: {
    description?: string[]
    photo?: string[]
  }
  error?: string // For server errors
}

// Hook parameters
export interface UseTaskLogMutationsOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  invalidateKeys?: string[] // SWR keys to invalidate after mutations
}

// Query parameter interfaces
export interface AttendanceQueryParams {
  // Date filters (mutually exclusive)
  days?: number
  from_date?: string // YYYY-MM-DD format
  to_date?: string // YYYY-MM-DD format
  date?: string // YYYY-MM-DD format

  // Other filters
  clock_type?: 'in' | 'out'
  method?: 'manual' | 'qr_code'
  location?: string

  // Sorting
  sort_by?: SortByField
  sort_direction?: 'asc' | 'desc'

  // Pagination
  per_page?: number
  page?: number
}

export interface UseAttendanceListParams {
  // All query params are optional
  days?: number
  from_date?: string
  to_date?: string
  date?: string
  clock_type?: 'in' | 'out'
  method?: 'manual' | 'qr_code'
  location?: string
  sort_by?: SortByField
  sort_direction?: 'asc' | 'desc'
  per_page?: number
  page?: number

  // Hook-specific options
  enabled?: boolean // Whether to automatically fetch
  revalidateOnFocus?: boolean
}

export interface UseAttendanceSummaryParams {
  month?: number
  year?: number
  enabled?: boolean
}

// Computed types for UI
export interface AttendanceSummary {
  present: number
  late: number
  absent: number
  leave: number
  totalDays: number
}

export interface ClockStatus {
  clockedIn: boolean
  clockInTime: string | null
  clockOutTime: string | null
  canClockOut: boolean
  workDuration: WorkDuration | null
}

// Error response interface
export interface ApiErrorResponse {
  status: false
  message: string
  errors?: Record<string, string[]>
}

// Attendance Report Types
export interface AttendanceReportQueryParams {
  start_date: string // YYYY-MM-DD format - required
  end_date: string // YYYY-MM-DD format - required
  include_task_logs?: boolean // defaults to true
  filter_clock_type?: 'in' | 'out'
  filter_method?: 'manual' | 'qr_code'
  filter_location?: string
  user_id?: number // Only for admins
}

export interface UseAttendanceReportParams extends AttendanceReportQueryParams {
  enabled?: boolean
  revalidateOnFocus?: boolean
}

// Holiday information
export interface HolidayInfo {
  id: number
  name: string
  description: string
  is_recurring: boolean
}

// Leave information
export interface LeaveInfo {
  id: number
  type: 'izin' | 'sakit' | 'cuti'
  reason: string
  start_date: string
  end_date: string
  duration: number // days
}

// Scheduled hours information
export interface ScheduledHours {
  start_time: string // HH:mm:ss
  end_time: string // HH:mm:ss
  duration_minutes: number
  hours_formatted: string // "H:mm"
}

// Daily attendance record for reports
export interface DailyAttendanceRecord {
  date: string // YYYY-MM-DD
  day_of_week: string
  clock_in: string | null // timestamp
  clock_out: string | null // timestamp
  clock_in_method: ClockMethod
  clock_out_method: ClockMethod
  location: string | null
  total_hours: number
  total_minutes: number
  hours_formatted: string // "H:mm"
  is_holiday: boolean
  holiday_info: HolidayInfo | null
  is_leave: boolean
  leave_info: LeaveInfo | null
  scheduled_hours: ScheduledHours | null
  task_logs: TaskLog[]
  task_logs_count: number
}

// Report user information
export interface ReportUser {
  id: number
  name: string
  email: string
  role: string
  position: string | null
  department: {
    id: number
    name: string
  } | null
}

// Date range summary
export interface DateRangeSummary {
  start_date: string
  end_date: string
  total_days: number
  weekdays: number
  weekends: number
  holidays: number
  work_days: number
}

// Leave count by type
export interface LeaveCountByType {
  izin: number
  sakit: number
  cuti: number
}

// Attendance summary
export interface AttendanceReportSummary {
  present_days: number
  absent_days: number
  leave_days: number
  leave_by_type: LeaveCountByType
  attendance_rate: string // percentage with %
}

// Work hours summary
export interface WorkHoursSummary {
  total_hours: number
  total_minutes: number
  hours_formatted: string
}

export interface WorkHoursDifference {
  total_minutes: number
  hours_formatted: string // includes +/- sign
  type: 'overtime' | 'undertime' | 'exact'
}

export interface WorkHoursReportSummary {
  scheduled: WorkHoursSummary
  actual: WorkHoursSummary
  difference: WorkHoursDifference
  average_hours_per_day: number
}

// Leave quota information
export interface LeaveQuotaSummary {
  year: number
  total: number
  used: number
  remaining: number
  percentage_used: number
}

// Complete report summary
export interface ReportSummary {
  date_range: DateRangeSummary
  attendance: AttendanceReportSummary
  work_hours: WorkHoursReportSummary
  leave_quota: LeaveQuotaSummary
}

// Complete report data
export interface AttendanceReportData {
  user: ReportUser
  daily_records: DailyAttendanceRecord[]
  summary: ReportSummary
  generated_at: string
}

// API response for attendance report
export interface AttendanceReportResponse {
  status: boolean
  message: string
  data: AttendanceReportData
}

// Error response for report validation
export interface AttendanceReportErrorResponse {
  status: false
  message: string
  errors?: {
    start_date?: string[]
    end_date?: string[]
    include_task_logs?: string[]
    filter_clock_type?: string[]
    filter_method?: string[]
    filter_location?: string[]
    user_id?: string[]
  }
}
