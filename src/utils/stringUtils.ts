export const capitalizeFirstLetter = (string: string): string => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const capitalizeWords = (string: string): string => {
  if (!string) return ''
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const toTitleCase = (string: string): string => {
  if (!string) return ''
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const normalizeSpaces = (string: string): string => {
  if (!string) return ''
  return string.replace(/\s+/g, ' ').trim()
}

// Convert to slug format (for URLs)
export const toSlug = (string: string): string => {
  if (!string) return ''
  return string
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Truncate string with ellipsis
export const truncate = (string: string, length: number): string => {
  if (!string) return ''
  return string.length > length ? string.substring(0, length) + '...' : string
}

// Remove all special characters
export const removeSpecialChars = (string: string): string => {
  if (!string) return ''
  return string.replace(/[^a-zA-Z0-9 ]/g, '')
}

// Count words in string
export const wordCount = (string: string): number => {
  if (!string) return 0
  return string.trim().split(/\s+/).length
}

// Check if string contains only numbers
export const isNumeric = (string: string): boolean => {
  if (!string) return false
  return /^\d+$/.test(string)
}

// Format number with thousand separator
export const formatNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Convert newlines to HTML breaks
export const nlToBr = (string: string): string => {
  if (!string) return ''
  return string.replace(/\n/g, '<br />')
}

// Extract first n characters
export const firstChars = (string: string, n: number): string => {
  if (!string) return ''
  return string.substring(0, n)
}

// Extract last n characters
export const lastChars = (string: string, n: number): string => {
  if (!string) return ''
  return string.slice(-n)
}

// Mask string (e.g., for passwords or credit cards)
export const maskString = (
  string: string,
  visibleChars: number = 4,
): string => {
  if (!string) return ''
  return '*'.repeat(string.length - visibleChars) + string.slice(-visibleChars)
}

// Reverse string
export const reverseString = (string: string): string => {
  if (!string) return ''
  return string.split('').reverse().join('')
}

// Check if string is palindrome
export const isPalindrome = (string: string): boolean => {
  if (!string) return false
  const normalized = string.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalized === normalized.split('').reverse().join('')
}

// Extract initials from name
export const getInitials = (name: string): string => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
}
