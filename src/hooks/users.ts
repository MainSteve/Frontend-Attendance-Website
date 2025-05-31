// src/hooks/users.ts
import useSWR from 'swr'
import axios from '@/lib/axios'

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  position: string | null;
  department_id: number | null;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Department {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Hook for users list
export const useUsers = () => {
  const { data, error, mutate } = useSWR<User[]>('/api/users', () => 
    axios.get('/api/users').then(res => res.data)
  )

  const createUser = async (userData: Partial<User>) => {
    try {
      const response = await axios.post('/api/users', userData)
      mutate() // Revalidate the cache
      return response.data
    } catch (error) {
        console.error(error)
      throw error
    }
  }

  const updateUser = async (id: number, userData: Partial<User>) => {
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
    mutate
  }
}

// Hook for single user
export const useUser = (id: number | null) => {
  const { data, error, mutate } = useSWR<User>(
    id ? `/api/users/${id}` : null,
    id ? () => axios.get(`/api/users/${id}`).then(res => res.data) : null
  )

  return {
    user: data,
    isLoading: id && !error && !data,
    isError: error,
    mutate
  }
}

// Hook for departments
export const useDepartments = () => {
  const { data, error, mutate } = useSWR<Department[]>('/api/departments', () => 
    axios.get('/api/departments').then(res => res.data)
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

  const updateDepartment = async (id: number, departmentData: { name: string }) => {
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
    mutate
  }
}