"use client"

import { useState, useRef } from "react"
import { Button } from "./button"
import { Card } from "./card"
import { X, Upload, Image, FileText } from "lucide-react"

interface UploadedFile {
  id: string
  file: File
  description: string
  category: string
  preview?: string
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSize?: number // in MB
}

export function FileUpload({ 
  onFilesChange, 
  maxFiles = 10, 
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png"],
  maxSize = 10
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newFiles: UploadedFile[] = files.map(file => {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} not supported. Please use: ${acceptedTypes.join(", ")}`)
        return null
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size: ${maxSize}MB`)
        return null
      }

      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
      }

      return {
        id: Math.random().toString(36).substring(2, 15),
        file,
        description: "",
        category: "reference",
        preview
      }
    }).filter(Boolean) as UploadedFile[]

    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== id)
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const updateFileMetadata = (id: string, field: keyof UploadedFile, value: string) => {
    const updatedFiles = uploadedFiles.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    )
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Click to upload
            </Button>
            <p className="mt-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {acceptedTypes.join(", ")} up to {maxSize}MB each
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                      {getFileIcon(file.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info and Controls */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file.size)} • {file.file.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* File Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Client fabric sample, Design sketch"
                        value={file.description}
                        onChange={(e) => updateFileMetadata(file.id, "description", e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={file.category}
                        onChange={(e) => updateFileMetadata(file.id, "category", e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="fabric">Fabric Sample</option>
                        <option value="sketch">Design Sketch</option>
                        <option value="reference">Reference Image</option>
                        <option value="measurement">Measurement Photo</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
