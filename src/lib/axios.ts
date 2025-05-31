import Axios, { AxiosInstance } from 'axios'

const axios: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // For token-based auth, these aren't needed
  // but we can keep them for backward compatibility
  withCredentials: true,
  withXSRFToken: true, 
})

// Add an interceptor to include the auth token in all requests
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

export default axios