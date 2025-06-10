import Link from 'next/link'
import { useState } from 'react'
import { Bell, Menu, X, LogOut, User } from 'lucide-react'

import { UserType } from '@/types/User'
import { useAuth } from '@/hooks/auth'

const Navigation = ({ user }: { user: UserType }) => {
  const { logout } = useAuth({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                Attendance System
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={e => e.key === 'Escape' && setIsDropdownOpen(false)}
                aria-label="Close dropdown menu"
                tabIndex={0}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                <img
                  src={user?.photo_profile_url ?? '/33.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <button
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                    onKeyDown={e =>
                      e.key === 'Escape' && setIsDropdownOpen(false)
                    }
                    aria-label="Close dropdown menu"
                    tabIndex={0}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      {/* Profile Button */}
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors block">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {user?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Info */}
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                  src={user?.photo_profile_url ?? '/33.png'}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="ml-3 flex-1">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
              </Link>

              {/* Navigation Links */}
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md flex items-center space-x-2 transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navigation
