// src/hooks/useQrCode.ts

import { useState } from 'react'
import { QrProcessResponse } from '@/types/qrcode'

interface UseQrCodeOptions {
  onSuccess?: (attendanceId: number) => void
  onError?: (error: string) => void
}

export const useQrCode = (options?: UseQrCodeOptions) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get auth headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('authToken') ?? sessionStorage.getItem('authToken')
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }

  // Process QR code token
  const processQrCode = async (token: string): Promise<number | null> => {
    try {
      setIsProcessing(true)
      setError(null)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/attendance/qr-api/${token}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ?? `HTTP error! status: ${response.status}`,
        )
      }

      const result: QrProcessResponse = await response.json()

      if (!result.status) {
        throw new Error(result.message || 'QR code processing failed')
      }

      const attendanceId = result.data?.id
      if (attendanceId) {
        options?.onSuccess?.(attendanceId)
        return attendanceId
      } else {
        throw new Error('No attendance ID returned')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      setError(errorMessage)
      options?.onError?.(errorMessage)
      console.error('QR code processing error:', error)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  // Extract token from QR URL
  const extractTokenFromUrl = (qrData: string): string | null => {
    try {
      // Expected format: {baseUrl}/api/attendance/qr/{token}
      const url = new URL(qrData)
      const pathParts = url.pathname.split('/')

      // Find 'qr' in the path and get the next part as token
      const qrIndex = pathParts.findIndex(part => part === 'qr')
      if (qrIndex !== -1 && qrIndex < pathParts.length - 1) {
        return pathParts[qrIndex + 1]
      }

      // If not a URL, assume it's just the token
      if (!qrData.startsWith('http')) {
        return qrData
      }

      return null
    } catch (error) {
      console.error('Error extracting token from QR data:', error)
      return qrData
    }
  }

  // Handle QR scan result
  const handleQrScan = async (qrData: string): Promise<number | null> => {
    const token = extractTokenFromUrl(qrData)

    if (!token) {
      const errorMessage = 'Invalid QR code format'
      setError(errorMessage)
      options?.onError?.(errorMessage)
      return null
    }

    return await processQrCode(token)
  }

  return {
    processQrCode,
    handleQrScan,
    extractTokenFromUrl,
    isProcessing,
    error,
    setError,
  }
}
