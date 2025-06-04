'use client'

import React from 'react'
import {
  BarChart3,
  Clock,
  Calendar,
  TrendingUp,
  Coffee,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useAttendanceReport } from '@/hooks/attendance'

interface AttendanceReportSummaryProps {
  startDate: string
  endDate: string
  month: number
  year: number
  isDashboard?: boolean // Add this new prop
}

const AttendanceReportSummary: React.FC<AttendanceReportSummaryProps> = ({
  startDate,
  endDate,
  month,
  year,
  isDashboard = false, // Add default value
}) => {
  const { summary, user, isLoading, isError } = useAttendanceReport({
    start_date: startDate,
    end_date: endDate,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Laporan Kehadiran
          </h2>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 ml-2">
            Memuat laporan kehadiran...
          </span>
        </div>
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Laporan Kehadiran
          </h2>
        </div>
        <div className="text-center text-red-600 py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Gagal memuat laporan kehadiran</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 mt-2">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      {!isDashboard && (
        // Header section
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Laporan Kehadiran - {monthNames[month - 1]} {year}
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              {summary.date_range.start_date} s/d {summary.date_range.end_date}
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{user.name}</span>
              {user.position && <span> • {user.position}</span>}
              {user.department && <span> • {user.department.name}</span>}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">
                  Total Hari Kerja
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.date_range.work_days}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Hadir</p>
                <p className="text-2xl font-bold text-green-900">
                  {summary.attendance.present_days}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Absen</p>
                <p className="text-2xl font-bold text-red-900">
                  {summary.attendance.absent_days}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Cuti</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {summary.attendance.leave_days}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                Tingkat Kehadiran
              </span>
            </div>
            <span className="text-2xl font-bold text-blue-900">
              {summary.attendance.attendance_rate}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: summary.attendance.attendance_rate,
              }}></div>
          </div>
        </div>

        {!isDashboard && (
          <>
            {/* Work Hours Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Jam Terjadwal
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {summary.work_hours.scheduled.hours_formatted}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {summary.work_hours.scheduled.total_hours}h{' '}
                  {summary.work_hours.scheduled.total_minutes}m
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Jam Aktual
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {summary.work_hours.actual.hours_formatted}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rata-rata: {summary.work_hours.average_hours_per_day}h/hari
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Selisih
                  </span>
                </div>
                <p
                  className={`text-xl font-bold ${
                    summary.work_hours.difference.type === 'overtime'
                      ? 'text-green-600'
                      : summary.work_hours.difference.type === 'undertime'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                  {summary.work_hours.difference.hours_formatted}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {summary.work_hours.difference.type === 'overtime'
                    ? 'Lembur'
                    : summary.work_hours.difference.type === 'undertime'
                    ? 'Kurang'
                    : 'Tepat'}
                </p>
              </div>
            </div>

            {/* Leave Breakdown */}
            {summary.attendance.leave_days > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-orange-900 mb-3">
                  Rincian Cuti
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {summary.attendance.leave_by_type.sakit}
                    </p>
                    <p className="text-xs text-orange-700">Sakit</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {summary.attendance.leave_by_type.izin}
                    </p>
                    <p className="text-xs text-orange-700">Izin</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {summary.attendance.leave_by_type.cuti}
                    </p>
                    <p className="text-xs text-orange-700">Cuti</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leave Quota */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-purple-900">
                  Kuota Cuti {summary.leave_quota.year}
                </h3>
                <span className="text-xs text-purple-600">
                  {summary.leave_quota.percentage_used}% terpakai
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.leave_quota.percentage_used}%`,
                  }}></div>
              </div>
              <div className="flex justify-between text-xs text-purple-700">
                <span>Terpakai: {summary.leave_quota.used}</span>
                <span>Sisa: {summary.leave_quota.remaining}</span>
                <span>Total: {summary.leave_quota.total}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AttendanceReportSummary
