/**
 * N8N Node Catalog - Main Barrel Export
 *
 * Combines all node modules into a unified catalog of 303+ nodes
 */

import type { NodeSchema, NodeCategory } from "./types.js";

// Import node modules
import { TRIGGER_NODES } from "./triggers.js";
import { CORE_NODES } from "./core.js";
import { FLOW_NODES } from "./flow-control.js";
import { DATA_NODES } from "./data-transformation.js";
import { INTEGRATION_NODES, getIntegrationNodeCounts } from "./integrations/index.js";

// Re-export types
export type { NodeSchema, NodeParameter, NodeCredential, NodeCategory, NodeExample } from "./types.js";

// Re-export individual modules
export { TRIGGER_NODES } from "./triggers.js";
export { CORE_NODES } from "./core.js";
export { FLOW_NODES } from "./flow-control.js";
export { DATA_NODES } from "./data-transformation.js";
// Aliases for backwards compatibility
export { FLOW_NODES as FLOW_CONTROL_NODES } from "./flow-control.js";
export { DATA_NODES as DATA_TRANSFORMATION_NODES } from "./data-transformation.js";
export {
  INTEGRATION_NODES,
  COMMUNICATION_NODES,
  EMAIL_NODES,
  CRM_NODES,
  PROJECT_MANAGEMENT_NODES,
  DATABASE_NODES,
  CLOUD_STORAGE_NODES,
  ECOMMERCE_NODES,
  PRODUCTIVITY_NODES,
  SOCIAL_MEDIA_NODES,
  DEVOPS_NODES,
  AI_ML_NODES,
  ANALYTICS_NODES,
  MARKETING_NODES,
  HR_RECRUITMENT_NODES,
  FINANCE_NODES,
  SUPPORT_NODES,
  MISCELLANEOUS_NODES,
} from "./integrations/index.js";

/**
 * Complete Node Catalog - All 303+ n8n nodes
 */
export const NODE_CATALOG: Record<string, NodeSchema> = {
  ...TRIGGER_NODES,
  ...CORE_NODES,
  ...FLOW_NODES,
  ...DATA_NODES,
  ...INTEGRATION_NODES,
};

/**
 * Get total count of nodes in the catalog
 */
export function getNodeCount(): number {
  return Object.keys(NODE_CATALOG).length;
}

/**
 * Get nodes grouped by category
 */
export function getNodesByCategory(): Record<NodeCategory, NodeSchema[]> {
  const categories: Record<NodeCategory, NodeSchema[]> = {
    trigger: [],
    core: [],
    flow: [],
    data: [],
    action: [],
    ai: [],
    communication: [],
    email: [],
    crm: [],
    project: [],
    database: [],
    storage: [],
    ecommerce: [],
    productivity: [],
    social: [],
    devops: [],
    analytics: [],
    marketing: [],
    hr: [],
    finance: [],
    support: [],
    utility: [],
  };

  for (const node of Object.values(NODE_CATALOG)) {
    if (categories[node.category]) {
      categories[node.category].push(node);
    }
  }

  return categories;
}

/**
 * Find a node by type
 */
export function findNode(type: string): NodeSchema | undefined {
  return NODE_CATALOG[type];
}

/**
 * Search nodes by name or description
 */
export function searchNodes(query: string, limit = 20): NodeSchema[] {
  const lowerQuery = query.toLowerCase();
  const results: NodeSchema[] = [];

  for (const node of Object.values(NODE_CATALOG)) {
    if (
      node.displayName.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.type.toLowerCase().includes(lowerQuery)
    ) {
      results.push(node);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Get nodes by category name
 */
export function getNodesForCategory(category: NodeCategory): NodeSchema[] {
  return Object.values(NODE_CATALOG).filter(node => node.category === category);
}

/**
 * List all available node types
 */
export function listNodeTypes(): string[] {
  return Object.keys(NODE_CATALOG);
}

/**
 * Get node counts by module
 */
export function getNodeCounts(): Record<string, number> {
  return {
    triggers: Object.keys(TRIGGER_NODES).length,
    core: Object.keys(CORE_NODES).length,
    flowControl: Object.keys(FLOW_NODES).length,
    dataTransformation: Object.keys(DATA_NODES).length,
    integrations: Object.keys(INTEGRATION_NODES).length,
    ...getIntegrationNodeCounts(),
    total: Object.keys(NODE_CATALOG).length,
  };
}

/**
 * Validate that a node type exists
 */
export function isValidNodeType(type: string): boolean {
  return type in NODE_CATALOG;
}

/**
 * Get all trigger nodes
 */
export function getTriggerNodes(): NodeSchema[] {
  return Object.values(NODE_CATALOG).filter(node => node.category === "trigger");
}

/**
 * Get all action nodes (non-trigger)
 */
export function getActionNodes(): NodeSchema[] {
  return Object.values(NODE_CATALOG).filter(node => node.category !== "trigger");
}

/**
 * Get a node schema by type (alias for findNode for backwards compatibility)
 */
export function getNodeByType(type: string): NodeSchema | undefined {
  return NODE_CATALOG[type];
}

/**
 * Get all available node types (alias for listNodeTypes for backwards compatibility)
 */
export function getAllNodeTypes(): string[] {
  return Object.keys(NODE_CATALOG);
}
