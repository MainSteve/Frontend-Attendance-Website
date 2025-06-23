'use client'
import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth'

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
  token: string
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

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block font-medium text-sm text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            required
            disabled={loading}
            className="block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your email"
          />
          {errors.email && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.email[0]}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block font-medium text-sm text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            required
            disabled={loading}
            minLength={8}
            className="block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter new password (min. 8 characters)"
          />
          {errors.password && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.password[0]}
            </span>
          )}
        </div>

        {/* Password Confirmation Field */}
        <div>
          <label
            htmlFor="passwordConfirmation"
            className="block font-medium text-sm text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            value={formData.passwordConfirmation}
            onChange={handleInputChange('passwordConfirmation')}
            required
            disabled={loading}
            minLength={8}
            className="block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Confirm your new password"
          />
          {errors.password_confirmation && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.password_confirmation[0]}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading ?? !token}
            className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150">
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </div>

        {/* Invalid Token Warning */}
        {!token && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-600">
              Invalid or missing reset token. Please request a new password
              reset link.
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
