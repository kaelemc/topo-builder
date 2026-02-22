/**
 * Fabric-to-Topology Conversion
 *
 * Converts a simplified fabric definition (leaf/spine/superspine counts + templates)
 * into full UINode[] and UIEdge[] arrays for the topology store.
 */

import type { UINode, UIEdge, UIEdgeData, UIMemberLink } from '../types/ui';
import type { NodeTemplate, LinkTemplate } from '../types/schema';
import { ANNOTATION_NAME_PREFIX } from './constants';

export interface FabricTierDef {
  count: number;
  template: string;
}

export interface FabricDefinition {
  leafs: FabricTierDef;
  spines: FabricTierDef;
  superspines?: FabricTierDef;
}

interface TierLayout {
  y: number;
  nodes: UINode[];
}

function getNamePrefix(templateName: string, nodeTemplates: NodeTemplate[], fallback: string): string {
  const tmpl = nodeTemplates.find(t => t.name === templateName);
  return tmpl?.annotations?.[ANNOTATION_NAME_PREFIX] || fallback;
}

function buildTierNodes(
  tier: FabricTierDef,
  nodeTemplates: NodeTemplate[],
  fallbackPrefix: string,
  y: number,
  startId: number,
): { nodes: UINode[]; nextId: number } {
  const prefix = getNamePrefix(tier.template, nodeTemplates, fallbackPrefix);
  const nodes: UINode[] = [];
  let id = startId;

  for (let i = 1; i <= tier.count; i++) {
    const nodeId = `node-${id}`;
    const name = `${prefix}${i}`;
    nodes.push({
      id: nodeId,
      type: 'topoNode',
      position: { x: 0, y }, // x set later during centering
      selected: false,
      data: { id: nodeId, name, template: tier.template },
    });
    id++;
  }

  return { nodes, nextId: id };
}

function centerTierHorizontally(nodes: UINode[], spacing: number): void {
  const totalWidth = (nodes.length - 1) * spacing;
  const startX = -totalWidth / 2;
  for (let i = 0; i < nodes.length; i++) {
    nodes[i] = {
      ...nodes[i],
      position: { x: startX + i * spacing, y: nodes[i].position.y },
    };
  }
}

function getNextPortNumber(edges: UIEdge[], nodeId: string): number {
  let maxPort = 0;
  for (const edge of edges) {
    const memberLinks = edge.data?.memberLinks;
    if (!memberLinks) continue;

    let interfaces: string[] = [];
    if (edge.source === nodeId) interfaces = memberLinks.map(ml => ml.sourceInterface);
    else if (edge.target === nodeId) interfaces = memberLinks.map(ml => ml.targetInterface);

    for (const iface of interfaces) {
      const match = iface.match(/ethernet-1-(\d+)/);
      if (match) {
        const port = parseInt(match[1], 10);
        if (port > maxPort) maxPort = port;
      }
    }
  }
  return maxPort + 1;
}

function getEdgePairKey(a: string, b: string): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function getNextLinkNumberForPair(edges: UIEdge[], sourceNodeName: string, targetNodeName: string): number {
  const pairKey = getEdgePairKey(sourceNodeName, targetNodeName);
  let memberLinkCount = 0;

  for (const edge of edges) {
    const edgeSource = edge.data?.sourceNode;
    const edgeTarget = edge.data?.targetNode;
    if (!edgeSource || !edgeTarget) continue;
    if (getEdgePairKey(edgeSource, edgeTarget) !== pairKey) continue;
    memberLinkCount += edge.data?.memberLinks?.length ?? 0;
  }

  return memberLinkCount + 1;
}

function createISLEdge(
  sourceNode: UINode,
  targetNode: UINode,
  islTemplate: string,
  currentEdges: UIEdge[],
  edgeIdCounter: { value: number },
): UIEdge {
  const nextSourcePort = getNextPortNumber(currentEdges, sourceNode.id);
  const nextTargetPort = getNextPortNumber(currentEdges, targetNode.id);
  const sourceInterface = `ethernet-1-${nextSourcePort}`;
  const targetInterface = `ethernet-1-${nextTargetPort}`;

  const sourceName = sourceNode.data.name;
  const targetName = targetNode.data.name;
  const nextLinkNumber = getNextLinkNumberForPair(currentEdges, sourceName, targetName);

  const id = `edge-${edgeIdCounter.value}`;
  edgeIdCounter.value++;

  const memberLink: UIMemberLink = {
    name: `${targetName}-${sourceName}-${nextLinkNumber}`,
    template: islTemplate,
    sourceInterface,
    targetInterface,
  };

  const data: UIEdgeData = {
    id,
    sourceNode: sourceName,
    targetNode: targetName,
    edgeType: 'normal',
    memberLinks: [memberLink],
  };

  return {
    id,
    type: 'linkEdge',
    source: sourceNode.id,
    target: targetNode.id,
    sourceHandle: null,
    targetHandle: null,
    selected: false,
    data,
  };
}

const SPACING = 200;
const Y_SUPERSPINE = 100;
const Y_SPINE = 350;
const Y_LEAF = 600;

export function fabricToTopology(
  fabric: FabricDefinition,
  nodeTemplates: NodeTemplate[],
  linkTemplates: LinkTemplate[],
): { nodes: UINode[]; edges: UIEdge[]; maxNodeId: number; maxEdgeId: number } {
  let nodeId = 1;

  // Build leaf nodes
  const leafResult = buildTierNodes(fabric.leafs, nodeTemplates, 'leaf', Y_LEAF, nodeId);
  nodeId = leafResult.nextId;

  // Build spine nodes
  const spineResult = buildTierNodes(fabric.spines, nodeTemplates, 'spine', Y_SPINE, nodeId);
  nodeId = spineResult.nextId;

  // Build optional superspine nodes
  let superspineNodes: UINode[] = [];
  if (fabric.superspines && fabric.superspines.count > 0) {
    const ssResult = buildTierNodes(fabric.superspines, nodeTemplates, 'superspine', Y_SUPERSPINE, nodeId);
    superspineNodes = ssResult.nodes;
    nodeId = ssResult.nextId;
  }

  // Center tiers horizontally
  centerTierHorizontally(leafResult.nodes, SPACING);
  centerTierHorizontally(spineResult.nodes, SPACING);
  if (superspineNodes.length > 0) {
    centerTierHorizontally(superspineNodes, SPACING);
  }

  const allNodes = [...leafResult.nodes, ...spineResult.nodes, ...superspineNodes];

  // Build ISL edges
  const islTemplate = linkTemplates.find(t => t.type === 'interSwitch')?.name || 'isl';
  const edgeIdCounter = { value: 1 };
  const edges: UIEdge[] = [];

  // Leaf ↔ Spine links
  for (const leaf of leafResult.nodes) {
    for (const spine of spineResult.nodes) {
      const edge = createISLEdge(leaf, spine, islTemplate, edges, edgeIdCounter);
      edges.push(edge);
    }
  }

  // Spine ↔ Superspine links
  for (const spine of spineResult.nodes) {
    for (const ss of superspineNodes) {
      const edge = createISLEdge(spine, ss, islTemplate, edges, edgeIdCounter);
      edges.push(edge);
    }
  }

  return {
    nodes: allNodes,
    edges,
    maxNodeId: nodeId - 1,
    maxEdgeId: edgeIdCounter.value - 1,
  };
}
