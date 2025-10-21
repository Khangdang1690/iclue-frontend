"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  History,
  Database,
  Clock,
  Download,
  Share2,
  Trash2,
  XCircle,
  CheckCircle2,
  Loader2
} from "lucide-react"
import type { Dataset } from "@/lib/api/types"
import type { AnalysisProgress } from "@/hooks/useAnalysisStream"
import { analysisService, type AnalysisSession } from "@/lib/api"

interface ContextualSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  currentView: 'empty' | 'new-analysis' | 'running' | 'viewing'
  selectedAnalysisId: string | null
  progress: AnalysisProgress | null
  datasets: Dataset[]
  selectedDatasetIds: string[]
  onNewAnalysis: () => void
  onViewAllRuns: () => void
  onCancelAnalysis: () => void
  userId: string
}

export function ContextualSidebar({
  collapsed,
  onToggleCollapse,
  currentView,
  selectedAnalysisId,
  progress,
  datasets,
  selectedDatasetIds,
  onNewAnalysis,
  onViewAllRuns,
  onCancelAnalysis,
  userId
}: ContextualSidebarProps) {
  const [recentAnalyses, setRecentAnalyses] = React.useState<AnalysisSession[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = React.useState(false)

  // Load recent analyses for empty state
  React.useEffect(() => {
    if (currentView === 'empty') {
      const loadRecent = async () => {
        setIsLoadingRecent(true)
        try {
          const response = await analysisService.listAnalyses(userId, 5, 0)
          setRecentAnalyses(response.analyses || [])
        } catch (err) {
          console.error("Failed to load recent analyses:", err)
        } finally {
          setIsLoadingRecent(false)
        }
      }
      loadRecent()
    }
  }, [currentView, userId])

  // Render sidebar content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'empty':
        return (
          <>
            <div className="space-y-4">
              <Button
                onClick={onNewAnalysis}
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Analyses
                </h3>

                {isLoadingRecent ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentAnalyses.length > 0 ? (
                  <div className="space-y-2">
                    {recentAnalyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          // This will be handled by parent
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium line-clamp-1">
                            {analysis.name}
                          </span>
                          {analysis.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          {analysis.status === 'running' && (
                            <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {analysis.insights_generated || 0} insights
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {analysis.completed_at
                            ? new Date(analysis.completed_at).toLocaleDateString()
                            : 'Running...'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No recent analyses
                  </p>
                )}
              </div>
            </div>
          </>
        )

      case 'new-analysis':
        return (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Configuration</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Datasets Selected</span>
                    <Badge variant="secondary">{selectedDatasetIds.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Datasets</span>
                    <Badge variant="outline">{datasets.length}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-2">Selected Datasets</h3>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-1">
                    {selectedDatasetIds.map((id) => {
                      const dataset = datasets.find(d => d.id === id)
                      if (!dataset) return null
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50"
                        >
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="line-clamp-1">{dataset.table_name}</span>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        )

      case 'running':
        return (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Analysis Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <Badge variant="default" className="bg-blue-600">
                      Step {progress?.current_step || 0} of {progress?.total_steps || 8}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1 text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Running</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-2">Datasets Analyzed</h3>
                <div className="space-y-1">
                  {selectedDatasetIds.slice(0, 3).map((id) => {
                    const dataset = datasets.find(d => d.id === id)
                    if (!dataset) return null
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50"
                      >
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <span className="line-clamp-1">{dataset.table_name}</span>
                      </div>
                    )
                  })}
                  {selectedDatasetIds.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{selectedDatasetIds.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={onCancelAnalysis}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Analysis
              </Button>
            </div>
          </>
        )

      case 'viewing':
        return (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Analysis Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    {progress?.status === 'completed' ? (
                      <Badge variant="default" className="bg-green-600">Completed</Badge>
                    ) : progress?.status === 'failed' ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </div>
                  {progress?.insights_count !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Insights</span>
                      <Badge variant="outline">{progress.insights_count}</Badge>
                    </div>
                  )}
                  {progress?.recommendations_count !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Recommendations</span>
                      <Badge variant="outline">{progress.recommendations_count}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {progress?.status === 'completed' && (
                <>
                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          const url = analysisService.getDownloadUrl(selectedAnalysisId!)
                          window.open(url, '_blank')
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        disabled
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share (Coming Soon)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        disabled
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`flex-shrink-0 border-l border-border bg-muted/30 transition-all duration-300 ease-in-out relative ${
        collapsed ? 'w-0' : 'w-80'
      }`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-4 -left-4 z-10 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-muted transition-transform ${
          collapsed ? 'rotate-180' : ''
        }`}
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar Content */}
      {!collapsed && (
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 p-6">
            {renderContent()}
          </ScrollArea>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-border p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onViewAllRuns}
            >
              <History className="mr-2 h-4 w-4" />
              View All Runs
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
