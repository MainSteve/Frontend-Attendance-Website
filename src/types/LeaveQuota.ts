import { UserType } from "./User"; 

export interface LeaveQuota {
  id: number;
  user_id: number;
  year: number;
  total_quota: number;
  used_quota: number;
  remaining_quota: number;
  created_at: string;
  updated_at: string;
  user: UserType;
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