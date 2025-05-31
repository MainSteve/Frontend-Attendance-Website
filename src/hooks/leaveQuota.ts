// src/hooks/leaveQuota.ts

import useSWR from 'swr';
import axios from '@/lib/axios';
import { 
  LeaveQuotaResponse,
  LeaveQuotaSummary,
  LeaveQuota
} from '@/types/LeaveQuota';
import { useAuth } from '@/hooks/auth';

// Hook for fetching leave quota data
export const useLeaveQuota = (year?: number) => {
  const { user } = useAuth({});
  const currentYear = year ?? new Date().getFullYear();

  const { data, error, mutate, isLoading } = useSWR<LeaveQuotaResponse>(
    user ? `/api/leave-quotas?year=${currentYear}` : null,
    () => axios.get('/api/leave-quotas', {
      params: { year: currentYear }
    }).then(res => res.data),
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

    // Find the leave quota for the current user
    const userQuota = data.data.find(quota => quota.user_id === user.id);
    
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
    return data.data.find(quota => quota.user_id === user.id) || null;
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

// Hook for leave quota actions (if needed for future features)
export const useLeaveQuotaActions = () => {
  // This can be extended later for leave request functionality
  const applyForLeave = async () => {
    // TODO: Implement leave application logic
    console.log('Navigate to leave application form');
  };

  return {
    applyForLeave,
  };
};