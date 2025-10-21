"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Trash2, Eye, Calendar, Database } from "lucide-react"
import { analysisService, AnalysisSession } from '@/lib/api/analysis'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'

interface AnalysisHistoryProps {
  onSelectAnalysis?: (analysisId: string) => void
}

export function AnalysisHistory({ onSelectAnalysis }: AnalysisHistoryProps) {
  const { user } = useUser()
  const [analyses, setAnalyses] = React.useState<AnalysisSession[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const fetchAnalyses = React.useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const response = await analysisService.listAnalyses(user.id)
      setAnalyses(response.analyses)
    } catch (err) {
      console.error('Error fetching analyses:', err)
      setError('Failed to load analyses')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  React.useEffect(() => {
    fetchAnalyses()
  }, [fetchAnalyses])

  const handleDelete = async (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user?.id || !confirm('Are you sure you want to delete this analysis?')) return

    try {
      setDeletingId(analysisId)
      await analysisService.deleteAnalysis(user.id, analysisId)
      // Refresh the list
      await fetchAnalyses()
    } catch (err) {
      console.error('Error deleting analysis:', err)
      alert('Failed to delete analysis')
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (analysisId: string) => {
    if (onSelectAnalysis) {
      onSelectAnalysis(analysisId)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>Your past analyses will appear here</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <p>No analyses found. Run your first analysis to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>View and manage your past analyses ({analyses.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleView(analysis.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{analysis.name}</h3>
                  {getStatusBadge(analysis.status)}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {analysis.dataset_count} dataset{analysis.dataset_count !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {analysis.completed_at
                      ? format(new Date(analysis.completed_at), 'MMM d, yyyy')
                      : format(new Date(analysis.started_at!), 'MMM d, yyyy')}
                  </span>
                </div>

                {analysis.executive_summary && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                    {analysis.executive_summary}
                  </p>
                )}

                {analysis.error_message && (
                  <p className="text-sm text-destructive mt-2 line-clamp-1">
                    Error: {analysis.error_message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleView(analysis.id)
                  }}
                  disabled={analysis.status !== 'completed'}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(analysis.id, e)}
                  disabled={deletingId === analysis.id}
                >
                  {deletingId === analysis.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}