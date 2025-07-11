'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronDown,
  Eye,
  X as XIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useLeaveRequests, useLeaveRequest, useLeaveRequestActions } from '@/hooks/leaveRequest';
import { useMyLeaveQuota } from '@/hooks/leaveQuota'
import { useAuth } from '@/hooks/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LeaveRequest, LeaveRequestFilters } from '@/types/LeaveRequest';
import { formatLeaveDate } from '@/utils/dateConverter';

const LeaveRequestsPage = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<LeaveRequestFilters>({
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });
  
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { leaveRequests, pagination, isLoading, mutate } = useLeaveRequests(filters);
  const { leaveQuotaSummary, isLoading: quotaLoading } = useMyLeaveQuota();
  const { leaveRequest: selectedLeave, isLoading: detailLoading } = useLeaveRequest(selectedLeaveId);
  const { cancelLeaveRequest, getProofUrl } = useLeaveRequestActions();

  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const handleViewDetail = (id: number) => {
    setSelectedLeaveId(id);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedLeaveId(null);
  };

  const handleCancelRequest = async (id: number) => {
    setCancelingId(id);
    try {
      await cancelLeaveRequest(id);
      mutate();
      if (selectedLeaveId === id) {
        handleCloseDetail();
      }
    } catch (error) {
      console.error('Error canceling request:', error);
    } finally {
      setCancelingId(null);
    }
  };

  const handleViewProof = async (proofId: number) => {
    try {
      const response = await getProofUrl(proofId); // 2 hours
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error getting proof URL:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'sakit':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Sakit</Badge>;
      case 'cuti':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Cuti</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return formatLeaveDate(dateString);
  };

  const canCancelRequest = (request: LeaveRequest) => {
    if (request.status === 'rejected') return false;
    if (request.status === 'approved' && new Date(request.start_date) <= new Date()) return false;
    return true;
  };

  const updateFilters = (newFilters: Partial<LeaveRequestFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      per_page: 10,
      sort_by: 'created_at',
      sort_direction: 'desc',
      status: undefined,
      type: undefined,
      year: undefined,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Cuti & Sakit</h1>
        <p className="text-gray-600">Kelola dan pantau permohonan cuti dan sakit Anda</p>
      </div>

      {/* Quota Summary */}
      {leaveQuotaSummary && !quotaLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{leaveQuotaSummary.remaining}</div>
              <div className="text-sm text-gray-600">Sisa Kuota</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{leaveQuotaSummary.total}</div>
              <div className="text-sm text-gray-600">Total Kuota</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">
                {leaveRequests.filter(req => req.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {leaveRequests.filter(req => req.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Disetujui</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filter & Pencarian</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Jenis</Label>
              <Select value={filters.type || 'all'} onValueChange={(value) => updateFilters({ type: value === 'all' ? undefined : value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tahun</Label>
              <Select value={filters.year?.toString() || 'all'} onValueChange={(value) => updateFilters({ year: value === 'all' ? undefined : parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urutkan</Label>
              <Select value={filters.sort_by || 'created_at'} onValueChange={(value) => updateFilters({ sort_by: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Tanggal Dibuat</SelectItem>
                  <SelectItem value="start_date">Tanggal Mulai</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Jenis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filter
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada permohonan cuti</h3>
            <p className="text-gray-600">Belum ada permohonan cuti atau sakit yang tercatat.</p>
          </div>
        ) : (
          <>
            {leaveRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3 grid grid-cols-2 grid-rows-2 gap-3 md:grid-cols-4 md:grid-rows-1">
                      {getTypeBadge(request.type)}
                      {getStatusBadge(request.status)}
                      {request.has_proofs && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <FileText className="h-3 w-3 mr-1" />
                          {request.proofs_count} Bukti
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Tanggal</div>
                        <div className="font-medium">
                          {formatDate(request.start_date)}
                          {request.start_date !== request.end_date && (
                            <> - {formatDate(request.end_date)}</>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{request.duration} hari</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Dibuat</div>
                        <div className="font-medium">
                          {formatDate(request.created_at)}
                        </div>
                      </div>

                      {request.reason && (
                        <div>
                          <div className="text-sm text-gray-500">Alasan</div>
                          <div className="font-medium line-clamp-2">{request.reason}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(request.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>

                    {canCancelRequest(request) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={cancelingId === request.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {cancelingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XIcon className="h-4 w-4 mr-1" />
                        )}
                        Batalkan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
                <div className="text-sm text-gray-700">
                  Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} hasil
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ page: Math.max(1, filters.page! - 1) })}
                    disabled={pagination.current_page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={pagination.current_page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilters({ page })}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilters({ page: Math.min(pagination.last_page, filters.page! + 1) })}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Permohonan Cuti/Sakit</DialogTitle>
            <DialogDescription>
              Informasi lengkap permohonan cuti atau sakit
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2">Memuat detail...</span>
            </div>
          ) : selectedLeave ? (
            <div className="space-y-6">
              {/* Status and Type */}
              <div className="flex items-center space-x-3">
                {getTypeBadge(selectedLeave.type)}
                {getStatusBadge(selectedLeave.status)}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Mulai</Label>
                  <div className="mt-1 font-medium">{formatDate(selectedLeave.start_date)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Selesai</Label>
                  <div className="mt-1 font-medium">{formatDate(selectedLeave.end_date)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Durasi</Label>
                  <div className="mt-1 font-medium">{selectedLeave.duration} hari</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Dibuat</Label>
                  <div className="mt-1 font-medium">{formatDate(selectedLeave.created_at)}</div>
                </div>
              </div>

              {/* Reason */}
              {selectedLeave.reason && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Alasan</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedLeave.reason}</div>
                </div>
              )}

              {/* Proof Files */}
              {selectedLeave.proofs && selectedLeave.proofs.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">
                    Bukti Pendukung ({selectedLeave.proofs.length})
                  </Label>
                  <div className="space-y-3">
                    {selectedLeave.proofs.map((proof) => (
                      <div key={proof.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{proof.filename}</div>
                          <div className="text-sm text-gray-500">
                            {proof.human_readable_size}
                            {proof.description && ` • ${proof.description}`}
                          </div>
                          {proof.is_verified && (
                            <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Terverifikasi
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProof(proof.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDetail}>
                  Tutup
                </Button>
                {canCancelRequest(selectedLeave) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelRequest(selectedLeave.id)}
                    disabled={cancelingId === selectedLeave.id}
                  >
                    {cancelingId === selectedLeave.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XIcon className="h-4 w-4 mr-2" />
                    )}
                    Batalkan Permohonan
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Data tidak ditemukan</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveRequestsPage;