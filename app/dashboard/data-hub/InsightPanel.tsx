"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  FileText,
  ExternalLink,
  Loader2
} from "lucide-react"
import { analysisService } from "@/lib/api"
import type { Insight, Recommendation, AnalyticsResult } from "@/lib/api/analysis"

interface InsightPanelProps {
  userId: string
}

export function InsightPanel({ userId }: InsightPanelProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [insights, setInsights] = React.useState<Insight[]>([])
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([])
  const [analyticsResults, setAnalyticsResults] = React.useState<AnalyticsResult[]>([])
  const [dashboardUrl, setDashboardUrl] = React.useState<string | null>(null)
  const [executiveSummary, setExecutiveSummary] = React.useState<string>("")
  const [error, setError] = React.useState<string | null>(null)

  const handleRunAnalysis = async () => {
    setIsRunning(true)
    setError(null)

    try {
      const response = await analysisService.runBusinessDiscovery(userId)

      if (!response.success) {
        setError(response.error || "Analysis failed")
        return
      }

      // Use synthesized_insights as primary insights (these are LLM-generated narratives)
      setInsights(response.synthesized_insights || response.insights || [])
      setRecommendations(response.recommendations || [])
      setExecutiveSummary(response.executive_summary || "")
      setDashboardUrl(response.dashboard_url || null)

      // Transform analytics_results into display format
      const analyticsDisplay: AnalyticsResult[] = []

      if (response.analytics_results?.anomalies) {
        analyticsDisplay.push({
          type: "anomaly",
          title: "Anomaly Detection",
          description: `Found ${response.analytics_results.anomalies.length} unusual patterns in your data`,
          data: response.analytics_results.anomalies
        })
      }

      if (response.analytics_results?.forecasts) {
        analyticsDisplay.push({
          type: "forecast",
          title: "Time Series Forecasts",
          description: `Generated ${response.analytics_results.forecasts.length} 7-day forecasts`,
          data: response.analytics_results.forecasts
        })
      }

      if (response.analytics_results?.causal_relationships) {
        analyticsDisplay.push({
          type: "causal",
          title: "Causal Relationships",
          description: `Identified ${response.analytics_results.causal_relationships.length} cause-effect relationships`,
          data: response.analytics_results.causal_relationships
        })
      }

      if (response.analytics_results?.variance_decomposition) {
        analyticsDisplay.push({
          type: "variance",
          title: "Variance Analysis",
          description: `Analyzed what drives variance in your metrics`,
          data: response.analytics_results.variance_decomposition
        })
      }

      setAnalyticsResults(analyticsDisplay)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run analysis")
    } finally {
      setIsRunning(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (insights.length === 0 && !isRunning && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
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
        <Button
          size="lg"
          onClick={handleRunAnalysis}
          disabled={isRunning}
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
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Business Insights</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated insights and recommendations from your data
          </p>
        </div>
        <Button
          onClick={handleRunAnalysis}
          disabled={isRunning}
          variant="outline"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              Run New Analysis
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isRunning && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground">
              Analyzing your data...
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a few minutes
            </p>
          </div>
        </div>
      )}

      {!isRunning && insights.length > 0 && (
        <>
          {/* Executive Summary */}
          {executiveSummary && (
            <section className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Executive Summary
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {executiveSummary}
              </p>
            </section>
          )}

          {/* Dashboard Link */}
          {dashboardUrl && (
            <section>
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Interactive Dashboard
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      View detailed visualizations and charts
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </section>
          )}

          {/* Key Insights */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-primary" />
              Key Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-5 bg-white border border-border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base font-semibold text-foreground flex-1">
                      {insight.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getPriorityColor(insight.priority)}
                      >
                        {insight.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                        Impact: {insight.impact}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {insight.narrative}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Category: {insight.category}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Impact: {rec.impact}</span>
                          <span>•</span>
                          <span>Effort: {rec.effort}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Analytics Results */}
          {analyticsResults.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Advanced Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-muted/30 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.type === "anomaly" && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                      {result.type === "forecast" && <TrendingUp className="h-4 w-4 text-blue-600" />}
                      {result.type === "causal" && <Target className="h-4 w-4 text-purple-600" />}
                      {result.type === "variance" && <BarChart3 className="h-4 w-4 text-green-600" />}
                      <h4 className="text-sm font-semibold text-foreground">
                        {result.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
