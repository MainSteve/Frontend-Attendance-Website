'use client'
import React, { useState } from 'react'
import * as Yup from 'yup'
import Link from 'next/link'
import Image from 'next/image'
import axios, { AxiosError } from 'axios'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import { ArrowLeft, Mail, Send } from 'lucide-react'

import { useAuth } from '@/hooks/auth'

interface FormValues {
  email: string
}

const ForgotPasswordPage = () => {
  const [status, setStatus] = useState<string>('')

  const { forgotPassword } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .required('The email field is required.'),
  })

  const submitForm = async (
    values: FormValues,
    { setSubmitting, setErrors }: FormikHelpers<FormValues>,
  ): Promise<any> => {
    try {
      const response = await forgotPassword({
        email: values.email,
      })

      // Set success status from response
      setStatus(response.message || 'We have emailed your password reset link!')

      // Clear any previous errors
      setErrors({})
    } catch (error: Error | AxiosError | any) {
      setStatus('')
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response?.data?.errors)
      } else {
        setStatus(
          'An error occurred while sending the reset link. Please try again.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
        {/* Animated floating elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-2xl animate-bounce"
          style={{ animationDuration: '3s' }}></div>
        <div
          className="absolute top-1/2 left-10 w-64 h-64 bg-blue-400/15 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '1s' }}></div>
        <div
          className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}></div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>

        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500/50 to-transparent animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-l from-blue-500/50 to-transparent animate-pulse"
            style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Logo Section */}
          <div className="text-center space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-20 h-20 mx-auto mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl p-2 shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Company Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white mb-2">
                Reset Password
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                Forgot your password? No problem. Just enter your email address
                and we&apos;ll send you a password reset link
              </p>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={`p-4 rounded-xl backdrop-blur-sm border ${
                status.includes('error') || status.includes('An error')
                  ? 'bg-red-500/20 border-red-300/30 text-red-100'
                  : 'bg-green-500/20 border-green-300/30 text-green-100'
              }`}>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{status}</p>
              </div>
            </div>
          )}

          {/* Forgot Password Form */}
          <Formik
            onSubmit={submitForm}
            validationSchema={ForgotPasswordSchema}
            initialValues={{ email: '' }}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
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
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/50 focus:bg-white/20 transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="span"
                    className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded-lg inline-block"
                  />
                </div>

                {/* Submit Button */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Reset Link...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Send Reset Link</span>
                      </div>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

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

export default ForgotPasswordPage
