// src/types/LeaveQuota.ts

export interface LeaveQuotaUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'employee';
  position: string | null;
  department_id: number | null;
}

export interface LeaveQuota {
  id: number;
  user_id: number;
  year: number;
  total_quota: number;
  used_quota: number;
  remaining_quota: number;
  created_at: string;
  updated_at: string;
  user: LeaveQuotaUser;
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