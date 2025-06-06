// Format date to readable string
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

// Get day name from date
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  })
}

// Format date with day name
export const formatDateWithDay = (date: Date): string => {
  const dayName = getDayName(date)
  const formattedDate = formatDate(date)
  return `${dayName}, ${formattedDate}`
}

// Get only time from date
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Format date without time
export const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('en-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date with day name but no time
export const formatDateWithDayOnly = (date: Date): string => {
  const dayName = getDayName(date)
  const formattedDate = formatDateOnly(date)
  return `${dayName}, ${formattedDate}`
}

// Usage example:
// const utcDate = "2025-05-31T10:00:00Z";
// const formattedDate = formatDate(localDate);                    // "May 31, 2025, 17:00:00"
// const dayName = getDayName(localDate);                         // "Saturday"
// const fullFormat = formatDateWithDay(localDate);               // "Saturday, May 31, 2025, 17:00:00"
// const timeOnly = formatTime(localDate);                        // "17:00:00"
// const dateOnly = formatDateOnly(localDate);                    // "May 31, 2025"
// const dateWithDayOnly = formatDateWithDayOnly(localDate);      // "Saturday, May 31, 2025"

// Add these functions to your existing src/utils/dateConverter.ts

/**
 * Parse date string and format with Jakarta timezone (full date + time)
 * @param dateString - ISO date string from API (e.g., "2025-05-31T10:00:00Z")
 * @returns Formatted string (e.g., "May 31, 2025, 17:00:00")
 */
export const parseAndFormatJakartaDate = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDate(date)
}

/**
 * Parse date string and format time only with Jakarta timezone
 * @param dateString - ISO date string from API (e.g., "2025-05-31T10:00:00Z")
 * @returns Formatted time string (e.g., "17:00:00")
 */
export const parseAndFormatJakartaTime = (dateString: string): string => {
  const date = new Date(dateString)
  return formatTime(date)
}

/**
 * Parse date string and format date only with Jakarta timezone
 * @param dateString - ISO date string from API (e.g., "2025-05-31T10:00:00Z")
 * @returns Formatted date string (e.g., "May 31, 2025")
 */
export const parseAndFormatJakartaDateOnly = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDateOnly(date)
}

/**
 * Parse date string and format with day name + date (no time) with Jakarta timezone
 * @param dateString - ISO date string from API (e.g., "2025-05-31T10:00:00Z")
 * @returns Formatted string (e.g., "Saturday, May 31, 2025")
 */
export const parseAndFormatJakartaDateWithDay = (
  dateString: string,
): string => {
  const date = new Date(dateString)
  return formatDateWithDayOnly(date)
}

// Updated usage examples:
//
// FROM API STRING:
// const apiDateString = "2025-05-31T10:00:00Z";
//
// parseAndFormatJakartaDate(apiDateString);        // "May 31, 2025, 17:00:00"
// parseAndFormatJakartaTime(apiDateString);        // "17:00:00"
// parseAndFormatJakartaDateOnly(apiDateString);    // "May 31, 2025"
// parseAndFormatJakartaDateWithDay(apiDateString); // "Saturday, May 31, 2025"
//
// FROM DATE OBJECT (existing functions):
// const dateObj = new Date();
// formatDate(dateObj);                // "May 31, 2025, 17:00:00"
// formatTime(dateObj);                // "17:00:00"
// formatDateOnly(dateObj);            // "May 31, 2025"
// formatDateWithDayOnly(dateObj);     // "Saturday, May 31, 2025"
