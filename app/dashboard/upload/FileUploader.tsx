"use client"

import * as React from "react"
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { uploadFiles } from "@/lib/api/client"

interface ProgressUpdate {
  step: string
  progress: number
  message: string
  current_step: string
  status: string
  data?: {
    company_id: string
    dataset_ids: Record<string, string>
    total_datasets: number
  }
  error?: string
}

export function FileUploader() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [currentStep, setCurrentStep] = React.useState("")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [uploadStatus, setUploadStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)

  const { userId } = useAuth()
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file =>
      file.name.endsWith('.csv') ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    )

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !userId) return

    setIsUploading(true)
    setUploadStatus("uploading")
    setProgress(0)
    setError(null)

    try {
      // Upload files using centralized API
      const response = await uploadFiles(
        "/api/etl/upload",
        selectedFiles,
        userId
      )

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      // Read SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: ProgressUpdate = JSON.parse(line.slice(6))

            setProgress(data.progress)
            setCurrentStep(data.current_step)
            setStatusMessage(data.message)

            if (data.status === 'completed') {
              setUploadStatus("success")
              setIsUploading(false)

              // Redirect to datasets page after 2 seconds
              setTimeout(() => {
                router.push('/dashboard/datasets')
              }, 2000)
            } else if (data.status === 'error') {
              setUploadStatus("error")
              setError(data.error || "Upload failed")
              setIsUploading(false)
            }
          }
        }
      }
    } catch (err) {
      setUploadStatus("error")
      setError(err instanceof Error ? err.message : "Upload failed")
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Data Files</CardTitle>
          <CardDescription>
            Upload CSV or Excel files to start analyzing your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Drag and drop your files here, or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                browse
              </button>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && uploadStatus === "idle" && (
            <Button
              onClick={handleUpload}
              className="w-full mt-4"
              disabled={isUploading}
            >
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Progress Card */}
      {uploadStatus !== "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadStatus === "uploading" && (
                <>
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Processing Files
                </>
              )}
              {uploadStatus === "success" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Upload Complete!
                </>
              )}
              {uploadStatus === "error" && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Upload Failed
                </>
              )}
            </CardTitle>
            <CardDescription>
              {uploadStatus === "uploading" && currentStep}
              {uploadStatus === "success" && "Redirecting to your datasets..."}
              {uploadStatus === "error" && "An error occurred during upload"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadStatus === "uploading" && (
              <>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">{statusMessage}</p>
              </>
            )}

            {uploadStatus === "success" && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Your files have been processed successfully!
                </p>
              </div>
            )}

            {uploadStatus === "error" && error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
                <Button
                  onClick={() => {
                    setUploadStatus("idle")
                    setError(null)
                    setProgress(0)
                  }}
                  variant="outline"
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
