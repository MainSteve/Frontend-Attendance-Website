"use client";

import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { useAttendanceSummary } from '@/hooks/attendance';

interface AttendanceSummaryCardProps {
  month?: number;
  year?: number;
  className?: string;
}

const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({ 
  month, 
  year,
  className = "col-span-2"
}) => {
  const { attendanceSummary, isLoading, isError } = useAttendanceSummary(month, year);

  if (isLoading) {
    return (
      <div className={`${className} bg-white rounded-lg shadow p-6`}>
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Ringkasan Kehadiran Bulan Ini</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 ml-2">Loading attendance summary...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${className} bg-white rounded-lg shadow p-6`}>
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Ringkasan Kehadiran Bulan Ini</h3>
        </div>
        <div className="text-center text-red-600 py-8">
          <p>Failed to load attendance summary</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800 mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const attendancePercentage = attendanceSummary.totalDays > 0 
    ? Math.round(((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.totalDays) * 100)
    : 0;

  return (
    <div className={`${className} bg-white rounded-lg shadow p-6`}>
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Ringkasan Kehadiran Bulan Ini</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-green-600">{attendanceSummary.present}</span>
          <p className="text-sm text-gray-600 mt-1">Hadir</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-yellow-600">{attendanceSummary.late}</span>
          <p className="text-sm text-gray-600 mt-1">Terlambat</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</span>
          <p className="text-sm text-gray-600 mt-1">Absen</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <span className="text-2xl font-bold text-blue-600">{attendanceSummary.leave}</span>
          <p className="text-sm text-gray-600 mt-1">Cuti</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${attendancePercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Progress: {attendanceSummary.present + attendanceSummary.late} dari {attendanceSummary.totalDays} hari ({attendancePercentage}%)
        </p>
      </div>
    </div>
  );
};

export default AttendanceSummaryCard;