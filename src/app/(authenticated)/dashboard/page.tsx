"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useDepartments } from '@/hooks/users';
import { formatDateWithDayOnly } from '@/utils/dateConverter';
import { toTitleCase } from '@/utils/stringUtils';

// Import all the new components
import AttendanceSummaryCard from '@/components/dashboard/AttendanceSummaryCard';
import ClockStatusCard from '@/components/dashboard/ClockStatusCard';
import LeaveQuotaCard from '@/components/dashboard/LeaveQuotaCard';
import WeeklyScheduleCard from '@/components/dashboard/WeeklyScheduleCard';
import AnnouncementsCard from '@/components/dashboard/AnnouncementsCard';

const EmployeeDashboard = () => {
  const { user, isLoading: userLoading } = useAuth({});
  const { departments, isLoading: departmentsLoading } = useDepartments();

  const userDepartment = departments?.find(dept => dept.id === user?.department_id);
  
  // Get current date in Indonesian format
  const currentDate = formatDateWithDayOnly(new Date());

  // Loading state
  if (userLoading || departmentsLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading user data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Selamat Datang, {user.name}</h2>
          <p className="text-sm text-gray-500">{currentDate}</p>
          {user.position && (
            <p className="text-sm text-gray-600">
              {toTitleCase(user.position)} - {userDepartment?.name ?? 'No Department'}
            </p>
          )}
        </div>
        
        {/* Top Section - Attendance Summary and Clock Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AttendanceSummaryCard />
          
          <ClockStatusCard />
        </div>
        
        {/* Middle Section - Leave Quota and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <LeaveQuotaCard />
          
          <AnnouncementsCard />
        </div>
        
        {/* Bottom Section - Weekly Schedule */}
        <WeeklyScheduleCard />
      </main>
    </div>
  );
};

export default EmployeeDashboard;