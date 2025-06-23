// src/components/admin/AnnouncementsManagement.tsx

import React, { useState, useEffect } from 'react'
import {
  useAnnouncementsAdmin,
  useAnnouncementStatistics,
  getImportanceConfig,
  getPreviewContent,
  isExpiringSoon,
  isExpired,
  getDaysRemainingText,
  getStatusColor,
} from '@/hooks/announcements'
import { useDepartments } from '@/hooks/users'
import {
  AnnouncementFormData,
  AnnouncementFilters,
  ImportanceLevel,
} from '@/types/Announcements'
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  X,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { formatLeaveDate } from '@/utils/dateConverter'

const AnnouncementsManagement = () => {
  // State management
  const [filters, setFilters] = useState<AnnouncementFilters>({
    show_all: true,
    per_page: 15,
    page: 1,
  })

  const [announcementForm, setAnnouncementForm] =
    useState<AnnouncementFormData>({
      title: '',
      content: '',
      importance_level: 2,
      department_ids: [],
      is_active: true,
    })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  )
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(
    null,
  )
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Hooks
  const {
    announcements,
    pagination,
    isLoading: announcementsLoading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleActiveStatus,
    mutate,
  } = useAnnouncementsAdmin(filters)

  const { statistics, isLoading: statsLoading } = useAnnouncementStatistics()
  const { departments, isLoading: departmentsLoading } = useDepartments()

  // Show message helper
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Reset form
  const resetForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      importance_level: 2,
      department_ids: [],
      is_active: true,
    })
    setEditingId(null)
    setIsFormOpen(false)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !announcementForm.title ||
      !announcementForm.content ||
      announcementForm.department_ids.length === 0
    ) {
      showMessage('error', 'Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const announcementData = {
        title: announcementForm.title,
        content: announcementForm.content,
        importance_level: announcementForm.importance_level,
        department_ids: announcementForm.department_ids,
        is_active: announcementForm.is_active,
      }

      if (editingId) {
        await updateAnnouncement(editingId, announcementData)
        showMessage('success', 'Announcement updated successfully')
      } else {
        await createAnnouncement(announcementData)
        showMessage('success', 'Announcement created successfully')
      }

      resetForm()
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${editingId ? 'update' : 'create'} announcement`
      showMessage('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (announcement: any) => {
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      importance_level: announcement.importance_level,
      department_ids: announcement.departments.map((dept: any) => dept.id),
      is_active: announcement.is_active,
    })
    setEditingId(announcement.id)
    setIsFormOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    setIsLoading(true)
    try {
      await deleteAnnouncement(id)
      showMessage('success', 'Announcement deleted successfully')
      setShowDeleteConfirm(null)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete announcement'
      showMessage('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle toggle active status
  const handleToggleActive = async (id: number) => {
    try {
      await toggleActiveStatus(id)
      showMessage('success', 'Announcement status updated successfully')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update announcement status'
      showMessage('error', errorMessage)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AnnouncementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Handle department selection
  const handleDepartmentChange = (departmentId: number, checked: boolean) => {
    if (checked) {
      setAnnouncementForm(prev => ({
        ...prev,
        department_ids: [...prev.department_ids, departmentId],
      }))
    } else {
      setAnnouncementForm(prev => ({
        ...prev,
        department_ids: prev.department_ids.filter(id => id !== departmentId),
      }))
    }
  }

  // Select all departments
  const handleSelectAllDepartments = () => {
    const allDepartmentIds = departments?.map(dept => dept.id) || []
    setAnnouncementForm(prev => ({
      ...prev,
      department_ids: allDepartmentIds,
    }))
  }

  // Clear all departments
  const handleClearAllDepartments = () => {
    setAnnouncementForm(prev => ({
      ...prev,
      department_ids: [],
    }))
  }

  // Filter announcements based on search term
  const filteredAnnouncements = announcements.filter(announcement => {
    const lowerSearch = searchTerm.toLowerCase()
    return (
      announcement.title.toLowerCase().includes(lowerSearch) ||
      announcement.content.toLowerCase().includes(lowerSearch)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Manajemen Pengumuman
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Buat Pengumuman</span>
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pengumuman
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {statistics.total_announcements}
                </p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.active_announcements}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kadaluarsa</p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.expired_announcements}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Prioritas Tinggi
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics.by_importance.high}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.show_all ? 'all' : 'active'}
              onChange={e =>
                handleFilterChange({ show_all: e.target.value === 'all' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="active">Aktif Saja</option>
              <option value="all">Semua</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioritas
            </label>
            <select
              value={filters.importance_level || ''}
              onChange={e => {
                const value = e.target.value
                handleFilterChange({
                  importance_level: value
                    ? (parseInt(value) as ImportanceLevel)
                    : undefined,
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Prioritas</option>
              <option value="1">📋 Low</option>
              <option value="2">⚠️ Medium</option>
              <option value="3">🚨 High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Per Halaman
            </label>
            <select
              value={filters.per_page || 15}
              onChange={e =>
                handleFilterChange({ per_page: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({ show_all: true, per_page: 15, page: 1 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Announcement Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan judul pengumuman"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten *
                </label>
                <textarea
                  value={announcementForm.content}
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      content: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Tulis konten pengumuman..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Prioritas *
                </label>
                <select
                  value={announcementForm.importance_level}
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      importance_level: parseInt(
                        e.target.value,
                      ) as ImportanceLevel,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required>
                  <option value={1}>📋 Low - Informasi umum</option>
                  <option value={2}>⚠️ Medium - Penting untuk diketahui</option>
                  <option value={3}>🚨 High - Sangat urgent dan penting</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Target Departemen * (
                    {announcementForm.department_ids.length} dipilih)
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectAllDepartments}
                      className="text-xs text-blue-600 hover:text-blue-800">
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllDepartments}
                      className="text-xs text-red-600 hover:text-red-800">
                      Hapus Semua
                    </button>
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {departmentsLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading departments...
                    </div>
                  ) : departments && departments.length > 0 ? (
                    departments.map(dept => (
                      <label key={dept.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={announcementForm.department_ids.includes(
                            dept.id,
                          )}
                          onChange={e =>
                            handleDepartmentChange(dept.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {dept.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      No departments available
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={announcementForm.is_active}
                  onChange={e =>
                    setAnnouncementForm({
                      ...announcementForm,
                      is_active: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm text-gray-700">
                  Aktifkan pengumuman
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {isLoading
                    ? 'Menyimpan...'
                    : editingId
                    ? 'Update'
                    : 'Buat Pengumuman'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Konfirmasi Hapus
              </h2>
            </div>

            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini
              tidak dapat dibatalkan.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isLoading}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                {isLoading ? 'Menghapus...' : 'Hapus'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Detail Pengumuman
              </h2>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedAnnouncement.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>
                    Dibuat: {formatLeaveDate(selectedAnnouncement.created_at)}
                  </span>
                  <span>Oleh: {selectedAnnouncement.creator.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      getImportanceConfig(selectedAnnouncement.importance_level)
                        .bgColor
                    } ${
                      getImportanceConfig(selectedAnnouncement.importance_level)
                        .textColor
                    }`}>
                    {
                      getImportanceConfig(selectedAnnouncement.importance_level)
                        .icon
                    }{' '}
                    {
                      getImportanceConfig(selectedAnnouncement.importance_level)
                        .label
                    }
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Konten:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Target Departemen:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAnnouncement.departments.map((dept: any) => (
                    <span
                      key={dept.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {dept.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedAnnouncement.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedAnnouncement.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getDaysRemainingText(selectedAnnouncement)}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      handleEdit(selectedAnnouncement)
                      setSelectedAnnouncement(null)
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Daftar Pengumuman
          </h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {announcementsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengumuman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioritas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Departemen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnnouncements.map(announcement => (
                    <tr key={announcement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900">
                            {announcement.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {getPreviewContent(announcement.content, 80)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Oleh: {announcement.creator.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getImportanceConfig(announcement.importance_level)
                              .bgColor
                          } ${
                            getImportanceConfig(announcement.importance_level)
                              .textColor
                          }`}>
                          {
                            getImportanceConfig(announcement.importance_level)
                              .icon
                          }{' '}
                          {
                            getImportanceConfig(announcement.importance_level)
                              .label
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {announcement.departments.slice(0, 2).map(dept => (
                            <span
                              key={dept.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {dept.name}
                            </span>
                          ))}
                          {announcement.departments.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              +{announcement.departments.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              announcement.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {announcement.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                          <span
                            className={`text-xs ${
                              isExpired(announcement)
                                ? 'text-red-600'
                                : isExpiringSoon(announcement)
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                            {getDaysRemainingText(announcement)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatLeaveDate(announcement.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setSelectedAnnouncement(announcement)
                            }
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Lihat Detail">
                            <SquareArrowOutUpRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(announcement.id)}
                            className={`p-1 rounded ${
                              announcement.is_active
                                ? 'text-gray-600 hover:text-gray-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={
                              announcement.is_active
                                ? 'Nonaktifkan'
                                : 'Aktifkan'
                            }>
                            {announcement.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setShowDeleteConfirm(announcement.id)
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Hapus">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {pagination.from} sampai {pagination.to} dari{' '}
                    {pagination.total} data
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.current_page - 1)
                      }
                      disabled={pagination.current_page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>

                    {Array.from(
                      { length: Math.min(5, pagination.last_page) },
                      (_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 border rounded-lg text-sm ${
                              pagination.current_page === page
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}>
                            {page}
                          </button>
                        )
                      },
                    )}

                    <button
                      onClick={() =>
                        handlePageChange(pagination.current_page + 1)
                      }
                      disabled={
                        pagination.current_page === pagination.last_page
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm
                ? 'Tidak ada pengumuman yang cocok dengan pencarian'
                : 'Belum ada pengumuman'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="mt-4 text-blue-500 hover:text-blue-600">
                Buat pengumuman pertama
              </button>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-500 hover:text-blue-600">
                Hapus filter pencarian
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnnouncementsManagement
