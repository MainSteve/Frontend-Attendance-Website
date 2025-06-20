// src/hooks/holiday.ts

import useSWR from 'swr'
import axios from '@/lib/axios'
import {
  Holiday,
  HolidayResponse,
  SingleHolidayResponse,
  CreateHolidayRequest,
  UpdateHolidayRequest,
  HolidayFilters,
  HolidayStats,
} from '@/types/Holiday'

// Hook for fetching holidays with filters and pagination
export const useHolidays = (filters: HolidayFilters = {}) => {
  // Build query parameters
  const queryParams = new URLSearchParams()

  if (filters.year) queryParams.append('year', filters.year.toString())
  if (filters.start_date) queryParams.append('start_date', filters.start_date)
  if (filters.end_date) queryParams.append('end_date', filters.end_date)
  if (filters.is_recurring !== undefined)
    queryParams.append('is_recurring', filters.is_recurring.toString())
  if (filters.per_page)
    queryParams.append('per_page', filters.per_page.toString())
  if (filters.page) queryParams.append('page', filters.page.toString())

  const queryString = queryParams.toString()
  const endpoint = `/api/holidays${queryString ? `?${queryString}` : ''}`

  const { data, error, mutate, isLoading } = useSWR<HolidayResponse>(
    endpoint,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    },
  )

  // CRUD operations
  const createHoliday = async (holidayData: CreateHolidayRequest) => {
    try {
      const response = await axios.post('/api/holidays', holidayData)
      mutate() // Revalidate the cache
      return response.data as SingleHolidayResponse
    } catch (error) {
      console.error('Error creating holiday:', error)
      throw error
    }
  }

  const updateHoliday = async (
    id: number,
    holidayData: UpdateHolidayRequest,
  ) => {
    try {
      const response = await axios.put(`/api/holidays/${id}`, holidayData)
      mutate() // Revalidate the cache
      return response.data as SingleHolidayResponse
    } catch (error) {
      console.error('Error updating holiday:', error)
      throw error
    }
  }

  const deleteHoliday = async (id: number) => {
    try {
      const response = await axios.delete(`/api/holidays/${id}`)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error('Error deleting holiday:', error)
      throw error
    }
  }

  // Helper functions
  const getHolidayStats = (): HolidayStats => {
    if (!data?.data?.data) {
      return { total: 0, thisMonth: 0, recurring: 0, upcoming: 0 }
    }

    const holidays = data.data.data
    const today = new Date()
    const thisMonth = today.getMonth()
    const thisYear = today.getFullYear()

    return {
      total: data.data.total,
      thisMonth: holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date)
        return (
          holidayDate.getMonth() === thisMonth &&
          holidayDate.getFullYear() === thisYear
        )
      }).length,
      recurring: holidays.filter(holiday => holiday.is_recurring).length,
      upcoming: holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date)
        return holidayDate > today
      }).length,
    }
  }

  return {
    holidays: data?.data?.data || [],
    pagination: data?.data
      ? {
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        }
      : null,
    stats: getHolidayStats(),
    isLoading,
    isError: error,
    mutate,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}

// Hook for fetching a single holiday with details
export const useHoliday = (id: number | null) => {
  const { data, error, mutate } = useSWR<SingleHolidayResponse>(
    id ? `/api/holidays/${id}` : null,
    id ? () => axios.get(`/api/holidays/${id}`).then(res => res.data) : null,
  )

  return {
    holiday: data?.data?.holiday,
    affectedWorkingHours: data?.data?.affected_working_hours,
    isLoading: id && !error && !data,
    isError: error,
    mutate,
  }
}

// Hook for getting holidays for calendar/picker views (simpler data)
export const useHolidaysForCalendar = (year?: number) => {
  const currentYear = year ?? new Date().getFullYear()

  const { holidays, isLoading, isError } = useHolidays({
    year: currentYear,
    per_page: 1000, // Get all holidays for the year
  })

  // Format holidays for calendar use
  const calendarHolidays = holidays.map(holiday => ({
    date: holiday.date,
    name: holiday.name,
    isRecurring: holiday.is_recurring,
  }))

  // Check if a specific date is a holiday
  const isHoliday = (date: string): boolean => {
    return holidays.some(holiday => {
      if (holiday.is_recurring) {
        // For recurring holidays, check month and day only
        const holidayDate = new Date(holiday.date)
        const checkDate = new Date(date)
        return (
          holidayDate.getMonth() === checkDate.getMonth() &&
          holidayDate.getDate() === checkDate.getDate()
        )
      }
      return holiday.date === date
    })
  }

  // Get holiday name for a specific date
  const getHolidayName = (date: string): string | null => {
    const holiday = holidays.find(holiday => {
      if (holiday.is_recurring) {
        const holidayDate = new Date(holiday.date)
        const checkDate = new Date(date)
        return (
          holidayDate.getMonth() === checkDate.getMonth() &&
          holidayDate.getDate() === checkDate.getDate()
        )
      }
      return holiday.date === date
    })
    return holiday?.name ?? null
  }

  return {
    calendarHolidays,
    isLoading,
    isError,
    isHoliday,
    getHolidayName,
  }
}

// Hook for quick holiday operations without full data fetching
export const useHolidayOperations = () => {
  const createHoliday = async (holidayData: CreateHolidayRequest) => {
    try {
      const response = await axios.post('/api/holidays', holidayData)
      return response.data as SingleHolidayResponse
    } catch (error) {
      console.error('Error creating holiday:', error)
      throw error
    }
  }

  const updateHoliday = async (
    id: number,
    holidayData: UpdateHolidayRequest,
  ) => {
    try {
      const response = await axios.put(`/api/holidays/${id}`, holidayData)
      return response.data as SingleHolidayResponse
    } catch (error) {
      console.error('Error updating holiday:', error)
      throw error
    }
  }

  const deleteHoliday = async (id: number) => {
    try {
      const response = await axios.delete(`/api/holidays/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting holiday:', error)
      throw error
    }
  }

  return {
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}
