// Auto-generated from schema.json - do not edit manually
// Run: node scripts/generate-types.js

export type Operation = 'create' | 'replace' | 'replaceAll' | 'delete' | 'deleteAll';

export type LinkType = 'edge' | 'interSwitch' | 'loopback';

export type LinkSpeed = '800G' | '400G' | '200G' | '100G' | '50G' | '40G' | '25G' | '10G' | '2.5G' | '1G' | '100M';

export type EncapType = 'null' | 'dot1q';

export type SimNodeType = 'Linux' | 'TestMan' | 'SrlTest';

// Simulation types
export interface SimNodeTemplate {
  name: string;
  type: SimNodeType;
  image?: string;
  imagePullSecret?: string;
}

export interface SimNode {
  id: string; // Stable internal ID for React Flow
  name: string;
  template?: string;
  type?: SimNodeType;
  image?: string;
  imagePullSecret?: string;
  labels?: Record<string, string>;
  // UI position (exported to YAML as x/y labels)
  position?: { x: number; y: number };
}

export interface SimTopologyMapping {
  node: string;
  interface: string;
  simNode: string;
}

export interface Simulation {
  topology?: SimTopologyMapping[];
  simNodeTemplates: SimNodeTemplate[];
  simNodes: SimNode[];
}

// Index signatures required for React Flow compatibility
export interface TopologyNodeData {
  [key: string]: unknown;
  id: string;
  name: string;
  platform?: string;
  template?: string;
  nodeProfile?: string;
  labels?: Record<string, string>;
}

export interface MemberLink {
  name: string;
  template?: string;
  sourceInterface: string;
  targetInterface: string;
}

export interface TopologyEdgeData {
  [key: string]: unknown;
  id: string;
  sourceNode: string;
  targetNode: string;
  memberLinks?: MemberLink[];
}

export interface NodeTemplate {
  name: string;
  platform?: string;
  nodeProfile?: string;
  labels?: Record<string, string>;
}

export interface LinkTemplate {
  name: string;
  type?: LinkType;
  speed?: LinkSpeed;
  encapType?: EncapType;
  labels?: Record<string, string>;
}

export interface EdgeLinkEndpoint {
  local: {
    node: string;
    interface?: string;
  };
  remote?: {
    node: string;
    interface?: string;
  };
  sim?: {
    simNode: string;
    simNodeInterface?: string;
  };
}

export interface EdgeLink {
  name: string;
  template?: string;
  labels?: Record<string, string>;
  endpoints: EdgeLinkEndpoint[];
}

export interface NetworkNode {
  name: string;
  platform?: string;
  template?: string;
  nodeProfile?: string;
  labels?: Record<string, string>;
}

export interface TopologyState {
  topologyName: string;
  namespace: string;
  operation: Operation;
  nodeTemplates: NodeTemplate[];
  linkTemplates: LinkTemplate[];
  nodes: import('@xyflow/react').Node<TopologyNodeData>[];
  edges: import('@xyflow/react').Edge<TopologyEdgeData>[];
  edgeLinks: EdgeLink[];
  simulation: Simulation;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedEdgeLinkIndex: number | null;
  selectedSimNodeName: string | null;
  yamlRefreshCounter: number;
  layoutVersion: number;
  darkMode: boolean;
  showSimNodes: boolean;
  error: string | null;
}
