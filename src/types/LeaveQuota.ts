// src/types/LeaveQuota.ts

import { UserType } from './User'

export interface LeaveQuota {
  id: number
  user_id: number
  year: number
  total_quota: number
  used_quota: number
  remaining_quota: number
  created_at: string
  updated_at: string
  user?: UserType // Make user optional since it might not always be included
}

export interface LeaveQuotaResponse {
  status: boolean
  message: string
  data: LeaveQuota[]
}

export interface SingleLeaveQuotaResponse {
  status: boolean
  message: string
  data: LeaveQuota
}

export interface LeaveQuotaSummary {
  total: number
  used: number
  remaining: number
  year: number
  usagePercentage: number
}

// Request types for API calls
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

// Error response type
export interface LeaveQuotaErrorResponse {
  status: false
  message: string
  errors?: Record<string, string[]>
}
