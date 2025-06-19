import React, { useState, useMemo } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Filter,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw
} from 'lucide-react'
import { 
  useLeaveRequests, 
  useLeaveRequest,
  useLeaveRequestActions 
} from '@/hooks/leaveRequest'
import { LeaveRequest, LeaveRequestStatus } from '@/types/LeaveRequest'

// Helper function to format date
const formatDate = (dateString: string, format: 'short' | 'long' = 'short') => {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const longMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  
  const day = date.getDate()
  const month = format === 'short' ? months[date.getMonth()] : longMonths[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  if (format === 'long') {
    return `${day} ${month} ${year} ${hours}:${minutes}`
  }
  return `${day} ${month} ${year}`
}

// Modal Component for Leave Request Details
const LeaveRequestDetailModal = ({ 
  requestId, 
  onClose 
}: { 
  requestId: number | null
  onClose: () => void 
}) => {
  const { leaveRequest, isLoading } = useLeaveRequest(requestId)
  const { getProofUrl } = useLeaveRequestActions()
  const [loadingProof, setLoadingProof] = useState<number | null>(null)

  const handleViewProof = async (proofId: number) => {
    try {
      setLoadingProof(proofId)
      const response = await getProofUrl(proofId)
      window.open(response.data.url, '_blank')
    } catch (error) {
      console.error('Failed to get proof URL:', error)
    } finally {
      setLoadingProof(null)
    }
  }

  if (!requestId) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : leaveRequest ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Detail Permohonan Cuti</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Employee Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Informasi Karyawan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">{leaveRequest.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{leaveRequest.user.email}</p>
                </div>
                {leaveRequest.user.position && (
                  <div>
                    <p className="text-sm text-gray-500">Posisi</p>
                    <p className="font-medium">{leaveRequest.user.position}</p>
                  </div>
                )}
                {leaveRequest.user.department && (
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{leaveRequest.user.department.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Details */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Detail Cuti</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-32">Tipe:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leaveRequest.type === 'sakit' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {leaveRequest.type === 'sakit' ? 'Sakit' : 'Cuti'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-32">Tanggal:</span>
                  <span className="font-medium">
                    {formatDate(leaveRequest.start_date, 'long')} - 
                    {formatDate(leaveRequest.end_date, 'long')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-32">Durasi:</span>
                  <span className="font-medium">{leaveRequest.duration} hari</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 w-32">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leaveRequest.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : leaveRequest.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leaveRequest.status === 'approved' ? 'Disetujui' : 
                     leaveRequest.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </span>
                </div>
                {leaveRequest.reason && (
                  <div>
                    <span className="text-sm text-gray-500">Alasan:</span>
                    <p className="mt-1 text-gray-700">{leaveRequest.reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Proofs */}
            {leaveRequest.proofs && leaveRequest.proofs.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Bukti Dokumen</h3>
                <div className="space-y-2">
                  {leaveRequest.proofs.map((proof) => (
                    <div key={proof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{proof.filename}</p>
                        {proof.description && (
                          <p className="text-xs text-gray-500">{proof.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {proof.human_readable_size} • {proof.mime_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {proof.is_verified && (
                          <span className="text-xs text-green-600 flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            Terverifikasi
                          </span>
                        )}
                        <button
                          onClick={() => handleViewProof(proof.id)}
                          disabled={loadingProof === proof.id}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          {loadingProof === proof.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Lihat
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-400 pt-4 border-t">
              <p>Dibuat pada: {formatDate(leaveRequest.created_at, 'long')}</p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Data tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}

const LeaveRequestManagement = () => {
  const [filters, setFilters] = useState({
    status: undefined as "pending" | "approved" | "rejected" | undefined,
    type: undefined as 'sakit' | 'cuti' | undefined,
    user_id: undefined as number | undefined,
    year: new Date().getFullYear(),
    page: 1
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  
  const { leaveRequests, pagination, isLoading, mutate } = useLeaveRequests(filters)
  const { updateLeaveRequestStatus } = useLeaveRequestActions()

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!searchTerm) return leaveRequests
    
    return leaveRequests.filter(request => 
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [leaveRequests, searchTerm])

  const handleStatusChange = async (id: number, newStatus: LeaveRequestStatus) => {
    try {
      await updateLeaveRequestStatus(id, { status: newStatus })
      mutate() // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'sakit' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui'
      case 'rejected':
        return 'Ditolak'
      default:
        return 'Menunggu'
    }
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Permohonan Cuti</h1>
        <button
          onClick={() => mutate()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau alasan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Tipe</option>
                <option value="sakit">Sakit</option>
                <option value="cuti">Cuti</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada permohonan cuti ditemukan</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Karyawan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Alasan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bukti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.user.name}
                          </div>
                          <div className="text-sm text-gray-500">{request.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(request.type)}`}>
                          {request.type === 'sakit' ? 'Sakit' : 'Cuti'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {formatDate(request.start_date)} - 
                          {formatDate(request.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.duration} hari
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={request.reason}>
                          {request.reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.has_proofs ? (
                          <span className="flex items-center text-green-600">
                            <FileText className="w-4 h-4 mr-1" />
                            {request.proofs_count}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRequestId(request.id)}
                            className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(request.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Setujui">
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(request.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Tolak">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Menampilkan {pagination.from} sampai {pagination.to} dari {pagination.total} hasil
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.last_page))].map((_, idx) => {
                      const page = idx + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            pagination.current_page === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}>
                          {page}
                        </button>
                      )
                    })}
                    
                    {pagination.last_page > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <button
                          onClick={() => handlePageChange(pagination.last_page)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            pagination.current_page === pagination.last_page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}>
                          {pagination.last_page}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequestId && (
        <LeaveRequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  )
}

export default LeaveRequestManagement