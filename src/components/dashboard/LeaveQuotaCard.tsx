// src/components/Dashboard/LeaveQuotaCard.tsx

'use client';

import React, { useState } from 'react';
import { Calendar, Loader2, Plus, Info } from 'lucide-react';
import { useLeaveQuota, useLeaveQuotaActions } from '@/hooks/leaveQuota';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const LeaveQuotaCard = () => {
  const { leaveQuotaSummary, isLoading, isError, mutate } = useLeaveQuota();
  const { applyForLeave } = useLeaveQuotaActions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApplyLeave = () => {
    applyForLeave();
    setIsDialogOpen(false);
    // Here you could navigate to a leave application form
    // or open a more complex dialog for leave application
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Sisa Kuota Cuti</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-48">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading quota...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Sisa Kuota Cuti</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-48">
          <Alert className="w-full">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Error loading leave quota data.{' '}
              <button 
                onClick={() => mutate()} 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Default values if no data
  const quota = leaveQuotaSummary || {
    total: 0,
    used: 0,
    remaining: 0,
    year: new Date().getFullYear(),
    usagePercentage: 0,
  };

  // Calculate remaining percentage for the circular progress
  const remainingPercentage = quota.total > 0 ? (quota.remaining / quota.total) * 100 : 0;

  // Determine status color based on remaining quota
  const getStatusColor = () => {
    if (quota.remaining <= 2) return 'text-red-600';
    if (quota.remaining <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (quota.remaining <= 2) return '#dc2626'; // red-600
    if (quota.remaining <= 5) return '#d97706'; // yellow-600
    return '#2563eb'; // blue-600
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Sisa Kuota Cuti</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {quota.year}
        </Badge>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        {/* Circular Progress */}
        <div className="relative h-32 w-32 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="3"
              strokeDasharray={`${remainingPercentage}, 100`}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className={`text-3xl font-bold ${getStatusColor()}`}>
              {quota.remaining}
            </span>
            <span className="text-sm text-gray-500 block">Hari</span>
          </div>
        </div>

        {/* Quota Details */}
        <div className="text-center mb-4 space-y-2">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-800">{quota.total}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{quota.used}</div>
              <div className="text-gray-500">Terpakai</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getStatusColor()}`}>{quota.remaining}</div>
              <div className="text-gray-500">Tersisa</div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Digunakan: {quota.used} dari {quota.total} hari ({quota.usagePercentage}%)
          </p>
        </div>

        {/* Apply Leave Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`w-full ${quota.remaining <= 0 ? 'cursor-not-allowed' : ''}`}
              disabled={quota.remaining <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajukan Cuti
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajukan Permohonan Cuti</DialogTitle>
              <DialogDescription>
                Anda memiliki {quota.remaining} hari cuti tersisa untuk tahun {quota.year}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Fitur pengajuan cuti akan segera tersedia. Saat ini Anda dapat menghubungi HR untuk mengajukan cuti.
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Tutup
                </Button>
                <Button onClick={handleApplyLeave} className="flex-1">
                  Hubungi HR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Warning for low quota */}
        {quota.remaining <= 2 && quota.remaining > 0 && (
          <Alert className="mt-4 w-full">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Kuota cuti Anda hampir habis. Tersisa {quota.remaining} hari.
            </AlertDescription>
          </Alert>
        )}

        {quota.remaining === 0 && (
          <Alert className="mt-4 w-full" variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Kuota cuti tahun {quota.year} telah habis.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default LeaveQuotaCard;