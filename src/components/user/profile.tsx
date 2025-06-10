'use client'

import { useState } from 'react'
import {
  Camera,
  Trash2,
  User,
  Mail,
  MapPin,
  Building,
  Loader2,
} from 'lucide-react'
import { useProfile, useDepartments } from '@/hooks/users'
import ImageUploader from '@/components/common/ImageUploader'
import {
  toTitleCase,
  getInitials,
  truncate,
  formatNumber,
} from '@/utils/stringUtils'

const ProfilePage = () => {
  const { profile, isLoading, uploadPhotoProfile, deletePhotoProfile, mutate } =
    useProfile()

  const { departments } = useDepartments()

  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const userDepartment = departments?.find(
    dept => dept.id === profile?.department_id,
  )
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      formatNumber(parseFloat((bytes / Math.pow(k, i)).toFixed(2))) +
      ' ' +
      sizes[i]
    )
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
      setSuccessMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError(
        'Please select a valid image file (JPEG, PNG, JPG, or WebP)',
      )
      return
    }

    if (selectedFile.size > maxSize) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setSuccessMessage(null)

    try {
      await uploadPhotoProfile(selectedFile)
      setSuccessMessage('Photo profile uploaded successfully!')
      setSelectedFile(null)
      mutate() // Refresh profile data
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(
        error.response?.data?.message ?? 'Failed to upload photo profile',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your photo profile?')) {
      return
    }

    setIsDeleting(true)
    setUploadError(null)
    setSuccessMessage(null)

    try {
      await deletePhotoProfile()
      setSuccessMessage('Photo profile deleted successfully!')
      mutate() // Refresh profile data
    } catch (error: any) {
      console.error('Delete error:', error)
      setUploadError(
        error.response?.data?.message ?? 'Failed to delete photo profile',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Profile Photo</h1>
            <p className="text-blue-100 mt-2">Manage your profile photo</p>
          </div>

          <div className="p-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            {uploadError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Photo Profile Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Photo
                  </h3>

                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      {profile.photo_profile_url ? (
                        <img
                          src={profile.photo_profile_url}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg mx-auto bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {getInitials(profile.name)}
                          </span>
                        </div>
                      )}
                      {profile.has_photo_profile && (
                        <div className="absolute top-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                          <Camera className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {profile.has_photo_profile && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto">
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Photo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Information Display (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Profile Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">
                          {toTitleCase(profile.name)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="font-medium text-gray-900">
                          {toTitleCase(profile.position)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">
                          {profile.department_id
                            ? toTitleCase(
                                userDepartment?.name ?? 'No department',
                              )
                            : 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload New Photo
                  </h3>

                  <div className="space-y-4">
                    <ImageUploader
                      file={selectedFile}
                      onChange={handleFileChange}
                      label="Upload Profile Photo"
                    />

                    {selectedFile && (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">
                            File Details
                          </h4>
                          <div className="text-sm text-blue-700 space-y-1">
                            <p>
                              <span className="font-medium">Name:</span>
                              <span
                                title={selectedFile.name}
                                className="cursor-help">
                                {truncate(selectedFile.name, 30)}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Size:</span>{' '}
                              {formatFileSize(selectedFile.size)}
                            </p>
                            <p>
                              <span className="font-medium">Type:</span>{' '}
                              {selectedFile.type}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-5 h-5" />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Photo Requirements
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Supported formats: JPEG, PNG, JPG, WebP</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Recommended: Square aspect ratio (1:1)</li>
                      <li>• Minimum resolution: 200x200 pixels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
