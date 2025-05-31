// src/types/Attendance.ts

export interface TaskLog {
  id: number;
  description: string;
  photo_url: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  clock_type: 'in' | 'out';
  location: string;
  method: 'manual' | 'qr_code';
  created_at: string;
  task_logs: TaskLog[];
}

export interface WorkDuration {
  hours: number;
  minutes: number;
  total_minutes: number;
}

export interface TodayAttendanceData {
  attendances: AttendanceRecord[];
  work_duration: WorkDuration | null;
  task_logs: TaskLog[];
}

export interface TodayAttendanceResponse {
  status: boolean;
  message: string;
  data: TodayAttendanceData;
}

export interface AttendancePaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface AttendanceListData {
  current_page: number;
  data: AttendanceRecord[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: AttendancePaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AttendanceListResponse {
  status: boolean;
  message: string;
  data: AttendanceListData;
}

export interface ClockInOutData {
  clock_type: 'in' | 'out';
  location?: string;
  method: 'manual' | 'qr_code';
}

export interface ClockInOutResponse {
  status: boolean;
  message: string;
  data: AttendanceRecord;
}

// Computed types for UI
export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  leave: number;
  totalDays: number;
}

export interface ClockStatus {
  clockedIn: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  canClockOut: boolean;
  workDuration: WorkDuration | null;
}