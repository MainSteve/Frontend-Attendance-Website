// src/hooks/qrcode.ts
// Updated with polling mechanism for auto-regenerate

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from '@/lib/axios'
import {
  QrGenerateRequest,
  QrGenerateResponse,
  QrProcessResponse,
  QrCodeDisplayData,
  QrCodeGenerationStatus,
  QrGeneratorSettings,
  QrCodeStatistics,
  QrCodeError,
} from '@/types/qrcode'
import { useAuth } from '@/hooks/auth'

// Main hook for QR Code generation and management with auto-regenerate
export const useQrCodeGenerator = () => {
  const { user } = useAuth({})
  const [currentQrCode, setCurrentQrCode] = useState<QrCodeDisplayData | null>(
    null,
  )
  const [generationStatus, setGenerationStatus] =
    useState<QrCodeGenerationStatus>({
      isGenerating: false,
      isActive: false,
      timeRemaining: 0,
      scannedCount: 0,
    })
  const [error, setError] = useState<QrCodeError | null>(null)
  const [settings, setSettings] = useState<QrGeneratorSettings>({
    clock_type: 'in',
    location: 'Office Main Entrance',
    expiry_minutes: 10,
    auto_regenerate: false,
    auto_regenerate_interval: 30, // 30 seconds after scan
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoRegenerateRef = useRef<NodeJS.Timeout | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const scanCheckRef = useRef<NodeJS.Timeout | null>(null)
  const lastKnownScanCount = useRef<number>(0)

  // Generate QR Code
  const generateQrCode = useCallback(
    async (customSettings?: Partial<QrGeneratorSettings>) => {
      if (user?.role !== 'admin') {
        setError({
          code: 'UNAUTHORIZED',
          message: 'Only admins can generate QR codes',
        })
        return null
      }

      const requestData: QrGenerateRequest = {
        clock_type: customSettings?.clock_type ?? settings.clock_type,
        location: customSettings?.location ?? settings.location,
        expiry_minutes:
          customSettings?.expiry_minutes ?? settings.expiry_minutes,
      }

      setGenerationStatus(prev => ({ ...prev, isGenerating: true }))
      setError(null)

      try {
        const response = await axios.post('/api/qr-code/generate', requestData)
        const data: QrGenerateResponse = response.data

        if (data.status) {
          const qrCodeData: QrCodeDisplayData = {
            ...data.data,
            generated_at: new Date().toISOString(),
            clock_type: requestData.clock_type,
            location: requestData.location,
          }

          setCurrentQrCode(qrCodeData)
          setGenerationStatus(prev => ({
            ...prev,
            isGenerating: false,
            isActive: true,
            timeRemaining: data.data.expires_in_minutes * 60,
            scannedCount: 0,
          }))

          // Reset scan count tracking
          lastKnownScanCount.current = 0

          // Start countdown timer
          startCountdownTimer(data.data.expires_in_minutes * 60)

          // Start scan monitoring if auto-regenerate is enabled
          if (settings.auto_regenerate) {
            startScanMonitoring(data.data.token)
          }

          console.log('QR Code generated successfully:', qrCodeData)
          return qrCodeData
        } else {
          throw new Error(data.message)
        }
      } catch (error: any) {
        const errorData: QrCodeError = {
          code: error.response?.status?.toString() ?? 'UNKNOWN',
          message:
            error.response?.data?.message ??
            error.message ??
            'Failed to generate QR code',
          details: error.response?.data?.errors,
        }

        setError(errorData)
        setGenerationStatus(prev => ({
          ...prev,
          isGenerating: false,
          isActive: false,
        }))
        return null
      }
    },
    [user, settings],
  )

  // Start countdown timer
  const startCountdownTimer = useCallback(
    (initialSeconds: number) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      let seconds = initialSeconds
      timerRef.current = setInterval(() => {
        seconds -= 1
        setGenerationStatus(prev => ({ ...prev, timeRemaining: seconds }))

        if (seconds <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          setGenerationStatus(prev => ({ ...prev, isActive: false }))
          setCurrentQrCode(null)

          // Auto regenerate if enabled
          if (settings.auto_regenerate) {
            console.log('QR Code expired, scheduling auto-regenerate...')
            scheduleAutoRegenerate()
          }
        }
      }, 1000)
    },
    [settings.auto_regenerate],
  )

  // Start monitoring for scan events
  const startScanMonitoring = useCallback(
    (token: string) => {
      if (!settings.auto_regenerate || !token) return

      console.log(
        'Starting scan monitoring for token:',
        token.substring(0, 8) + '...',
      )

      const checkForScans = async () => {
        try {
          // Check if QR code has been scanned by trying to get its status
          // This is a hypothetical endpoint - you may need to implement this in Laravel
          const response = await axios.get(`/api/qr-code/status/${token}`)

          if (response.data.status && response.data.data) {
            const { is_used, scan_count } = response.data.data

            if (is_used && scan_count > lastKnownScanCount.current) {
              console.log('QR Code scan detected! Scan count:', scan_count)

              // Update scan count
              setGenerationStatus(prev => ({
                ...prev,
                scannedCount: scan_count,
              }))
              lastKnownScanCount.current = scan_count

              // Schedule auto-regenerate
              scheduleAutoRegenerate()

              // Stop monitoring this token since it's been used
              return
            }
          }

          // Continue monitoring if QR is still active
          if (generationStatus.isActive) {
            scanCheckRef.current = setTimeout(checkForScans, 5000) // Check every 5 seconds
          }
        } catch (error) {
          console.warn('Scan monitoring error:', error)
          // Continue monitoring despite errors
          if (generationStatus.isActive) {
            scanCheckRef.current = setTimeout(checkForScans, 10000) // Retry in 10 seconds
          }
        }
      }

      // Start initial check after 2 seconds
      scanCheckRef.current = setTimeout(checkForScans, 2000)
    },
    [settings.auto_regenerate, generationStatus.isActive],
  )

  // Alternative: Poll for scan events using a simpler approach
  const startScanPolling = useCallback(() => {
    if (!settings.auto_regenerate || !currentQrCode) return

    console.log('Starting scan polling...')

    const pollForScans = async () => {
      try {
        // Simple approach: check attendance records for recent QR scans
        const response = await axios.get(
          '/api/attendance/recent?method=qr_code&limit=1',
        )

        if (response.data.status && response.data.data?.length > 0) {
          const latestAttendance = response.data.data[0]
          const attendanceTime = new Date(latestAttendance.created_at)
          const currentTime = new Date()
          const timeDiff = currentTime.getTime() - attendanceTime.getTime()

          // If attendance was recorded within the last minute, likely from our QR
          if (timeDiff < 60000) {
            // 60 seconds
            console.log(
              'Recent QR scan detected, scheduling auto-regenerate...',
            )
            setGenerationStatus(prev => ({
              ...prev,
              scannedCount: prev.scannedCount + 1,
            }))
            scheduleAutoRegenerate()
            return
          }
        }

        // Continue polling if QR is still active
        if (generationStatus.isActive) {
          pollRef.current = setTimeout(pollForScans, 10000) // Poll every 10 seconds
        }
      } catch (error) {
        console.warn('Scan polling error:', error)
        // Continue polling despite errors
        if (generationStatus.isActive) {
          pollRef.current = setTimeout(pollForScans, 15000) // Retry in 15 seconds
        }
      }
    }

    // Start initial poll after 5 seconds
    pollRef.current = setTimeout(pollForScans, 5000)
  }, [settings.auto_regenerate, currentQrCode, generationStatus.isActive])

  // Schedule auto regenerate
  const scheduleAutoRegenerate = useCallback(() => {
    if (!settings.auto_regenerate) return

    if (autoRegenerateRef.current) {
      clearTimeout(autoRegenerateRef.current)
    }

    console.log(
      `Scheduling auto-regenerate in ${settings.auto_regenerate_interval} seconds...`,
    )

    autoRegenerateRef.current = setTimeout(() => {
      console.log('Auto-regenerating QR code...')
      generateQrCode()
    }, settings.auto_regenerate_interval * 1000)
  }, [
    generateQrCode,
    settings.auto_regenerate,
    settings.auto_regenerate_interval,
  ])

  // Process QR Code scan (for manual checking)
  const processQrScan = useCallback(
    async (token: string) => {
      try {
        const response = await axios.post(`/api/qr-code/process/${token}`)
        const data: QrProcessResponse = response.data

        if (data.status) {
          setGenerationStatus(prev => ({
            ...prev,
            scannedCount: prev.scannedCount + 1,
          }))

          // Auto regenerate if enabled
          if (settings.auto_regenerate) {
            console.log('Manual scan processed, scheduling auto-regenerate...')
            scheduleAutoRegenerate()
          }

          return data
        } else {
          throw new Error(data.message)
        }
      } catch (error: any) {
        const errorData: QrCodeError = {
          code: error.response?.status?.toString() ?? 'UNKNOWN',
          message:
            error.response?.data?.message ??
            error.message ??
            'Failed to process QR scan',
        }

        setError(errorData)
        throw errorData
      }
    },
    [settings.auto_regenerate, scheduleAutoRegenerate],
  )

  // Stop QR Code generation and all timers
  const stopGeneration = useCallback(() => {
    console.log('Stopping QR code generation and all timers...')

    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (autoRegenerateRef.current) {
      clearTimeout(autoRegenerateRef.current)
    }
    if (pollRef.current) {
      clearTimeout(pollRef.current)
    }
    if (scanCheckRef.current) {
      clearTimeout(scanCheckRef.current)
    }

    setCurrentQrCode(null)
    setGenerationStatus({
      isGenerating: false,
      isActive: false,
      timeRemaining: 0,
      scannedCount: 0,
    })
    lastKnownScanCount.current = 0
  }, [])

  // Update settings and restart monitoring if needed
  const updateSettings = useCallback(
    (newSettings: Partial<QrGeneratorSettings>) => {
      console.log('Updating QR settings:', newSettings)

      setSettings(prev => {
        const updated = { ...prev, ...newSettings }

        // If auto-regenerate setting changed, adjust monitoring
        if ('auto_regenerate' in newSettings) {
          if (updated.auto_regenerate && currentQrCode) {
            // Start monitoring if it wasn't active before
            if (!prev.auto_regenerate) {
              startScanPolling()
            }
          } else if (!updated.auto_regenerate) {
            // Stop monitoring if disabled
            if (pollRef.current) clearTimeout(pollRef.current)
            if (scanCheckRef.current) clearTimeout(scanCheckRef.current)
            if (autoRegenerateRef.current)
              clearTimeout(autoRegenerateRef.current)
          }
        }

        return updated
      })
    },
    [currentQrCode, startScanPolling],
  )

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Start scan polling when QR is generated and auto-regenerate is enabled
  useEffect(() => {
    if (
      currentQrCode &&
      generationStatus.isActive &&
      settings.auto_regenerate
    ) {
      console.log('Starting scan polling due to settings change...')
      startScanPolling()
    }

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current)
      if (scanCheckRef.current) clearTimeout(scanCheckRef.current)
    }
  }, [
    currentQrCode,
    generationStatus.isActive,
    settings.auto_regenerate,
    startScanPolling,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoRegenerateRef.current) clearTimeout(autoRegenerateRef.current)
      if (pollRef.current) clearTimeout(pollRef.current)
      if (scanCheckRef.current) clearTimeout(scanCheckRef.current)
    }
  }, [])

  return {
    currentQrCode,
    generationStatus,
    settings,
    error,
    generateQrCode,
    processQrScan,
    stopGeneration,
    updateSettings,
    clearError,
    // Computed properties
    isAdmin: user?.role === 'admin',
    timeRemainingFormatted: formatTime(generationStatus.timeRemaining),
    isExpired: generationStatus.timeRemaining <= 0 && generationStatus.isActive,
    isExpiringSoon:
      generationStatus.timeRemaining <= 60 && generationStatus.isActive,
  }
}

