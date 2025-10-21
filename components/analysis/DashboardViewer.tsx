"use client"

import React from 'react'
import { Loader2 } from "lucide-react"

interface DashboardViewerProps {
  analysisId: string
}

export function DashboardViewer({ analysisId }: DashboardViewerProps) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const dashboardUrl = `${apiBase}/api/analyses/${analysisId}/dashboard`

  const handleIframeLoad = () => {
    setLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setLoading(false)
    setError('Failed to load dashboard')
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
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
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Analysis Dashboard"
      />
    </div>
  )
}