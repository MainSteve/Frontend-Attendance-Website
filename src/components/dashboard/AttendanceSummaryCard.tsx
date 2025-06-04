'use client'

import React from 'react'
import { FileText, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AttendanceReportSummary from '@/components/attendance/AttendanceReportSummary'

interface AttendanceSummaryCardProps {
  month?: number
  year?: number
  className?: string
}

const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  month,
  year,
  className = 'col-span-2',
}) => {
  const router = useRouter()

  const getDateRange = (month: number, year: number) => {
    // First day of the month - create in UTC to avoid timezone shift
    const startDate = new Date(Date.UTC(year, month - 1, 1))
      .toISOString()
      .split('T')[0]

    // Today or last day of month if current month
    const today = new Date()
    const isCurrentMonth =
      month === today.getMonth() + 1 && year === today.getFullYear()

    let endDate: string
    if (isCurrentMonth) {
      // Create today's date in UTC
      endDate = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
      )
        .toISOString()
        .split('T')[0]
    } else {
      // Last day of the selected month
      const lastDay = new Date(Date.UTC(year, month, 0))
      endDate = lastDay.toISOString().split('T')[0]
    }

    return { startDate, endDate }
  }

  const handleViewDetails = () => {
    // Navigate to detailed attendance page
    const currentMonth = month ?? new Date().getMonth() + 1
    const currentYear = year ?? new Date().getFullYear()
    router.push(
      `/dashboard/attendance/details?month=${currentMonth}&year=${currentYear}`,
    )
  }

  // Get date range for current month/year
  const currentMonth = month ?? new Date().getMonth() + 1
  const currentYear = year ?? new Date().getFullYear()
  const { startDate, endDate } = getDateRange(currentMonth, currentYear)

  // If no end date (not current month), don't render
  if (!endDate) {
    return (
      <div className={`${className} bg-white rounded-lg shadow p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">
              Ringkasan Kehadiran Bulan Ini
            </h3>
          </div>
          <button
            onClick={handleViewDetails}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            <Eye className="h-4 w-4 mr-1" />
            Details
          </button>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>No data available for future months</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">
            Ringkasan Kehadiran Bulan Ini
          </h3>
        </div>
        <button
          onClick={handleViewDetails}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
          <Eye className="h-4 w-4 mr-1" />
          Details
        </button>
      </div>

      <AttendanceReportSummary
        startDate={startDate}
        endDate={endDate}
        month={currentMonth}
        year={currentYear}
        isDashboard={true}
      />
    </div>
  )
}

export default AttendanceSummaryCard
