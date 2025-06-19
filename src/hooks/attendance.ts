import useSWR from 'swr'
import axios from '@/lib/axios'
import { useState, useMemo } from 'react'
import {
  TodayAttendanceResponse,
  AttendanceListResponse,
  ClockInOutData,
  ClockInOutResponse,
  AttendanceSummary,
  ClockStatus,
  AttendanceRecord,
  AttendanceReportParams,
  AttendanceListParams,
  AttendanceQueryParams,
  UseAttendanceListParams,
  UseAttendanceSummaryParams,
  UseAttendanceReportParams,
  AttendanceReportQueryParams,
  AttendanceReportResponse,
  AttendanceDetailResponse,
  UseTaskLogMutationsOptions,
  AddTaskLogRequest,
  AddTaskLogApiResponse,
  UpdateTaskLogRequest,
  UpdateTaskLogApiResponse,
  DeleteTaskLogApiResponse,
  ApiResponse,
} from '@/types/Attendance'
import { UserType } from '@/types/User'
import { formatTime } from '@/utils/dateConverter'

// Hook for today's attendance and clock status
export const useAttendanceToday = () => {
  const { data, error, mutate } = useSWR<TodayAttendanceResponse>(
    '/api/attendance/today',
    () => axios.get('/api/attendance/today').then(res => res.data),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  // Compute clock status from today's data
  const getClockStatus = (): ClockStatus => {
    if (!data?.data?.attendances) {
      return {
        clockedIn: false,
        clockInTime: null,
        clockOutTime: null,
        canClockOut: false,
        workDuration: null,
      }
    }

    const attendances = data.data.attendances
    const clockIn = attendances.find(record => record.clock_type === 'in')
    const clockOut = attendances.find(record => record.clock_type === 'out')

    return {
      clockedIn: !!clockIn,
      clockInTime: clockIn ? formatTime(new Date(clockIn.created_at)) : null,
      clockOutTime: clockOut ? formatTime(new Date(clockOut.created_at)) : null,
      canClockOut: !!clockIn && !clockOut,
      workDuration: data.data.work_duration,
    }
  }

  return {
    todayAttendance: data?.data,
    clockStatus: getClockStatus(),
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

// Main hook for attendance list with full query support
export const useAttendanceList = (params: UseAttendanceListParams = {}) => {
  const { enabled = true, revalidateOnFocus = false, ...queryParams } = params

  // Build the query parameters
  const apiParams: AttendanceQueryParams = {
    ...queryParams,
  }

  // Create SWR key
  const swrKey = enabled ? createSWRKey('/api/attendance', apiParams) : null

  const { data, error, mutate } = useSWR<AttendanceListResponse>(
    swrKey,
    () => {
      const queryString = buildQueryString(apiParams)
      return axios
        .get(`/api/attendance${queryString ? `?${queryString}` : ''}`)
        .then(res => res.data)
    },
    {
      revalidateOnFocus,
      shouldRetryOnError: false,
    },
  )

  return {
    attendanceData: data?.data,
    attendanceList: data?.data?.data || [],
    pagination: data?.data
      ? {
          currentPage: data.data.current_page,
          lastPage: data.data.last_page,
          perPage: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
          links: data.data.links,
          nextPageUrl: data.data.next_page_url,
          prevPageUrl: data.data.prev_page_url,
        }
      : null,
    isLoading: enabled && !error && !data,
    isError: error,
    mutate,
  }
}

// Hook for attendance summary (monthly)
export const useAttendanceSummary = (
  params: UseAttendanceSummaryParams = {},
) => {
  const { month, year, enabled = true } = params

  // Default to current month if not provided
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()

  // Calculate first day of the month
  const fromDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`

  const listParams: UseAttendanceListParams = {
    from_date: fromDate,
    per_page: 100,
    enabled,
  }

  const { attendanceList, isLoading, isError, mutate } =
    useAttendanceList(listParams)

  // Compute attendance summary from raw data
  const attendanceSummary: AttendanceSummary = useMemo(() => {
    if (!attendanceList || attendanceList.length === 0) {
      return {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        totalDays: 0,
      }
    }

    // Group by date to count unique days
    const dayMap = new Map<string, AttendanceRecord[]>()
    attendanceList.forEach(record => {
      const date = record.created_at.split('T')[0] // Get date part
      if (!dayMap.has(date)) {
        dayMap.set(date, [])
      }
      dayMap.get(date)!.push(record)
    })

    let present = 0
    let late = 0

    dayMap.forEach(dayRecords => {
      // Check if there's a clock-in for this day
      const hasClockIn = dayRecords.some(record => record.clock_type === 'in')
      if (hasClockIn) {
        // Check if late (you might want to adjust this logic based on your business rules)
        const clockInRecord = dayRecords.find(
          record => record.clock_type === 'in',
        )
        if (clockInRecord) {
          const clockInTime = new Date(clockInRecord.created_at)
          const isLate =
            clockInTime.getHours() > 8 ||
            (clockInTime.getHours() === 8 && clockInTime.getMinutes() > 0)
          if (isLate) {
            late++
          } else {
            present++
          }
        }
      }
    })

    // Calculate total working days in the month (you might want to exclude weekends/holidays)
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate()
    const totalWorkingDays = Math.min(daysInMonth, 22) // Assume ~22 working days per month

    return {
      present,
      late,
      absent: Math.max(0, totalWorkingDays - present - late),
      leave: 0, // You might want to fetch this from a separate API
      totalDays: totalWorkingDays,
    }
  }, [attendanceList, targetYear, targetMonth])

  return {
    attendanceData: attendanceList,
    attendanceSummary,
    isLoading,
    isError,
    mutate,
  }
}

// Helper function to check if error is a business logic error
const isBusinessLogicError = (error: any): boolean => {
  return (
    error?.response?.status === 422 &&
    error?.response?.data?.status === false &&
    !error?.response?.data?.errors
  )
}

// Helper function to check if error is a validation error
const isValidationError = (error: any): boolean => {
  return (
    error?.response?.status === 422 &&
    error?.response?.data?.status === false &&
    error?.response?.data?.errors
  )
}

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  return 'An unexpected error occurred'
}

// Hook for clock in/out functionality
export const useClockInOut = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const clockIn = async (data: Omit<ClockInOutData, 'clock_type'>) => {
    setIsLoading(true)
    setLastError(null)

    try {
      const response = await axios.post<ClockInOutResponse>('/api/attendance', {
        clock_type: 'in',
        method: data.method,
        location: data.location, // Will default to 'Remote' on backend if not provided
      })
      return response.data
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      setLastError(errorMessage)

      // Log different error types for debugging
      if (isValidationError(error)) {
        console.error('Clock In Validation Error:', error.response.data.errors)
      } else if (isBusinessLogicError(error)) {
        console.error('Clock In Business Logic Error:', errorMessage)
      } else {
        console.error('Clock In Error:', error)
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clockOut = async (data: Omit<ClockInOutData, 'clock_type'>) => {
    setIsLoading(true)
    setLastError(null)

    try {
      const response = await axios.post<ClockInOutResponse>('/api/attendance', {
        clock_type: 'out',
        method: data.method,
        location: data.location, // Will default to 'Remote' on backend if not provided
      })
      return response.data
    } catch (error: any) {
      const errorMessage = getErrorMessage(error)
      setLastError(errorMessage)

      // Log different error types for debugging
      if (isValidationError(error)) {
        console.error('Clock Out Validation Error:', error.response.data.errors)
      } else if (isBusinessLogicError(error)) {
        console.error('Clock Out Business Logic Error:', errorMessage)
      } else {
        console.error('Clock Out Error:', error)
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setLastError(null)
  }

  return {
    clockIn,
    clockOut,
    isLoading,
    lastError,
    clearError,
    // Helper functions for error checking
    isBusinessLogicError,
    isValidationError,
    getErrorMessage,
  }
}

// Hook for fetching a single attendance record by ID
export const useAttendanceDetail = (
  id: number | string | null,
  options: { enabled?: boolean } = {},
) => {
  const { enabled = true } = options

  // Only create SWR key if ID is provided and enabled
  const swrKey = enabled && id ? `/api/attendance/${id}` : null

  const { data, error, mutate } = useSWR<AttendanceDetailResponse>(
    swrKey,
    () => axios.get(`/api/attendance/${id}`).then(res => res.data),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  )

  return {
    attendanceDetail: data?.data,
    attendanceRecord: data?.data, // Alias for convenience
    taskLogs: data?.data?.task_logs || [],
    taskLogsCount: data?.data?.task_logs_count || 0,
    photosCount: data?.data?.photos_count || 0,
    isLoading: enabled && !error && !data && swrKey !== null,
    isError: error,
    error,
    mutate,
    // Helper functions
    hasTaskLogs: (data?.data?.task_logs_count || 0) > 0,
    hasPhotos: (data?.data?.photos_count || 0) > 0,
  }
}

// Hook for fetching attendance detail only when needed (lazy loading)
export const useAttendanceDetailLazy = () => {
  const [attendanceId, setAttendanceId] = useState<number | string | null>(null)

  const result = useAttendanceDetail(attendanceId, { enabled: !!attendanceId })

  const fetchAttendance = (id: number | string) => {
    setAttendanceId(id)
  }

  const clearAttendance = () => {
    setAttendanceId(null)
  }

  return {
    ...result,
    fetchAttendance,
    clearAttendance,
    currentId: attendanceId,
  }
}

// Task log mutations hook - comprehensive CRUD operations
export const useTaskLogMutations = (
  options: UseTaskLogMutationsOptions = {},
) => {
  const { onSuccess, onError, invalidateKeys = [] } = options
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<any>(null)

  const clearError = () => setLastError(null)
  const { mutate } = useSWR(null)

  // Helper function to invalidate SWR cache
  const invalidateCache = (additionalKeys: string[] = []) => {
    const keysToInvalidate = [...invalidateKeys, ...additionalKeys]

    keysToInvalidate.forEach(key => {
      mutate(key)
    })
  }

  // ADD TASK LOG
  const addTaskLog = async (attendanceId: number, data: AddTaskLogRequest) => {
    setIsLoading(true)
    setLastError(null)

    try {
      const formData = new FormData()
      formData.append('description', data.description)

      if (data.photo) {
        formData.append('photo', data.photo)
      }

      const response = await axios.post<AddTaskLogApiResponse>(
        `/api/attendance/${attendanceId}/task-log`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      if (response.data.status) {
        invalidateCache([
          `/api/attendance/${attendanceId}`, // Refresh attendance detail
          '/api/attendance', // Refresh attendance list if it includes task log counts
        ])
        onSuccess?.(response.data)
        return response.data.data
      } else {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      const errorData = error.response?.data
      setLastError(errorData || error)
      onError?.(errorData || error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // UPDATE TASK LOG
  const updateTaskLog = async (
    taskLogId: number,
    data: UpdateTaskLogRequest,
    method: 'PUT' | 'PATCH' = 'PUT',
  ) => {
    setIsLoading(true)
    setLastError(null)

    try {
      const formData = new FormData()

      if (data.description !== undefined) {
        formData.append('description', data.description)
      }

      if (data.photo) {
        formData.append('photo', data.photo)
      }

      // Use _method for Laravel method spoofing when sending FormData
      formData.append('_method', method)

      const response = await axios.post<UpdateTaskLogApiResponse>(
        `/api/attendance/task-log/${taskLogId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      if (response.data.status) {
        invalidateCache([
          '/api/attendance', // Refresh lists that might show updated task logs
        ])
        onSuccess?.(response.data)
        return response.data.data
      } else {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      const errorData = error.response?.data
      setLastError(errorData || error)
      onError?.(errorData || error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // DELETE TASK LOG
  const deleteTaskLog = async (taskLogId: number) => {
    setIsLoading(true)
    setLastError(null)

    try {
      const response = await axios.delete<DeleteTaskLogApiResponse>(
        `/api/attendance/task-log/${taskLogId}`,
      )

      if (response.data.status) {
        invalidateCache([
          '/api/attendance', // Refresh lists
        ])
        onSuccess?.(response.data)
        return response.data.data
      } else {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      const errorData = error.response?.data
      setLastError(errorData || error)
      onError?.(errorData || error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions for error checking
  const isValidationError = (error: any) => {
    return error?.status === false && error?.errors
  }

  const isUnauthorizedError = (error: any) => {
    return error?.status === 403 || error?.message?.includes('Unauthorized')
  }

  const getErrorMessage = (error: any) => {
    if (isValidationError(error)) {
      const firstError = Object.values(error.errors)[0] as string[]
      return firstError?.[0] || 'Validation failed'
    }
    return error?.message || 'An unexpected error occurred'
  }

  return {
    addTaskLog,
    updateTaskLog,
    deleteTaskLog,
    isLoading,
    lastError,
    clearError,
    // Helper functions
    isValidationError: isValidationError(lastError),
    isUnauthorizedError: isUnauthorizedError(lastError),
    getErrorMessage: () => getErrorMessage(lastError),
  }
}

// Individual hooks for specific operations
export const useAddTaskLog = (options: UseTaskLogMutationsOptions = {}) => {
  const { addTaskLog, isLoading, lastError, clearError, ...helpers } =
    useTaskLogMutations(options)

  return {
    addTaskLog,
    isLoading,
    error: lastError,
    clearError,
    ...helpers,
  }
}

export const useUpdateTaskLog = (options: UseTaskLogMutationsOptions = {}) => {
  const { updateTaskLog, isLoading, lastError, clearError, ...helpers } =
    useTaskLogMutations(options)

  return {
    updateTaskLog,
    isLoading,
    error: lastError,
    clearError,
    ...helpers,
  }
}

export const useDeleteTaskLog = (options: UseTaskLogMutationsOptions = {}) => {
  const { deleteTaskLog, isLoading, lastError, clearError, ...helpers } =
    useTaskLogMutations(options)

  return {
    deleteTaskLog,
    isLoading,
    error: lastError,
    clearError,
    ...helpers,
  }
}

// Hook for filtered attendance (convenience wrapper)
export const useAttendanceByDateRange = (fromDate: string, toDate: string) => {
  return useAttendanceList({
    from_date: fromDate,
    to_date: toDate,
    sort_by: 'created_at',
    sort_direction: 'desc',
  })
}

// Hook for attendance by specific date
export const useAttendanceByDate = (date: string) => {
  return useAttendanceList({
    date,
    sort_by: 'created_at',
    sort_direction: 'asc',
  })
}

// Hook for attendance by clock type
export const useAttendanceByType = (clockType: 'in' | 'out', days = 30) => {
  return useAttendanceList({
    clock_type: clockType,
    days,
    sort_by: 'created_at',
    sort_direction: 'desc',
  })
}

// Utility functions for regular attendance APIs
const createSWRKey = (
  endpoint: string,
  params: AttendanceQueryParams,
): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
  return `${endpoint}?${JSON.stringify(filteredParams)}`
}

const buildQueryString = (params: AttendanceQueryParams): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  return searchParams.toString()
}

// Report-specific utility functions
const createReportSWRKey = (
  endpoint: string,
  params: AttendanceReportQueryParams,
): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
  return `${endpoint}?${JSON.stringify(filteredParams)}`
}

const buildReportQueryString = (
  params: AttendanceReportQueryParams,
): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  return searchParams.toString()
}

// Hook for attendance reports
export const useAttendanceReport = (params: UseAttendanceReportParams) => {
  const { enabled = true, revalidateOnFocus = false, ...queryParams } = params

  // Build the query parameters
  const apiParams: AttendanceReportQueryParams = {
    ...queryParams,
  }

  // Create SWR key - only if required params are provided
  const swrKey =
    enabled && apiParams.start_date && apiParams.end_date
      ? createReportSWRKey('/api/attendance/report', apiParams)
      : null

  const { data, error, mutate } = useSWR<AttendanceReportResponse>(
    swrKey,
    () => {
      const queryString = buildReportQueryString(apiParams)
      return axios
        .get(`/api/attendance/report${queryString ? `?${queryString}` : ''}`)
        .then(res => res.data)
    },
    {
      revalidateOnFocus,
      shouldRetryOnError: false,
    },
  )

  return {
    reportData: data?.data,
    user: data?.data?.user,
    dailyRecords: data?.data?.daily_records || [],
    summary: data?.data?.summary,
    generatedAt: data?.data?.generated_at,
    isLoading: enabled && !error && !data && swrKey !== null,
    isError: error,
    mutate,
  }
}

// Hook for monthly attendance report
export const useMonthlyAttendanceReport = (
  year: number,
  month: number,
  options: {
    includeTaskLogs?: boolean
    userId?: number
    enabled?: boolean
  } = {},
) => {
  const { includeTaskLogs = true, userId, enabled = true } = options

  // Calculate first and last day of the month
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay
    .toString()
    .padStart(2, '0')}`

  return useAttendanceReport({
    start_date: startDate,
    end_date: endDate,
    include_task_logs: includeTaskLogs,
    user_id: userId,
    enabled,
  })
}

// Hook for weekly attendance report
export const useWeeklyAttendanceReport = (
  startDate: string,
  options: {
    includeTaskLogs?: boolean
    userId?: number
    enabled?: boolean
  } = {},
) => {
  const { includeTaskLogs = true, userId, enabled = true } = options

  // Calculate end date (6 days after start)
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endDate = end.toISOString().split('T')[0]

  return useAttendanceReport({
    start_date: startDate,
    end_date: endDate,
    include_task_logs: includeTaskLogs,
    user_id: userId,
    enabled,
  })
}

// Hook for current month report
export const useCurrentMonthReport = (
  options: {
    includeTaskLogs?: boolean
    userId?: number
    enabled?: boolean
  } = {},
) => {
  const now = new Date()
  return useMonthlyAttendanceReport(
    now.getFullYear(),
    now.getMonth() + 1,
    options,
  )
}

// Hook for previous month report
export const usePreviousMonthReport = (
  options: {
    includeTaskLogs?: boolean
    userId?: number
    enabled?: boolean
  } = {},
) => {
  const now = new Date()
  const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  return useMonthlyAttendanceReport(year, previousMonth, options)
}

// Hook for recent attendance (last N days)
export const useRecentAttendance = (days = 7) => {
  return useAttendanceList({
    days,
    sort_by: 'created_at',
    sort_direction: 'desc',
    per_page: 50,
  })
}

