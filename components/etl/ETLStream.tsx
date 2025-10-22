"use client"

import React from 'react'
import { useETLStream } from '@/hooks/useETLStream'
import { CheckCircle2, AlertCircle, Upload, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ETLStreamProps {
  jobId: string
  userId: string
  onComplete?: () => void
}

export function ETLStream({ jobId, userId, onComplete }: ETLStreamProps) {
  const { state, isConnected, error } = useETLStream({
    jobId,
    userId,
    enabled: !!jobId && !!userId,
  })

  console.log('[ETL-STREAM-COMPONENT] Render - jobId:', jobId, 'state:', state.status)

  // Call onComplete when status changes to completed
  React.useEffect(() => {
    if (state.status === 'completed' && onComplete) {
      console.log('[ETL-STREAM-COMPONENT] Processing complete, calling onComplete')
      onComplete()
    }
  }, [state.status, onComplete])

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state.status === 'running' ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : state.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Upload className="h-5 w-5 text-slate-500" />
            )}
            <h3 className="font-semibold text-slate-900">
              {state.status === 'running'
                ? 'Processing Files'
                : state.status === 'completed'
                ? 'Processing Complete'
                : 'Initializing...'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 space-y-4">
        {state.status === 'running' && (
          <>
            <Progress value={state.progress} className="w-full" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">{state.step}</p>
              <p className="text-sm text-slate-600">{state.message}</p>
            </div>
          </>
        )}

        {state.status === 'completed' && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600">
              Your files have been processed successfully!
            </p>
          </div>
        )}

        {state.status === 'error' && state.error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{state.error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {state.status === 'completed' && (
        <div className="border-t border-slate-200 px-4 py-3 bg-green-50">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>Processing completed successfully! Redirecting...</span>
          </div>
        </div>
      )}
    </div>
  )
}
