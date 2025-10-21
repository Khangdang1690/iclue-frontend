"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Calendar,
  FileText,
  Lightbulb,
  Target,
  Users,
  BookOpen,
  Database,
} from "lucide-react"
import type { Dataset } from "@/lib/api/types"

interface DatasetContextProps {
  isOpen: boolean
  onClose: () => void
  dataset: Dataset | null
}

const getDomainColor = (domain: string) => {
  const domainLower = domain?.toLowerCase() || ''

  if (domainLower.includes('sales')) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (domainLower.includes('finance')) return 'bg-green-100 text-green-700 border-green-200'
  if (domainLower.includes('marketing')) return 'bg-purple-100 text-purple-700 border-purple-200'
  if (domainLower.includes('product')) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (domainLower.includes('hr')) return 'bg-pink-100 text-pink-700 border-pink-200'
  if (domainLower.includes('operations')) return 'bg-cyan-100 text-cyan-700 border-cyan-200'

  return 'bg-gray-100 text-gray-700 border-gray-200'
}

export function DatasetContext({ isOpen, onClose, dataset }: DatasetContextProps) {
  if (!dataset) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b border-border">
          <SheetTitle className="text-2xl font-bold">{dataset.table_name}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {dataset.original_filename}
          </SheetDescription>

          {/* Domain Badge */}
          {dataset.domain && (
            <div className="flex gap-2 pt-2">
              <Badge className={`${getDomainColor(dataset.domain)} px-3 py-1`}>
                {dataset.domain.split('|')[0]}
              </Badge>
              {dataset.dataset_type && (
                <Badge variant="outline" className="text-xs px-3 py-1">
                  {dataset.dataset_type}
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="space-y-8 mt-8 pb-8">
          {/* Overview */}
          <section>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Overview
            </h3>
            <div className="space-y-4 pl-1">
              {dataset.description && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground leading-relaxed">
                    {dataset.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <Database className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Rows</p>
                    <p className="font-mono font-semibold text-sm">
                      {dataset.row_count?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <Database className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Columns</p>
                    <p className="font-mono font-semibold text-sm">{dataset.column_count || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {(dataset.department || dataset.time_period) && (
                <div className="space-y-3 pt-2">
                  {dataset.department && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{dataset.department}</span>
                    </div>
                  )}

                  {dataset.time_period && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Time Period:</span>
                      <span className="font-medium">{dataset.time_period}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Entities */}
          {dataset.entities && dataset.entities.length > 0 && (
            <section>
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Business Entities
              </h3>
              <div className="flex flex-wrap gap-2 pl-1">
                {dataset.entities.map((entity, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-3 py-1.5">
                    {entity}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Typical Use Cases */}
          {dataset.typical_use_cases && dataset.typical_use_cases.length > 0 && (
            <section>
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Typical Use Cases
              </h3>
              <ul className="space-y-3 pl-1">
                {dataset.typical_use_cases.map((useCase, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex items-start gap-3 pl-2"
                  >
                    <span className="text-primary mt-0.5 text-lg">•</span>
                    <span className="leading-relaxed">{useCase}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Business Context / Terms Dictionary */}
          {dataset.business_context &&
            Object.keys(dataset.business_context).length > 0 && (
              <section>
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Business Terms
                </h3>
                <div className="space-y-4 pl-1">
                  {Object.entries(dataset.business_context).map(
                    ([term, explanation], idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 rounded-lg"
                      >
                        <h4 className="text-sm font-semibold mb-2 text-foreground">{term}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {explanation}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          {/* Help Text */}
          <section className="pt-6 border-t border-border/50">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Using this dataset</p>
                <p className="text-blue-700 leading-relaxed">
                  Click on the dataset name in the list or schema view to explore the
                  actual data, or use the AI assistant to ask questions about this
                  dataset.
                </p>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
