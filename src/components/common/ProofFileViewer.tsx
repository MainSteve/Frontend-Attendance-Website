// src/components/common/ProofFileViewer.tsx

import React, { useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  Shield,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeaveRequestProof } from '@/types/LeaveRequest';
import { formatFileSize, isImageFile, isPdfFile } from '@/utils/leaveUtils';
import { VerificationBadge } from './StatusBadges';

interface ProofFileViewerProps {
  proof: LeaveRequestProof;
  onView: (proofId: number) => Promise<void>;
  onVerify?: (proofId: number) => Promise<void>;
  onDelete?: (proofId: number) => Promise<void>;
  canVerify?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
}

const ProofFileViewer: React.FC<ProofFileViewerProps> = ({
  proof,
  onView,
  onVerify,
  onDelete,
  canVerify = false,
  canDelete = false,
  isLoading = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isImage = isImageFile(proof.mime_type);
  const isPdf = isPdfFile(proof.mime_type);

  const handleView = async () => {
    try {
      await onView(proof.id);
    } catch (error) {
      console.error('Error viewing proof:', error);
    }
  };

  const handlePreview = async () => {
    if (!isImage) {
      // For non-images, just open in new tab
      handleView();
      return;
    }

    setLoadingPreview(true);
    try {
      // Get temporary URL for preview
      // This would typically be the same as onView but we store it for the modal
      await onView(proof.id);
      setPreviewUrl(proof.url); // Assuming the proof object has the URL after fetching
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleVerify = async () => {
    if (onVerify) {
      try {
        await onVerify(proof.id);
      } catch (error) {
        console.error('Error verifying proof:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete && confirm('Are you sure you want to delete this proof file?')) {
      try {
        await onDelete(proof.id);
      } catch (error) {
        console.error('Error deleting proof:', error);
      }
    }
  };

  const resetPreviewControls = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    resetPreviewControls();
  };

  const getFileIcon = () => {
    if (isImage) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (isPdf) {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {proof.filename}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(proof.size)}
              </p>
            </div>
          </div>
          
          {proof.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {proof.description}
            </p>
          )}

          <div className="flex items-center space-x-2 mt-2">
            <VerificationBadge
              isVerified={proof.is_verified}
              verifierName={proof.verifier?.name}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {isImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={loadingPreview}
            >
              {loadingPreview ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                {isPdf ? 'View' : 'Download'}
              </>
            )}
          </Button>

          {canVerify && !proof.is_verified && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Shield className="h-4 w-4 mr-1" />
              Verify
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{proof.filename}</DialogTitle>
                <DialogDescription>
                  {proof.description && <span>{proof.description} • </span>}
                  {formatFileSize(proof.size)}
                </DialogDescription>
              </div>
              
              {/* Preview Controls */}
              {isImage && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-500 min-w-[4rem] text-center">
                    {zoom}%
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((rotation + 90) % 360)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleView}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden" 
               style={{ height: '60vh' }}>
            {previewUrl && isImage ? (
              <img
                src={previewUrl}
                alt={proof.filename}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                onError={() => {
                  console.error('Failed to load image preview');
                  setShowPreview(false);
                }}
              />
            ) : (
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Preview not available for this file type</p>
                <Button onClick={handleView} className="mt-2">
                  Open File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ProofFileListProps {
  proofs: LeaveRequestProof[];
  onViewProof: (proofId: number) => Promise<void>;
  onVerifyProof?: (proofId: number) => Promise<void>;
  onDeleteProof?: (proofId: number) => Promise<void>;
  canVerify?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProofFileList: React.FC<ProofFileListProps> = ({
  proofs,
  onViewProof,
  onVerifyProof,
  onDeleteProof,
  canVerify = false,
  canDelete = false,
  isLoading = false,
  emptyMessage = "No proof files uploaded",
}) => {
  if (proofs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proofs.map((proof) => (
        <ProofFileViewer
          key={proof.id}
          proof={proof}
          onView={onViewProof}
          onVerify={onVerifyProof}
          onDelete={onDeleteProof}
          canVerify={canVerify}
          canDelete={canDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default ProofFileViewer;