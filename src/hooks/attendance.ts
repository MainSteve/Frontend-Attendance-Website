// src/hooks/attendance.ts
import useSWR from 'swr'
import axios from '@/lib/axios'
import { useState } from 'react'
import {
  TodayAttendanceResponse,
  AttendanceListResponse,
  ClockInOutData,
  ClockInOutResponse,
  AttendanceSummary,
  ClockStatus,
  AttendanceRecord
} from '@/types/Attendance'
import { formatTime } from '@/utils/dateConverter'

// Hook for today's attendance and clock status
export const useAttendanceToday = () => {
  const { data, error, mutate } = useSWR<TodayAttendanceResponse>(
    '/api/attendance/today',
    () => axios.get('/api/attendance/today').then(res => res.data)
  )

  // Compute clock status from today's data
  const getClockStatus = (): ClockStatus => {
    if (!data?.data?.attendances) {
      return {
        clockedIn: false,
        clockInTime: null,
        clockOutTime: null,
        canClockOut: false,
        workDuration: null
      }
    }

    const attendances = data.data.attendances
    const clockIn = attendances.find(record => record.clock_type === 'in')
    const clockOut = attendances.find(record => record.clock_type === 'out')

    return {
      clockedIn: !!clockIn,
      clockInTime: clockIn ? formatTime(new Date(clockIn.created_at)) : null,
      clockOutTime: clockOut ? formatTime(new Date (clockOut.created_at)) : null,
      canClockOut: !!clockIn && !clockOut,
      workDuration: data.data.work_duration
    }
  }

  return {
    todayAttendance: data?.data,
    clockStatus: getClockStatus(),
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// Hook for attendance summary (monthly)
export const useAttendanceSummary = (month?: number, year?: number) => {
  // Default to current month if not provided
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()
  
  // Calculate first day of the month
  const fromDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`
  
  const { data, error, mutate } = useSWR<AttendanceListResponse>(
    `/api/attendance?per_page=100&from_date=${fromDate}`,
    () => axios.get(`/api/attendance`, {
      params: {
        per_page: 100,
        from_date: fromDate
      }
    }).then(res => res.data)
  )

  // Compute attendance summary from raw data
  const getAttendanceSummary = (): AttendanceSummary => {
    if (!data?.data?.data) {
      return {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        totalDays: 0
      }
    }

    const records = data.data.data
    
    // Group by date to count unique days
    const dayMap = new Map<string, AttendanceRecord[]>()
    records.forEach(record => {
      const date = record.created_at.split('T')[0] // Get date part
      if (!dayMap.has(date)) {
        dayMap.set(date, [])
      }
      dayMap.get(date)!.push(record)
    })

    let present = 0
    let late = 0
    
    dayMap.forEach((dayRecords) => {
      // Check if there's a clock-in for this day
      const hasClockIn = dayRecords.some(record => record.clock_type === 'in')
      if (hasClockIn) {
        present++
        
        // Check if late (you might want to adjust this logic based on your business rules)
        const clockInRecord = dayRecords.find(record => record.clock_type === 'in')
        if (clockInRecord) {
          const clockInTime = new Date(clockInRecord.created_at)
          const isLate = clockInTime.getHours() > 8 || 
                        (clockInTime.getHours() === 8 && clockInTime.getMinutes() > 0)
          if (isLate) {
            late++
            present-- // Don't double count
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
      totalDays: totalWorkingDays
    }
  }

  return {
    attendanceData: data?.data,
    attendanceSummary: getAttendanceSummary(),
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// Hook for clock in/out functionality
export const useClockInOut = () => {
  const [isLoading, setIsLoading] = useState(false)

  const clockIn = async (data: Omit<ClockInOutData, 'clock_type'>) => {
    setIsLoading(true)
    try {
      const response = await axios.post<ClockInOutResponse>('/api/attendance', {
        ...data,
        clock_type: 'in'
      })
      return response.data
    } catch (error) {
      console.error('Clock In Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clockOut = async (data: Omit<ClockInOutData, 'clock_type'>) => {
    setIsLoading(true)
    try {
      const response = await axios.post<ClockInOutResponse>('/api/attendance', {
        ...data,
        clock_type: 'out'
      })
      return response.data
    } catch (error) {
      console.error('Clock Out Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    clockIn,
    clockOut,
    isLoading
  }
}