/**
 * Node Catalog - Comprehensive schemas for ALL n8n nodes (303+)
 *
 * This provides the MCP with knowledge about node parameters,
 * enabling it to create valid, production-ready workflows using
 * native integrations instead of HTTP Request fallbacks.
 *
 * Organized modular structure:
 * - nodes/types.ts         - Shared interfaces
 * - nodes/triggers.ts      - ~30 trigger nodes
 * - nodes/core.ts          - ~20 core utility nodes
 * - nodes/flow-control.ts  - ~12 flow control nodes
 * - nodes/data-transformation.ts - ~15 data transformation nodes
 * - nodes/integrations/    - 200+ integration nodes (17 category files)
 */

// Re-export everything from the modular structure
export {
  // Types
  type NodeSchema,
  type NodeParameter,
  type NodeCredential,
  type NodeCategory,
  type NodeExample,

  // Main catalog
  NODE_CATALOG,

  // Individual modules
  TRIGGER_NODES,
  CORE_NODES,
  FLOW_CONTROL_NODES,
  DATA_TRANSFORMATION_NODES,
  INTEGRATION_NODES,

  // Integration sub-modules
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

  // Helper functions
  getNodeCount,
  getNodesByCategory,
  findNode,
  searchNodes,
  getNodesForCategory,
  listNodeTypes,
  getNodeCounts,
  isValidNodeType,
  getTriggerNodes,
  getActionNodes,
  getNodeByType,
  getAllNodeTypes,
} from "./nodes/index.js";

// Re-export templates and expressions
export { WORKFLOW_TEMPLATES, getWorkflowTemplate, getAllWorkflowTemplates } from "./templates/index.js";
export { EXPRESSION_REFERENCE } from "./expressions/index.js";
