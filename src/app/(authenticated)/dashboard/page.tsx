"use client";

import React, { useState } from 'react';
import { Clock, Calendar, FileText, Bell, Briefcase } from 'lucide-react';

const EmployeeDashboard = () => {
  // Sample data - in a real app, this would come from API
  const [user] = useState({
    name: 'Ahmad Rizki',
    position: 'Software Developer',
    department: 'IT Development',
    avatarUrl: '/api/placeholder/100/100'
  });
  
  const [attendance] = useState({
    present: 18,
    late: 2,
    absent: 0,
    leave: 1,
    totalDays: 21,
  });
  
  const [clockStatus] = useState({
    clockedIn: true,
    clockInTime: '08:02:34',
    clockOutTime: null,
  });
  
  const [leaveQuota] = useState({
    total: 12,
    used: 3,
    remaining: 9,
  });
  
  const [announcements] = useState([
    {
      id: 1,
      title: 'Rapat Evaluasi Bulanan',
      content: 'Rapat akan diadakan pada hari Jumat, 9 Mei 2025 pukul 13:00 WIB via Zoom.',
      date: '2025-05-04',
    },
    {
      id: 2,
      title: 'Update Kebijakan Absensi',
      content: 'Terdapat perubahan kebijakan absensi yang akan berlaku mulai 15 Mei 2025.',
      date: '2025-05-03',
    }
  ]);
  
  const [weeklySchedule] = useState([
    { day: 'Senin', date: '6 May', startTime: '08:00', endTime: '17:00' },
    { day: 'Selasa', date: '7 May', startTime: '08:00', endTime: '17:00' },
    { day: 'Rabu', date: '8 May', startTime: '08:00', endTime: '17:00' },
    { day: 'Kamis', date: '9 May', startTime: '08:00', endTime: '17:00' },
    { day: 'Jumat', date: '10 May', startTime: '08:00', endTime: '16:00' }
  ]);
  
  // Get current date in Indonesian format
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Attendance System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <img src={user.avatarUrl} alt="Profile" className="h-8 w-8 rounded-full" />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Selamat Datang, {user.name}</h2>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
        
        {/* Top Section - Attendance Summary and Clock Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Attendance Summary Card */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Ringkasan Kehadiran Bulan Ini</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-green-600">{attendance.present}</span>
                <p className="text-sm text-gray-600 mt-1">Hadir</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-yellow-600">{attendance.late}</span>
                <p className="text-sm text-gray-600 mt-1">Terlambat</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-red-600">{attendance.absent}</span>
                <p className="text-sm text-gray-600 mt-1">Absen</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-blue-600">{attendance.leave}</span>
                <p className="text-sm text-gray-600 mt-1">Cuti</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(attendance.present / attendance.totalDays) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Progress: {attendance.present} dari {attendance.totalDays} hari ({Math.round((attendance.present / attendance.totalDays) * 100)}%)
              </p>
            </div>
          </div>
          
          {/* Clock Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Status Absensi Hari Ini</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-40">
              {clockStatus.clockedIn ? (
                <>
                  <div className="text-green-500 font-semibold mb-2">Sudah Clock In</div>
                  <div className="text-3xl font-bold">{clockStatus.clockInTime}</div>
                  <div className="mt-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md">
                      Clock Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-yellow-500 font-semibold mb-2">Belum Clock In</div>
                  <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md">
                    Clock In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Middle Section - Leave Quota and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Leave Quota Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Sisa Kuota Cuti</h3>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="relative h-32 w-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#edf2f7"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4299e1"
                    strokeWidth="3"
                    strokeDasharray={`${leaveQuota.remaining / leaveQuota.total * 100}, 100`}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-3xl font-bold text-blue-600">{leaveQuota.remaining}</span>
                  <span className="text-sm text-gray-500 block">Hari</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Digunakan: {leaveQuota.used} dari {leaveQuota.total} hari
                </p>
                <button className="mt-4 text-sm text-blue-600 hover:text-blue-800">
                  Ajukan Cuti
                </button>
              </div>
            </div>
          </div>
          
          {/* Announcements Card */}
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Pengumuman</h3>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Lihat Semua
              </button>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b border-gray-100 pb-4">
                  <h4 className="font-medium text-gray-800">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(announcement.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Weekly Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Jadwal Kerja Minggu Ini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hari
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Masuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Pulang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weeklySchedule.map((day, index) => {
                  const isToday = day.day === new Date().toLocaleDateString('id-ID', { weekday: 'long' });
                  return (
                    <tr key={index} className={isToday ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.startTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isToday ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Hari Ini
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;