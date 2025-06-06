'use client';

import React, { useState } from 'react';
import { X, QrCode, Hand, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { AttendanceMethodModalProps } from '@/types/qrcode';
import { useQrCode } from '@/hooks/useQrCode';
import { useClockInOut } from '@/hooks/attendance';
import QrScanner from '@/components/qr/QrScanner';

const AttendanceMethodModal: React.FC<AttendanceMethodModalProps> = ({
  isOpen,
  onClose,
  clockType,
  onSuccess
}) => {
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [location, setLocation] = useState('');

  const { clockIn, clockOut, isLoading: clockActionLoading } = useClockInOut();
  
  const { handleQrScan, isProcessing: qrProcessing, error: qrError } = useQrCode({
    onSuccess: (attendanceId) => {
      setMessage({ type: 'success', text: 'QR Code attendance successful!' });
      setTimeout(() => {
        onSuccess(attendanceId);
        handleClose();
      }, 1500);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error });
      setShowQrScanner(false);
    }
  });

  const handleClose = () => {
    setShowQrScanner(false);
    setMessage(null);
    setLocation('');
    onClose();
  };

  const handleQrCodeMethod = () => {
    setMessage(null);
    setShowQrScanner(true);
  };

  const handleManualMethod = async () => {
    try {
      if (!location.trim()) {
        setMessage({ type: 'error', text: 'Please enter your location' });
        return;
      }

      setIsProcessing(true);
      setMessage(null);

      const attendanceData = {
        location: location.trim(),
        method: 'manual' as const
      };

      let response;
      if (clockType === 'in') {
        response = await clockIn(attendanceData);
      } else {
        response = await clockOut(attendanceData);
      }

      // Extract attendance ID from response
      // Assuming the response has the attendance record with an ID
      const attendanceId = response?.data?.id ?? console.error('No attendance ID found in response');
      
      if (attendanceId) {
        setMessage({ type: 'success', text: 'Manual attendance successful!' });
        setTimeout(() => {
          onSuccess(attendanceId);
          handleClose();
        }, 1500);
      } else {
        throw new Error('No attendance ID returned from manual attendance');
      }

    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ?? error?.message ?? 'Manual attendance failed';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQrScanSuccess = async (qrData: string) => {
    setShowQrScanner(false);
    await handleQrScan(qrData);
  };

  const handleQrScanError = (error: string) => {
    setMessage({ type: 'error', text: error });
    setShowQrScanner(false);
  };

  if (!isOpen) return null;

  const isLoading = isProcessing || clockActionLoading || qrProcessing;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Choose Attendance Method
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select how you want to clock {clockType}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Message Display */}
            {message && (
              <div className={`mb-4 p-3 rounded-md flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* QR Code Option */}
              <button
                onClick={handleQrCodeMethod}
                disabled={isLoading}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <QrCode className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4 text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      Scan QR Code
                    </h3>
                    <p className="text-sm text-gray-600">
                      Use your camera to scan an attendance QR code
                    </p>
                  </div>
                </div>
              </button>

              {/* Manual Option */}
              <div className="w-full p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0">
                    {isLoading && !qrProcessing ? (
                      <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    ) : (
                      <Hand className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                  <div className="ml-4 text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      Manual Check-{clockType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Record attendance manually from your current location
                    </p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={handleManualMethod}
                  disabled={isLoading || !location.trim()}
                  className="w-full mt-3 p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Submit Manual Attendance
                </button>
              </div>
            </div>

            {/* Loading State */}
            {qrProcessing && (
              <div className="mt-4 flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Processing QR code...</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScanner
        isOpen={showQrScanner}
        onScanSuccess={handleQrScanSuccess}
        onScanError={handleQrScanError}
        onClose={() => setShowQrScanner(false)}
      />
    </>
  );
};

export default AttendanceMethodModal;