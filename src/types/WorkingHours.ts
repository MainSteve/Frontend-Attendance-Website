export interface WorkingHourUser {
  id: number;
  name: string;
}

export interface WorkingHourSchedule {
  id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface WorkingHoursSchedule {
  monday: WorkingHourSchedule | null;
  tuesday: WorkingHourSchedule | null;
  wednesday: WorkingHourSchedule | null;
  thursday: WorkingHourSchedule | null;
  friday: WorkingHourSchedule | null;
  saturday: WorkingHourSchedule | null;
  sunday: WorkingHourSchedule | null;
}

export interface WorkingHoursData {
  user: WorkingHourUser;
  schedule: WorkingHoursSchedule;
}

export interface WorkingHoursResponse {
  status: boolean;
  message: string;
  data: WorkingHoursData;
}

// Holiday types
export interface Holiday {
  id: number;
  name: string;
  date: string;
  description: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface HolidayPaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

export interface HolidaysData {
  current_page: number;
  data: Holiday[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: HolidayPaginationLinks[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface HolidaysResponse {
  status: boolean;
  message: string;
  data: HolidaysData;
}

// Combined types for the weekly schedule display
export interface WeeklyScheduleDay {
  date: Date;
  dateString: string;
  dayName: string;
  dayNameIndonesian: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  isHoliday: boolean;
  holidayInfo: Holiday | null;
  isWorkDay: boolean;
  status: 'working' | 'holiday' | 'off' | 'weekend';
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';