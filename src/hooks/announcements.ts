// src/hooks/announcements.ts

import useSWR from 'swr';
import axios from '@/lib/axios';
import { 
  AnnouncementsResponse,
  AnnouncementsPaginatedResponse,
  SingleAnnouncementResponse,
  AnnouncementSummary,
  ImportanceLevelConfig,
  ImportanceLevel,
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementFilters,
  AnnouncementStatistics
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

export const useMyAnnouncements = () => {
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

  return {
    announcements: data?.data ?? [],
    sortedAnnouncements: getSortedAnnouncements(),
    urgentAnnouncements: getUrgentAnnouncements(),
    announcementSummary: getAnnouncementSummary(),
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for admin announcements management with full CRUD
export const useAnnouncementsAdmin = (filters: AnnouncementFilters = {}) => {
  const { user } = useAuth({});
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (filters.show_all !== undefined) queryParams.append('show_all', filters.show_all.toString());
  if (filters.department_ids && filters.department_ids.length > 0) {
    filters.department_ids.forEach(id => queryParams.append('department_ids[]', id.toString()));
  }
  if (filters.importance_level) queryParams.append('importance_level', filters.importance_level.toString());
  if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
  if (filters.page) queryParams.append('page', filters.page.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/api/announcements${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<AnnouncementsPaginatedResponse>(
    user?.role === 'admin' ? endpoint : null,
    () => axios.get(endpoint).then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // CRUD operations
  const createAnnouncement = async (announcementData: CreateAnnouncementRequest) => {
    try {
      const response = await axios.post('/api/announcements', announcementData);
      mutate(); // Revalidate the cache
      return response.data as SingleAnnouncementResponse;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };

  const updateAnnouncement = async (id: number, announcementData: UpdateAnnouncementRequest) => {
    try {
      const response = await axios.put(`/api/announcements/${id}`, announcementData);
      mutate(); // Revalidate the cache
      return response.data as SingleAnnouncementResponse;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    try {
      await axios.delete(`/api/announcements/${id}`);
      mutate(); // Revalidate the cache
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  };

  const toggleActiveStatus = async (id: number) => {
    try {
      const response = await axios.post(`/api/announcements/${id}/toggle-active`);
      mutate(); // Revalidate the cache
      return response.data as SingleAnnouncementResponse;
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      throw error;
    }
  };

  return {
    announcements: data?.data || [],
    pagination: data ? {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
      from: data.from,
      to: data.to,
    } : null,
    isLoading,
    isError: error,
    mutate,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleActiveStatus,
  };
};

// Hook for fetching single announcement
export const useAnnouncement = (id: number | null) => {
  const { data, error, mutate } = useSWR<SingleAnnouncementResponse>(
    id ? `/api/announcements/${id}` : null,
    id ? () => axios.get(`/api/announcements/${id}`).then(res => res.data) : null,
  );

  return {
    announcement: data?.data,
    isLoading: id && !error && !data,
    isError: error,
    mutate,
  };
};

// Hook for admin statistics
export const useAnnouncementStatistics = () => {
  const { user } = useAuth({});

  const { data, error, mutate, isLoading } = useSWR<AnnouncementStatistics>(
    user?.role === 'admin' ? '/api/announcements-statistics' : null,
    () => axios.get('/api/announcements-statistics').then(res => res.data),
    {
      revalidateOnFocus: false,
      refreshInterval: 600000, // Refresh every 10 minutes
    }
  );

  return {
    statistics: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Utility functions
export const getPreviewContent = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

export const getImportanceConfig = (level: number): ImportanceLevelConfig => {
  return importanceLevelConfig[level as ImportanceLevel] ?? importanceLevelConfig[1];
};

export const isExpiringSoon = (announcement: Announcement): boolean => {
  return announcement.is_valid && announcement.days_remaining <= 3 && announcement.days_remaining > 0;
};

export const isExpired = (announcement: Announcement): boolean => {
  return !announcement.is_valid || announcement.days_remaining <= 0;
};

export const getDaysRemainingText = (announcement: Announcement): string => {
  if (!announcement.is_valid || announcement.days_remaining <= 0) {
    return 'Expired';
  }
  
  if (announcement.days_remaining === 1) {
    return '1 day left';
  }
  
  return `${announcement.days_remaining} days left`;
};

export const getStatusColor = (announcement: Announcement): string => {
  if (!announcement.is_active) return 'gray';
  if (isExpired(announcement)) return 'red';
  if (isExpiringSoon(announcement)) return 'yellow';
  return 'green';
};

// Hook for quick announcement operations without full data fetching
export const useAnnouncementOperations = () => {
  const createAnnouncement = async (announcementData: CreateAnnouncementRequest) => {
    try {
      const response = await axios.post('/api/announcements', announcementData);
      return response.data as SingleAnnouncementResponse;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };

  const updateAnnouncement = async (id: number, announcementData: UpdateAnnouncementRequest) => {
    try {
      const response = await axios.put(`/api/announcements/${id}`, announcementData);
      return response.data as SingleAnnouncementResponse;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    try {
      await axios.delete(`/api/announcements/${id}`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  };

  const toggleActiveStatus = async (id: number) => {
    try {
      const response = await axios.post(`/api/announcements/${id}/toggle-active`);
      return response.data as SingleAnnouncementResponse;
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      throw error;
    }
  };

  return {
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleActiveStatus,
  };
};