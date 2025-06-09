import React, { useState } from 'react'
import { Upload, ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string
}

const ImageUploader = ({
  file,
  onChange,
  label = 'Upload Image',
}: {
  file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type.startsWith('image/')) {
      const event = {
        target: {
          files: [droppedFile],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      onChange(event)
    }
  }

  const inputId = `file-upload-${Math.random()}`

  return (
    <div
      className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }
        `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
        id={inputId}
      />

      <div className="flex flex-col items-center">
        {file ? (
          <>
            <ImageIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm text-green-600 font-medium">
              {file.name}
            </span>
            <div className="flex gap-2 mt-3">
              <label
                htmlFor={inputId}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                Change Image
              </label>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-xs text-gray-500 mt-1 mb-3">
              JPG, PNG, WEBP max 10MB
            </span>
            <div className="flex flex-col gap-2">
              <label
                htmlFor={inputId}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                Select File
              </label>
              <span className="text-sm text-gray-500">
                or drag and drop your image here
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ImageUploader
