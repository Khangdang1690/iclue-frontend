"use client"

import * as React from "react"
import { analysisService, etlService } from "@/lib/api"
import type { Dataset } from "@/lib/api/types"
import { useAnalysisStream } from "@/hooks/useAnalysisStream"
import { NewAnalysisView } from "@/components/analysis/NewAnalysisView"
import { AnalysisView } from "@/components/analysis/AnalysisView"
import { AllRunsDrawer } from "@/components/analysis/AllRunsDrawer"
import { Button } from "@/components/ui/button"
import { Lightbulb, Sparkles, History, Plus } from "lucide-react"

interface InsightPanelContextualLayoutProps {
  userId: string
}

type ViewState = 'empty' | 'new-analysis' | 'running' | 'viewing'

export function InsightPanelContextualLayout({ userId }: InsightPanelContextualLayoutProps) {
  // View state
  const [currentView, setCurrentView] = React.useState<ViewState>('empty')
  const [selectedAnalysisId, setSelectedAnalysisId] = React.useState<string | null>(null)
  const [selectedAnalysisStatus, setSelectedAnalysisStatus] = React.useState<'running' | 'completed' | 'failed' | null>(null)

  // Drawer state
  const [allRunsDrawerOpen, setAllRunsDrawerOpen] = React.useState(false)

  // Data state
  const [datasets, setDatasets] = React.useState<Dataset[]>([])
  const [selectedDatasetIds, setSelectedDatasetIds] = React.useState<string[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Streaming progress for running analysis (even if in viewing mode)
  const streamEnabled = Boolean(selectedAnalysisId && (currentView === 'running' || selectedAnalysisStatus === 'running'))
  const streamAnalysisId = streamEnabled ? selectedAnalysisId : null

  // Debug logging for stream parameters
  React.useEffect(() => {
    console.log('[PANEL] Stream params changed:', {
      currentView,
      selectedAnalysisId,
      streamEnabled,
      streamAnalysisId
    });
  }, [currentView, selectedAnalysisId, streamEnabled, streamAnalysisId]);

  const { progress } = useAnalysisStream({
    analysisId: streamAnalysisId,
    enabled: streamEnabled
  })

  // Load datasets on mount
  React.useEffect(() => {
    const loadDatasets = async () => {
      try {
        const data = await etlService.getDatasets(userId)
        setDatasets(data)
        // Select all datasets by default
        setSelectedDatasetIds(data.map(d => d.id))
      } catch (err) {
        console.error("Failed to load datasets:", err)
        setError("Failed to load datasets")
      } finally {
        setIsLoadingDatasets(false)
      }
    }
    loadDatasets()
  }, [userId])

  // Analysis completion handler
  const handleAnalysisComplete = React.useCallback(() => {
    console.log('[PANEL] ✅ Analysis complete callback triggered!')
    console.log('[PANEL] Switching to viewing mode...')
    setSelectedAnalysisStatus('completed')

    // Auto-redirect to results after a brief delay
    setTimeout(() => {
      setCurrentView('viewing')
    }, 2000) // 2 second delay to let user see completion message
  }, [])

  // Auto-navigate to viewing when analysis fails
  React.useEffect(() => {
    console.log('[PANEL] Progress status effect triggered:', {
      status: progress?.status,
      error: progress?.error,
      currentView
    });

    if (progress?.status === 'failed') {
      console.log('[PANEL] Analysis failed, switching to viewing mode');
      setError(progress.error || 'Analysis failed')
      setSelectedAnalysisStatus('failed')
      setCurrentView('viewing') // Still show the view with error state
    }
  }, [progress?.status, progress?.error, currentView])

  // Handlers
  const handleNewAnalysis = () => {
    setError(null)
    setCurrentView('new-analysis')
  }

  const handleRunAnalysis = async (analysisName?: string) => {
    if (selectedDatasetIds.length === 0) {
      setError("Please select at least one dataset to analyze")
      return
    }

    setError(null)

    try {
      const response = await analysisService.runBusinessDiscovery(
        userId,
        selectedDatasetIds,
        analysisName
      )

      if (!response.success) {
        setError(response.error || "Analysis failed")
        return
      }

      // Switch to running view and set the analysis ID
      setSelectedAnalysisId(response.analysis_id || null)
      setSelectedAnalysisStatus('running')
      setCurrentView('running')
    } catch (err) {
      console.error('Error starting analysis:', err)
      setError(err instanceof Error ? err.message : "Failed to start analysis")
    }
  }

  const handleSelectAnalysis = async (analysisId: string) => {
    setSelectedAnalysisId(analysisId)
    setError(null)
    try {
      const res = await analysisService.getAnalysis(userId, analysisId)
      const status = res.analysis.status as 'running' | 'completed' | 'failed'
      setSelectedAnalysisStatus(status)
      // If the analysis is still running, switch to running view to enable streaming
      setCurrentView(status === 'running' ? 'running' : 'viewing')
    } catch (e) {
      console.error('Failed to fetch analysis status:', e)
      // Fallback to viewing if status cannot be fetched
      setSelectedAnalysisStatus(null)
      setCurrentView('viewing')
    } finally {
      setAllRunsDrawerOpen(false)
    }
  }

  const handleDeleteAnalysis = () => {
    // Navigate back to empty state after deletion
    setSelectedAnalysisId(null)
    setCurrentView('empty')
    setError(null)
  }

  // Render main content based on current view
  const renderMainContent = () => {
    // Loading state
    if (isLoadingDatasets) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading datasets...</p>
          </div>
        </div>
      )
    }

    // Error state
    if (error && currentView !== 'viewing') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <p className="text-destructive">{error}</p>
            </div>
            <Button onClick={() => setError(null)}>Dismiss</Button>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'empty':
        return (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-full mb-6">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-semibold mb-3 text-foreground">
              Discover Business Insights
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
              Run AI-powered analysis to uncover patterns, insights,
              and actionable recommendations from your data.
            </p>
            <Button
              size="lg"
              onClick={handleNewAnalysis}
              className="shadow-lg"
            >
              <Lightbulb className="mr-2 h-5 w-5" />
              Run New Analysis
            </Button>
          </div>
        )

      case 'new-analysis':
        return (
          <NewAnalysisView
            datasets={datasets}
            selectedDatasetIds={selectedDatasetIds}
            onSelectedDatasetsChange={setSelectedDatasetIds}
            onRun={handleRunAnalysis}
            onCancel={() => setCurrentView('empty')}
          />
        )

      case 'running':
        return (
          <AnalysisView
            analysisId={selectedAnalysisId}
            status="running"
            onComplete={handleAnalysisComplete}
          />
        )

      case 'viewing': {
        const effectiveStatus = (selectedAnalysisStatus || progress?.status || 'completed') as 'running' | 'completed' | 'failed'
        return (
          <AnalysisView
            analysisId={selectedAnalysisId}
            status={effectiveStatus}
            error={error}
            userId={userId}
            onDelete={handleDeleteAnalysis}
          />
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Insight Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered business discovery and analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentView !== 'new-analysis' && currentView !== 'running' && (
              <Button
                variant="default"
                onClick={handleNewAnalysis}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setAllRunsDrawerOpen(true)}
            >
              <History className="mr-2 h-4 w-4" />
              View All Runs
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-background">
        {renderMainContent()}
      </div>

      {/* All Runs Drawer */}
      <AllRunsDrawer
        open={allRunsDrawerOpen}
        onClose={() => setAllRunsDrawerOpen(false)}
        onSelectAnalysis={handleSelectAnalysis}
        userId={userId}
      />
    </div>
  )
}
