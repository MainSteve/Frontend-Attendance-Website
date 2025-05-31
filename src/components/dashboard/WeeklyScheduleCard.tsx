'use client';

import React, { useState } from 'react';
import { Briefcase, Loader2, Calendar, Clock, Info } from 'lucide-react';
import { useWeeklySchedule } from '@/hooks/workingHours';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WeeklyScheduleDay } from '@/types/WorkingHours';

const WeeklyScheduleCard = () => {
  const { 
    weekDays, 
    currentWeek, 
    todayString, 
    isLoading, 
    isError 
  } = useWeeklySchedule();
  
  const [selectedDay, setSelectedDay] = useState<WeeklyScheduleDay | null>(null);

  const getStatusBadge = (day: WeeklyScheduleDay) => {
    switch (day.status) {
      case 'working':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Kerja
          </Badge>
        );
      case 'holiday':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
            Libur Nasional
          </Badge>
        );
      case 'weekend':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Weekend
          </Badge>
        );
      case 'off':
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            Libur
          </Badge>
        );
    }
  };

  const getRowClassName = (day: WeeklyScheduleDay) => {
    let baseClasses = "transition-colors duration-200 ";
    
    if (day.dateString === todayString) {
      baseClasses += "bg-blue-50 border-l-4 border-blue-500 ";
    } else {
      baseClasses += "hover:bg-gray-50 ";
    }
    
    return baseClasses;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatWeekRange = () => {
    const startFormatted = currentWeek.start.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
    const endFormatted = currentWeek.end.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Jadwal Kerja Minggu Ini</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Jadwal Kerja Minggu Ini</h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <Alert className="w-full">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Error loading schedule data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-2 sm:mb-0">
          <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Jadwal Kerja Minggu Ini</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">
            {formatWeekRange()}
          </span>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              day.dateString === todayString 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {day.dayNameIndonesian}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatDate(day.date)}
                </p>
              </div>
              {getStatusBadge(day)}
            </div>
            
            {day.status === 'working' && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{day.startTime} - {day.endTime}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Durasi: {day.duration}
                </p>
              </div>
            )}
            
            {day.holidayInfo && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700">
                  {day.holidayInfo.name}
                </p>
                <p className="text-xs text-gray-500">
                  {day.holidayInfo.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
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
                Durasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weekDays.map((day, index) => (
              <tr key={index} className={getRowClassName(day)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {day.dayNameIndonesian}
                      </div>
                      {day.dateString === todayString && (
                        <div className="text-xs text-blue-600 font-medium">
                          Hari Ini
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(day.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.startTime ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {day.endTime ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {day.duration ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(day)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {(day.holidayInfo ?? day.status === 'working') && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedDay(day)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Detail - {day.dayNameIndonesian}, {formatDate(day.date)}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {day.holidayInfo && (
                            <div className="p-4 bg-red-50 rounded-lg">
                              <h4 className="font-semibold text-red-800 mb-2">
                                🎉 {day.holidayInfo.name}
                              </h4>
                              <p className="text-sm text-red-700 mb-2">
                                {day.holidayInfo.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {day.holidayInfo.is_recurring ? 'Tahunan' : 'Satu Kali'}
                              </Badge>
                            </div>
                          )}
                          
                          {day.status === 'working' && (
                            <div className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-800 mb-2">
                                💼 Hari Kerja
                              </h4>
                              <div className="space-y-2 text-sm text-green-700">
                                <div className="flex justify-between">
                                  <span>Jam Masuk:</span>
                                  <span className="font-medium">{day.startTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Jam Pulang:</span>
                                  <span className="font-medium">{day.endTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total Durasi:</span>
                                  <span className="font-medium">{day.duration}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {day.status === 'off' && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                😴 Hari Libur
                              </h4>
                              <p className="text-sm text-gray-600">
                                Tidak ada jadwal kerja pada hari ini.
                              </p>
                            </div>
                          )}
                          
                          {day.status === 'weekend' && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">
                                🌴 Weekend
                              </h4>
                              <p className="text-sm text-blue-600">
                                Hari libur akhir pekan.
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Hari Kerja: {weekDays.filter(d => d.status === 'working').length}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Libur Nasional: {weekDays.filter(d => d.status === 'holiday').length}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Weekend: {weekDays.filter(d => d.status === 'weekend').length}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span>Libur: {weekDays.filter(d => d.status === 'off').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleCard;