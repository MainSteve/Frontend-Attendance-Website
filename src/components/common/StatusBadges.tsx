// src/components/common/StatusBadges.tsx

import React from 'react';
import { Clock, CheckCircle, XCircle, FileText, AlertTriangle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LeaveStatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className,
  size = 'md' 
}) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  
  switch (status.toLowerCase()) {
    case 'approved':
      return (
        <Badge className={cn("bg-green-100 text-green-800 border-green-200", className)}>
          <CheckCircle className={cn(iconSize, "mr-1")} />
          Disetujui
        </Badge>
      );
    case 'pending':
      return (
        <Badge className={cn("bg-yellow-100 text-yellow-800 border-yellow-200", className)}>
          <Clock className={cn(iconSize, "mr-1")} />
          Menunggu
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className={cn("bg-red-100 text-red-800 border-red-200", className)}>
          <XCircle className={cn(iconSize, "mr-1")} />
          Ditolak
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
};

interface TypeBadgeProps {
  type: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LeaveTypeBadge: React.FC<TypeBadgeProps> = ({ 
  type, 
  className,
  size = 'md' 
}) => {
  switch (type.toLowerCase()) {
    case 'sakit':
      return (
        <Badge 
          variant="outline" 
          className={cn("text-orange-600 border-orange-200 bg-orange-50", className)}
        >
          Sakit
        </Badge>
      );
    case 'cuti':
      return (
        <Badge 
          variant="outline" 
          className={cn("text-blue-600 border-blue-200 bg-blue-50", className)}
        >
          Cuti
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {type}
        </Badge>
      );
  }
};

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  className 
}) => {
  switch (priority) {
    case 'high':
      return (
        <Badge className={cn("bg-red-100 text-red-800 border-red-200", className)}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          Prioritas Tinggi
        </Badge>
      );
    case 'medium':
      return (
        <Badge className={cn("bg-yellow-100 text-yellow-800 border-yellow-200", className)}>
          Prioritas Sedang
        </Badge>
      );
    case 'low':
      return (
        <Badge className={cn("bg-green-100 text-green-800 border-green-200", className)}>
          Prioritas Rendah
        </Badge>
      );
    default:
      return null;
  }
};

interface ProofBadgeProps {
  count: number;
  hasVerified?: boolean;
  className?: string;
}

export const ProofBadge: React.FC<ProofBadgeProps> = ({ 
  count, 
  hasVerified = false,
  className 
}) => {
  if (count === 0) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        hasVerified 
          ? "text-green-600 border-green-200 bg-green-50" 
          : "text-blue-600 border-blue-200 bg-blue-50", 
        className
      )}
    >
      <FileText className="h-3 w-3 mr-1" />
      {count} Bukti
      {hasVerified && <Shield className="h-3 w-3 ml-1" />}
    </Badge>
  );
};

interface VerificationBadgeProps {
  isVerified: boolean;
  verifierName?: string;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  isVerified, 
  verifierName,
  className 
}) => {
  if (isVerified) {
    return (
      <Badge className={cn("bg-green-100 text-green-800 border-green-200 text-xs", className)}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Terverifikasi
        {verifierName && ` oleh ${verifierName}`}
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn("text-yellow-600 border-yellow-200 bg-yellow-50 text-xs", className)}
    >
      <Clock className="h-3 w-3 mr-1" />
      Belum Diverifikasi
    </Badge>
  );
};