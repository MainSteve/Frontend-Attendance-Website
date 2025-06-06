// src/components/qr/QrScanner.tsx
// Note: You need to install qr-scanner: npm install qr-scanner

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { QrScannerProps } from '@/types/qrcode';

// Import QrScanner (you need to install: npm install qr-scanner)
// import QrScanner from 'qr-scanner';

const QrScanner: React.FC<QrScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClose,
  isOpen
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const initializeScanner = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if QrScanner is available (you need to install qr-scanner)
        const QrScanner = (await import('qr-scanner')).default;
        
        if (!videoRef.current) {
          throw new Error('Video element not found');
        }

        // Check camera availability
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);

        if (!hasCamera) {
          throw new Error('No camera found on this device');
        }

        // Create QR scanner instance
        const scanner = new QrScanner(
          videoRef.current,
          (result: any) => {
            console.log('QR code detected:', result.data);
            onScanSuccess(result.data);
            cleanup();
          },
          {
            onDecodeError: (err: any) => {
              // Don't show decode errors as they happen continuously while scanning
              console.debug('Decode error (normal):', err);
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera if available
          }
        );

        await scanner.start();
        setQrScanner(scanner);
        setIsLoading(false);

      } catch (err: any) {
        console.error('Scanner initialization error:', err);
        const errorMessage = err.message ?? 'Failed to initialize camera';
        setError(errorMessage);
        onScanError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeScanner();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Camera className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Scan QR Code
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Initializing camera...</p>
              <p className="text-sm text-gray-500 mt-2">
                Please allow camera access when prompted
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 text-center mb-4">{error}</p>
              {error.includes('camera') && (
                <div className="text-sm text-gray-600 text-center">
                  <p>Tips:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Make sure camera permission is granted</li>
                    <li>Check if another app is using the camera</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </div>
              )}
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Video Element */}
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50">
                    <div className="w-full h-full border-2 border-blue-500 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  Position the QR code within the frame
                </p>
                <p className="text-sm text-gray-500">
                  The scanner will automatically detect the code
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && (
          <div className="flex justify-center p-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScanner;