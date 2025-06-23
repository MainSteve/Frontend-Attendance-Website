'use client'
import React, { useState } from 'react'
import * as Yup from 'yup'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'

import { useAuth } from '@/hooks/auth'
import AuthCard from '@/components/AuthCard'
import ApplicationLogo from '@/components/ApplicationLogo'
import AuthSessionStatus from '@/components/AuthSessionStatus'

interface FormValues {
  email: string
}

const ForgotPasswordPage = () => {
  const [status, setStatus] = useState<string>('')
  const router = useRouter()

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
    <AuthCard
      logo={
        <Link href="/">
          <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
        </Link>
      }>
      <div className="mb-4 text-sm text-gray-600">
        Forgot your password? No problem. Just let us know your email address
        and we will email you a password reset link that will allow you to
        choose a new one.
      </div>

      <AuthSessionStatus className="mb-4" status={status} />

      <Formik
        onSubmit={submitForm}
        validationSchema={ForgotPasswordSchema}
        initialValues={{ email: '' }}>
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block font-medium text-sm text-gray-700">
                Email
              </label>

              <Field
                id="email"
                name="email"
                type="email"
                className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter your email address"
              />

              <ErrorMessage
                name="email"
                component="span"
                className="text-xs text-red-500"
              />
            </div>

            <div className="flex items-center justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
                {isSubmitting ? 'Sending...' : 'Email Password Reset Link'}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="flex items-center justify-center mt-4">
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Back to Login
        </Link>
      </div>
    </AuthCard>
  )
}

export default ForgotPasswordPage
