"use client"

import * as React from "react"
import { Upload, X, FileText, AlertCircle, Database, Trash2, Eye, Info } from "lucide-react"
import { etlService } from "@/lib/api"
import type { Dataset, ETLProgressUpdate } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DuplicateModal } from "./DuplicateModal"
import { DatasetViewer } from "./DatasetViewer"
import { SchemaView } from "./SchemaView"
import { DatasetContext } from "./DatasetContext"

interface DataHubClientProps {
  initialDatasets: Dataset[]
  userId: string
}

interface DuplicateFile {
  fileName: string
  datasetName: string
  overlapPercentage: number
  newRows: number
}

export function DataHubClient({ initialDatasets, userId }: DataHubClientProps) {
  const [datasets, setDatasets] = React.useState<Dataset[]>(initialDatasets)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [currentStep, setCurrentStep] = React.useState("")
  const [statusMessage, setStatusMessage] = React.useState("")
  const [uploadStatus, setUploadStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)

  // Duplicate detection state (batch)
  const [duplicates, setDuplicates] = React.useState<DuplicateFile[]>([])
  const [showDuplicateModal, setShowDuplicateModal] = React.useState(false)

  // Delete confirmation state
  const [deletingDatasetId, setDeletingDatasetId] = React.useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [datasetToDelete, setDatasetToDelete] = React.useState<{ id: string; name: string } | null>(null)

  // Dataset viewer state
  const [showDatasetViewer, setShowDatasetViewer] = React.useState(false)
  const [datasetToView, setDatasetToView] = React.useState<{ id: string; name: string } | null>(null)

  // Dataset context state
  const [showDatasetContext, setShowDatasetContext] = React.useState(false)
  const [datasetForContext, setDatasetForContext] = React.useState<Dataset | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Drag and drop handlers
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

  const handleUpload = async (forceActions?: Record<string, 'skip' | 'replace' | 'append_anyway'>) => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadStatus("uploading")
    setProgress(0)
    setError(null)

    try {
      // Use the new API service layer with optional force actions
      const response = await etlService.uploadFilesWithProgress(userId, selectedFiles, forceActions)

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
            const data: ETLProgressUpdate = JSON.parse(line.slice(6))

            setProgress(data.progress)
            setCurrentStep(data.current_step)
            setStatusMessage(data.message)

            if (data.status === 'duplicates_detected') {
              // Batch duplicates found - show all at once
              const dupFiles: DuplicateFile[] = []

              if (data.duplicates) {
                Object.entries(data.duplicates).forEach(([fileName, dupInfo]: [string, { dataset_name: string; overlap_percentage: number; new_rows: number; total_rows: number }]) => {
                  dupFiles.push({
                    fileName,
                    datasetName: dupInfo.dataset_name,
                    overlapPercentage: dupInfo.overlap_percentage,
                    newRows: dupInfo.new_rows,
                  })
                })
              }

              setDuplicates(dupFiles)
              setShowDuplicateModal(true)
              setIsUploading(false)
              // Stream has ended, user needs to resolve all duplicates
              return
            } else if (data.status === 'completed') {
              setIsUploading(false)
              setSelectedFiles([])

              // Refresh datasets
              const updatedDatasets = await etlService.getDatasets(userId)
              setDatasets(updatedDatasets)

              // Reset upload UI immediately
              setUploadStatus("idle")
              setProgress(0)
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

  const handleDuplicateBatchSubmit = (choices: Record<string, 'skip' | 'replace' | 'append_anyway'>) => {
    setShowDuplicateModal(false)
    setDuplicates([])

    // Check if all files are being skipped
    const allSkipped = Object.values(choices).every(choice => choice === 'skip')

    if (allSkipped) {
      // Just close modal and reset
      setUploadStatus("idle")
      setSelectedFiles([])
      return
    }

    // Re-upload with force actions for all files
    handleUpload(choices)
  }

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false)
    setDuplicates([])
    setUploadStatus("idle")
    setSelectedFiles([])
  }

  const handleDeleteDataset = (datasetId: string, datasetName: string) => {
    setDatasetToDelete({ id: datasetId, name: datasetName })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!datasetToDelete) return

    setShowDeleteDialog(false)
    setDeletingDatasetId(datasetToDelete.id)

    try {
      await etlService.deleteDataset(userId, datasetToDelete.id)

      // Refresh datasets list
      const updatedDatasets = await etlService.getDatasets(userId)
      setDatasets(updatedDatasets)

      setDeletingDatasetId(null)
      setDatasetToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete dataset")
      setDeletingDatasetId(null)
      setDatasetToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteDialog(false)
    setDatasetToDelete(null)
  }

  const handleViewDataset = (datasetId: string, datasetName: string) => {
    setDatasetToView({ id: datasetId, name: datasetName })
    setShowDatasetViewer(true)
  }

  const closeDatasetViewer = () => {
    setShowDatasetViewer(false)
    setDatasetToView(null)
  }

  const handleShowContext = (dataset: Dataset) => {
    setDatasetForContext(dataset)
    setShowDatasetContext(true)
  }

  const closeDatasetContext = () => {
    setShowDatasetContext(false)
    setDatasetForContext(null)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="datasets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="schema">Schema View</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-6 mt-6">
          {/* Upload Section */}
          {uploadStatus !== "uploading" && (
            <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload Files</CardTitle>
            <CardDescription className="text-xs">
              CSV or Excel files for automated ETL processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm">
                Drag and drop files or{" "}
                <span className="text-primary font-medium">
                  click to browse
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supported: CSV, Excel (.xlsx, .xls)
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
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Selected ({selectedFiles.length})
                </h4>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleUpload()}
                  size="sm"
                  className="w-full"
                  disabled={isUploading}
                >
                  Process {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      {uploadStatus === "uploading" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin" />
              Processing ETL Pipeline
            </CardTitle>
            <CardDescription className="text-xs">{currentStep}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{statusMessage}</span>
              <span className="font-mono font-medium">{progress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {uploadStatus === "error" && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Upload Failed</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setUploadStatus("idle")
                setError(null)
                setProgress(0)
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Datasets Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Datasets</CardTitle>
              <CardDescription className="text-xs">
                {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'} in your workspace
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border">
              <Database className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-sm font-medium mb-1">No datasets yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Upload CSV or Excel files to begin ETL processing
              </p>
            </div>
          ) : (
            <div className="border border-border">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-muted border-b border-border">
                <div className="col-span-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </div>
                <div className="col-span-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Domain
                </div>
                <div className="col-span-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">
                  Rows
                </div>
                <div className="col-span-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">
                  Columns
                </div>
                <div className="col-span-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </div>
                <div className="col-span-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Uploaded
                </div>
                <div className="col-span-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="grid grid-cols-12 gap-4 px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-3 flex flex-col">
                    <button
                      onClick={() => handleViewDataset(dataset.id, dataset.table_name)}
                      className="flex items-center gap-1.5 text-xs font-medium text-left hover:text-primary transition-colors group"
                    >
                      <Eye className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                      <span className="truncate group-hover:underline">{dataset.table_name}</span>
                    </button>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {dataset.original_filename}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {dataset.domain || 'Unknown'}
                  </div>
                  <div className="col-span-1 text-xs font-mono text-right">
                    {dataset.row_count?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="col-span-1 text-xs font-mono text-right">
                    {dataset.column_count || 'N/A'}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${
                        dataset.status === 'ready'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : dataset.status === 'processing'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {dataset.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {new Date(dataset.uploaded_at).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end gap-2">
                    <button
                      onClick={() => handleShowContext(dataset)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View dataset context"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDataset(dataset.id, dataset.table_name)}
                      disabled={deletingDatasetId === dataset.id}
                      className="text-muted-foreground hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete dataset"
                    >
                      {deletingDatasetId === dataset.id ? (
                        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="schema" className="mt-6">
          <SchemaView userId={userId} onDatasetClick={handleViewDataset} />
        </TabsContent>
      </Tabs>

      {/* Duplicate Detection Modal */}
      {duplicates.length > 0 && (
        <DuplicateModal
          isOpen={showDuplicateModal}
          duplicates={duplicates}
          onSubmit={handleDuplicateBatchSubmit}
          onCancel={handleCancelDuplicate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{datasetToDelete?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>The dataset and all its data</li>
              <li>All relationships with other datasets</li>
              <li>Column metadata and semantic information</li>
            </ul>
            <p className="mt-3 text-sm font-medium text-destructive">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Dataset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dataset Viewer */}
      {datasetToView && (
        <DatasetViewer
          isOpen={showDatasetViewer}
          onClose={closeDatasetViewer}
          datasetId={datasetToView.id}
          datasetName={datasetToView.name}
          userId={userId}
        />
      )}

      {/* Dataset Context Panel */}
      <DatasetContext
        isOpen={showDatasetContext}
        onClose={closeDatasetContext}
        dataset={datasetForContext}
      />
    </div>
  )
}
