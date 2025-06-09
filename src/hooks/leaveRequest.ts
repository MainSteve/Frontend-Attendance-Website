// src/hooks/leaveRequest.ts

import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/auth';
import { toast } from 'react-hot-toast';
import {
  LeaveRequestResponse,
  LeaveRequestDetailResponse,
  LeaveQuotaSummaryResponse,
  LeaveRequest,
  CreateLeaveRequestData,
  AddProofsData,
  UpdateStatusData,
  ProofUrlResponse,
  LeaveRequestFilters,
} from '@/types/LeaveRequest';

// Hook for fetching leave requests with filters
export const useLeaveRequests = (filters?: LeaveRequestFilters) => {
  const { user } = useAuth({});
  
  const queryParams = new URLSearchParams();
  if (filters?.user_id) queryParams.append('user_id', filters.user_id.toString());
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.start_date) queryParams.append('start_date', filters.start_date);
  if (filters?.end_date) queryParams.append('end_date', filters.end_date);
  if (filters?.year) queryParams.append('year', filters.year.toString());
  if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by);
  if (filters?.sort_direction) queryParams.append('sort_direction', filters.sort_direction);
  if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());
  if (filters?.page) queryParams.append('page', filters.page.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/leave-requests${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<LeaveRequestResponse>(
    user ? endpoint : null,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    leaveRequests: data?.data?.data || [],
    pagination: data?.data ? {
      current_page: data.data.current_page,
      last_page: data.data.last_page,
      per_page: data.data.per_page,
      total: data.data.total,
      from: data.data.from,
      to: data.data.to,
    } : null,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for fetching single leave request detail
export const useLeaveRequest = (id: number | null) => {
  const { user } = useAuth({});

  const { data, error, mutate, isLoading } = useSWR<LeaveRequestDetailResponse>(
    user && id ? `/api/leave-requests/${id}` : null,
    () => axios.get(`/api/leave-requests/${id}`).then(res => res.data),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    leaveRequest: data?.data || null,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for leave quota summary
export const useLeaveQuotaSummary = (userId?: number, year?: number) => {
  const { user } = useAuth({});
  const currentYear = year ?? new Date().getFullYear();
  
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('user_id', userId.toString());
  if (year) queryParams.append('year', year.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/api/leave-summary${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<LeaveQuotaSummaryResponse>(
    user ? endpoint : null,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    quotaSummary: data?.data || null,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for leave request actions
export const useLeaveRequestActions = () => {
  const { mutate } = useSWRConfig();
  const { user } = useAuth({});

  const createLeaveRequest = async (data: CreateLeaveRequestData) => {
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('start_date', data.start_date);
      formData.append('end_date', data.end_date);
      
      if (data.reason) formData.append('reason', data.reason);
      if (data.user_id) formData.append('user_id', data.user_id.toString());
      if (data.status) formData.append('status', data.status);

      // Add proof files
      if (data.proofs && data.proofs.length > 0) {
        data.proofs.forEach((file, index) => {
          formData.append(`proofs[${index}]`, file);
        });
      }

      // Add proof descriptions
      if (data.proof_descriptions && data.proof_descriptions.length > 0) {
        data.proof_descriptions.forEach((description, index) => {
          if (description) {
            formData.append(`proof_descriptions[${index}]`, description);
          }
        });
      }

      const response = await axios.post('/api/leave-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Revalidate related data
      mutate('/api/leave-requests');
      mutate('/api/leave-summary');
      
      toast.success('Leave request created successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create leave request';
      toast.error(message);
      throw error;
    }
  };

  const addProofs = async (leaveRequestId: number, data: AddProofsData) => {
    try {
      const formData = new FormData();
      
      data.proofs.forEach((file, index) => {
        formData.append(`proofs[${index}]`, file);
      });

      if (data.proof_descriptions && data.proof_descriptions.length > 0) {
        data.proof_descriptions.forEach((description, index) => {
          if (description) {
            formData.append(`proof_descriptions[${index}]`, description);
          }
        });
      }

      const response = await axios.post(`/api/leave-requests/${leaveRequestId}/proofs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Revalidate data
      mutate(`/api/leave-requests/${leaveRequestId}`);
      mutate('/api/leave-requests');
      
      toast.success('Proof files uploaded successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload proof files';
      toast.error(message);
      throw error;
    }
  };

  const cancelLeaveRequest = async (id: number) => {
    try {
      const response = await axios.post(`/api/leave-requests/${id}/cancel`);
      
      // Revalidate data
      mutate(`/api/leave-requests/${id}`);
      mutate('/api/leave-requests');
      mutate('/api/leave-summary');
      
      toast.success('Leave request cancelled successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel leave request';
      toast.error(message);
      throw error;
    }
  };

  const updateLeaveRequestStatus = async (id: number, data: UpdateStatusData) => {
    try {
      const response = await axios.post(`/api/leave-requests/${id}/status`, data);
      
      // Revalidate data
      mutate(`/api/leave-requests/${id}`);
      mutate('/api/leave-requests');
      mutate('/api/leave-summary');
      
      toast.success('Leave request status updated successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update leave request status';
      toast.error(message);
      throw error;
    }
  };

  const deleteLeaveRequest = async (id: number) => {
    try {
      const response = await axios.delete(`/api/leave-requests/${id}`);
      
      // Revalidate data
      mutate('/api/leave-requests');
      mutate('/api/leave-summary');
      
      toast.success('Leave request deleted successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete leave request';
      toast.error(message);
      throw error;
    }
  };

  const deleteProof = async (proofId: number) => {
    try {
      const response = await axios.delete(`/api/leave-request-proofs/${proofId}`);
      
      // Revalidate related data
      mutate('/api/leave-requests');
      
      toast.success('Proof file deleted successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete proof file';
      toast.error(message);
      throw error;
    }
  };

  const getProofUrl = async (proofId: number, expiresIn: number = 60): Promise<ProofUrlResponse> => {
    try {
      const response = await axios.get(`/api/leave-request-proofs/${proofId}/url`, {
        params: { expires_in: expiresIn }
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get proof file URL';
      toast.error(message);
      throw error;
    }
  };

  const verifyProof = async (proofId: number) => {
    try {
      const response = await axios.post(`/api/leave-request-proofs/${proofId}/verify`);
      
      // Revalidate data
      mutate('/api/leave-requests');
      
      toast.success('Proof verified successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to verify proof';
      toast.error(message);
      throw error;
    }
  };

  return {
    createLeaveRequest,
    addProofs,
    cancelLeaveRequest,
    updateLeaveRequestStatus,
    deleteLeaveRequest,
    deleteProof,
    getProofUrl,
    verifyProof,
  };
};

// Utility hook for leave request statistics
export const useLeaveRequestStats = (userId?: number) => {
  const { leaveRequests } = useLeaveRequests({ 
    user_id: userId,
    per_page: 1000 // Get all records for stats
  });

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === 'pending').length,
    approved: leaveRequests.filter(req => req.status === 'approved').length,
    rejected: leaveRequests.filter(req => req.status === 'rejected').length,
    sakit: leaveRequests.filter(req => req.type === 'sakit').length,
    cuti: leaveRequests.filter(req => req.type === 'cuti').length,
    withProofs: leaveRequests.filter(req => req.has_proofs).length,
    withoutProofs: leaveRequests.filter(req => !req.has_proofs).length,
  };

  return stats;
};