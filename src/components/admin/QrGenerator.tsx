// src/components/admin/QrGenerator.tsx

import React, { useState, useEffect, useRef } from 'react'
import {
  QrCode,
  Settings,
  Play,
  Square,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  useQrCodeGenerator,
  getClockTypeLabel,
} from '@/hooks/qrcode'
import QRCodeWithLogo from 'qrcode-with-logos'

const QrGenerator = () => {
  const {
    currentQrCode,
    generationStatus,
    settings,
    error,
    generateQrCode,
    stopGeneration,
    updateSettings,
    clearError,
    isAdmin,
    timeRemainingFormatted,
    isExpired,
    isExpiringSoon,
  } = useQrCodeGenerator()

  const [showSettings, setShowSettings] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const qrImgRef = useRef<HTMLImageElement>(null)

  // Update local settings when hook settings change
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  // Generate QR code with qrcode-with-logos library
  useEffect(() => {
    if (currentQrCode && qrCanvasRef.current) {
      generateQrCodeImage()
    }
  }, [currentQrCode])

  // Show message helper
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Generate QR code image using qrcode-with-logos
  const generateQrCodeImage = async () => {
    if (!currentQrCode || !qrCanvasRef.current) return

    try {
      const qrCodeOptions = {
        image: qrImgRef.current!,
        content: currentQrCode.qr_url,
        width: 280,
        logo: { src: '/logo.png' },
      }

      const qrCodeWithLogo = new QRCodeWithLogo(qrCodeOptions)
      const qrCanvas = await qrCodeWithLogo.getCanvas()
      // Draw the generated QR code onto your canvas
      const ctx = qrCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          qrCanvasRef.current.width,
          qrCanvasRef.current.height,
        )
        ctx.drawImage(qrCanvas, 0, 0)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      // Fallback: generate simple QR without logo
      try {
        const fallbackOptions = {
          canvas: qrCanvasRef.current,
          content: currentQrCode.qr_url,
          width: 280,
          height: 280,
          nodeQrCodeOptions: {
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            margin: 2,
          },
        }

        const fallbackQr = new QRCodeWithLogo(fallbackOptions)
        const fallbackCanvas = await fallbackQr.getCanvas()
        const ctx = qrCanvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            qrCanvasRef.current.width,
            qrCanvasRef.current.height,
          )
          ctx.drawImage(fallbackCanvas, 0, 0)
        }
      } catch (fallbackError) {
        console.error('Error generating fallback QR code:', fallbackError)
        showMessage('error', 'Failed to generate QR code image')
      }
    }
  }

  // Handle generate QR code
  const handleGenerate = async () => {
    if (!isAdmin) {
      showMessage('error', 'Unauthorized access')
      return
    }

    clearError()
    const result = await generateQrCode(localSettings)

    if (result) {
      showMessage('success', 'QR code generated successfully')
    } else if (error) {
      showMessage('error', error.message)
    }
  }

  // Handle stop generation
  const handleStop = () => {
    stopGeneration()
    showMessage('success', 'QR code generation stopped')
  }

  // Handle settings save
  const handleSaveSettings = () => {
    updateSettings(localSettings)
    setShowSettings(false)
    showMessage('success', 'Settings updated successfully')
  }

  // Handle settings reset
  const handleResetSettings = () => {
    const defaultSettings = {
      clock_type: 'in' as const,
      location: 'Office Main Entrance',
      expiry_minutes: 10,
      auto_regenerate: false,
      auto_regenerate_interval: 30,
    }
    setLocalSettings(defaultSettings)
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          Only administrators can access QR code generation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">QR Code Generator</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800 font-medium">
              Error: {error.message}
            </span>
          </div>
          {error.details && (
            <div className="mt-2 text-sm text-red-600">
              <pre>{JSON.stringify(error.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Control Panel
            </h2>

            {/* Quick Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clock Type
                </label>
                <select
                  value={localSettings.clock_type}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      clock_type: e.target.value as 'in' | 'out',
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="in">Clock In</option>
                  <option value="out">Clock Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={localSettings.location}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={localSettings.expiry_minutes}
                  onChange={e =>
                    setLocalSettings(prev => ({
                      ...prev,
                      expiry_minutes: parseInt(e.target.value) || 10,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              {!generationStatus.isActive ? (
                <button
                  onClick={handleGenerate}
                  disabled={generationStatus.isGenerating}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {generationStatus.isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Generate QR Code</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2">
                  <Square className="h-5 w-5" />
                  <span>Stop Generation</span>
                </button>
              )}
            </div>

            {/* Status Information */}
            {generationStatus.isActive && currentQrCode && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-800">Status</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div
                      className={`font-medium ${
                        localSettings.clock_type === 'in'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}>
                      {getClockTypeLabel(localSettings.clock_type)}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Time Left:</span>
                    <div
                      className={`font-medium ${
                        isExpired
                          ? 'text-red-600'
                          : isExpiringSoon
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                      {timeRemainingFormatted}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium text-gray-800">
                      {localSettings.location}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Scanned:</span>
                    <div className="font-medium text-gray-800">
                      {generationStatus.scannedCount} times
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Generated QR Code
            </h2>

            {currentQrCode && generationStatus.isActive ? (
              <div className="text-center space-y-6">
                {/* QR Code */}
                <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                  <canvas
                    ref={qrCanvasRef}
                    className="block mx-auto"
                    width={280}
                    height={280}
                  />
                </div>

                {/* QR Code Info */}
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-gray-800 mb-3">
                    QR Code Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <QrCode
                        className={`h-4 w-4 ${
                          localSettings.clock_type === 'in'
                            ? 'text-green-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {getClockTypeLabel(localSettings.clock_type)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Expires in:</span>
                      <span
                        className={`font-medium ${
                          isExpired
                            ? 'text-red-600'
                            : isExpiringSoon
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                        {timeRemainingFormatted}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {localSettings.location}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Scanned:</span>
                      <span className="font-medium">
                        {generationStatus.scannedCount} times
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 break-all">
                      <strong>Token:</strong> {currentQrCode.token}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Instructions for Employees:
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Open the company app on your mobile device</li>
                    <li>2. Tap on "Scan QR Code" or use the camera feature</li>
                    <li>3. Point your camera at this QR code</li>
                    <li>4. Your attendance will be recorded automatically</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <QrCode className="h-min-24 w-min-24 mx-auto my-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No QR Code Generated
                </h3>
                <p className="text-gray-500 mb-6">
                  Click "Generate QR Code" to create a new attendance QR code
                </p>

                <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Current Settings:
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>
                      • Type: {getClockTypeLabel(localSettings.clock_type)}
                    </div>
                    <div>• Location: {localSettings.location}</div>
                    <div>• Expiry: {localSettings.expiry_minutes} minutes</div>
                    <div>
                      • Auto-regenerate:{' '}
                      {settings.auto_regenerate ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Advanced Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Auto Regenerate */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Auto Regenerate
                    </label>
                    <button
                      onClick={() =>
                        setLocalSettings(prev => ({
                          ...prev,
                          auto_regenerate: !prev.auto_regenerate,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.auto_regenerate
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.auto_regenerate
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Automatically generate new QR code after it expires
                  </p>
                </div>

                {/* Common Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Locations
                  </label>
                  <div className="space-y-2">
                    {[
                      'Office Main Entrance',
                      'Office Back Entrance',
                      'Warehouse Gate',
                      'Factory Floor',
                      'Reception Area',
                    ].map(location => (
                      <button
                        key={location}
                        onClick={() =>
                          setLocalSettings(prev => ({ ...prev, location }))
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          localSettings.location === location
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                        <div className="text-sm">{location}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Save Settings
                </button>
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Reset
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QrGenerator
