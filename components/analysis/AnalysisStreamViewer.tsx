"use client"

import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Sparkles, Brain, TrendingUp, Lightbulb, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamMessage {
  type: 'thinking' | 'insight' | 'recommendation' | 'narrative' | 'complete'
  content: string
  step?: string
  timestamp?: string
}

interface AnalysisStreamViewerProps {
  messages: StreamMessage[]
  isStreaming: boolean
}

export function AnalysisStreamViewer({ messages, isStreaming }: AnalysisStreamViewerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="relative">
            <Brain className={cn(
              "h-6 w-6 text-primary",
              isStreaming && "animate-pulse"
            )} />
            {isStreaming && (
              <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-ping" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Business Analysis</h2>
            <p className="text-sm text-muted-foreground">
              {isStreaming ? 'Analyzing your data...' : 'Analysis complete'}
            </p>
          </div>
        </div>

        {/* Streaming messages */}
        <div
          ref={containerRef}
          className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Starting analysis...</p>
            </div>
          )}

          {messages.map((message, index) => (
            <StreamMessageItem
              key={index}
              message={message}
              isLast={index === messages.length - 1}
              isStreaming={isStreaming}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        {isStreaming && (
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Card>
  )
}

interface StreamMessageItemProps {
  message: StreamMessage
  isLast: boolean
  isStreaming: boolean
}

function StreamMessageItem({ message, isLast, isStreaming }: StreamMessageItemProps) {
  const showCursor = isLast && isStreaming

  const getIcon = () => {
    switch (message.type) {
      case 'thinking':
        return <Brain className="h-5 w-5 text-slate-500" />
      case 'insight':
        return <Lightbulb className="h-5 w-5 text-amber-500" />
      case 'recommendation':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'narrative':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'complete':
        return <Sparkles className="h-5 w-5 text-primary" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getTypeLabel = () => {
    switch (message.type) {
      case 'thinking':
        return 'Thinking'
      case 'insight':
        return 'Insight'
      case 'recommendation':
        return 'Recommendation'
      case 'narrative':
        return 'Analysis'
      case 'complete':
        return 'Complete'
      default:
        return ''
    }
  }

  const getBgColor = () => {
    switch (message.type) {
      case 'thinking':
        return 'bg-slate-50 dark:bg-slate-800/50'
      case 'insight':
        return 'bg-amber-50 dark:bg-amber-900/20'
      case 'recommendation':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'narrative':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'complete':
        return 'bg-primary/5'
      default:
        return 'bg-white'
    }
  }

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-300",
      getBgColor(),
      isLast && isStreaming && "ring-2 ring-primary/20"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">
              {getTypeLabel()}
            </span>
            {message.step && (
              <span className="text-xs text-muted-foreground">
                • {message.step}
              </span>
            )}
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {message.content}
              {showCursor && (
                <span className="inline-block w-0.5 h-4 ml-1 bg-primary animate-pulse" />
              )}
            </p>
          </div>
          {message.timestamp && (
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
