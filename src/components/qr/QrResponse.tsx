'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, QrCode } from 'lucide-react'
import { useAuth } from '@/hooks/auth'

const QrResponse = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth({})
  
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    attendanceId?: number
  } | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    // If no token, redirect to dashboard
    if (!token) {
      router.push('/dashboard')
      return
    }

    // If auth is still loading, wait
    if (authLoading) {
      return
    }

    // If not authenticated, redirect to login with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(`/qr-scan?token=${token}`)
      router.push(`/login?redirect=${returnUrl}`)
      return
    }

    // If authenticated and has token, process QR code
    processQrCode()
  }, [token, user, authLoading, router])

  const processQrCode = async () => {
    if (!token || processing) return

    setProcessing(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/attendance/qr/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (data.status) {
        // Success
        setResult({
          success: true,
          message: 'Attendance recorded successfully!',
          attendanceId: data.data?.id
        })

        // Redirect to dashboard with attendance ID after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard?attendance=${data.data?.id}&source=qr`)
        }, 2000)
      } else {
        // Error from backend
        setResult({
          success: false,
          message: data.message ?? 'QR code processing failed'
        })

        // Redirect to dashboard with error after 3 seconds
        setTimeout(() => {
          const errorMessage = encodeURIComponent(data.message ?? 'QR code processing failed')
          router.push(`/dashboard?error=${errorMessage}&source=qr`)
        }, 3000)
      }
    } catch (error) {
      console.error('QR processing error:', error)
      setResult({
        success: false,
        message: 'Network error. Please try again.'
      })

      // Redirect to dashboard with error after 3 seconds
      setTimeout(() => {
        const errorMessage = encodeURIComponent('Network error. Please try again.')
        router.push(`/dashboard?error=${errorMessage}&source=qr`)
      }, 3000)
    } finally {
      setProcessing(false)
    }
  }

  // Loading state
  if (authLoading || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            QR Code Attendance
          </h1>
        </div>

        {processing && (
          <div className="mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Processing QR code...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we record your attendance.</p>
          </div>
        )}

        {result && (
          <div className="mb-6">
            {result.success ? (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-green-800 mb-2">Success!</h2>
                <p className="text-green-600 mb-3">{result.message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
                <p className="text-red-600 mb-3">{result.message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </p>
              </div>
            )}
          </div>
        )}

        {!processing && !result && (
          <div className="mb-6">
            <p className="text-gray-600">
              Initializing QR code processing...
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={processing}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default QrResponse