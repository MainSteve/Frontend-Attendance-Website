export const formatDate = (date: Date): string => {
  return date.toLocaleString('en-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  })
}

export const formatDateWithDay = (date: Date): string => {
  const dayName = getDayName(date)
  const formattedDate = formatDate(date)
  return `${dayName}, ${formattedDate}`
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('en-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateWithDayOnly = (date: Date): string => {
  const dayName = getDayName(date)
  const formattedDate = formatDateOnly(date)
  return `${dayName}, ${formattedDate}`
}

export const parseAndFormatJakartaDate = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDate(date)
}

export const parseAndFormatJakartaTime = (dateString: string): string => {
  const date = new Date(dateString)
  return formatTime(date)
}

export const parseAndFormatJakartaDateOnly = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDateOnly(date)
}

export const parseAndFormatJakartaDateWithDay = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDateWithDayOnly(date)
}

// Additional Leave System Utilities

/**
 * Format date for leave requests (Indonesian locale, date only)
 */
export const formatLeaveDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format date to short format (DD/MM/YYYY)
 */
export const formatDateShort = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format date for input type="date" (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return formatDateForInput(new Date());
};

/**
 * Calculate duration between two dates (inclusive)
 */
export const calculateDuration = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // Include both start and end date
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Calculate working days between two dates (excluding weekends)
 */
export const calculateWorkingDays = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  let workingDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

/**
 * Validate date range for leave request
 */
export const validateDateRange = (
  startDate: string, 
  endDate: string, 
  minStartDate?: string
): { isValid: boolean; error?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const minDate = minStartDate ? new Date(minStartDate) : today;
  
  // Check if start date is before minimum allowed date
  if (start < minDate) {
    return {
      isValid: false,
      error: `Start date cannot be before ${formatLeaveDate(minDate)}`
    };
  }
  
  // Check if end date is before start date
  if (end < start) {
    return {
      isValid: false,
      error: 'End date cannot be before start date'
    };
  }
  
  // Check if duration is reasonable (e.g., not more than 90 days)
  const duration = calculateDuration(start, end);
  if (duration > 90) {
    return {
      isValid: false,
      error: 'Leave duration cannot exceed 90 days'
    };
  }
  
  return { isValid: true };
};

/**
 * Generate date range options for filters
 */
export const getDateRangeOptions = () => {
  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();
  
  return [
    {
      label: 'This Month',
      start: new Date(thisYear, thisMonth, 1),
      end: new Date(thisYear, thisMonth + 1, 0),
    },
    {
      label: 'Last Month',
      start: new Date(thisYear, thisMonth - 1, 1),
      end: new Date(thisYear, thisMonth, 0),
    },
    {
      label: 'This Quarter',
      start: new Date(thisYear, Math.floor(thisMonth / 3) * 3, 1),
      end: new Date(thisYear, Math.floor(thisMonth / 3) * 3 + 3, 0),
    },
    {
      label: 'This Year',
      start: new Date(thisYear, 0, 1),
      end: new Date(thisYear, 11, 31),
    },
    {
      label: 'Last Year',
      start: new Date(thisYear - 1, 0, 1),
      end: new Date(thisYear - 1, 11, 31),
    },
  ];
};

/**
 * Generate years for filter dropdown
 */
export const getYearOptions = (yearsBack: number = 2, yearsForward: number = 1) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = currentYear - yearsBack; i <= currentYear + yearsForward; i++) {
    years.push(i);
  }
  
  return years;
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if a file is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Check if a file is a PDF
 */
export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

/**
 * Get display name for file type
 */
export const getFileTypeDisplayName = (mimeType: string): string => {
  const typeMap: { [key: string]: string } = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'application/pdf': 'PDF Document',
  };
  
  return typeMap[mimeType] || mimeType;
};

/**
 * Calculate quota usage percentage
 */
export const calculateQuotaUsagePercentage = (used: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
};

/**
 * Get quota status color based on remaining quota
 */
export const getQuotaStatusColor = (remaining: number, total: number) => {
  const percentage = remaining / total;
  
  if (percentage <= 0.1) return 'text-red-600'; // 10% or less
  if (percentage <= 0.3) return 'text-yellow-600'; // 30% or less
  return 'text-green-600';
};

/**
 * Get quota progress color for charts
 */
export const getQuotaProgressColor = (remaining: number, total: number) => {
  const percentage = remaining / total;
  
  if (percentage <= 0.1) return '#dc2626'; // red-600
  if (percentage <= 0.3) return '#d97706'; // yellow-600
  return '#2563eb'; // blue-600
};