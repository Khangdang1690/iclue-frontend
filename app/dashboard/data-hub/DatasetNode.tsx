"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { Key, Link, BarChart3, Calendar, FileText, Info } from "lucide-react"

interface Column {
  name: string
  data_type: string
  semantic_type: string
  is_primary_key: boolean
  is_foreign_key: boolean
  business_meaning: string
}

interface DatasetNodeData {
  name: string
  domain: string
  description: string
  row_count: number
  columns: Column[]
  onClick?: () => void
  onInfoClick?: () => void
}

interface DatasetNodeProps {
  data: DatasetNodeData
}

const getSemanticIcon = (column: Column) => {
  if (column.is_primary_key) {
    return <Key className="h-3 w-3 text-amber-600" />
  }
  if (column.is_foreign_key) {
    return <Link className="h-3 w-3 text-blue-600" />
  }

  switch (column.semantic_type) {
    case 'measure':
      return <BarChart3 className="h-3 w-3 text-green-600" />
    case 'date':
      return <Calendar className="h-3 w-3 text-purple-600" />
    case 'dimension':
      return <FileText className="h-3 w-3 text-gray-600" />
    default:
      return <FileText className="h-3 w-3 text-gray-600" />
  }
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

export function DatasetNode({ data }: DatasetNodeProps) {
  const maxVisibleColumns = 5
  const visibleColumns = data.columns.slice(0, maxVisibleColumns)
  const remainingCount = data.columns.length - maxVisibleColumns

  return (
    <div
      className="bg-white border-2 border-border rounded-lg shadow-lg min-w-[280px] max-w-[320px]"
      onClick={data.onClick}
    >
      {/* Input/Output handles for relationships */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />

      {/* Header */}
      <div className="px-3 py-2 bg-muted border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold truncate flex-1">{data.name}</h3>
          <div className="flex items-center gap-1">
            {data.onInfoClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  data.onInfoClick?.()
                }}
                className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                title="View dataset context"
              >
                <Info className="h-3 w-3" />
              </button>
            )}
            {data.domain && (
              <span className={`px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider border rounded ${getDomainColor(data.domain)}`}>
                {data.domain.split('|')[0]}
              </span>
            )}
          </div>
        </div>
        {data.row_count > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {data.row_count.toLocaleString()} rows
          </p>
        )}
      </div>

      {/* Columns */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          {visibleColumns.map((column, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-xs group hover:bg-muted/50 px-1 py-0.5 rounded"
              title={column.business_meaning || column.name}
            >
              {getSemanticIcon(column)}
              <span className="truncate flex-1 font-mono text-[11px]">
                {column.name}
              </span>
              {column.is_primary_key && (
                <span className="text-[9px] text-amber-600 font-medium">PK</span>
              )}
              {column.is_foreign_key && (
                <span className="text-[9px] text-blue-600 font-medium">FK</span>
              )}
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="text-[10px] text-muted-foreground italic px-1 pt-1 border-t border-border/50">
              ... +{remainingCount} more column{remainingCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
