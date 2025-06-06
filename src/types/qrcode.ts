// src/types/qrcode.ts

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

export interface QrScannerProps {
  onScanSuccess: (data: string) => void
  onScanError: (error: string) => void
  onClose: () => void
  isOpen: boolean
}

export type { IDetectedBarcode } from '@yudiel/react-qr-scanner'

export interface AttendanceMethodModalProps {
  isOpen: boolean
  onClose: () => void
  clockType: 'in' | 'out'
  onSuccess: (attendanceId: number) => void
}
