"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { etlService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DatasetViewerProps {
  isOpen: boolean
  onClose: () => void
  datasetId: string
  datasetName: string
  userId: string
}

export function DatasetViewer({ isOpen, onClose, datasetId, datasetName, userId }: DatasetViewerProps) {
  const [columns, setColumns] = React.useState<string[]>([])
  const [rows, setRows] = React.useState<any[][]>([])
  const [totalRows, setTotalRows] = React.useState(0)
  const [currentPage, setCurrentPage] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const pageSize = 50
  const totalPages = Math.ceil(totalRows / pageSize)

  const loadData = React.useCallback(async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await etlService.getDatasetData(
        userId,
        datasetId,
        pageSize,
        page * pageSize
      )
      setColumns(data.columns)
      setRows(data.rows)
      setTotalRows(data.total_rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dataset")
    } finally {
      setIsLoading(false)
    }
  }, [userId, datasetId, pageSize])

  React.useEffect(() => {
    if (isOpen) {
      setCurrentPage(0)
      loadData(0)
    }
  }, [isOpen, loadData])

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      loadData(newPage)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      loadData(newPage)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{datasetName}</DialogTitle>
          <div className="text-xs text-muted-foreground mt-1">
            {totalRows.toLocaleString()} rows × {columns.length} columns
          </div>
        </DialogHeader>

        {error && (
          <div className="flex-shrink-0 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-auto border border-border rounded">
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-r border-border">
                    #
                  </th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2 text-muted-foreground font-mono border-r border-border">
                      {currentPage * pageSize + rowIdx + 1}
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-3 py-2 border-r border-border last:border-r-0"
                      >
                        {cell === null || cell === undefined ? (
                          <span className="text-muted-foreground italic">null</span>
                        ) : typeof cell === 'number' ? (
                          <span className="font-mono">{cell}</span>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalRows)} of {totalRows.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1 || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
