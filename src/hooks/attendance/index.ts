// hooks/attendance/index.ts
// Export all attendance-related hooks

// Main attendance hooks (existing)
export { useAttendanceSummary } from '../attendance'
export { useAttendanceList } from '../attendance'
export { useAttendanceReport } from '../attendance'
export { useClockInOut } from '../attendance'

// Detail and mutations hooks (new)
export { useAttendanceDetail } from '../attendance'
export { useTaskLogMutations } from '../attendance'

// Types (if needed)
export type {
  UseAttendanceListParams,
  UseAttendanceSummaryParams,
  UseAttendanceReportParams,
} from '@/types/Attendance'
