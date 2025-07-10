// src/components/qr/QrScanner.tsx
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

  // Function to extract hostname from URL string
  const extractHostname = (url: string): string => {
    try {
      // Remove protocol if present
      const cleanUrl = url.replace(/^https?:\/\//, '');
      // Remove path, query, and fragment
      const hostname = cleanUrl.split('/')[0].split('?')[0].split('#')[0];
      return hostname;
    } catch {
      return '';
    }
  };

  // Function to check if URL is safe to navigate to
  const isSafeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      
      // Get allowed domains from environment variable
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const allowedDomains = [];
      
      // Add backend domain if it exists
      if (backendUrl) {
        const backendHostname = extractHostname(backendUrl);
        if (backendHostname) {
          allowedDomains.push(backendHostname);
        }
      }
      
      // Add current domain
      if (typeof window !== 'undefined') {
        allowedDomains.push(window.location.hostname);
      }
      
      // For development, allow localhost
      if (process.env.NODE_ENV === 'development') {
        allowedDomains.push('localhost', '127.0.0.1');
      }
      
      console.log('Checking URL:', url);
      console.log('URL hostname:', urlObj.hostname);
      console.log('Allowed domains:', allowedDomains);
      
      const hostname = urlObj.hostname;
      
      // Check if hostname matches any allowed domain
      return allowedDomains.some(domain => {
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch (error) {
      console.error('Error checking URL safety:', error);
      return false;
    }
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const qrData = detectedCodes[0].rawValue;
      console.log('QR code detected:', qrData);
      
      // Check if the scanned data is a URL
      if (isValidUrl(qrData)) {
        console.log('Valid URL detected, checking safety...');
        
        // For debugging: always show confirmation for URLs
        // You can modify this logic based on your needs
        if (true) { // Changed from isSafeUrl(qrData) to always show confirmation
          console.log('Showing confirmation dialog');
          setScannedUrl(qrData);
          setShowConfirmation(true);
          setIsScanning(false);
        } else {
          console.log('URL not safe, rejecting');
          setError('This URL is not allowed');
          setIsScanning(false);
        }
      } else {
        console.log('Not a URL, using original callback');
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
        
        // Check if it's a safe URL before navigating
        if (isSafeUrl(scannedUrl)) {
          // If it's the same origin, use Next.js router
          if (url.hostname === window.location.hostname) {
            const pathWithQuery = url.pathname + url.search + url.hash;
            router.push(pathWithQuery);
          } else {
            // For external safe URLs, open in new tab
            window.open(scannedUrl, '_blank', 'noopener,noreferrer');
          }
        } else {
          // For unsafe URLs, still allow user to open in new tab with warning
          if (confirm('This URL is not from a trusted domain. Are you sure you want to open it?')) {
            window.open(scannedUrl, '_blank', 'noopener,noreferrer');
          }
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
    console.log('Current state:', { error, showConfirmation, scannedUrl, isScanning });
    
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
                formats={['qr_code']}
                constraints={{
                  facingMode: 'environment',
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