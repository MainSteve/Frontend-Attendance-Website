'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Calendar,
  ChevronRight,
  LogIn,
  LogOut,
  Smartphone,
  QrCode,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { useAttendanceList } from '@/hooks/attendance'
import { AttendanceRecord } from '@/types/Attendance'
import AttendanceRecordDetailModal from './AttendanceRecordDetailModal'

interface AttendanceRecordsListProps {
  startDate: string
  endDate: string
  onRecordClick?: (record: AttendanceRecord) => void
}

const AttendanceRecordsList: React.FC<AttendanceRecordsListProps> = ({
  startDate,
  endDate,
  onRecordClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all')
  const [filterMethod, setFilterMethod] = useState<
    'all' | 'manual' | 'qr_code'
  >('all')
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { attendanceList, pagination, isLoading, isError } = useAttendanceList({
    from_date: startDate,
    to_date: endDate,
    page: currentPage,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
    ...(filterType !== 'all' && { clock_type: filterType }),
    ...(filterMethod !== 'all' && { method: filterMethod }),
    ...(searchTerm && { search: searchTerm }),
  })

  const handleRecordClick = (record: AttendanceRecord) => {
    // Call the optional onRecordClick prop if provided
    onRecordClick?.(record)

    // Open the detail modal
    setSelectedRecordId(record.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecordId(null)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getClockTypeIcon = (type: string) => {
    return type === 'in' ? (
      <LogIn className="h-4 w-4 text-green-600" />
    ) : (
      <LogOut className="h-4 w-4 text-red-600" />
    )
  }

  const getClockTypeColor = (type: string) => {
    return type === 'in'
      ? 'border-l-green-500 bg-green-50'
      : 'border-l-red-500 bg-red-50'
  }

  const getMethodIcon = (method: string) => {
    return method === 'qr_code' ? (
      <QrCode className="h-4 w-4 text-blue-600" />
    ) : (
      <Smartphone className="h-4 w-4 text-gray-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Riwayat Kehadiran
          </h2>
        </div>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 ml-2">
            Memuat riwayat kehadiran...
          </span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Riwayat Kehadiran
          </h2>
        </div>
        <div className="text-center text-red-600 py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Gagal memuat riwayat kehadiran</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 mt-2">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Riwayat Kehadiran
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            {attendanceList.length} dari {pagination?.total ?? 0} record
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Clock Type Filter */}
          <select
            value={filterType}
            onChange={e => {
              setFilterType(e.target.value as 'all' | 'in' | 'out')
              setCurrentPage(1)
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Semua Tipe</option>
            <option value="in">Clock In</option>
            <option value="out">Clock Out</option>
          </select>

          {/* Method Filter */}
          <select
            value={filterMethod}
            onChange={e => {
              setFilterMethod(e.target.value as 'all' | 'manual' | 'qr_code')
              setCurrentPage(1)
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Semua Metode</option>
            <option value="manual">Manual</option>
            <option value="qr_code">QR Code</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterType('all')
              setFilterMethod('all')
              setCurrentPage(1)
            }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md 
    text-gray-700 bg-gray-100 hover:bg-gray-200 
    border border-gray-300 hover:border-gray-400
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <RotateCcw className="h-4 w-4 mr-1.5 text-gray-600" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="p-6">
        {attendanceList.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Tidak ada data kehadiran</p>
            <p className="text-sm">
              Tidak ditemukan record kehadiran untuk periode yang dipilih
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendanceList.map(record => (
              <div
                key={record.id}
                onClick={() => handleRecordClick(record)}
                className={`
                  border-l-4 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50
                  ${getClockTypeColor(record.clock_type)}
                `}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getClockTypeIcon(record.clock_type)}
                      <span
                        className={`font-semibold text-sm uppercase ${
                          record.clock_type === 'in'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                        Clock {record.clock_type}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatTime(record.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(record.created_at)}
                      </div>

                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {record.location || 'Remote'}
                      </div>

                      <div className="flex items-center">
                        {getMethodIcon(record.method)}
                        <span className="ml-1 capitalize">
                          {record.method === 'qr_code' ? 'QR Code' : 'Manual'}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-2 text-xs text-gray-500">
                      Record ID: {record.id} • Created:{' '}
                      {new Date(record.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center ml-4">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.lastPage > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Menampilkan{' '}
              {(pagination.currentPage - 1) * pagination.perPage + 1} sampai{' '}
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.total,
              )}{' '}
              dari {pagination.total} hasil
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Sebelumnya
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, pagination.lastPage))].map(
                  (_, index) => {
                    const page = index + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}>
                        {page}
                      </button>
                    )
                  },
                )}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.lastPage}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AttendanceRecordDetailModal
        recordId={selectedRecordId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default AttendanceRecordsList
