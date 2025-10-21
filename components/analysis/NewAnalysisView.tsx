"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Database,
  Play,
  X,
  ArrowUpDown,
  Sparkles
} from "lucide-react"
import type { Dataset } from "@/lib/api/types"

interface NewAnalysisViewProps {
  datasets: Dataset[]
  selectedDatasetIds: string[]
  onSelectedDatasetsChange: (ids: string[]) => void
  onRun: (analysisName?: string) => void
  onCancel: () => void
}

type SortField = 'table_name' | 'row_count' | 'column_count' | 'domain'
type SortDirection = 'asc' | 'desc'

export function NewAnalysisView({
  datasets,
  selectedDatasetIds,
  onSelectedDatasetsChange,
  onRun,
  onCancel
}: NewAnalysisViewProps) {
  const [analysisName, setAnalysisName] = React.useState("")
  const [sortField, setSortField] = React.useState<SortField>('table_name')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')
  const [error, setError] = React.useState<string | null>(null)

  // Determine if all datasets are selected
  const allSelected = datasets.length > 0 && selectedDatasetIds.length === datasets.length
  const someSelected = selectedDatasetIds.length > 0 && selectedDatasetIds.length < datasets.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectedDatasetsChange([])
    } else {
      onSelectedDatasetsChange(datasets.map(d => d.id))
    }
  }

  const handleToggleDataset = (datasetId: string) => {
    if (selectedDatasetIds.includes(datasetId)) {
      onSelectedDatasetsChange(selectedDatasetIds.filter(id => id !== datasetId))
    } else {
      onSelectedDatasetsChange([...selectedDatasetIds, datasetId])
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleRun = () => {
    if (selectedDatasetIds.length === 0) {
      setError("Please select at least one dataset to analyze")
      return
    }
    setError(null)
    onRun(analysisName.trim() || undefined)
  }

  // Sort datasets
  const sortedDatasets = React.useMemo(() => {
    return [...datasets].sort((a, b) => {
      let aVal: string | number | null = a[sortField]
      let bVal: string | number | null = b[sortField]

      // Handle null/undefined values
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''

      // String comparison for text fields
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = typeof bVal === 'string' ? bVal.toLowerCase() : String(bVal)
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
  }, [datasets, sortField, sortDirection])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              New Analysis
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select datasets to analyze and discover insights
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Analysis Name Input */}
        <div className="max-w-md">
          <label htmlFor="analysis-name" className="text-sm font-medium text-foreground mb-1.5 block">
            Analysis Name (Optional)
          </label>
          <Input
            id="analysis-name"
            placeholder="e.g., Q1 Revenue Analysis"
            value={analysisName}
            onChange={(e) => setAnalysisName(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Dataset Selection Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Select Datasets
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedDatasetIds.length} of {datasets.length} selected
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {datasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No datasets available. Please upload data first.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all datasets"
                      className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('table_name')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Dataset Name
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('row_count')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Rows
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('column_count')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Columns
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('domain')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Domain
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDatasets.map((dataset) => {
                  const isSelected = selectedDatasetIds.includes(dataset.id)
                  return (
                    <TableRow
                      key={dataset.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => handleToggleDataset(dataset.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleDataset(dataset.id)}
                          aria-label={`Select ${dataset.table_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            {dataset.table_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {dataset.row_count?.toLocaleString() || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {dataset.column_count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        {dataset.domain ? (
                          <Badge variant="outline" className="text-xs">
                            {dataset.domain}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Footer with Run Button */}
      <div className="flex-shrink-0 border-t border-border bg-muted/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedDatasetIds.length > 0 ? (
              <span>
                Ready to analyze <strong>{selectedDatasetIds.length}</strong> dataset
                {selectedDatasetIds.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span>Select at least one dataset to continue</span>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleRun}
            disabled={selectedDatasetIds.length === 0}
            className="shadow-md"
          >
            <Play className="mr-2 h-5 w-5" />
            Run Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
