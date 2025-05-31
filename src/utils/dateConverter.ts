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
  });
};

// Get day name from date
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long'
  });
};

// Format date with day name
export const formatDateWithDay = (date: Date): string => {
  const dayName = getDayName(date);
  const formattedDate = formatDate(date);
  return `${dayName}, ${formattedDate}`;
};

// Get only time from date
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Format date without time
export const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('en-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format date with day name but no time
export const formatDateWithDayOnly = (date: Date): string => {
  const dayName = getDayName(date);
  const formattedDate = formatDateOnly(date);
  return `${dayName}, ${formattedDate}`;
};

// Usage example:
// const utcDate = "2025-05-31T10:00:00Z";
// const formattedDate = formatDate(localDate);                    // "May 31, 2025, 17:00:00"
// const dayName = getDayName(localDate);                         // "Saturday"
// const fullFormat = formatDateWithDay(localDate);               // "Saturday, May 31, 2025, 17:00:00"
// const timeOnly = formatTime(localDate);                        // "17:00:00"
// const dateOnly = formatDateOnly(localDate);                    // "May 31, 2025"
// const dateWithDayOnly = formatDateWithDayOnly(localDate);      // "Saturday, May 31, 2025"