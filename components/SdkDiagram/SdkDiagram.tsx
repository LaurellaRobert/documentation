import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import { useCallback } from 'react'
import ReactFlow, { Edge, Node, NodeMouseHandler, Position, addEdge, useEdgesState, useNodesState } from 'reactflow'

import 'reactflow/dist/base.css'
import { BOTPRESS_NODE, BotpressNode, BotpressNodeData } from './BotpressNode'
import { NodeInfoCard } from './NodeInfoCard'
import { EdgeData, SMOOTH_STEP_WITH_LABEL_EDGE, SmoothStepWithLabelEdge } from './SmoothStepLabelEdge'
import { SourceHandle } from './SourceHandle'
import { TargetHandle } from './TargetHandle'
const INTEGRATION_SOURCE_MARKER_ID = 'source-marker-integration'
const BOT_SOURCE_MARKER_ID = 'source-marker-bot'
const initialNodes: Node<ExternalApiNodeData | BotpressNodeData>[] = [
  {
    id: '1',
    position: { x: 10, y: 10 },
    type: 'externalApi',
    data: {
      label: 'Google API',
      link: {
        url: '',
        title: '(via Google APIs)',
      },
    } as ExternalApiNodeData,
  },
  {
    id: '2',
    type: BOTPRESS_NODE,
    position: { x: 100, y: 350 },
    data: {
      label: 'Gmail',
      icon: IntegrationIcon,
      defaultCurrentColorClass: 'text-fuchsia-200',
      labelColorClass: 'text-fuchsia-800',
      infoCardTitleClass: 'text-fuchsia-600',
      headerBgClass: 'bg-fuchsia-50/50',
      sourceMarkerId: INTEGRATION_SOURCE_MARKER_ID,
      subNodes: [
        {
          title: 'channels.message.text',
          value: 'sendEmail',
          hasSource: true,
          hasTarget: true,
        },
        {
          title: 'handler',
          value: 'onNewEmail',
          hasSource: true,
          hasTarget: true,
        },
      ],
    },
  },
  {
    id: '3',
    type: BOTPRESS_NODE,
    position: { x: 500, y: 700 },
    data: {
      label: 'Mail Shrimp',
      icon: BotIcon,
      defaultCurrentColorClass: 'text-blue-200',
      labelColorClass: 'text-blue-800',
      infoCardTitleClass: 'text-blue-600',
      headerBgClass: 'bg-blue-50/50',
      sourceMarkerId: BOT_SOURCE_MARKER_ID,
      subNodes: [
        {
          title: 'Send message to user',
          value: 'sendEmail',
          hasTarget: true,
        },
        {
          title: 'Trigger',
          value: 'createMessage',
          hasSource: true,
        },
      ],
    },
  },
]
const initialEdges: Edge<EdgeData>[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    targetHandle: 't0',
    type: SMOOTH_STEP_WITH_LABEL_EDGE,
    markerStart: 'external',
  },
  {
    id: 'e2-1',
    source: '2',
    target: '1',
    type: SMOOTH_STEP_WITH_LABEL_EDGE,
    markerStart: INTEGRATION_SOURCE_MARKER_ID,
    data: { color: '#f0abfc' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 's1',
    targetHandle: 't1',
    type: SMOOTH_STEP_WITH_LABEL_EDGE,
    markerStart: INTEGRATION_SOURCE_MARKER_ID,
    data: { color: '#f0abfc' },
  },
  {
    id: 'e3-2',
    source: '3',
    target: '2',
    type: SMOOTH_STEP_WITH_LABEL_EDGE,
    targetHandle: 't1',
    sourceHandle: 's1',
    data: { color: '#93c5fd' },
    markerStart: BOT_SOURCE_MARKER_ID,
  },
]
const edgeTypes = { [SMOOTH_STEP_WITH_LABEL_EDGE]: SmoothStepWithLabelEdge }
const nodeTypes = { [BOTPRESS_NODE]: BotpressNode, externalApi: ExternalApiNode }
export function SdkDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Parameters<typeof addEdge>[0]) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick: NodeMouseHandler = (event, node) => {
    // Animate edges
    setEdges((prevEdges) => {
      prevEdges.forEach((edge) => {
        if (edge.source === node.id) {
          edge.animated = true
        } else {
          edge.animated = false
        }
      })
      return [...prevEdges]
    })
  }

  return (
    <>
      <div className="w-100 h-[80vh] p-4">
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onNodesChange={onNodesChange}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>
    </>
  )
}

type ExternalApiNodeData = {
  label: string
  link: { url: string; title: string }
}

