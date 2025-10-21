"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
import { AlertCircle, FileText, BarChart3, CheckCircle2, Brain, Sparkles, Download, Trash2 } from "lucide-react"
import { AnalysisStream } from "./AnalysisStream"
import { DashboardViewer } from "./DashboardViewer"
import { ReportViewer } from "./ReportViewer"
import { analysisService } from "@/lib/api"

// Animated thinking dots component
function ThinkingDots() {
  return (
    <div className="flex gap-1.5 justify-center">
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
    </div>
  )
}

interface AnalysisViewProps {
  analysisId: string | null
  status: 'running' | 'completed' | 'failed'
  error?: string | null
  onDelete?: () => void
  onComplete?: () => void
  userId?: string
}

export function AnalysisView({
  analysisId,
  status,
  error,
  onDelete,
  onComplete,
  userId
}: AnalysisViewProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDownload = () => {
    if (!analysisId) return
    const url = analysisService.getDownloadUrl(analysisId)
    window.open(url, '_blank')
  }

  const handleDelete = async () => {
    if (!analysisId || !userId) return

    setIsDeleting(true)
    try {
      await analysisService.deleteAnalysis(userId, analysisId)
      onDelete?.()
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }
  // Running state - show Claude-style streaming
  if (status === 'running') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 py-12">
        <div className="w-full max-w-4xl">
          {analysisId ? (
            <AnalysisStream
              analysisId={analysisId}
              onComplete={onComplete}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-6">
                <Brain className="h-10 w-10 text-primary animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-primary animate-ping" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                Initializing AI Analysis
                <ThinkingDots />
              </h2>
              <p className="text-muted-foreground max-w-md">
                Preparing your data for deep analysis and insight generation
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Failed state - show error
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 py-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Analysis Failed
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || "An unexpected error occurred during analysis."}
          </p>
          <p className="text-xs text-muted-foreground">
            Please try running the analysis again or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }

  // Completed state - show dashboard and report
  if (status === 'completed' && analysisId) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Analysis Complete
                </h2>
                <p className="text-sm text-muted-foreground">
                  View your insights and recommendations below
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this analysis, including the dashboard and report.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Results Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="dashboard" className="h-full flex flex-col">
            <div className="flex-shrink-0 px-8 pt-4 pb-4 border-b border-border">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="report" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Report
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="flex-1 h-full m-0 p-0">
              <DashboardViewer analysisId={analysisId} />
            </TabsContent>

            <TabsContent value="report" className="flex-1 overflow-auto px-8 py-6 m-0">
              <ReportViewer analysisId={analysisId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Fallback state
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">No analysis selected</p>
    </div>
  )
}
