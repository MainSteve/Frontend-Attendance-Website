import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Type definitions
interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  role?: string
  position?: string
  department_id?: number | null
  created_at?: string
  updated_at?: string
}

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

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  token: string
  email: string
  password: string
  password_confirmation: string
}

interface UseAuthOptions {
  middleware?: 'guest' | 'auth' | string
  redirectIfAuthenticated?: string
}

interface AuthResponse {
  token?: string
  user?: User
  message?: string
  success?: boolean
}

interface UseAuthReturn {
  user: User | undefined
  register: (data: RegisterData) => Promise<AuthResponse | undefined>
  login: (data: LoginData) => Promise<AuthResponse | undefined>
  logout: () => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<AuthResponse>
  resetPassword: (data: ResetPasswordData) => Promise<AuthResponse>
  getUserRole: () => string | null
  isLoading: boolean
  error: any
  mutate: any
}

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
}: UseAuthOptions = {}): UseAuthReturn => {
  const router = useRouter()

  // Store token in localStorage
  const storeToken = (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      // Set the token in axios headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }

  // Store user in localStorage
  const storeUser = (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  // Get token from localStorage
  const getToken = (): string | null => {
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
  } = useSWR<User>(
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
  const isLoading: boolean = swrIsLoading || isValidating

  // Register functionality
  const register = async (
    data: RegisterData,
  ): Promise<AuthResponse | undefined> => {
    try {
      const response = await axios.post<AuthResponse>('/api/register', data)

      // If the API returns a token directly
      if (response.data.token) {
        storeToken(response.data.token)
        if (response.data.user) {
          storeUser(response.data.user)
        }
      }

      await mutate()
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Login functionality
  const login = async (data: LoginData): Promise<AuthResponse | undefined> => {
    try {
      const response = await axios.post<AuthResponse>('/api/login', data)

      // Store the token and user data
      if (response.data.token) {
        storeToken(response.data.token)
        if (response.data.user) {
          storeUser(response.data.user)
        }
      }

      await mutate()
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Forgot password functionality
  const forgotPassword = async (
    data: ForgotPasswordData,
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        '/api/forgot-password',
        data,
      )
      return response.data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  // Reset password functionality
  const resetPassword = async (
    data: ResetPasswordData,
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        '/api/reset-password',
        data,
      )

      // Optionally store token if provided (for immediate login after reset)
      if (response.data.token) {
        storeToken(response.data.token)
        if (response.data.user) {
          storeUser(response.data.user)
        }
        await mutate()
      }

      return response.data
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Logout functionality
  const logout = async (): Promise<void> => {
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
      return user.role ?? null
    }

    // Try to get from localStorage as fallback
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser)
          return parsedUser.role ?? null
        } catch (e) {
          console.error('Error parsing stored user:', e)
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
    forgotPassword,
    resetPassword,
    getUserRole,
    isLoading,
    error,
    mutate,
  }
}
