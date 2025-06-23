// src/components/Dashboard/LeaveQuotaCard.tsx

'use client';

import React, { useState } from 'react';
import { Calendar, Loader2, Plus, Info, FileText, ArrowRight, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMyLeaveQuota } from '@/hooks/leaveQuota';
import { useLeaveRequestActions } from '@/hooks/leaveRequest';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTodayDate, calculateDuration, validateDateRange } from '@/utils/dateConverter';
import ImageUploader from '@/components/common/ImageUploader';

interface ProofFile {
  file: File;
  description: string;
}

const LeaveQuotaCard = () => {
  const { leaveQuotaSummary, isLoading, isError, mutate } = useMyLeaveQuota();
  const { createLeaveRequest } = useLeaveRequestActions();
  const router = useRouter();
  
  // Default values if no data - Move this up before it's used
  const quota = leaveQuotaSummary || {
    total: 0,
    used: 0,
    remaining: 0,
    usagePercentage: 0,
  };

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: '' as 'sakit' | 'cuti' | '',
    reason: '',
    start_date: '',
    end_date: '',
  });
  
  const [proofFiles, setProofFiles] = useState<ProofFile[]>([]);

  // Reset form when dialog closes
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormData({
      type: '',
      reason: '',
      start_date: '',
      end_date: '',
    });
    setProofFiles([]);
  };

  const addProofFile = () => {
    if (proofFiles.length < 5) {
      setProofFiles([...proofFiles, { file: null as any, description: '' }]);
    }
  };

  const updateProofFile = (index: number, file: File) => {
    const updated = [...proofFiles];
    updated[index].file = file;
    setProofFiles(updated);
  };

  const updateProofDescription = (index: number, description: string) => {
    const updated = [...proofFiles];
    updated[index].description = description;
    setProofFiles(updated);
  };

  const removeProofFile = (index: number) => {
    setProofFiles(proofFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.start_date || !formData.end_date) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    // Validate date range
    const dateValidation = validateDateRange(formData.start_date, formData.end_date);
    if (!dateValidation.isValid) {
      toast.error(dateValidation.error || 'Rentang tanggal tidak valid');
      return;
    }

    // Validate sick leave must have proof files
    if (formData.type === 'sakit' && proofFiles.filter(pf => pf.file).length === 0) {
      toast.error('Cuti sakit memerlukan bukti pendukung');
      return;
    }

    // Check if duration exceeds remaining quota for 'cuti' type
    if (formData.type === 'cuti' && quota.remaining > 0 && duration > quota.remaining) {
      toast.error(`Durasi cuti (${duration} hari) melebihi sisa kuota Anda (${quota.remaining} hari)`);
      return;
    }

    // Check if user has no quota left
    if (formData.type === 'cuti' && quota.remaining <= 0) {
      toast.error('Kuota cuti Anda sudah habis untuk tahun ini');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validProofFiles = proofFiles.filter(pf => pf.file);
      
      await createLeaveRequest({
        type: formData.type,
        reason: formData.reason,
        start_date: formData.start_date,
        end_date: formData.end_date,
        proofs: validProofFiles.map(pf => pf.file),
        proof_descriptions: validProofFiles.map(pf => pf.description),
      });
      
      // Success notification
      toast.success(
        formData.type === 'sakit' 
          ? 'Permohonan cuti sakit berhasil disubmit dan otomatis disetujui'
          : 'Permohonan cuti berhasil disubmit, menunggu persetujuan admin'
      );
      
      // Refresh quota data
      mutate();
      handleDialogClose();
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      
      // Handle specific error responses
      if (error?.response?.status === 422) {
        const errorData = error.response.data;
        
        // Handle quota exceeded error
        if (errorData?.message?.includes('quota') || 
            errorData?.message?.includes('kuota') || 
            errorData?.message?.includes('insufficient') ||
            errorData?.message?.includes('exceeds')) {
          toast.error('Kuota cuti Anda tidak mencukupi untuk durasi yang diminta');
        } 
        // Handle validation errors
        else if (errorData?.errors) {
          const firstError = Object.values(errorData.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        }
        // Generic validation error
        else {
          toast.error(errorData?.message || 'Data yang dimasukkan tidak valid');
        }
      } 
      // Handle network or server errors
      else if (error?.response?.status >= 500) {
        toast.error('Terjadi kesalahan server, silakan coba lagi nanti');
      }
      // Handle authentication errors
      else if (error?.response?.status === 401) {
        toast.error('Sesi Anda telah berakhir, silakan login kembali');
      }
      // Handle permission errors
      else if (error?.response?.status === 403) {
        toast.error('Anda tidak memiliki izin untuk melakukan aksi ini');
      }
      // Generic error
      else {
        toast.error('Terjadi kesalahan saat mengajukan permohonan cuti');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = formData.start_date && formData.end_date 
    ? calculateDuration(formData.start_date, formData.end_date) 
    : 0;
  
  const canSubmit = formData.type && formData.start_date && formData.end_date && !isSubmitting;
  
  const isQuotaExceeded = formData.type === 'cuti' && quota.remaining > 0 && duration > quota.remaining;
  const isQuotaEmpty = formData.type === 'cuti' && quota.remaining <= 0;
  const isSickWithoutProof = formData.type === 'sakit' && proofFiles.filter(pf => pf.file).length === 0;

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
          {new Date().getFullYear()}
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

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Apply Leave Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajukan Cuti/Sakit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajukan Permohonan Cuti/Sakit</DialogTitle>
              <DialogDescription>
                Silakan lengkapi form di bawah untuk mengajukan permohonan cuti atau sakit.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="type">Jenis Cuti *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'sakit' | 'cuti') => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis cuti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cuti">Cuti</SelectItem>
                    <SelectItem value="sakit">Sakit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Tanggal Mulai *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    min={getTodayDate()}
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Tanggal Selesai *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    min={formData.start_date || getTodayDate()}
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Duration Display */}
              {duration > 0 && (
                <Alert className={isQuotaExceeded || isQuotaEmpty ? 'border-red-200 bg-red-50' : ''}>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Durasi: {duration} hari
                    {isQuotaExceeded && (
                      <span className="text-red-600 block mt-1">
                        ⚠️ Melebihi sisa kuota Anda ({quota.remaining} hari)
                      </span>
                    )}
                    {isQuotaEmpty && (
                      <span className="text-red-600 block mt-1">
                        ⚠️ Kuota cuti Anda sudah habis
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Alasan</Label>
                <Textarea
                  id="reason"
                  placeholder="Masukkan alasan cuti/sakit..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Proof Files */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bukti Pendukung {formData.type === 'sakit' && <span className="text-red-500">*</span>}</Label>
                  {proofFiles.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProofFile}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Bukti
                    </Button>
                  )}
                </div>

                {formData.type === 'sakit' && proofFiles.length === 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Untuk cuti sakit, diperlukan bukti pendukung seperti surat dokter, resep obat, atau foto kondisi.
                    </AlertDescription>
                  </Alert>
                )}

                {proofFiles.map((proofFile, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Bukti {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProofFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <ImageUploader
                      file={proofFile.file}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateProofFile(index, file);
                      }}
                      label="Upload bukti (JPG, PNG, PDF max 5MB)"
                    />
                    
                    <div className="space-y-1">
                      <Label htmlFor={`description-${index}`} className="text-sm">Deskripsi</Label>
                      <Input
                        id={`description-${index}`}
                        placeholder="Deskripsi bukti..."
                        value={proofFile.description}
                        onChange={(e) => updateProofDescription(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Info for Sick Leave */}
              {formData.type === 'sakit' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Cuti sakit akan otomatis disetujui setelah submit.
                  </AlertDescription>
                </Alert>
              )}

              {formData.type === 'cuti' && isQuotaEmpty && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Kuota cuti Anda sudah habis untuk tahun ini. Anda tidak dapat mengajukan cuti biasa.
                  </AlertDescription>
                </Alert>
              )}

              {formData.type === 'cuti' && !isQuotaEmpty && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Permohonan cuti akan menunggu persetujuan dari admin.
                    {quota.remaining <= 5 && quota.remaining > 0 && (
                      <span className="block mt-1 text-amber-600">
                        ⚠️ Sisa kuota cuti Anda tinggal {quota.remaining} hari
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={!canSubmit || isQuotaExceeded || isQuotaEmpty || isSickWithoutProof}
                  className={
                    (isQuotaExceeded || isQuotaEmpty || isSickWithoutProof) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Permohonan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Details Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/leave-requests')}
          className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <FileText className="h-4 w-4 mr-2" />
          Lihat Semua Permohonan
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

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
              Kuota cuti tahun {new Date().getFullYear()} telah habis.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default LeaveQuotaCard;