'use client'

import React, { useState } from 'react'
import {
  X,
  Clock,
  MapPin,
  Calendar,
  Smartphone,
  QrCode,
  LogIn,
  LogOut,
  Hash,
  Eye,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save,
  Ban,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react'
// import { AttendanceRecord } from '@/types/Attendance'
import { useTaskLogMutations } from '@/hooks/useTaskLogMutations'
import { useAttendanceDetail } from '@/hooks/useAttendanceDetail'
import ImageUploader from '@/components/common/ImageUploader'

interface AttendanceRecordDetailModalProps {
  recordId: number | null
  isOpen: boolean
  onClose: () => void
}

interface TaskLogFormData {
  description: string
  photo: File | null
}

interface EditingTaskLog {
  id: number
  description: string
  photo: File | null
}

const AttendanceRecordDetailModal: React.FC<
  AttendanceRecordDetailModalProps
> = ({ recordId, isOpen, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTaskLog, setEditingTaskLog] = useState<EditingTaskLog | null>(
    null,
  )
  const [newTaskLog, setNewTaskLog] = useState<TaskLogFormData>({
    description: '',
    photo: null,
  })

  const { attendanceDetail, isLoading, isError, mutate } = useAttendanceDetail(
    recordId,
    { enabled: isOpen && !!recordId },
  )

  const {
    addTaskLog,
    updateTaskLog,
    deleteTaskLog,
    isAdding,
    isUpdating,
    isDeleting,
  } = useTaskLogMutations({
    onSuccess: () => {
      mutate() // Refresh data
      setShowAddForm(false)
      setEditingTaskLog(null)
      setNewTaskLog({ description: '', photo: null })
    },
    onError: error => {
      console.error('Task log operation failed:', error)
      alert('Operasi gagal. Silakan coba lagi.')
    },
  })

  if (!isOpen) return null

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  const getClockTypeIcon = (type: string) => {
    return type === 'in' ? (
      <LogIn className="h-5 w-5 text-green-600" />
    ) : (
      <LogOut className="h-5 w-5 text-red-600" />
    )
  }

  const getMethodIcon = (method: string) => {
    return method === 'qr_code' ? (
      <QrCode className="h-5 w-5 text-blue-600" />
    ) : (
      <Smartphone className="h-5 w-5 text-gray-600" />
    )
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false,
  ) => {
    const file = e.target.files?.[0] || null
    if (isEdit && editingTaskLog) {
      setEditingTaskLog({ ...editingTaskLog, photo: file })
    } else {
      setNewTaskLog({ ...newTaskLog, photo: file })
    }
  }

  const handleAddTaskLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attendanceDetail || !newTaskLog.description.trim()) return

    const formData = new FormData()
    formData.append('description', newTaskLog.description)
    if (newTaskLog.photo) {
      formData.append('photo', newTaskLog.photo)
    }

    await addTaskLog(attendanceDetail.id, formData)
  }

  const handleUpdateTaskLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTaskLog?.description.trim()) return

    const formData = new FormData()
    formData.append('description', editingTaskLog.description)
    if (editingTaskLog.photo) {
      formData.append('photo', editingTaskLog.photo)
    }

    await updateTaskLog(editingTaskLog.id, formData)
  }

  const handleDeleteTaskLog = async (taskLogId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus task log ini?')) {
      await deleteTaskLog(taskLogId)
    }
  }

  const startEditing = (taskLog: any) => {
    setEditingTaskLog({
      id: taskLog.id,
      description: taskLog.description,
      photo: null,
    })
  }

  const cancelEditing = () => {
    setEditingTaskLog(null)
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 ml-2">Memuat detail record...</span>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="text-center text-red-600 py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg mb-2">Gagal memuat detail record</p>
          <p className="text-sm text-gray-600">
            Record tidak ditemukan atau terjadi kesalahan
          </p>
        </div>
      )
    }

    if (!attendanceDetail) {
      return (
        <div className="text-center text-gray-500 py-12">
          <p>Tidak ada data untuk ditampilkan</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div
          className={`
          border-l-4 rounded-lg p-4
          ${
            attendanceDetail.clock_type === 'in'
              ? 'border-l-green-500 bg-green-50'
              : 'border-l-red-500 bg-red-50'
          }
        `}>
          <div className="flex items-center space-x-3 mb-3">
            {getClockTypeIcon(attendanceDetail.clock_type)}
            <span
              className={`font-bold text-lg uppercase ${
                attendanceDetail.clock_type === 'in'
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
              Clock {attendanceDetail.clock_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium mr-2">Tanggal:</span>
              <span>{formatDate(attendanceDetail.created_at)}</span>
            </div>

            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium mr-2">Waktu:</span>
              <span className="font-mono">
                {formatTime(attendanceDetail.created_at)}
              </span>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium mr-2">Lokasi:</span>
              <span>{attendanceDetail.location || 'Remote'}</span>
            </div>

            <div className="flex items-center">
              {getMethodIcon(attendanceDetail.method)}
              <span className="font-medium mr-2 ml-2">Metode:</span>
              <span className="capitalize">
                {attendanceDetail.method === 'qr_code' ? 'QR Code' : 'Manual'}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Hash className="h-4 w-4 mr-2" />
            Informasi Record
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Record ID:</span>
              <span className="ml-2 font-mono text-blue-600">
                #{attendanceDetail.id}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">User ID:</span>
              <span className="ml-2 font-mono">{attendanceDetail.user_id}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Dibuat:</span>
              <span className="ml-2">
                {formatDateTime(attendanceDetail.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Task Logs Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-blue-900">Aktivitas Tugas</h3>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || isAdding}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="h-4 w-4 mr-1" />
              Tambah Task
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {attendanceDetail.task_logs_count}
              </div>
              <div className="text-sm text-blue-700">Total Task Logs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {attendanceDetail.photos_count}
              </div>
              <div className="text-sm text-blue-700">Dengan Foto</div>
            </div>
          </div>
        </div>

        {/* Add New Task Log Form */}
        {showAddForm && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">
              Tambah Task Log Baru
            </h4>
            <form onSubmit={handleAddTaskLog} className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Task *
                </label>
                <textarea
                  value={newTaskLog.description}
                  onChange={e =>
                    setNewTaskLog({
                      ...newTaskLog,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your task activity..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="ImageUploader"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Foto (Opsional)
                </label>
                <ImageUploader
                  file={newTaskLog.photo}
                  onChange={e => handleFileChange(e, false)}
                  label="Upload foto task"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isAdding ?? !newTaskLog.description.trim()}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Task
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewTaskLog({ description: '', photo: null })
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                  <Ban className="h-4 w-4 mr-2" />
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Logs List */}
        {attendanceDetail.task_logs && attendanceDetail.task_logs.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Daftar Task Logs</h3>
            {attendanceDetail.task_logs.map((task, index) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4">
                {editingTaskLog?.id === task.id ? (
                  // Edit Form
                  <form onSubmit={handleUpdateTaskLog} className="space-y-4">
                    <div>
                      <textarea
                        value={editingTaskLog.description}
                        onChange={e =>
                          setEditingTaskLog({
                            ...editingTaskLog,
                            description: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="ImageUploader"
                        className="block text-sm font-medium text-gray-700 mb-2">
                        Update Foto
                      </label>
                      <ImageUploader
                        file={editingTaskLog.photo}
                        onChange={e => handleFileChange(e, true)}
                        label="Upload foto baru"
                      />
                      {task.photo_url && (
                        <p className="text-xs text-gray-500 mt-1">
                          Foto saat ini akan diganti jika Anda upload foto baru
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Update
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                        <Ban className="h-4 w-4 mr-1" />
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            Task #{index + 1}
                          </h4>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            ID: {task.id}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {task.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                          <span>{formatDateTime(task.created_at)}</span>
                          {task.has_photo && (
                            <span className="flex items-center text-green-600">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Dengan foto
                            </span>
                          )}
                        </div>
                      </div>

                      {task.photo_url && (
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            className="w-20 h-20 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() =>
                              window.open(task.photo_url ?? '', '_blank')
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                window.open(task.photo_url ?? '', '_blank')
                              }
                            }}
                            title={`View task ${index + 1} photo in new tab`}>
                            <img
                              src={task.photo_url}
                              alt={`Task ${index + 1}`}
                              className="w-full h-full object-cover rounded hover:opacity-75 transition-opacity"
                              onError={e => {
                                const target = e.target as HTMLImageElement
                                target.parentElement?.style.setProperty(
                                  'display',
                                  'none',
                                )
                              }}
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => startEditing(task)}
                        className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTaskLog(task.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50">
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
            <p>Tidak ada task logs untuk record ini</p>
            {!showAddForm && ( // Only hide when form is shown
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 mt-3">
                <Plus className="h-4 w-4 mr-1" />
                Tambah Task Log Pertama
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Detail Record Kehadiran
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceRecordDetailModal
