"use client"

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2, AlertCircle, FileText } from "lucide-react"
import { analysisService } from '@/lib/api/analysis'
import { useUser } from '@clerk/nextjs'

interface ReportViewerProps {
  analysisId: string
  title?: string
  description?: string
}

export function ReportViewer({ analysisId, title, description }: ReportViewerProps) {
  const { user } = useUser()
  const [markdown, setMarkdown] = React.useState<string>('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchReport = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)
        const reportContent = await analysisService.getReport(user.id, analysisId)
        setMarkdown(reportContent)
      } catch (err) {
        console.error('Error fetching report:', err)
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [analysisId, user?.id])

  const handleDownload = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const downloadUrl = `${apiBase}/api/analyses/${analysisId}/download`
    window.open(downloadUrl, '_blank')
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title || 'Business Analysis Report'}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
          <Button
            onClick={handleDownload}
            disabled={loading || !!error}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading report...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="m-6">
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && markdown && (
          <div className="bg-white dark:bg-slate-950">
            <article className="professional-report max-w-5xl mx-auto px-8 py-10">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: (props) => <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6 mt-8 pb-3 border-b-2 border-primary/20" {...props} />,
                  h2: (props) => <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 mt-8 pb-2 border-b border-slate-200 dark:border-slate-800" {...props} />,
                  h3: (props) => <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3 mt-6" {...props} />,
                  h4: (props) => <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 mt-4" {...props} />,
                  p: (props) => <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4" {...props} />,
                  ul: (props) => <ul className="space-y-2 mb-4 ml-6 list-disc marker:text-primary" {...props} />,
                  ol: (props) => <ol className="space-y-2 mb-4 ml-6 list-decimal marker:text-primary" {...props} />,
                  li: (props) => <li className="text-slate-600 dark:text-slate-400 leading-relaxed" {...props} />,
                  blockquote: (props) => <blockquote className="border-l-4 border-primary/40 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-900 rounded-r-lg" {...props} />,
                  table: (props) => (
                    <div className="my-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  ),
                  thead: (props) => <thead className="bg-slate-100 dark:bg-slate-900" {...props} />,
                  tbody: (props) => <tbody className="divide-y divide-slate-200 dark:divide-slate-800" {...props} />,
                  tr: (props) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors" {...props} />,
                  th: (props) => <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300" {...props} />,
                  td: (props) => <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400" {...props} />,
                  strong: (props) => <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props} />,
                  em: (props) => <em className="italic text-slate-700 dark:text-slate-300" {...props} />,
                  code: ({ inline, ...props }: { inline?: boolean; children?: React.ReactNode; className?: string }) =>
                    inline
                      ? <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-primary rounded text-sm font-mono" {...props} />
                      : <code className="block px-4 py-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-sm font-mono overflow-x-auto my-4" {...props} />,
                  a: (props) => <a className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors" {...props} />,
                  hr: (props) => <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </CardContent>
    </Card>
  )
}