import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

const QRGenerator = () => {
  const [qrType, setQrType] = useState('clock_in');
  const [generatedQR, setGeneratedQR] = useState('');

  const generateQR = () => {
    // Simulate QR generation
    const qrData = {
      type: qrType,
      timestamp: new Date().toISOString(),
      code: Math.random().toString(36).substring(7)
    };
    setGeneratedQR(JSON.stringify(qrData));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Generate QR Code</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipe QR Code</label>
          <select
            value={qrType}
            onChange={(e) => setQrType(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="clock_in">Clock In</option>
            <option value="clock_out">Clock Out</option>
          </select>
        </div>

        <button
          onClick={generateQR}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <QrCode size={20} />
          Generate QR Code
        </button>

        {generatedQR && (
          <div className="mt-8">
            <div className="border-2 border-gray-300 rounded-lg p-8 inline-block">
              <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={120} className="mx-auto mb-4" />
                  <p className="text-sm text-gray-600">QR Code untuk {qrType === 'clock_in' ? 'Clock In' : 'Clock Out'}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Data: {generatedQR}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default QRGenerator;