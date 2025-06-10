// src/hooks/users.ts
import useSWR from 'swr'
import axios from '@/lib/axios'
import { UserType } from '@/types/User'
import { Department } from '@/types/Department'

// Hook for users list
export const useUsers = () => {
  const { data, error, mutate } = useSWR<UserType[]>('/api/users', () =>
    axios.get('/api/users').then(res => res.data),
  )

  const createUser = async (userData: Partial<UserType>) => {
    try {
      const response = await axios.post('/api/users', userData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateUser = async (id: number, userData: Partial<UserType>) => {
    try {
      const response = await axios.put(`/api/users/${id}`, userData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`)
      mutate() // Revalidate the cache
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    users: data,
    isLoading: !error && !data,
    isError: error,
    createUser,
    updateUser,
    deleteUser,
    mutate,
  }
}

// Hook for single user
export const useUser = (id: number | null) => {
  const { data, error, mutate } = useSWR<UserType>(
    id ? `/api/users/${id}` : null,
    id ? () => axios.get(`/api/users/${id}`).then(res => res.data) : null,
  )

  return {
    user: data,
    isLoading: id && !error && !data,
    isError: error,
    mutate,
  }
}

// Hook for current user profile
export const useProfile = () => {
  const { data, error, mutate } = useSWR<UserType>('/api/user', () =>
    axios.get('/api/user').then(res => res.data),
  )

  const updateProfile = async (userData: Partial<UserType>) => {
    try {
      const response = await axios.put('/api/user', userData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const uploadPhotoProfile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('photo_profile', file)

      const response = await axios.post(
        `/api/users/${data?.id}/photo-profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deletePhotoProfile = async () => {
    try {
      const response = await axios.delete(
        `/api/users/${data?.id}/photo-profile`,
      )
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    profile: data,
    isLoading: !error && !data,
    isError: error,
    updateProfile,
    uploadPhotoProfile,
    deletePhotoProfile,
    mutate,
  }
}

// Hook for user photo profile operations (for any user)
export const useUserPhotoProfile = (userId: number) => {
  const uploadPhotoProfile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('photo_profile', file)

      const response = await axios.post(
        `/api/users/${userId}/photo-profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deletePhotoProfile = async () => {
    try {
      const response = await axios.delete(`/api/users/${userId}/photo-profile`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const getPhotoProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/photo-profile`)
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    uploadPhotoProfile,
    deletePhotoProfile,
    getPhotoProfile,
  }
}

// Hook for departments
export const useDepartments = () => {
  const { data, error, mutate } = useSWR<Department[]>('/api/departments', () =>
    axios.get('/api/departments').then(res => res.data),
  )

  const createDepartment = async (departmentData: { name: string }) => {
    try {
      const response = await axios.post('/api/departments', departmentData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const updateDepartment = async (
    id: number,
    departmentData: { name: string },
  ) => {
    try {
      const response = await axios.put(`/api/departments/${id}`, departmentData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const deleteDepartment = async (id: number) => {
    try {
      await axios.delete(`/api/departments/${id}`)
      mutate() // Revalidate the cache
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    departments: data,
    isLoading: !error && !data,
    isError: error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    mutate,
  }
}
