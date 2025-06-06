'use client'

import { useState, useCallback } from 'react'

interface UseTaskLogMutationsOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface UseTaskLogMutationsReturn {
  // Mutation functions
  addTaskLog: (attendanceId: number, formData: FormData) => Promise<void>
  updateTaskLog: (taskLogId: number, formData: FormData) => Promise<void>
  deleteTaskLog: (taskLogId: number) => Promise<void>

  // Loading states
  isAdding: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Error states
  addError: string | null
  updateError: string | null
  deleteError: string | null
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`

export const useTaskLogMutations = (
  options: UseTaskLogMutationsOptions = {},
): UseTaskLogMutationsReturn => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [addError, setAddError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('token') ?? sessionStorage.getItem('token')
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    }
  }

  // Helper function to handle API response
  const handleResponse = async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message ?? `HTTP error! status: ${response.status}`)
    }

    if (!data.status) {
      throw new Error(data.message ?? 'Operation failed')
    }

    return data
  }

  // Add new task log
  const addTaskLog = useCallback(
    async (attendanceId: number, formData: FormData) => {
      setIsAdding(true)
      setAddError(null)

      try {
        const response = await fetch(
          `${API_BASE_URL}/attendance/${attendanceId}/task-log`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData, // FormData automatically sets content-type
          },
        )

        const result = await handleResponse(response)

        options.onSuccess?.(result)
      } catch (error: any) {
        const errorMessage = error.message ?? 'Failed to add task log'
        setAddError(errorMessage)
        options.onError?.(error)
        throw error
      } finally {
        setIsAdding(false)
      }
    },
    [options],
  )

  // Update existing task log
  const updateTaskLog = useCallback(
    async (taskLogId: number, formData: FormData) => {
      setIsUpdating(true)
      setUpdateError(null)

      try {
        // Add _method field for Laravel method spoofing
        formData.append('_method', 'PUT')

        const response = await fetch(
          `${API_BASE_URL}/attendance/task-log/${taskLogId}`,
          {
            method: 'POST', // Using POST with _method spoofing for file uploads
            headers: getAuthHeaders(),
            body: formData,
          },
        )

        const result = await handleResponse(response)

        options.onSuccess?.(result)
      } catch (error: any) {
        const errorMessage = error.message ?? 'Failed to update task log'
        setUpdateError(errorMessage)
        options.onError?.(error)
        throw error
      } finally {
        setIsUpdating(false)
      }
    },
    [options],
  )

  // Delete task log
  const deleteTaskLog = useCallback(
    async (taskLogId: number) => {
      setIsDeleting(true)
      setDeleteError(null)

      try {
        const response = await fetch(
          `${API_BASE_URL}/attendance/task-log/${taskLogId}`,
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          },
        )

        const result = await handleResponse(response)

        options.onSuccess?.(result)
      } catch (error: any) {
        const errorMessage = error.message ?? 'Failed to delete task log'
        setDeleteError(errorMessage)
        options.onError?.(error)
        throw error
      } finally {
        setIsDeleting(false)
      }
    },
    [options],
  )

  return {
    // Mutation functions
    addTaskLog,
    updateTaskLog,
    deleteTaskLog,

    // Loading states
    isAdding,
    isUpdating,
    isDeleting,

    // Error states
    addError,
    updateError,
    deleteError,
  }
}
