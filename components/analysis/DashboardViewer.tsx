"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface DashboardViewerProps {
  analysisId: string
  title?: string
  description?: string
}

export function DashboardViewer({ analysisId, title, description }: DashboardViewerProps) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const dashboardUrl = `http://localhost:8000/api/analyses/${analysisId}/dashboard`

  const handleIframeLoad = () => {
    setLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setLoading(false)
    setError('Failed to load dashboard')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title || 'Interactive Dashboard'}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ minHeight: '600px' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 text-destructive">
              <p>{error}</p>
            </div>
          )}
          <iframe
            src={dashboardUrl}
            className="w-full border-0 rounded-md"
            style={{ height: '600px' }}
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Analysis Dashboard"
          />
        </div>
      </CardContent>
    </Card>
  )
}
