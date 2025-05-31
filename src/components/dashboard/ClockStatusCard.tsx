"use client";

import React, { useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useAttendanceToday, useClockInOut } from '@/hooks/attendance';

const ClockStatusCard = () => {
  const { clockStatus, isLoading, mutate } = useAttendanceToday();
  const { clockIn, clockOut, isLoading: clockActionLoading } = useClockInOut();
  const [error, setError] = useState<string | null>(null);

  const handleClockIn = async () => {
    try {
      setError(null);
      await clockIn({
        location: 'Office', // You might want to make this dynamic
        method: 'manual'
      });
      // Refresh today's attendance data
      mutate();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      setError(null);
      await clockOut({
        location: 'Office', // You might want to make this dynamic
        method: 'manual'
      });
      // Refresh today's attendance data
      mutate();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to clock out');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Status Absensi Hari Ini</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 mt-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Clock className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Status Absensi Hari Ini</h3>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center h-40">
        {clockStatus.clockedIn ? (
          <>
            <div className="text-green-500 font-semibold mb-2">
              {clockStatus.canClockOut ? 'Sudah Clock In' : 'Sudah Clock Out'}
            </div>
            
            <div className="text-center mb-2">
              {clockStatus.clockInTime && (
                <div className="text-lg">
                  <span className="text-gray-600">Masuk: </span>
                  <span className="font-bold">{clockStatus.clockInTime}</span>
                </div>
              )}
              {clockStatus.clockOutTime && (
                <div className="text-lg">
                  <span className="text-gray-600">Keluar: </span>
                  <span className="font-bold">{clockStatus.clockOutTime}</span>
                </div>
              )}
            </div>

            {clockStatus.workDuration && (
              <div className="text-sm text-gray-600 mb-3">
                Durasi: {Math.abs(clockStatus.workDuration.hours)}j {Math.abs(clockStatus.workDuration.minutes)}m
              </div>
            )}

            {clockStatus.canClockOut && (
              <div className="mt-4">
                <button 
                  onClick={handleClockOut}
                  disabled={clockActionLoading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
                >
                  {clockActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Clock Out</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-yellow-500 font-semibold mb-4">Belum Clock In</div>
            <button 
              onClick={handleClockIn}
              disabled={clockActionLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
              {clockActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Clock In</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClockStatusCard;