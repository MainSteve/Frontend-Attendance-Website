'use client'
import Link from 'next/link'
import * as Yup from 'yup'
import axios, { AxiosError } from 'axios'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'

import { useAuth } from '@/hooks/auth'
import ApplicationLogo from '@/components/ApplicationLogo'
import AuthCard from '@/components/AuthCard'
import { useState, useEffect } from 'react'
import AuthSessionStatus from '@/components/AuthSessionStatus'
import { useRouter, useSearchParams } from 'next/navigation'

interface Values {
  id: string
  password: string
  remember: boolean
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
    <AuthCard
      logo={
        <Link href="/">
          <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
        </Link>
      }>
      <AuthSessionStatus className="mb-4" status={status} />
      {redirectUrl && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Please log in to continue with QR code attendance.
          </p>
        </div>
      )}

      <Formik
        onSubmit={submitForm}
        validationSchema={LoginSchema}
        initialValues={{ id: '', password: '', remember: false }}>
        <Form className="space-y-4">
          <div>
            <label
              htmlFor="id"
              className="undefined block font-medium text-sm text-gray-700">
              Employee ID
            </label>

            <Field
              id="id"
              name="id"
              type="text"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <ErrorMessage
              name="id"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div className="">
            <label
              htmlFor="password"
              className="undefined block font-medium text-sm text-gray-700">
              Password
            </label>

            <Field
              id="password"
              name="password"
              type="password"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <ErrorMessage
              name="password"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="remember" className="inline-flex items-center">
              <Field
                type="checkbox"
                name="remember"
                className="rounded border-[#99A6AE] text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />

              <span className="ml-2 text-[#252729] text-sm leading-[150%] tracking-[-0.4px] font-medium">
                Remember me
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end mt-4 space-x-2">
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
              Login
            </button>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              Forgot Password?
            </Link>
          </div>
        </Form>
      </Formik>
    </AuthCard>
  )
}

export default LoginPage
