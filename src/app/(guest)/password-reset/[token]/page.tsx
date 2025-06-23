'use client'
import Link from 'next/link'
import AuthCard from '@/components/AuthCard'
import ApplicationLogo from '@/components/ApplicationLogo'
import ResetPasswordForm from '@/components/ResetPasswordForm'
import { useParams } from 'next/navigation'

export default function PasswordResetPage() {
  const params = useParams()
  const token =
    typeof params.token === 'string'
      ? params.token
      : Array.isArray(params.token)
      ? params.token[0]
      : ''

  return (
    <AuthCard
      logo={
        <Link href="/">
          <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
        </Link>
      }>
      <div className="mb-4 text-sm text-gray-600">
        Enter your new password below to reset your account password.
      </div>

      <ResetPasswordForm token={token} />
    </AuthCard>
  )
}
