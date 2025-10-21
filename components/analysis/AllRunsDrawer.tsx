"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Calendar,
  Database,
  Trash2
} from "lucide-react"
import { analysisService } from "@/lib/api"

interface AllRunsDrawerProps {
  open: boolean
  onClose: () => void
  onSelectAnalysis: (analysisId: string) => void
  userId: string
}

interface AnalysisSummary {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  started_at?: string | null
  completed_at?: string | null
  insights_generated?: number
  recommendations_generated?: number
  dataset_count?: number
}

export function AllRunsDrawer({
  open,
  onClose,
  onSelectAnalysis,
  userId
}: AllRunsDrawerProps) {
  const [analyses, setAnalyses] = React.useState<AnalysisSummary[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = React.useState<AnalysisSummary[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load analyses
  const loadAnalyses = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await analysisService.listAnalyses(userId, 50, 0)
      setAnalyses(response.analyses || [])
      setFilteredAnalyses(response.analyses || [])
    } catch (err) {
      console.error("Failed to load analyses:", err)
      setError("Failed to load analysis history")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Load analyses when drawer opens
  React.useEffect(() => {
    if (open) {
      loadAnalyses()
    }
  }, [open, loadAnalyses])

  // Auto-refresh every 10 seconds when drawer is open
  React.useEffect(() => {
    if (!open) return

    const interval = setInterval(() => {
      loadAnalyses()
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [open, loadAnalyses])

  // Filter analyses based on search query
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAnalyses(analyses)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = analyses.filter(analysis =>
      analysis.name?.toLowerCase().includes(query) ||
      analysis.id.toLowerCase().includes(query) ||
      analysis.status.toLowerCase().includes(query)
    )
    setFilteredAnalyses(filtered)
  }, [searchQuery, analyses])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'running':
        return <Badge variant="default">Running</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const handleSelectAnalysis = (analysisId: string) => {
    onSelectAnalysis(analysisId)
  }

  const handleDeleteAnalysis = async (analysisId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent selecting the analysis

    try {
      await analysisService.deleteAnalysis(userId, analysisId)
      // Reload the list after deletion
      await loadAnalyses()
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-xl font-semibold">Analysis History</SheetTitle>
          <SheetDescription>
            View and manage all your analysis runs
          </SheetDescription>
        </SheetHeader>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search analyses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && analyses.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading analyses...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <p className="text-sm text-destructive mb-4">{error}</p>
                <Button onClick={loadAnalyses} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No analyses match your search' : 'No analyses yet'}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-3">
                {filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => handleSelectAnalysis(analysis.id)}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group relative"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                          {analysis.name || 'Untitled Analysis'}
                        </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(analysis.started_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {getStatusIcon(analysis.status)}

                        {/* Delete Button - Shows on hover */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{analysis.name || 'Untitled Analysis'}&quot;.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => handleDeleteAnalysis(analysis.id, e)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-2">
                      {getStatusBadge(analysis.status)}
                    </div>

                    {/* Metadata */}
                    {analysis.status === 'completed' && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {analysis.insights_generated !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">
                              {analysis.insights_generated}
                            </span>
                            <span>insights</span>
                          </div>
                        )}
                        {analysis.recommendations_generated !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">
                              {analysis.recommendations_generated}
                            </span>
                            <span>actions</span>
                          </div>
                        )}
                        {analysis.dataset_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            <span className="font-medium text-foreground">
                              {analysis.dataset_count}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Completed timestamp */}
                    {analysis.status === 'completed' && analysis.completed_at && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Completed {formatDate(analysis.completed_at)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredAnalyses.length} of {analyses.length} analyses
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAnalyses}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
