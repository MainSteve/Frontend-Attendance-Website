'use client'

import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { useDepartments } from '@/hooks/users'
import { formatDateWithDayOnly } from '@/utils/dateConverter'
import { toTitleCase } from '@/utils/stringUtils'
import { useSearchParams, useRouter } from 'next/navigation'

// Import all the new components
import AttendanceSummaryCard from '@/components/dashboard/AttendanceSummaryCard'
import ClockStatusCard from '@/components/dashboard/ClockStatusCard'
import LeaveQuotaCard from '@/components/dashboard/LeaveQuotaCard'
import WeeklyScheduleCard from '@/components/dashboard/WeeklyScheduleCard'
import AnnouncementsCard from '@/components/dashboard/AnnouncementsCard'
import AttendanceRecordDetailModal from '@/components/attendance/AttendanceRecordDetailModal'

const EmployeeDashboard = () => {
  const router = useRouter()
  const { user, isLoading: userLoading } = useAuth({})
  const { departments, isLoading: departmentsLoading } = useDepartments()
  const searchParams = useSearchParams()

  // Add useEffect for admin check
  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/admin/menus')
    }
  }, [user, router])

  // ← ADD QR detection state variables here
  const [showQrAttendanceModal, setShowQrAttendanceModal] = useState(false)
  const [qrAttendanceId, setQrAttendanceId] = useState<number | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)

  const userDepartment = departments?.find(
    dept => dept.id === user?.department_id,
  )

  // Get current date in Indonesian format
  const currentDate = formatDateWithDayOnly(new Date())

  // ← ADD QR detection effect here
  useEffect(() => {
    const attendanceId = searchParams.get('attendance')
    const error = searchParams.get('error')
    const source = searchParams.get('source')

    // Only process if it's from QR source
    if (source === 'qr') {
      if (attendanceId) {
        // Success: show attendance detail modal
        const id = parseInt(attendanceId)
        if (!isNaN(id)) {
          setQrAttendanceId(id)
          setShowQrAttendanceModal(true)
        }
      } else if (error) {
        // Error: show error message
        setQrError(decodeURIComponent(error))
      }

      // Clean up URL parameters after processing
      const url = new URL(window.location.href)
      url.searchParams.delete('attendance')
      url.searchParams.delete('error')
      url.searchParams.delete('source')

      // Replace current URL without query params (doesn't reload page)
      window.history.replaceState({}, '', url.pathname)
    }
  }, [searchParams])

  // ← ADD QR handler functions here
  const handleCloseQrModal = () => {
    setShowQrAttendanceModal(false)
    setQrAttendanceId(null)
  }

  const handleCloseQrError = () => {
    setQrError(null)
  }

  // Loading state
  if (userLoading || departmentsLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading user data</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800">
            Refresh page
          </button>
        </div>
      </div>
    )
  }

  // Only render dashboard for non-admin users
  if (user.role === 'admin') {
    return null // Return null while redirecting
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ← ADD QR Error Message here (BEFORE Welcome Section) */}
        {qrError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-600 font-medium">QR Code Error</span>
              </div>
              <button
                onClick={handleCloseQrError}
                className="text-red-400 hover:text-red-600">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-red-600 text-sm mt-1">{qrError}</p>
          </div>
        )}

        {/* ← ADD QR Success Message here (BEFORE Welcome Section) */}
        {showQrAttendanceModal && qrAttendanceId && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-green-600 font-medium">
                QR Code Attendance Successful!
              </span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Your attendance has been recorded. Details are shown below.
            </p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Selamat Datang, {user.name}
          </h2>
          <p className="text-sm text-gray-500">{currentDate}</p>
          {user.position && (
            <p className="text-sm text-gray-600">
              {toTitleCase(user.position)} -{' '}
              {userDepartment?.name ?? 'No Department'}
            </p>
          )}
        </div>

        {/* Top Section - Attendance Summary and Clock Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AttendanceSummaryCard />

          <ClockStatusCard />
        </div>

        {/* Middle Section - Leave Quota and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <LeaveQuotaCard />

          <AnnouncementsCard />
        </div>

        {/* Bottom Section - Weekly Schedule */}
        <WeeklyScheduleCard />

        {/* ← ADD QR Modal here (BEFORE closing main tag) */}
        <AttendanceRecordDetailModal
          recordId={qrAttendanceId}
          isOpen={showQrAttendanceModal}
          onClose={handleCloseQrModal}
        />
      </main>
    </div>
  )
}

export default EmployeeDashboard
