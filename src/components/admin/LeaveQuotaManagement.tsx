// src/components/admin/LeaveQuotaManagement.tsx

import React, { useState, useEffect } from 'react'
import { useUsers } from '@/hooks/users'
import { useLeaveQuotas } from '@/hooks/leaveQuota'
import {
  UserPlus,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  RefreshCw,
} from 'lucide-react'
import { getYearOptions } from '@/utils/dateConverter'

interface QuotaFormData {
  user_id: string
  year: number
  total_quota: number
}

interface GenerateQuotaData {
  year: number
  default_quota: number
}

const LeaveQuotaManagement = () => {
  // State management
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  )
  const [quotaFormData, setQuotaFormData] = useState<QuotaFormData>({
    user_id: '',
    year: new Date().getFullYear(),
    total_quota: 12,
  })
  const [generateQuotaData, setGenerateQuotaData] = useState<GenerateQuotaData>(
    {
      year: new Date().getFullYear(),
      default_quota: 12,
    },
  )
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [editedTotalQuota, setEditedTotalQuota] = useState<number | null>(null)

  // Hooks
  const { users, isLoading: usersLoading, mutate: mutateUsers } = useUsers()
  const {
    leaveQuotas,
    isLoading: quotasLoading,
    createLeaveQuota,
    updateLeaveQuota,
    generateYearlyQuotas,
    mutate,
  } = useLeaveQuotas(selectedYear)

  // Get current user's quota for editing
  const selectedUserQuota = leaveQuotas.find(
    quota =>
      quota.user_id === parseInt(selectedUserId) && quota.year === selectedYear,
  )

  // Available years for dropdown
  const availableYears = getYearOptions(3, 2)

  // Filter users (exclude admins for quota management)
  const employeeUsers = users?.filter(user => user.role !== 'admin') || []

  // Show message helper
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Handle form submission for creating new quota
  const handleCreateQuota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quotaFormData.user_id) {
      showMessage('error', 'Please select a user')
      return
    }

    setIsCreating(true)
    try {
      await createLeaveQuota({
        user_id: parseInt(quotaFormData.user_id),
        year: quotaFormData.year,
        total_quota: quotaFormData.total_quota,
      })
      showMessage('success', 'Leave quota created successfully')
      setQuotaFormData({
        user_id: '',
        year: new Date().getFullYear(),
        total_quota: 12,
      })
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ?? 'Failed to create leave quota'
      showMessage('error', errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle quota update
  const handleUpdateQuota = async () => {
    if (!selectedUserQuota) return

    setIsUpdating(true)
    try {
      await updateLeaveQuota(selectedUserQuota.id, {
        total_quota: selectedUserQuota.total_quota,
      })
      showMessage('success', 'Leave quota updated successfully')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ?? 'Failed to update leave quota'
      showMessage('error', errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle generate yearly quotas
  const handleGenerateQuotas = async () => {
    setIsGenerating(true)
    try {
      const result = await generateYearlyQuotas(generateQuotaData)
      showMessage('success', result.message)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ?? 'Failed to generate yearly quotas'
      showMessage('error', errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  // Get user statistics
  const getUserStats = () => {
    const totalUsers = employeeUsers.length
    const usersWithQuota = leaveQuotas.filter(
      quota => quota.year === selectedYear,
    ).length
    const usersWithoutQuota = totalUsers - usersWithQuota

    return { totalUsers, usersWithQuota, usersWithoutQuota }
  }

  const stats = getUserStats()

  // Update editedTotalQuota when selectedUserQuota changes
  useEffect(() => {
    if (selectedUserQuota) {
      setEditedTotalQuota(selectedUserQuota.total_quota);
    } else {
      setEditedTotalQuota(null);
    }
  }, [selectedUserQuota]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Manajemen Jatah Cuti
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              mutateUsers()
              mutate()
            }}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <Calendar className="h-5 w-5 text-blue-500" />
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Karyawan
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Ada Jatah Cuti
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.usersWithQuota}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Belum Ada Jatah
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.usersWithoutQuota}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Create New Quota */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <UserPlus className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            Buat Jatah Cuti Baru
          </h2>
        </div>

        <form onSubmit={handleCreateQuota} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Karyawan
              </label>
              <select
                value={quotaFormData.user_id}
                onChange={e =>
                  setQuotaFormData({
                    ...quotaFormData,
                    user_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={usersLoading}>
                <option value="">Pilih karyawan...</option>
                {employeeUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun
              </label>
              <select
                value={quotaFormData.year}
                onChange={e =>
                  setQuotaFormData({
                    ...quotaFormData,
                    year: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Jatah Cuti
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={quotaFormData.total_quota}
                onChange={e =>
                  setQuotaFormData({
                    ...quotaFormData,
                    total_quota: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isCreating ? 'Membuat...' : 'Buat Jatah Cuti'}
          </button>
        </form>
      </div>

      {/* Edit Existing Quota */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Edit Jatah Cuti
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Karyawan
          </label>
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={usersLoading}>
            <option value="">Pilih karyawan...</option>
            {employeeUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.position}
              </option>
            ))}
          </select>
        </div>

        {selectedUserId && selectedUserQuota && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Jatah
                </label>
                <input
                  type="number"
                  min={selectedUserQuota.used_quota}
                  max="365"
                  value={editedTotalQuota ?? ''}
                  onChange={e => setEditedTotalQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sudah Digunakan
                </label>
                <input
                  type="number"
                  value={selectedUserQuota.used_quota}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sisa Jatah
                </label>
                <input
                  type="number"
                  value={selectedUserQuota.remaining_quota}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persentase Terpakai
                </label>
                <input
                  type="text"
                  value={`${Math.round(
                    (selectedUserQuota.used_quota /
                      selectedUserQuota.total_quota) *
                      100,
                  )}%`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                if (editedTotalQuota !== null && editedTotalQuota !== selectedUserQuota.total_quota) {
                  setIsUpdating(true);
                  try {
                    await updateLeaveQuota(selectedUserQuota.id, {
                      total_quota: editedTotalQuota,
                    });
                    showMessage('success', 'Leave quota updated successfully');
                    mutate();
                  } catch (error: any) {
                    const errorMessage =
                      error.response?.data?.message ?? 'Failed to update leave quota';
                    showMessage('error', errorMessage);
                  } finally {
                    setIsUpdating(false);
                  }
                }
              }}
              disabled={isUpdating || editedTotalQuota === null || editedTotalQuota === selectedUserQuota.total_quota}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isUpdating ? 'Updating...' : 'Update Jatah Cuti'}
            </button>
          </div>
        )}

        {selectedUserId && !selectedUserQuota && !quotasLoading && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>
              Karyawan ini belum memiliki jatah cuti untuk tahun {selectedYear}
            </p>
            <p className="text-sm">
              Gunakan form di atas untuk membuat jatah cuti baru
            </p>
          </div>
        )}
      </div>

      {/* Generate Yearly Quotas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            Generate Jatah Cuti Tahunan
          </h2>
        </div>

        <p className="text-gray-600 mb-4">
          Generate jatah cuti untuk semua karyawan yang belum memiliki jatah
          pada tahun tersebut
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <select
              value={generateQuotaData.year}
              onChange={e =>
                setGenerateQuotaData({
                  ...generateQuotaData,
                  year: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Jatah Cuti
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={generateQuotaData.default_quota}
              onChange={e =>
                setGenerateQuotaData({
                  ...generateQuotaData,
                  default_quota: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateQuotas}
          disabled={isGenerating}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isGenerating
            ? 'Generating...'
            : `Generate Jatah Cuti ${generateQuotaData.year}`}
        </button>
      </div>

      {/* Current Quotas List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daftar Jatah Cuti {selectedYear}
        </h2>

        {quotasLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : leaveQuotas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Karyawan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Jatah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terpakai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sisa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persentase
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveQuotas.map(quota => (
                  <tr key={quota.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quota.user?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quota.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quota.user?.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quota.total_quota} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quota.used_quota} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quota.remaining_quota} hari
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              quota.remaining_quota / quota.total_quota <= 0.1
                                ? 'bg-red-500'
                                : quota.remaining_quota / quota.total_quota <=
                                  0.3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${
                                (quota.used_quota / quota.total_quota) * 100
                              }%`,
                            }}></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {Math.round(
                            (quota.used_quota / quota.total_quota) * 100,
                          )}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Belum ada jatah cuti untuk tahun {selectedYear}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveQuotaManagement
