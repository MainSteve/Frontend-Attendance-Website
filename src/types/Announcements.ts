// src/types/Announcements.ts

export interface AnnouncementDepartment {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreatorDepartment {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreator {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'employee';
  position: string | null;
  department_id: number | null;
  department: AnnouncementCreatorDepartment | null;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  importance_level: number;
  importance_level_text: string;
  created_by: number;
  expires_at: string;
  expires_at_human: string;
  days_remaining: number;
  is_active: boolean;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
  departments: AnnouncementDepartment[];
  creator: AnnouncementCreator;
}

export interface AnnouncementsResponse {
  data: Announcement[];
}

export interface AnnouncementSummary {
  total: number;
  active: number;
  expired: number;
  critical: number;
  byImportance: {
    low: number;
    medium: number;
    high: number;
  };
}

export type ImportanceLevel = 1 | 2 | 3;

export interface ImportanceLevelConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}