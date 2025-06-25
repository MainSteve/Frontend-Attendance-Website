'use client'
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/auth'
import Navigation from '@/components/Layouts/Navigation'
import { UserType } from '@/types/User'

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth({ middleware: 'auth' })

  // Tambahkan pengecekan untuk user.role juga
  if (!user?.role || !['admin', 'employee'].includes(user.role)) {
    // Bisa diganti skeleton/loading spinner sesuai kebutuhan
    return null
  }

  // Type assertion karena setelah pengecekan di atas, kita tahu user.role pasti 'admin' | 'employee'
  const typedUser = user as UserType

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation user={typedUser} />
      <main>{children}</main>
    </div>
  )
}

export default AppLayout