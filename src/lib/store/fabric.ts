/**
 * Fabric Store Slice
 *
 * Manages the simplified fabric YAML definition and converts it
 * into full topology nodes/edges.
 */

import type { StateCreator } from 'zustand';
import yaml from 'js-yaml';

import type { UINode, UIEdge } from '../../types/ui';
import type { NodeTemplate, LinkTemplate } from '../../types/schema';
import { fabricToTopology, type FabricDefinition } from '../fabricToTopology';

export interface FabricState {
  fabricYaml: string;
}

export interface FabricActions {
  setFabricYaml: (yaml: string) => void;
  applyFabricYaml: () => void;
}

export type FabricSlice = FabricState & FabricActions;

export type FabricSliceCreator = StateCreator<
  FabricSlice & {
    nodes: UINode[];
    edges: UIEdge[];
    nodeTemplates: NodeTemplate[];
    linkTemplates: LinkTemplate[];
    triggerYamlRefresh: () => void;
    saveToUndoHistory: () => void;
    layoutVersion: number;
  },
  [],
  [],
  FabricSlice
>;

function parseFabricYaml(yamlString: string): FabricDefinition | null {
  if (!yamlString.trim()) return null;

  try {
    const parsed = yaml.load(yamlString) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;

    const leafs = parsed.leafs as { count?: number; template?: string } | undefined;
    const spines = parsed.spines as { count?: number; template?: string } | undefined;

    if (!leafs?.count || !leafs?.template) return null;
    if (!spines?.count || !spines?.template) return null;

    const result: FabricDefinition = {
      leafs: { count: leafs.count, template: leafs.template },
      spines: { count: spines.count, template: spines.template },
    };

    const superspines = parsed.superspines as { count?: number; template?: string } | undefined;
    if (superspines?.count && superspines?.template) {
      result.superspines = { count: superspines.count, template: superspines.template };
    }

    return result;
  } catch {
    return null;
  }
}

export const createFabricSlice: FabricSliceCreator = (set, get) => ({
  fabricYaml: '',

  setFabricYaml: (yamlString: string) => {
    set({ fabricYaml: yamlString });
  },

  applyFabricYaml: () => {
    const state = get();
    const fabric = parseFabricYaml(state.fabricYaml);
    if (!fabric) return;

    state.saveToUndoHistory();

    const { nodes, edges } = fabricToTopology(
      fabric,
      state.nodeTemplates,
      state.linkTemplates,
    );

    set({
      nodes,
      edges,
      layoutVersion: state.layoutVersion + 1,
    } as Partial<FabricSlice>);

    state.triggerYamlRefresh();
  },
});