function ExternalApiNode({ data }: { data: ExternalApiNodeData }) {
  return (
    <>
      <div className={classNames('border-current, flex-col rounded-md border text-zinc-200')}>
        <div className="p-4">
          <div className={classNames('text-lg text-zinc-600')}>{data.label}</div>
          <div className="flex items-center text-sm text-primary hover:text-primary-dark">
            {data.label} <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className={classNames('relative flex flex-col items-center py-5 pl-4')}>
            <NodeInfoCard titleClass="text-zinc-400" title="webhook" value="users/{userId}/watch" />
            <div className={classNames('full absolute bottom-2 mt-[1px] h-[5px] w-[5px] rounded bg-current')}></div>
          </div>
          <div className={classNames('relative flex flex-col items-center justify-center py-5 pr-4')}>
            <div className="absolute -right-[1px] h-[18px] w-[10px] rounded-bl-full rounded-tl-full border border-current">
              <div className="absolute -right-1 h-full w-full rounded-full bg-white"></div>
            </div>
            <NodeInfoCard titleClass="text-zinc-400" title="POST" value="users/{userId}/messages/send" />
          </div>
        </div>
      </div>
      <div className={classNames('text-zinc-300')}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }} className="text-zinc-300">
          <defs>
            <marker id="external" refX={4} refY={1} markerHeight={16} markerWidth={16}>
              <ellipse cx="4" cy="4" rx="3" ry="3" fill="white" stroke="currentColor" />
            </marker>
          </defs>
        </svg>

        <SourceHandle position={Position.Bottom} id="rt" left={126} />
        <TargetHandle position={Position.Right} id="lb" top={133} />
      </div>
    </>
  )
}

function IntegrationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14.7508 4.89999C14.7508 4.54194 14.893 4.19857 15.1462 3.94539C15.3994 3.69222 15.7427 3.54999 16.1008 3.54999C16.4588 3.54999 16.8022 3.69222 17.0554 3.94539C17.3085 4.19857 17.4508 4.54194 17.4508 4.89999V5.59999C17.4508 6.1702 17.6773 6.71706 18.0805 7.12027C18.4837 7.52347 19.0306 7.74999 19.6008 7.74999H23.8008C23.9732 7.74999 24.1385 7.81847 24.2604 7.94037C24.3823 8.06227 24.4508 8.2276 24.4508 8.39999V12.6C24.4508 12.7724 24.3823 12.9377 24.2604 13.0596C24.1385 13.1815 23.9732 13.25 23.8008 13.25H23.1008C22.3449 13.25 21.62 13.5503 21.0855 14.0847C20.551 14.6192 20.2508 15.3441 20.2508 16.1C20.2508 16.8559 20.551 17.5808 21.0855 18.1152C21.62 18.6497 22.3449 18.95 23.1008 18.95H23.8008C23.9732 18.95 24.1385 19.0185 24.2604 19.1404C24.3823 19.2623 24.4508 19.4276 24.4508 19.6V23.8C24.4508 23.9724 24.3823 24.1377 24.2604 24.2596C24.1385 24.3815 23.9732 24.45 23.8008 24.45H19.6008C19.4284 24.45 19.2631 24.3815 19.1412 24.2596C19.0193 24.1377 18.9508 23.9724 18.9508 23.8V23.1C18.9508 22.3441 18.6505 21.6192 18.116 21.0847C17.5816 20.5503 16.8566 20.25 16.1008 20.25C15.3449 20.25 14.62 20.5503 14.0855 21.0847C13.551 21.6192 13.2508 22.3441 13.2508 23.1V23.8C13.2508 23.9724 13.1823 24.1377 13.0604 24.2596C12.9385 24.3815 12.7732 24.45 12.6008 24.45H8.40078C8.22839 24.45 8.06306 24.3815 7.94116 24.2596C7.81926 24.1377 7.75078 23.9724 7.75078 23.8V19.6C7.75078 19.0298 7.52426 18.4829 7.12106 18.0797C6.71786 17.6765 6.171 17.45 5.60078 17.45H4.90078C4.54274 17.45 4.19936 17.3078 3.94619 17.0546C3.69301 16.8014 3.55078 16.458 3.55078 16.1C3.55078 15.7419 3.69301 15.3986 3.94619 15.1454C4.19936 14.8922 4.54274 14.75 4.90078 14.75H5.60078C6.171 14.75 6.71786 14.5235 7.12106 14.1203C7.52426 13.7171 7.75078 13.1702 7.75078 12.6V8.39999C7.75078 8.2276 7.81926 8.06227 7.94116 7.94037C8.06306 7.81847 8.22839 7.74999 8.40078 7.74999H12.6008C13.171 7.74999 13.7179 7.52347 14.1211 7.12027C14.5243 6.71706 14.7508 6.1702 14.7508 5.59999V4.89999Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function BotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <rect x="1.25" y="4.25" width="22.5" height="18.5" rx="5.01" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="0.5" width="1.5" height="3.42857" fill="currentColor" />
      <rect x="16.4277" y="0.5" width="1.5" height="3.42857" fill="currentColor" />
      <rect x="6.5" y="16" width="12" height="3" fill="currentColor" />
      <rect x="6.5" y="9" width="2" height="2" fill="currentColor" />
      <rect x="16.5" y="9" width="2" height="2" fill="currentColor" />
    </svg>
  )
}
