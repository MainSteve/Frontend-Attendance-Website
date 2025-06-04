// app/dashboard/attendance/details/page.tsx
import React, { Suspense } from 'react'
import AttendanceDetailsPageClient from '@/components/attendance/AttendanceDetailsPageClient'
import { Loader2 } from 'lucide-react'

// Loading component for Suspense
const LoadingPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Memuat halaman detail kehadiran...</p>
    </div>
  </div>
)

// Main page component (Server Component)
export default function AttendanceDetailsPageRoute() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AttendanceDetailsPageClient />
    </Suspense>
  )
}
