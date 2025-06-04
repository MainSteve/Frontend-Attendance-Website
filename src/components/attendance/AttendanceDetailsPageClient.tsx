'use client'

import React, { useState } from 'react'
import { ArrowLeft, Calendar, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import AttendanceReportSummary from '@/components/attendance/AttendanceReportSummary'
import AttendanceRecordsList from '@/components/attendance/AttendanceRecordsList'

interface AttendanceDetailsPageClientProps {
  // Optional props for direct usage without router
  initialMonth?: number
  initialYear?: number
}

const AttendanceDetailsPageClient: React.FC<
  AttendanceDetailsPageClientProps
> = ({ initialMonth, initialYear }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current date for defaults
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Initialize dates from URL params or props or current date
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (initialMonth) return initialMonth
    const monthParam = searchParams?.get('month')
    return monthParam ? parseInt(monthParam) : currentMonth
  })

  const [selectedYear, setSelectedYear] = useState(() => {
    if (initialYear) return initialYear
    const yearParam = searchParams?.get('year')
    return yearParam ? parseInt(yearParam) : currentYear
  })

  // Calculate date ranges
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
      // Last day of the selected month - create in UTC
      const lastDay = new Date(Date.UTC(year, month, 0))
      endDate = lastDay.toISOString().split('T')[0]
    }

    return { startDate, endDate }
  }

  const { startDate, endDate } = getDateRange(selectedMonth, selectedYear)

  // Handle month/year changes
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)

    // Update URL if using router
    if (router && searchParams) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('month', month.toString())
      params.set('year', year.toString())
      router.push(`/dashboard/attendance/details?${params.toString()}`)
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  // Generate month options
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ]

  // Generate year options (current year ± 2)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Month Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedMonth}
                  onChange={e =>
                    handleMonthChange(parseInt(e.target.value), selectedYear)
                  }
                  className="border border-gray-300 min-w-[8rem] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={e =>
                    handleMonthChange(selectedMonth, parseInt(e.target.value))
                  }
                  className="border border-gray-300 min-w-[5rem] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Range Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-blue-800">
                Menampilkan data dari <strong>{startDate}</strong> sampai{' '}
                <strong>{endDate}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Report Summary Card */}
          <AttendanceReportSummary
            startDate={startDate}
            endDate={endDate}
            month={selectedMonth}
            year={selectedYear}
          />

          {/* Attendance Records List */}
          <AttendanceRecordsList startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  )
}

export default AttendanceDetailsPageClient
