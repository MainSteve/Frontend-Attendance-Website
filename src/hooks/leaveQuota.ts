// src/hooks/leaveQuota.ts

import useSWR from 'swr';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/auth';

// Updated interfaces for Laravel LeaveQuota model
export interface LeaveQuota {
  id: number;
  user_id: number;
  year: number;
  total_quota: number;
  used_quota: number;
  remaining_quota: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    position?: string;
  };
}

export interface LeaveQuotaResponse {
  status: boolean;
  message: string;
  data: LeaveQuota[];
}

export interface LeaveQuotaSummary {
  total: number;
  used: number;
  remaining: number;
  year: number;
  usagePercentage: number;
}

// Hook for fetching leave quota data using LeaveQuotaController
export const useLeaveQuota = (year?: number, userId?: number) => {
  const { user } = useAuth({});
  const currentYear = year ?? new Date().getFullYear();

  const queryParams = new URLSearchParams();
  if (year) queryParams.append('year', year.toString());
  if (userId) queryParams.append('user_id', userId.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/api/leave-quotas${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<LeaveQuotaResponse>(
    user ? endpoint : null,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Process leave quota data for the current user
  const getLeaveQuotaSummary = (): LeaveQuotaSummary | null => {
    if (!data?.data || !user) {
      return null;
    }

    // Find the leave quota for the current user (or specified user)
    const targetUserId = userId || user.id;
    const userQuota = data.data.find(quota => quota.user_id === targetUserId);
    
    if (!userQuota) {
      return {
        total: 0,
        used: 0,
        remaining: 0,
        year: currentYear,
        usagePercentage: 0,
      };
    }

    const usagePercentage = userQuota.total_quota > 0 
      ? (userQuota.used_quota / userQuota.total_quota) * 100 
      : 0;

    return {
      total: userQuota.total_quota,
      used: userQuota.used_quota,
      remaining: userQuota.remaining_quota,
      year: userQuota.year,
      usagePercentage: Math.round(usagePercentage),
    };
  };

  // Get the full leave quota object for the current user
  const getUserLeaveQuota = (): LeaveQuota | null => {
    if (!data?.data || !user) {
      return null;
    }
    const targetUserId = userId || user.id;
    return data.data.find(quota => quota.user_id === targetUserId) || null;
  };

  return {
    leaveQuotaData: data?.data || [],
    leaveQuotaSummary: getLeaveQuotaSummary(),
    userLeaveQuota: getUserLeaveQuota(),
    isLoading,
    isError: error,
    mutate,
  };
};