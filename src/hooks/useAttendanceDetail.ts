// hooks/useAttendanceDetail.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DetailedAttendanceRecord,
  AttendanceDetailResponse,
} from '@/types/Attendance'

interface UseAttendanceDetailOptions {
  enabled?: boolean
  onSuccess?: (data: DetailedAttendanceRecord) => void
  onError?: (error: any) => void
}

interface UseAttendanceDetailReturn {
  attendanceDetail: DetailedAttendanceRecord | null
  isLoading: boolean
  isError: boolean
  error: string | null
  mutate: () => Promise<void> // Function to refetch data
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`

export const useAttendanceDetail = (
  recordId: number | null,
  options: UseAttendanceDetailOptions = {},
): UseAttendanceDetailReturn => {
  const [attendanceDetail, setAttendanceDetail] =
    useState<DetailedAttendanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true, onSuccess, onError } = options

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('token') ?? sessionStorage.getItem('token')
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }

  // Fetch attendance detail function
  const fetchAttendanceDetail = useCallback(async () => {
    if (!recordId || !enabled) return

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: AttendanceDetailResponse = await response.json()

      if (!result.status) {
        throw new Error(result.message || 'Failed to fetch attendance detail')
      }

      setAttendanceDetail(result.data)
      onSuccess?.(result.data)
    } catch (err: any) {
      const errorMessage = err.message ?? 'Failed to fetch attendance detail'
      setError(errorMessage)
      setIsError(true)
      onError?.(err)
      console.error('Fetch attendance detail error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [recordId, enabled, onSuccess, onError])

  // Mutate function to refetch data (useful after CRUD operations)
  const mutate = useCallback(async () => {
    await fetchAttendanceDetail()
  }, [fetchAttendanceDetail])

  // Effect to fetch data when recordId or enabled changes
  useEffect(() => {
    if (recordId && enabled) {
      fetchAttendanceDetail()
    } else {
      // Reset state when recordId is null or disabled
      setAttendanceDetail(null)
      setIsError(false)
      setError(null)
    }
  }, [recordId, enabled, fetchAttendanceDetail])

  return {
    attendanceDetail,
    isLoading,
    isError,
    error,
    mutate,
  }
}