// Hook for QR Code statistics (admin only)
export const useQrCodeStatistics = () => {
  const { user } = useAuth({})
  const [statistics, setStatistics] = useState<QrCodeStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    if (user?.role !== 'admin') return

    setIsLoading(true)
    setError(null)

    try {
      // This endpoint would need to be implemented in Laravel
      const response = await axios.get('/api/qr-code/statistics')
      setStatistics(response.data.data)
    } catch (error: any) {
      setError(error.response?.data?.message ?? 'Failed to fetch statistics')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
  }
}

// Hook for QR Code scanning (employee side)
export const useQrCodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<QrProcessResponse | null>(null)
  const [error, setError] = useState<QrCodeError | null>(null)

  const scanQrCode = useCallback(async (qrData: string) => {
    setIsScanning(true)
    setError(null)

    try {
      // Extract token from QR data (assuming it's a URL)
      let token: string

      if (qrData.includes('token=')) {
        const url = new URL(qrData)
        token = url.searchParams.get('token') ?? ''
      } else {
        // Assume the QR data is the token itself
        token = qrData
      }

      if (!token) {
        throw new Error('Invalid QR code format')
      }

      const response = await axios.post(`/api/qr-code/process/${token}`)
      const data: QrProcessResponse = response.data

      setScanResult(data)
      return data
    } catch (error: any) {
      const errorData: QrCodeError = {
        code: error.response?.status?.toString() ?? 'UNKNOWN',
        message:
          error.response?.data?.message ??
          error.message ??
          'Failed to scan QR code',
      }

      setError(errorData)
      throw errorData
    } finally {
      setIsScanning(false)
    }
  }, [])

  const clearScanResult = useCallback(() => {
    setScanResult(null)
    setError(null)
  }, [])

  return {
    isScanning,
    scanResult,
    error,
    scanQrCode,
    clearScanResult,
  }
}

// Utility functions
export const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '00:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export const getQrCodeStatusColor = (
  timeRemaining: number,
  isActive: boolean,
): string => {
  if (!isActive) return 'gray'
  if (timeRemaining <= 60) return 'red'
  if (timeRemaining <= 180) return 'yellow'
  return 'green'
}

export const getClockTypeLabel = (clockType: 'in' | 'out'): string => {
  return clockType === 'in' ? 'Clock In' : 'Clock Out'
}

export const getClockTypeColor = (clockType: 'in' | 'out'): string => {
  return clockType === 'in' ? 'green' : 'blue'
}
