import { UserType } from './User';

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequestProof {
  id: number;
  leave_request_id: number;
  filename: string;
  path: string;
  disk: string;
  mime_type: string;
  size: number;
  description?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: number;
  created_at: string;
  updated_at: string;
  url: string;
  human_readable_size: string;
  verifier?: UserType;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  type: 'sakit' | 'cuti';
  reason?: string;
  start_date: string;
  end_date: string;
  status: LeaveRequestStatus;
  created_at: string;
  duration: number;
  has_proofs: boolean;
  proofs_count: number;
  user: UserType;
  proofs: LeaveRequestProof[];
}

export interface LeaveRequestResponse {
  status: boolean;
  message: string;
  data: {
    data: LeaveRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface LeaveRequestDetailResponse {
  status: boolean;
  message: string;
  data: LeaveRequest;
}

export interface LeaveQuotaSummaryData {
  user: UserType;
  year: number;
  quota: {
    total: number;
    used: number;
    remaining: number;
    percentage_used: number;
  };
  leave_counts: {
    by_status: {
      pending: number;
      approved: number;
      rejected: number;
    };
    by_type: {
      sakit: number;
      cuti: number;
    };
  };
  leave_days: {
    sakit: number;
    cuti: number;
    total: number;
  };
  upcoming_leaves: LeaveRequest[];
}

export interface LeaveQuotaSummaryResponse {
  status: boolean;
  message: string;
  data: LeaveQuotaSummaryData;
}

export interface CreateLeaveRequestData {
  type: 'sakit' | 'cuti';
  reason?: string;
  start_date: string;
  end_date: string;
  proofs?: File[];
  proof_descriptions?: string[];
  user_id?: number; // For admin
  status?: LeaveRequestStatus; // For admin
}

export interface AddProofsData {
  proofs: File[];
  proof_descriptions?: string[];
}

export interface UpdateStatusData {
  status: LeaveRequestStatus;
}

export interface ProofUrlResponse {
  status: boolean;
  message: string;
  data: {
    url: string;
    expires_in_minutes: number;
    expires_at: string;
  };
}

export interface LeaveRequestFilters {
  user_id?: number;
  status?: 'pending' | 'approved' | 'rejected';
  type?: 'sakit' | 'cuti';
  start_date?: string;
  end_date?: string;
  year?: number;
  sort_by?: 'created_at' | 'start_date' | 'end_date' | 'status' | 'type';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}