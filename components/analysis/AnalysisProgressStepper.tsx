"use client"

import React from 'react'
import {  CheckCircle2, Circle, AlertCircle, Brain, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { AnalysisProgress } from '@/hooks/useAnalysisStream'

// Animated thinking dots component
function ThinkingDots() {
  return (
    <div className="flex gap-1">
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
    </div>
  )
}

interface AnalysisProgressStepperProps {
  progress: AnalysisProgress
}

export function AnalysisProgressStepper({ progress }: AnalysisProgressStepperProps) {
  // Track render count to verify component is actually re-rendering
  const renderCount = React.useRef(0);
  renderCount.current += 1;

  // Track last render time
  const [lastRenderTime, setLastRenderTime] = React.useState(Date.now());
  React.useEffect(() => {
    setLastRenderTime(Date.now());
  }, [progress]);

  // DEBUG: Log when component renders
  React.useEffect(() => {
    console.log('[STEPPER] Component rendered with progress:', {
      analysis_id: progress.analysis_id,
      status: progress.status,
      current_step: progress.current_step,
      total_steps: progress.total_steps,
      steps_count: progress.steps ? Object.keys(progress.steps).length : 0
    });

    if (progress.steps) {
      const stepStatuses: Record<string, string> = {};
      Object.entries(progress.steps).forEach(([name, step]) => {
        stepStatuses[name] = step.status;
      });
      console.log('[STEPPER] Step statuses (JSON):', JSON.stringify(stepStatuses, null, 2));

      // Also log each step individually for clarity
      Object.entries(progress.steps).forEach(([name, step]) => {
        console.log(`[STEPPER]   ${name}: ${step.status} (order: ${step.order})`);
      });
    }
  }, [progress]);

  const steps = progress.steps ? Object.values(progress.steps).sort((a, b) => a.order - b.order) : []

  // Calculate overall progress percentage
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const overallProgress = (completedSteps / steps.length) * 100

  // Format time estimate
  const getTimeRemaining = () => {
    if (progress.status === 'completed') return 'Completed'
    if (progress.status === 'failed') return 'Failed'

    const remainingSteps = steps.length - completedSteps
    const estimatedMinutes = Math.max(1, Math.ceil(remainingSteps * 0.5)) // Rough estimate: 30s per step

    if (estimatedMinutes === 1) return 'About 1 minute remaining'
    return `About ${estimatedMinutes} minutes remaining`
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Business Analysis in Progress</span>
          <div className="flex items-center gap-4">
            {/* DEBUG: Visible render counter */}
            <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Render #{renderCount.current} | Step {progress.current_step}/{progress.total_steps} | {new Date(lastRenderTime).toLocaleTimeString()}
            </span>
            {progress.status === 'failed' && (
              <span className="text-sm font-normal text-destructive">Analysis Failed</span>
            )}
            {progress.status === 'completed' && (
              <span className="text-sm font-normal text-green-600">Analysis Completed</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {progress.current_step} of {progress.total_steps}
            </span>
            <span className="text-muted-foreground font-medium">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {getTimeRemaining()}
          </p>
        </div>

        {/* DEBUG: Step statuses table */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs font-mono">
          <div className="font-bold mb-2 text-yellow-800">DEBUG: Step Statuses (Live)</div>
          <div className="grid grid-cols-4 gap-2">
            {steps.map(step => (
              <div key={step.name} className={`p-1 rounded ${
                step.status === 'completed' ? 'bg-green-100 text-green-800' :
                step.status === 'running' ? 'bg-blue-100 text-blue-800 font-bold' :
                step.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {step.name}: <strong>{step.status}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.name}
              className={`flex gap-4 ${
                step.status === 'running' ? 'bg-primary/5 p-4 rounded-lg -mx-4 px-4' : ''
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'completed' && (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                )}
                {step.status === 'running' && (
                  <div className="relative">
                    <Brain className="h-6 w-6 text-primary animate-pulse" />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-3 w-3 text-primary animate-ping" />
                    </div>
                  </div>
                )}
                {step.status === 'failed' && (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                )}
                {step.status === 'pending' && (
                  <Circle className="h-6 w-6 text-muted-foreground/30" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      step.status === 'running' ? 'text-primary' :
                      step.status === 'completed' ? 'text-foreground' :
                      step.status === 'failed' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {index + 1}. {step.display_name}
                    </h4>
                    {step.status === 'running' && (
                      <ThinkingDots />
                    )}
                    {/* DEBUG: Show status directly */}
                    <span className="text-xs bg-black/10 px-1 rounded">
                      [{step.status}]
                    </span>
                  </div>
                  {step.status !== 'running' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      step.status === 'completed' ? 'bg-green-100 text-green-700' :
                      step.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {step.status}
                    </span>
                  )}
                </div>

                {/* Step Details */}
                {step.details?.message && (
                  <div className={`text-sm text-muted-foreground mb-1 ${
                    step.status === 'running' ? 'animate-pulse' : ''
                  }`}>
                    <span className="inline-flex items-center gap-2">
                      {step.status === 'running' && (
                        <span className="text-xs text-primary">▸</span>
                      )}
                      {step.details.message}
                    </span>
                  </div>
                )}

                {/* Sub-progress for explore_dynamically step */}
                {step.status === 'running' && step.details?.progress_percent !== undefined && (
                  <div className="mt-2">
                    <Progress value={step.details.progress_percent} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.details.progress_percent}% complete
                    </p>
                  </div>
                )}

                {/* Additional Details */}
                {step.status === 'completed' && step.details && (
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {step.details.datasets_count !== undefined && (
                      <div>Loaded {step.details.datasets_count} dataset(s)</div>
                    )}
                    {step.details.total_rows !== undefined && (
                      <div>{step.details.total_rows.toLocaleString()} total rows</div>
                    )}
                    {step.details.questions_count !== undefined && (
                      <div>Generated {step.details.questions_count} exploration questions</div>
                    )}
                    {step.details.analyses_count !== undefined && (
                      <div>Completed {step.details.analyses_count} analyses</div>
                    )}
                    {step.details.insights_count !== undefined && (
                      <div>Discovered {step.details.insights_count} insights</div>
                    )}
                    {step.details.anomalies_count !== undefined && (
                      <div>Detected {step.details.anomalies_count} anomalies</div>
                    )}
                    {step.details.forecasts_count !== undefined && (
                      <div>Generated {step.details.forecasts_count} forecasts</div>
                    )}
                    {step.details.narratives_count !== undefined && (
                      <div>Created {step.details.narratives_count} narratives</div>
                    )}
                    {step.details.recommendations_count !== undefined && (
                      <div>Created {step.details.recommendations_count} recommendations</div>
                    )}
                  </div>
                )}

                {/* Timing Info */}
                {(step.started_at || step.completed_at) && (
                  <div className="text-xs text-muted-foreground/60 mt-1">
                    {step.completed_at && step.started_at && (
                      <span>
                        Completed in {Math.round((new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000)}s
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {progress.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-destructive">Error</h5>
                <p className="text-sm text-destructive/80 mt-1">{progress.error}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
