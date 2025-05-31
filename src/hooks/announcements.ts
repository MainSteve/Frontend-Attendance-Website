// src/hooks/announcements.ts

import useSWR from 'swr';
import axios from '@/lib/axios';
import { 
  AnnouncementsResponse,
  AnnouncementSummary,
  ImportanceLevelConfig,
  ImportanceLevel,
  Announcement
} from '@/types/Announcements';
import { useAuth } from '@/hooks/auth';

// Configuration for importance levels
export const importanceLevelConfig: Record<ImportanceLevel, ImportanceLevelConfig> = {
  1: {
    label: 'Low',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: '📋',
  },
  2: {
    label: 'Medium',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '⚠️',
  },
  3: {
    label: 'High',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '🚨',
  },
};

// Hook for fetching announcements
export const useAnnouncements = () => {
  const { user } = useAuth({});

  const { data, error, mutate, isLoading } = useSWR<AnnouncementsResponse>(
    user ? '/api/announcements/my-department' : null,
    () => axios.get('/api/announcements/my-department').then(res => res.data),
    {
      revalidateOnFocus: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Process announcements data
  const getAnnouncementSummary = (): AnnouncementSummary => {
    if (!data?.data) {
      return {
        total: 0,
        active: 0,
        expired: 0,
        critical: 0,
        byImportance: { low: 0, medium: 0, high: 0 },
      };
    }

    const announcements = data.data;
    const total = announcements.length;
    const active = announcements.filter(a => a.is_active && a.is_valid).length;
    const expired = announcements.filter(a => !a.is_valid || a.days_remaining <= 0).length;
    const critical = announcements.filter(a => a.days_remaining <= 2 && a.is_valid).length;

    const byImportance = {
      low: announcements.filter(a => a.importance_level === 1).length,
      medium: announcements.filter(a => a.importance_level === 2).length,
      high: announcements.filter(a => a.importance_level === 3).length,
    };

    return {
      total,
      active,
      expired,
      critical,
      byImportance,
    };
  };

  // Sort announcements by importance and recency
  const getSortedAnnouncements = (): Announcement[] => {
    if (!data?.data) return [];

    return [...data.data].sort((a, b) => {
      // First sort by validity (valid first)
      if (a.is_valid !== b.is_valid) {
        return a.is_valid ? -1 : 1;
      }

      // Then by importance (higher first)
      if (a.importance_level !== b.importance_level) {
        return b.importance_level - a.importance_level;
      }

      // Then by days remaining (urgent first)
      if (a.days_remaining !== b.days_remaining) {
        return a.days_remaining - b.days_remaining;
      }

      // Finally by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // Get announcements expiring soon
  const getUrgentAnnouncements = (): Announcement[] => {
    if (!data?.data) return [];

    return data.data.filter(a => 
      a.is_valid && 
      a.is_active && 
      a.days_remaining <= 3 && 
      a.days_remaining > 0
    );
  };

  // Format announcement content for preview
  const getPreviewContent = (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Get importance level configuration
  const getImportanceConfig = (level: number): ImportanceLevelConfig => {
    return importanceLevelConfig[level as ImportanceLevel] ?? importanceLevelConfig[1];
  };

  // Check if announcement is expiring soon
  const isExpiringSoon = (announcement: Announcement): boolean => {
    return announcement.is_valid && announcement.days_remaining <= 3 && announcement.days_remaining > 0;
  };

  // Check if announcement is expired
  const isExpired = (announcement: Announcement): boolean => {
    return !announcement.is_valid || announcement.days_remaining <= 0;
  };

  return {
    announcements: data?.data ?? [],
    sortedAnnouncements: getSortedAnnouncements(),
    urgentAnnouncements: getUrgentAnnouncements(),
    announcementSummary: getAnnouncementSummary(),
    isLoading,
    isError: error,
    mutate,
    // Utility functions
    getPreviewContent,
    getImportanceConfig,
    isExpiringSoon,
    isExpired,
  };
};

// Hook for announcement actions (if needed for future features)
export const useAnnouncementActions = () => {
  const markAsRead = async (announcementId: number) => {
    // TODO: Implement mark as read functionality
    console.log('Mark as read:', announcementId);
  };

  const shareAnnouncement = async (announcementId: number) => {
    // TODO: Implement share functionality
    console.log('Share announcement:', announcementId);
  };

  return {
    markAsRead,
    shareAnnouncement,
  };
};