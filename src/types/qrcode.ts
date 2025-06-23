export interface QrToken {
  token: string
  qr_url: string
  expires_at: string
  expires_in_minutes: number
}

export interface QrGenerateRequest {
  clock_type: 'in' | 'out'
  location: string
  expiry_minutes?: number
}

export interface QrGenerateResponse {
  status: boolean
  message: string
  data: QrToken
}

export interface QrProcessResponse {
  status: boolean
  message: string
  data?: {
    id: number
    user_id: number
    clock_type: 'in' | 'out'
    location: string
    method: 'qr_code'
    created_at: string
    updated_at: string
  }
}

// Extended types for admin QR Generator
export interface QrGeneratorSettings {
  clock_type: 'in' | 'out'
  location: string
  expiry_minutes: number
  auto_regenerate: boolean
  auto_regenerate_interval: number // seconds
}

export interface QrCodeDisplayData {
  token: string
  qr_url: string
  expires_at: string
  expires_in_minutes: number
  generated_at: string
  clock_type: 'in' | 'out'
  location: string
}

export interface QrCodeGenerationStatus {
  isGenerating: boolean
  isActive: boolean
  timeRemaining: number // seconds
  scannedCount: number
}

// QR Code generation options for qrcode-with-logos library
export interface QrCodeOptions {
  text: string
  width?: number
  height?: number
  colorDark?: string
  colorLight?: string
  correctLevel?: number // 0-3 (L, M, Q, H)
  quietZone?: number
  quietZoneColor?: string
  logo?: {
    src: string
    width?: number
    height?: number
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    bgColor?: string
  }
  backgroundImage?: {
    src: string
    width?: number
    height?: number
  }
  onRenderingStart?: () => void
  onRenderingEnd?: () => void
}

// Error types
export interface QrCodeError {
  code: string
  message: string
  details?: any
}

// Statistics for QR code usage
export interface QrCodeStatistics {
  total_generated: number
  total_scanned: number
  active_codes: number
  expired_codes: number
  scan_success_rate: number
  average_scan_time: number // minutes
  most_used_location: string
  peak_usage_hour: number
}

// QR Scanner props (for future scanner component)
export interface QrScannerProps {
  onScanSuccess: (data: string) => void
  onScanError: (error: string) => void
  onClose: () => void
  isOpen: boolean
}

// Attendance method modal props
export interface AttendanceMethodModalProps {
  isOpen: boolean
  onClose: () => void
  clockType: 'in' | 'out'
  onSuccess: (attendanceId: number) => void
}

// Re-export from @yudiel/react-qr-scanner if needed
export type { IDetectedBarcode } from '@yudiel/react-qr-scanner'
