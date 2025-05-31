import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: string
  position?: string
  department_id?: number | null
}

interface LoginData {
  id: string | number
  password: string
}

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
}: {
  middleware?: string
  redirectIfAuthenticated?: string
}) => {
  const router = useRouter()

  // Store token in localStorage
  const storeToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)

      // Set the token in axios headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }

  // Store user in localStorage
  const storeUser = (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Set token in axios headers on initial load
  useEffect(() => {
    const token = getToken()
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  const {
    data: user,
    error,
    mutate,
    isLoading: swrIsLoading,
    isValidating,
  } = useSWR(
    '/api/user',
    () =>
      axios
        .get('/api/user')
        .then(res => res.data)
        .catch(error => {
          if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          }
          throw error
        }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  // Calculate loading state
  const isLoading = swrIsLoading || isValidating

  // Register functionality
  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/api/register', data)

      // If the API returns a token directly (depends on your backend implementation)
      if (response.data.token) {
        storeToken(response.data.token)
        if (response.data.user) {
          storeUser(response.data.user)
        }
      }

      await mutate()
      return response
    } catch (error) {
      console.error(error)
    }
  }

  const login = async (data: LoginData) => {
    try {
      const response = await axios.post('/api/login', data)

      // Store the token and user data
      if (response.data.token) {
        storeToken(response.data.token)
        if (response.data.user) {
          storeUser(response.data.user)
        }
      }

      await mutate()
      return response
    } catch (error) {
      console.error(error)
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/logout')

      // Remove token and user data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
      }

      await mutate(undefined)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)

      // Even if API call fails, remove token from client
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
      }

      router.push('/login')
    }
  }

  // Utility to get the current user role
  const getUserRole = (): string | null => {
    if (user) {
      return user.role
    }

    // Try to get from localStorage as fallback
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          return parsedUser.role ?? null
        } catch (e) {
          console.error(e)
        }
      }
    }

    return null
  }

  useEffect(() => {
    if (middleware === 'guest' && redirectIfAuthenticated && user) {
      router.push(redirectIfAuthenticated)
    }

    if (middleware === 'auth' && error) {
      logout()
    }
  }, [user, error, middleware, redirectIfAuthenticated])

  return {
    user,
    register,
    login,
    logout,
    getUserRole,
    isLoading,
    error,
    mutate,
  }
}
