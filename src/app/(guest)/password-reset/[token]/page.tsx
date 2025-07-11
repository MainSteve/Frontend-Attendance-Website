'use client'
import Link from 'next/link'
import Image from 'next/image'
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

      {/* Password Reset Card */}
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
                Create New Password
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                Enter your new password below to reset your account password.
              </p>
            </div>
          </div>

          {/* Reset Password Form */}
          <ResetPasswordForm token={token} />
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
