"use client"

import * as React from "react"
import { AlertCircle, Database, RefreshCw, X, GitMerge } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DuplicateFile {
  fileName: string
  datasetName: string
  overlapPercentage: number
  newRows: number
}

interface DuplicateModalProps {
  isOpen: boolean
  duplicates: DuplicateFile[]
  onSubmit: (choices: Record<string, "skip" | "replace" | "append_anyway">) => void
  onCancel: () => void
}

export function DuplicateModal({
  isOpen,
  duplicates,
  onSubmit,
  onCancel,
}: DuplicateModalProps) {
  const [choices, setChoices] = React.useState<Record<string, "skip" | "replace" | "append_anyway">>({})

  // Initialize all choices to "skip" by default
  React.useEffect(() => {
    const initialChoices: Record<string, "skip" | "replace" | "append_anyway"> = {}
    duplicates.forEach(dup => {
      initialChoices[dup.fileName] = "skip"
    })
    setChoices(initialChoices)
  }, [duplicates])

  const handleSubmit = () => {
    onSubmit(choices)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center bg-yellow-100 border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <DialogTitle className="text-base">
                {duplicates.length} Duplicate{duplicates.length > 1 ? 's' : ''} Detected
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                These files already exist in your workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {duplicates.map((dup) => (
            <div key={dup.fileName} className="border border-border p-3 space-y-3">
              {/* File header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1">{dup.fileName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {dup.newRows.toLocaleString()} rows
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-yellow-700">
                    {Math.round(dup.overlapPercentage * 100)}% overlap
                  </p>
                </div>
              </div>

              {/* Existing dataset */}
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Matches
                  </p>
                  <p className="text-xs font-medium">{dup.datasetName}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setChoices(prev => ({ ...prev, [dup.fileName]: "skip" }))}
                  className={`p-2 text-center border transition-colors ${
                    choices[dup.fileName] === "skip"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <X className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-[10px] font-medium">Skip</p>
                </button>

                <button
                  onClick={() => setChoices(prev => ({ ...prev, [dup.fileName]: "replace" }))}
                  className={`p-2 text-center border transition-colors ${
                    choices[dup.fileName] === "replace"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <RefreshCw className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-[10px] font-medium">Replace</p>
                </button>

                <button
                  onClick={() => setChoices(prev => ({ ...prev, [dup.fileName]: "append_anyway" }))}
                  className={`p-2 text-center border transition-colors ${
                    choices[dup.fileName] === "append_anyway"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <GitMerge className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-[10px] font-medium">Append</p>
                </button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            size="sm"
          >
            Process Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
