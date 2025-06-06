'use client'
import Link from 'next/link'
import * as Yup from 'yup'
import axios, { AxiosError } from 'axios'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/auth'
import ApplicationLogo from '@/components/ApplicationLogo'
import AuthCard from '@/components/AuthCard'

interface Department {
  id: number
  name: string
}

interface Values {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: string
  position: string
  department_id: string
}

// Define the position options
const POSITION_OPTIONS = [
  'DIREKTUR',
  'GENERAL MANAGER',
  'GENERAL DIREKSI',
  'MANAGER',
  'HRD',
  'FINANCE',
  'DEPARTMENT',
  'STAFF',
  'PEMIMPIN'
]

const RegisterPage = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const { register } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`)
        setDepartments(response.data)
        setError(null)
      } catch (err) {
        setError('Failed to load departments. Please try again later.')
        console.error('Error fetching departments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const submitForm = async (
    values: Values,
    { setSubmitting, setErrors }: FormikHelpers<Values>,
  ): Promise<any> => {
    try {
      // Convert department_id to number or null
      const formData = {
        ...values,
        department_id: values.department_id ? parseInt(values.department_id) : null,
      }
      await register(formData)
    } catch (error: Error | AxiosError | any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response?.data?.errors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required('The name field is required.'),
    email: Yup.string()
      .email('Invalid email')
      .required('The email field is required.'),
    password: Yup.string().required('The password field is required.'),
    password_confirmation: Yup.string()
      .required('Please confirm password.')
      .oneOf([Yup.ref('password')], 'Your passwords do not match.'),
    role: Yup.string().required('The role field is required.'),
    position: Yup.string().required('The position field is required.'),
    department_id: Yup.string().nullable(),
  })

  return (
    <AuthCard
      logo={
        <Link href="/">
          <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
        </Link>
      }>
      <Formik
        onSubmit={submitForm}
        validationSchema={RegisterSchema}
        initialValues={{
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'employee', // Default role
          position: '', // Empty default, will show "Select a position" option
          department_id: '',
        }}>
        <Form className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="undefined block font-medium text-sm text-gray-700">
              Name
            </label>

            <Field
              id="name"
              name="name"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <ErrorMessage
              name="name"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="undefined block font-medium text-sm text-gray-700">
              Email
            </label>

            <Field
              id="email"
              name="email"
              type="email"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <ErrorMessage
              name="email"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="undefined block font-medium text-sm text-gray-700">
              Role
            </label>

            <Field
              as="select"
              id="role"
              name="role"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </Field>

            <ErrorMessage
              name="role"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="undefined block font-medium text-sm text-gray-700">
              Position
            </label>

            <Field
              as="select"
              id="position"
              name="position"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select a position</option>
              {POSITION_OPTIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </Field>

            <ErrorMessage
              name="position"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="department_id"
              className="undefined block font-medium text-sm text-gray-700">
              Department
            </label>

            <Field
              as="select"
              id="department_id"
              name="department_id"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={loading}
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Field>

            {loading && (
              <span className="text-xs text-gray-500">Loading departments...</span>
            )}
            {error && (
              <span className="text-xs text-red-500">{error}</span>
            )}

            <ErrorMessage
              name="department_id"
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

          <div className="">
            <label
              htmlFor="password_confirmation"
              className="undefined block font-medium text-sm text-gray-700">
              Confirm Password
            </label>

            <Field
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              className="block mt-1 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <ErrorMessage
              name="password_confirmation"
              component="span"
              className="text-xs text-red-500"
            />
          </div>

          <div className="flex items-center justify-end mt-4">
            <Link
              href="/login"
              className="underline text-sm text-gray-600 hover:text-gray-900">
              Already registered?
            </Link>

            <button
              type="submit"
              className="ml-4 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
              Register
            </button>
          </div>
        </Form>
      </Formik>
    </AuthCard>
  )
}

export default RegisterPage