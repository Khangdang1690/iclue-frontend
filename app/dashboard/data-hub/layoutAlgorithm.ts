import dagre from 'dagre'
import { Node, Edge } from 'reactflow'

const nodeWidth = 300
const nodeHeight = 200

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // TB = top-to-bottom, LR = left-to-right
    nodesep: 80, // Horizontal spacing between nodes
    ranksep: 120, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  })

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
