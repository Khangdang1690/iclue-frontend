"use client"

import * as React from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow"
import "reactflow/dist/style.css"
import { etlService } from "@/lib/api"
import { DatasetNode } from "./DatasetNode"
import { DatasetContext } from "./DatasetContext"
import { getLayoutedElements } from "./layoutAlgorithm"
import { AlertCircle, Loader2 } from "lucide-react"

interface SchemaViewProps {
  userId: string
  onDatasetClick?: (datasetId: string, datasetName: string) => void
}

// Custom node types
const nodeTypes = {
  datasetNode: DatasetNode,
}

export function SchemaView({ userId, onDatasetClick }: SchemaViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showDatasetContext, setShowDatasetContext] = React.useState(false)
  const [datasetForContext, setDatasetForContext] = React.useState<any>(null)
  const [datasetsMap, setDatasetsMap] = React.useState<Map<string, any>>(new Map())

  React.useEffect(() => {
    loadSchema()
  }, [userId])

  const loadSchema = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const schemaData = await etlService.getSchema(userId)

      // Create a map of datasets for quick lookup
      const datasetMap = new Map()
      schemaData.datasets.forEach(dataset => {
        datasetMap.set(dataset.id, dataset)
      })
      setDatasetsMap(datasetMap)

      // Transform datasets to nodes
      const initialNodes: Node[] = schemaData.datasets.map((dataset) => ({
        id: dataset.id,
        type: 'datasetNode',
        data: {
          name: dataset.name,
          domain: dataset.domain,
          description: dataset.description,
          row_count: dataset.row_count,
          columns: dataset.columns,
          onClick: onDatasetClick
            ? () => onDatasetClick(dataset.id, dataset.name)
            : undefined,
          onInfoClick: () => {
            setDatasetForContext(dataset)
            setShowDatasetContext(true)
          },
        },
        position: { x: 0, y: 0 }, // Will be set by layout algorithm
      }))

      // Transform relationships to edges
      const initialEdges: Edge[] = schemaData.relationships.map((rel) => ({
        id: rel.id,
        source: rel.from_dataset_id,
        target: rel.to_dataset_id,
        type: 'smoothstep',
        animated: rel.confidence > 0.9,
        label: `${rel.from_column} → ${rel.to_column}`,
        labelStyle: {
          fontSize: 10,
          fontWeight: 500,
          fill: '#666',
        },
        labelBgStyle: {
          fill: '#fff',
          fillOpacity: 0.9,
        },
        style: {
          stroke: rel.confidence > 0.8 ? '#3b82f6' : '#9ca3af',
          strokeWidth: rel.confidence > 0.8 ? 2 : 1,
        },
        data: {
          confidence: rel.confidence,
          match_percentage: rel.match_percentage,
          relationship_type: rel.relationship_type,
          join_strategy: rel.join_strategy,
        },
      }))

      // Apply auto-layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        'TB' // Top to bottom
      )

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
    } catch (err) {
      console.error('Failed to load schema:', err)
      setError(err instanceof Error ? err.message : 'Failed to load schema')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] border border-border rounded bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading schema...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] border border-border rounded bg-muted/20">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-sm font-medium">Failed to load schema</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] border border-border rounded bg-muted/20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium">No datasets found</p>
          <p className="text-xs text-muted-foreground">
            Upload files to see your data schema and relationships
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[700px] border border-border rounded bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls
          showZoom
          showFitView
          showInteractive
          position="bottom-right"
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-left"
          style={{
            width: 120,
            height: 80,
          }}
        />
      </ReactFlow>

      {/* Dataset Context Panel */}
      <DatasetContext
        isOpen={showDatasetContext}
        onClose={() => setShowDatasetContext(false)}
        dataset={datasetForContext}
      />
    </div>
  )
}
