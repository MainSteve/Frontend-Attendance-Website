'use client'
import Link from 'next/link'
import Image from 'next/image'
import * as Yup from 'yup'
import axios, { AxiosError } from 'axios'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'

import { useAuth } from '@/hooks/auth'
import { useState, useEffect } from 'react'
import AuthSessionStatus from '@/components/AuthSessionStatus'
import { useRouter, useSearchParams } from 'next/navigation'

interface Values {
  id: string
  password: string
}

const LoginPage = () => {
  const [status, setStatus] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectUrl = searchParams.get('redirect')

  const { user, login } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (user) {
      if (redirectUrl) {
        // Redirect to the original QR scan page
        router.push(decodeURIComponent(redirectUrl))
      } else {
        // Default redirect to dashboard
        router.push('/dashboard')
      }
    }
  }, [user, redirectUrl, router])

  const handleLoginSuccess = () => {
    if (redirectUrl) {
      // After successful login, redirect to QR scan page
      router.push(decodeURIComponent(redirectUrl))
    } else {
      // Default redirect to dashboard
      router.push('/dashboard')
    }
  }

  const submitForm = async (
    values: Values,
    { setSubmitting, setErrors }: FormikHelpers<Values>,
  ): Promise<any> => {
    try {
      await login({
        id: values.id,
        password: values.password,
      })
    } catch (error: Error | AxiosError | any) {
      // Log the full error to console first
      console.error('Login Error:', error)

      if (axios.isAxiosError(error) && error.response?.status === 422) {
        console.error('422 Validation Error:', error.response?.data)
        setErrors(error.response?.data?.errors)
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('401 Unauthorized:', error.response?.data)
        setStatus('Invalid credentials')
      } else if (axios.isAxiosError(error)) {
        console.error('Axios Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          stack: error.stack,
        })
        const errorMessage =
          error.response?.data?.message ?? 'An error occurred'
        setStatus(errorMessage)
      } else {
        console.error('Non-Axios Error:', {
          message: error.message,
          stack: error.stack,
          error: error,
        })
        setStatus(error.message ?? 'Unknown error occurred')
      }
    } finally {
      setSubmitting(false)
      handleLoginSuccess()
    }
  }

  const LoginSchema = Yup.object().shape({
    id: Yup.string().required('The ID field is required.'),
    password: Yup.string().required('The password field is required.'),
  })

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
        {/* Animated floating elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-blue-400/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
        
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500/50 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-blue-500/50 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Logo Section */}
          <div className="text-center space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-24 h-24 mx-auto mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl p-2 shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Company Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Status Message */}
          <AuthSessionStatus className="mb-4" status={status} />
          
          {/* Redirect Notice */}
          {redirectUrl && (
            <div className="mb-4 p-4 bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 rounded-xl">
              <p className="text-sm text-white/90 text-center">
                🔒 Please log in to continue with QR code attendance.
              </p>
            </div>
          )}

          {/* Login Form */}
          <Formik
            onSubmit={submitForm}
            validationSchema={LoginSchema}
            initialValues={{ id: '', password: '' }}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Employee ID Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="id"
                    className="block font-medium text-sm text-white/90">
                    Employee ID
                  </label>
                  <Field
                    id="id"
                    name="id"
                    type="text"
                    className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/50 focus:bg-white/20 transition-all duration-200"
                    placeholder="Enter your employee ID"
                  />
                  <ErrorMessage
                    name="id"
                    component="span"
                    className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-lg"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block font-medium text-sm text-white/90">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="span"
                    className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-lg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                  
                  <div className="text-center">
                    <Link
                      href="/forgot-password"
                      className="text-white/80 hover:text-white text-sm font-medium hover:underline transition-colors">
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-xs">
            © 2025 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage