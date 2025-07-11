'use client'
import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  AlertTriangle,
} from 'lucide-react'

// Type definitions
interface FormData {
  email: string
  password: string
  passwordConfirmation: string
}

interface FormErrors {
  email?: string[]
  password?: string[]
  password_confirmation?: string[]
  [key: string]: string[] | undefined
}

interface ResetPasswordFormProps {
  readonly token: string
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps): JSX.Element {
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()
  const router = useRouter()
  const emailFromUrl = searchParams.get('email') ?? ''

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState<boolean>(false)

  useEffect(() => {
    if (emailFromUrl) {
      setFormData(prev => ({
        ...prev,
        email: decodeURIComponent(emailFromUrl),
      }))
    }
  }, [emailFromUrl])

  const handleInputChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value,
      }))

      // Clear specific field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }))
      }
    }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()

    if (!token) {
      setErrors({ email: ['Invalid or missing reset token.'] })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await resetPassword({
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
        token,
      })

      // Redirect to login page on success
      router.push('/login?reset=success')
    } catch (error: any) {
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors ?? {})
      } else {
        setErrors({
          password: ['Something went wrong. Please try again.'],
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Invalid Token Warning
  if (!token) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl backdrop-blur-sm border bg-red-500/20 border-red-300/30">
          <div className="flex items-center space-x-3 text-red-100">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Invalid Reset Token</p>
              <p className="text-xs text-red-200 mt-1">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/forgot-password"
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center">
            Request New Reset Link
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center space-x-2 text-white/80 hover:text-white font-medium transition-colors group">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block font-medium text-sm text-white/90">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-white/50" />
            </div>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              disabled={loading}
              className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/50 focus:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <span className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-lg inline-block">
              {errors.email[0]}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block font-medium text-sm text-white/90">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-white/50" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              disabled={loading}
              minLength={8}
              className="block w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter new password (min. 8 characters)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/70 transition-colors">
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-lg inline-block">
              {errors.password[0]}
            </span>
          )}
        </div>

        {/* Password Confirmation Field */}
        <div className="space-y-2">
          <label
            htmlFor="passwordConfirmation"
            className="block font-medium text-sm text-white/90">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-4 w-4 text-white/50" />
            </div>
            <input
              id="passwordConfirmation"
              type={showPasswordConfirmation ? 'text' : 'password'}
              value={formData.passwordConfirmation}
              onChange={handleInputChange('passwordConfirmation')}
              required
              disabled={loading}
              minLength={8}
              className="block w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 focus:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswordConfirmation(!showPasswordConfirmation)
              }
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/70 transition-colors">
              {showPasswordConfirmation ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <span className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-lg inline-block">
              {errors.password_confirmation[0]}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Resetting Password...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Reset Password</span>
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Back to Login */}
      <div className="pt-4 border-t border-white/10">
        <Link
          href="/login"
          className="flex items-center justify-center space-x-2 text-white/80 hover:text-white font-medium transition-colors group">
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  )
}
