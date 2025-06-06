'use client'

import React, { useState } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { useAttendanceToday } from '@/hooks/attendance'
import AttendanceMethodModal from '@/components/attendance/AttendanceMethodModal'
import AttendanceRecordDetailModal from '@/components/attendance/AttendanceRecordDetailModal'

const ClockStatusCard = () => {
  const { clockStatus, isLoading, mutate } = useAttendanceToday()
  const [showMethodModal, setShowMethodModal] = useState(false)
  const [selectedClockType, setSelectedClockType] = useState<'in' | 'out'>('in')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<
    number | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  const handleClockAction = (clockType: 'in' | 'out') => {
    setError(null)
    setSelectedClockType(clockType)
    setShowMethodModal(true)
  }

  const handleClockIn = () => {
    handleClockAction('in')
  }

  const handleClockOut = () => {
    handleClockAction('out')
  }

  const handleAttendanceSuccess = (attendanceId: number) => {
    // Close method modal
    setShowMethodModal(false)

    // Refresh today's attendance data
    mutate()

    // Show attendance detail modal
    setSelectedAttendanceId(attendanceId)
    setShowDetailModal(true)
  }

  const handleMethodModalClose = () => {
    setShowMethodModal(false)
    setSelectedClockType('in')
  }

  const handleDetailModalClose = () => {
    setShowDetailModal(false)
    setSelectedAttendanceId(null)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">
            Status Absensi Hari Ini
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 mt-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">
            Status Absensi Hari Ini
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center h-40">
          {clockStatus.clockedIn ? (
            <>
              <div className="text-green-500 font-semibold mb-2">
                {clockStatus.canClockOut ? 'Sudah Clock In' : 'Sudah Clock Out'}
              </div>

              <div className="text-center mb-2">
                {clockStatus.clockInTime && (
                  <div className="text-lg">
                    <span className="text-gray-600">Masuk: </span>
                    <span className="font-bold">{clockStatus.clockInTime}</span>
                  </div>
                )}
                {clockStatus.clockOutTime && (
                  <div className="text-lg">
                    <span className="text-gray-600">Keluar: </span>
                    <span className="font-bold">
                      {clockStatus.clockOutTime}
                    </span>
                  </div>
                )}
              </div>

              {clockStatus.workDuration && (
                <div className="text-sm text-gray-600 mb-3">
                  Durasi: {Math.abs(clockStatus.workDuration.hours)}j{' '}
                  {Math.abs(clockStatus.workDuration.minutes)}m
                </div>
              )}

              {clockStatus.canClockOut && (
                <div className="mt-4">
                  <button
                    onClick={handleClockOut}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2">
                    <span>Clock Out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-yellow-500 font-semibold mb-4">
                Belum Clock In
              </div>
              <button
                onClick={handleClockIn}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2">
                <span>Clock In</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Attendance Method Selection Modal */}
      <AttendanceMethodModal
        isOpen={showMethodModal}
        onClose={handleMethodModalClose}
        clockType={selectedClockType}
        onSuccess={handleAttendanceSuccess}
      />

      {/* Attendance Record Detail Modal */}
      <AttendanceRecordDetailModal
        recordId={selectedAttendanceId}
        isOpen={showDetailModal}
        onClose={handleDetailModalClose}
      />
    </>
  )
}

export default ClockStatusCard
