'use client'

import React, { useState } from 'react'
import {
  Users,
  Calendar,
  CalendarX,
  QrCode,
  Megaphone,
  Menu,
  X,
  Award,
  FileCheck,
} from 'lucide-react'
import EmployeeList from '@/components/admin/EmployeeList'
import WorkSchedules from '@/components/admin/WorkSchedules'
import HolidayManagement from '@/components/admin/HolidayManagement'
import LeaveQuotaManagement from '@/components/admin/LeaveQuotaManagement'
import LeaveRequests from '@/components/admin/LeaveRequestManagement'
import QRGenerator from '@/components/admin/QrGenerator'
import Announcements from '@/components/admin/AnnouncementsManagement'
import AttendanceDetailsAdmin from '@/components/admin/AttendanceDetails'
import { UserType } from '@/types/User'

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(
    null,
  )

  const menuItems = [
    { id: 'qr-generator', label: 'Generate QR Code', icon: QrCode },
    { id: 'employees', label: 'Daftar Karyawan', icon: Users },
    { id: 'schedules', label: 'Jadwal Kerja', icon: Calendar },
    { id: 'holidays', label: 'Hari Libur', icon: CalendarX },
    { id: 'leave-quota', label: 'Jatah Cuti', icon: Award },
    { id: 'leave-requests', label: 'Permohonan Cuti', icon: FileCheck },
    { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
  ]

  const handleEmployeeClick = (employee: UserType) => {
    setSelectedEmployee(employee)
    setActiveSection('employee-attendance')
  }

  const handleBackFromAttendance = () => {
    setActiveSection('employees')
    setSelectedEmployee(null)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'employees':
        return <EmployeeList onEmployeeClick={handleEmployeeClick} />
      case 'employee-attendance':
        return selectedEmployee ? (
          <AttendanceDetailsAdmin
            employee={selectedEmployee}
            onBack={handleBackFromAttendance}
          />
        ) : null
      case 'schedules':
        return <WorkSchedules />
      case 'holidays':
        return <HolidayManagement />
      case 'leave-quota':
        return <LeaveQuotaManagement />
      case 'leave-requests':
        return <LeaveRequests />
      case 'announcements':
        return <Announcements />
      default:
        return <QRGenerator />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2
              className={`font-bold text-xl text-gray-800 ${
                !sidebarOpen && 'hidden'
              }`}>
              Admin Panel
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                if (item.id !== 'employees') {
                  setSelectedEmployee(null)
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${
                activeSection === item.id ||
                (activeSection === 'employee-attendance' &&
                  item.id === 'employees')
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AdminDashboard
