import useSWR from 'swr'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/auth'
import {
  LeaveQuota,
  LeaveQuotaResponse,
  LeaveQuotaSummary,
} from '@/types/LeaveQuota'

// Request interfaces for API calls
export interface CreateLeaveQuotaRequest {
  user_id: number
  year: number
  total_quota: number
}

export interface UpdateLeaveQuotaRequest {
  total_quota: number
}

export interface GenerateYearlyQuotasRequest {
  year: number
  default_quota: number
}

export interface GenerateYearlyQuotasResponse {
  status: boolean
  message: string
  data: {
    year: number
    default_quota: number
    created: number
    skipped: number
  }
}

// Hook for fetching all leave quotas (admin view)
export const useLeaveQuotas = (year?: number, userId?: number) => {
  const { user } = useAuth({})

  const queryParams = new URLSearchParams()
  if (year) queryParams.append('year', year.toString())
  if (userId) queryParams.append('user_id', userId.toString())

  const queryString = queryParams.toString()
  const endpoint = `/api/leave-quotas${queryString ? `?${queryString}` : ''}`

  const { data, error, mutate, isLoading } = useSWR<LeaveQuotaResponse>(
    user ? endpoint : null,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    },
  )

  // CRUD operations
  const createLeaveQuota = async (quotaData: CreateLeaveQuotaRequest) => {
    try {
      const response = await axios.post('/api/leave-quotas', quotaData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error('Error creating leave quota:', error)
      throw error
    }
  }

  const updateLeaveQuota = async (
    id: number,
    quotaData: UpdateLeaveQuotaRequest,
  ) => {
    try {
      const response = await axios.put(`/api/leave-quotas/${id}`, quotaData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error('Error updating leave quota:', error)
      throw error
    }
  }

  const generateYearlyQuotas = async (
    requestData: GenerateYearlyQuotasRequest,
  ) => {
    try {
      const response = await axios.post(
        '/api/leave-quotas/generate',
        requestData,
      )
      mutate() // Revalidate the cache
      return response.data as GenerateYearlyQuotasResponse
    } catch (error) {
      console.error('Error generating yearly quotas:', error)
      throw error
    }
  }

  return {
    leaveQuotas: data?.data || [],
    isLoading,
    isError: error,
    mutate,
    createLeaveQuota,
    updateLeaveQuota,
    generateYearlyQuotas,
  }
}

// Hook for fetching a single leave quota
export const useLeaveQuota = (id: number | null) => {
  const { data, error, mutate } = useSWR<{
    status: boolean
    message: string
    data: LeaveQuota
  }>(
    id ? `/api/leave-quotas/${id}` : null,
    id
      ? () => axios.get(`/api/leave-quotas/${id}`).then(res => res.data)
      : null,
  )

  return {
    leaveQuota: data?.data,
    isLoading: id && !error && !data,
    isError: error,
    mutate,
  }
}

// Hook for current user's leave quota
export const useMyLeaveQuota = (year?: number) => {
  const { user } = useAuth({})
  const currentYear = year ?? new Date().getFullYear()

  const queryParams = new URLSearchParams()
  queryParams.append('year', currentYear.toString())
  if (user?.id) {
    queryParams.append('user_id', user.id.toString())
  }

  const endpoint = `/api/leave-quotas?${queryParams.toString()}`

  const { data, error, mutate, isLoading } = useSWR<LeaveQuotaResponse>(
    user ? endpoint : null,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000,
    },
  )

  // Get leave quota summary for current user
  const getLeaveQuotaSummary = (): LeaveQuotaSummary | null => {
    if (!data?.data || !user) {
      return null
    }

    const userQuota = data.data.find(quota => quota.user_id === user.id)

    if (!userQuota) {
      return {
        total: 0,
        used: 0,
        remaining: 0,
        year: currentYear,
        usagePercentage: 0,
      }
    }

    const usagePercentage =
      userQuota.total_quota > 0
        ? (userQuota.used_quota / userQuota.total_quota) * 100
        : 0

    return {
      total: userQuota.total_quota,
      used: userQuota.used_quota,
      remaining: userQuota.remaining_quota,
      year: userQuota.year,
      usagePercentage: Math.round(usagePercentage),
    }
  }

  // Get the full leave quota object for current user
  const getUserLeaveQuota = (): LeaveQuota | null => {
    if (!data?.data || !user) {
      return null
    }
    return data.data.find(quota => quota.user_id === user.id) || null
  }

  return {
    leaveQuotaData: data?.data || [],
    leaveQuotaSummary: getLeaveQuotaSummary(),
    userLeaveQuota: getUserLeaveQuota(),
    isLoading,
    isError: error,
    mutate,
  }
}
