// src/components/qr/QrScanner.tsx
// Note: You need to install @yudiel/react-qr-scanner: npm install @yudiel/react-qr-scanner

'use client';

import React, { useState } from 'react';
import { X, Camera, AlertCircle, ExternalLink } from 'lucide-react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';
import { QrScannerProps } from '@/types/qrcode';

const QrScanner: React.FC<QrScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClose,
  isOpen
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Function to check if a string is a valid URL
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Function to check if URL is safe to navigate to
  const isSafeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Add your domain whitelist here if needed
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        '192.168.1.19',
        `${process.env.NEXT_PUBLIC_BACKEND_URL}` // Your local IP
        // Add other trusted domains
      ];
      
      const hostname = urlObj.hostname;
      return allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const qrData = detectedCodes[0].rawValue;
      console.log('QR code detected:', qrData);
      
      // Check if the scanned data is a URL
      if (isValidUrl(qrData)) {
        if (isSafeUrl(qrData)) {
          setScannedUrl(qrData);
          setShowConfirmation(true);
          setIsScanning(false);
        }
      } else {
        // If it's not a URL, use the original callback
        onScanSuccess(qrData);
        handleClose();
      }
    }
  };

  const handleNavigateToUrl = () => {
    if (scannedUrl) {
      try {
        const url = new URL(scannedUrl);
        
        // If it's the same origin or trusted domain, use Next.js router
        if (isSafeUrl(scannedUrl) && (url.hostname === window.location.hostname || url.hostname === `${process.env.NEXT_PUBLIC_BACKEND_URL}`)) {
          // Extract the path and query for Next.js router
          const pathWithQuery = url.pathname + url.search + url.hash;
          router.push(pathWithQuery);
        } else {
          // For external URLs, open in new tab
          window.open(scannedUrl, '_blank', 'noopener,noreferrer');
        }
        
        onScanSuccess(scannedUrl);
        handleClose();
      } catch (error) {
        console.error('Navigation error:', error);
        onScanError('Failed to navigate to URL');
      }
    }
  };

  const handleCancelNavigation = () => {
    setScannedUrl(null);
    setShowConfirmation(false);
    setIsScanning(true);
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
    let errorMessage = 'Failed to access camera';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setError(errorMessage);
    onScanError(errorMessage);
    setIsScanning(false);
  };

  const handleClose = () => {
    setError(null);
    setIsScanning(true);
    setScannedUrl(null);
    setShowConfirmation(false);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setIsScanning(true);
    setScannedUrl(null);
    setShowConfirmation(false);
  };

  // Function to render the appropriate content based on current state
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          <div className="text-sm text-gray-600 text-center mb-4">
            <p>Tips:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Make sure camera permission is granted</li>
              <li>Check if another app is using the camera</li>
              <li>Try using HTTPS or localhost</li>
              <li>Ensure your device has a camera</li>
            </ul>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    if (showConfirmation && scannedUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <ExternalLink className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Navigate to URL?
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            The QR code contains a link. Do you want to navigate to:
          </p>
          <div className="bg-gray-100 p-3 rounded-md mb-6 max-w-full">
            <p className="text-sm font-mono text-gray-800 break-all">
              {scannedUrl}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleNavigateToUrl}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Link
            </button>
            <button
              onClick={handleCancelNavigation}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Scan Again
            </button>
          </div>
        </div>
      );
    }

    // Default scanner content
    return (
      <>
        {/* Scanner Component */}
        <div className="relative mb-4">
          <div className="w-full h-64 bg-black rounded-lg overflow-hidden">
            {isScanning && (
              <Scanner
                onScan={handleScan}
                onError={handleError}
                formats={['qr_code']} // Focus only on QR codes
                constraints={{
                  facingMode: 'environment', // Use back camera if available
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 }
                }}
                styles={{
                  container: { 
                    width: '100%', 
                    height: '256px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  },
                  video: { 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' as const
                  }
                }}
                components={{
                  finder: true,
                  tracker: (detectedCodes, ctx) => {
                    // Custom tracker to highlight detected QR codes
                    detectedCodes.forEach((code) => {
                      const [first, second, third, fourth] = code.cornerPoints;
                      ctx.strokeStyle = '#00ff00';
                      ctx.lineWidth = 4;
                      ctx.beginPath();
                      ctx.moveTo(first.x, first.y);
                      ctx.lineTo(second.x, second.y);
                      ctx.lineTo(third.x, third.y);
                      ctx.lineTo(fourth.x, fourth.y);
                      ctx.lineTo(first.x, first.y);
                      ctx.stroke();
                    });
                  }
                }}
                classNames={{
                  container: 'qr-scanner-container',
                  video: 'qr-scanner-video'
                }}
                allowMultiple={false}
                scanDelay={300}
              />
            )}
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
    );
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
          {renderContent()}
        </div>

        {/* Footer */}
        {!error && !showConfirmation && (
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