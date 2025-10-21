"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Lightbulb,
  BarChart3,
  Loader2,
  Database,
  History,
  Plus
} from "lucide-react"
import { analysisService, etlService } from "@/lib/api"
import type { Dataset } from "@/lib/api/types"
import { AnalysisHistory } from "@/components/analysis/AnalysisHistory"
import { DashboardViewer } from "@/components/analysis/DashboardViewer"
import { ReportViewer } from "@/components/analysis/ReportViewer"
import { AnalysisStream } from "@/components/analysis/AnalysisStream"

interface InsightPanelClientProps {
  userId: string
}

export function InsightPanelClient({ userId }: InsightPanelClientProps) {
  const [activeTab, setActiveTab] = React.useState<"new" | "history" | "view">("new")
  const [selectedAnalysisId, setSelectedAnalysisId] = React.useState<string | null>(null)

  // New analysis state
  const [isRunning, setIsRunning] = React.useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [datasets, setDatasets] = React.useState<Dataset[]>([])
  const [selectedDatasetIds, setSelectedDatasetIds] = React.useState<string[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = React.useState(true)

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
      } finally {
        setIsLoadingDatasets(false)
      }
    }
    loadDatasets()
  }, [userId])

  // Store currentAnalysisId in a ref so we always have the latest value
  const currentAnalysisIdRef = React.useRef(currentAnalysisId)
  React.useEffect(() => {
    currentAnalysisIdRef.current = currentAnalysisId
  }, [currentAnalysisId])

  // Analysis completion handler - stable reference, reads from ref
  const handleAnalysisComplete = React.useCallback(() => {
    console.log('[INSIGHT-PANEL] ✅ Analysis complete callback triggered!')
    const analysisId = currentAnalysisIdRef.current
    console.log('[INSIGHT-PANEL] currentAnalysisId from ref:', analysisId)

    if (!analysisId) {
      console.error('[INSIGHT-PANEL] ❌ Cannot redirect - analysisId is null')
      return
    }

    console.log('[INSIGHT-PANEL] Setting selectedAnalysisId to:', analysisId)
    setSelectedAnalysisId(analysisId)

    // Auto-redirect to results after a brief delay
    console.log('[INSIGHT-PANEL] Starting 2s redirect timer...')
    setTimeout(() => {
      console.log('[INSIGHT-PANEL] Timer complete - switching to view tab')
      setIsRunning(false)
      setActiveTab('view')
    }, 2000)
  }, []) // No dependencies - stable reference

  const handleToggleDataset = (datasetId: string) => {
    setSelectedDatasetIds(prev =>
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    )
  }

  const handleSelectAll = () => {
    setSelectedDatasetIds(datasets.map(d => d.id))
  }

  const handleDeselectAll = () => {
    setSelectedDatasetIds([])
  }

  const handleRunAnalysis = async () => {
    if (selectedDatasetIds.length === 0) {
      setError("Please select at least one dataset to analyze")
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      const response = await analysisService.runBusinessDiscovery(
        userId,
        selectedDatasetIds
      )

      if (!response.success) {
        setError(response.error || "Analysis failed")
        setIsRunning(false)
        return
      }

      // Start streaming the analysis
      if (response.analysis_id) {
        setCurrentAnalysisId(response.analysis_id)
        // Don't set isRunning to false - let the streaming component handle completion
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run analysis")
      setIsRunning(false)
    }
  }

  const handleSelectAnalysis = (analysisId: string) => {
    setSelectedAnalysisId(analysisId)
    setActiveTab("view")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Insight Panel</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover insights, patterns, and recommendations from your data
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'history' | 'view')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Analysis
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2" disabled={!selectedAnalysisId}>
            <Lightbulb className="h-4 w-4" />
            View Results
          </TabsTrigger>
        </TabsList>

        {/* New Analysis Tab */}
        <TabsContent value="new" className="mt-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-full mb-6">
                <Lightbulb className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">
                Discover Business Insights
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
                Run our AI-powered business discovery workflow to uncover insights, patterns,
                and actionable recommendations from your data.
              </p>
            </div>

            {/* Dataset Selection */}
            <div className="bg-white border border-border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground">Select Datasets to Analyze</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={isLoadingDatasets}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={isLoadingDatasets}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              {isLoadingDatasets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : datasets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No datasets available. Please upload data first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={dataset.id}
                        checked={selectedDatasetIds.includes(dataset.id)}
                        onCheckedChange={() => handleToggleDataset(dataset.id)}
                      />
                      <label
                        htmlFor={dataset.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {dataset.table_name}
                          </span>
                          {dataset.domain && (
                            <Badge variant="outline" className="text-xs">
                              {dataset.domain}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground ml-6 mt-0.5">
                          {dataset.row_count?.toLocaleString() || 0} rows • {dataset.column_count || 0} columns
                        </p>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {selectedDatasetIds.length} of {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Real-time streaming UI */}
            {isRunning && currentAnalysisId && (
              <div className="mb-6">
                <AnalysisStream
                  analysisId={currentAnalysisId}
                  onComplete={handleAnalysisComplete}
                />
              </div>
            )}

            {isRunning && !currentAnalysisId && (
              <div className="flex items-center justify-center py-12 mb-6">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-lg text-muted-foreground">
                    Starting analysis...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Preparing workflow
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleRunAnalysis}
                disabled={isRunning || selectedDatasetIds.length === 0}
                className="shadow-lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Run Business Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <AnalysisHistory onSelectAnalysis={handleSelectAnalysis} />
        </TabsContent>

        {/* View Results Tab */}
        <TabsContent value="view" className="mt-6">
          {selectedAnalysisId ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </div>

              {/* Dashboard and Report Tabs */}
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="report">Report</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-4">
                  <DashboardViewer analysisId={selectedAnalysisId} />
                </TabsContent>

                <TabsContent value="report" className="mt-4">
                  <ReportViewer analysisId={selectedAnalysisId} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Select an analysis from history to view results
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
