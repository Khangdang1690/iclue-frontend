"use client"

import React from 'react'
import { useAnalysisStreamMessages } from '@/hooks/useAnalysisStreamMessages'
import { CheckCircle2, AlertCircle, Sparkles, Lightbulb, TrendingUp, Brain } from 'lucide-react'

interface AnalysisStreamProps {
  analysisId: string
  onComplete?: () => void
}

export function AnalysisStream({ analysisId, onComplete }: AnalysisStreamProps) {
  const { messages, isStreaming, error } = useAnalysisStreamMessages({
    analysisId,
    enabled: !!analysisId
  })
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const hasCalledComplete = React.useRef(false)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Call onComplete when streaming finishes and we have messages
  React.useEffect(() => {
    console.log('[ANALYSIS-STREAM] Effect - isStreaming:', isStreaming, 'messages:', messages.length, 'hasCalledComplete:', hasCalledComplete.current)
    console.log('[ANALYSIS-STREAM] onComplete prop:', typeof onComplete, onComplete ? 'defined' : 'UNDEFINED')

    if (!isStreaming && messages.length > 0 && !hasCalledComplete.current) {
      const lastMessage = messages[messages.length - 1]
      console.log('[ANALYSIS-STREAM] Last message type:', lastMessage?.type)

      if (lastMessage?.type === 'complete') {
        console.log('[ANALYSIS-STREAM] ✅ Completion detected! Calling onComplete...')
        hasCalledComplete.current = true

        if (onComplete) {
          console.log('[ANALYSIS-STREAM] 🔥 EXECUTING onComplete callback NOW')
          try {
            onComplete()
            console.log('[ANALYSIS-STREAM] ✓ onComplete executed successfully')
          } catch (error) {
            console.error('[ANALYSIS-STREAM] ❌ Error executing onComplete:', error)
          }
        } else {
          console.error('[ANALYSIS-STREAM] ❌ onComplete is undefined/null!')
        }
      }
    }
  }, [isStreaming, messages, onComplete])

  // Get icon for message type
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'thinking':
        return <Brain className="h-4 w-4 text-purple-500" />
      case 'insight':
        return <Lightbulb className="h-4 w-4 text-amber-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'recommendation':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'narrative':
        return <Sparkles className="h-4 w-4 text-blue-500" />
      default:
        return <Sparkles className="h-4 w-4 text-slate-500" />
    }
  }

  // Get colors for message type
  const getMessageColors = (type: string) => {
    switch (type) {
      case 'thinking':
        return 'bg-purple-50 border-purple-200 text-purple-900'
      case 'narrative':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'insight':
        return 'bg-amber-50 border-amber-200 text-amber-900'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'recommendation':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'complete':
        return 'bg-green-50 border-green-300 text-green-900 font-medium'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

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
            {isStreaming ? (
              <Sparkles className="h-5 w-5 text-blue-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <h3 className="font-semibold text-slate-900">
              {isStreaming ? 'Analyzing Your Data' : 'Analysis Complete'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {messages.length} {messages.length === 1 ? 'update' : 'updates'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 max-h-[500px] overflow-y-auto space-y-2">
        {messages.length === 0 && isStreaming && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-slate-500">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Initializing analysis...</span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${getMessageColors(msg.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getMessageIcon(msg.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      {!isStreaming && messages.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 bg-green-50">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>Analysis completed successfully! Redirecting to results...</span>
          </div>
        </div>
      )}
    </div>
  )
}
