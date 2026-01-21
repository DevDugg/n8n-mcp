/**
 * Integration Nodes Barrel Export
 *
 * Combines all integration node modules into a single export
 */

import type { NodeSchema } from "../types.js";

// Import all integration modules
import { COMMUNICATION_NODES } from "./communication.js";
import { EMAIL_NODES } from "./email.js";
import { CRM_NODES } from "./crm.js";
import { PROJECT_MANAGEMENT_NODES } from "./project-management.js";
import { DATABASE_NODES } from "./databases.js";
import { CLOUD_STORAGE_NODES } from "./cloud-storage.js";
import { ECOMMERCE_NODES } from "./ecommerce.js";
import { PRODUCTIVITY_NODES } from "./productivity.js";
import { SOCIAL_MEDIA_NODES } from "./social-media.js";
import { DEVOPS_NODES } from "./devops.js";
import { AI_ML_NODES } from "./ai-ml.js";
import { ANALYTICS_NODES } from "./analytics.js";
import { MARKETING_NODES } from "./marketing.js";
import { HR_RECRUITMENT_NODES } from "./hr-recruitment.js";
import { FINANCE_NODES } from "./finance.js";
import { SUPPORT_NODES } from "./support.js";
import { MISCELLANEOUS_NODES } from "./miscellaneous.js";

// Re-export individual modules
export {
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
};

/**
 * All integration nodes combined into a single object
 */
export const INTEGRATION_NODES: Record<string, NodeSchema> = {
  ...COMMUNICATION_NODES,
  ...EMAIL_NODES,
  ...CRM_NODES,
  ...PROJECT_MANAGEMENT_NODES,
  ...DATABASE_NODES,
  ...CLOUD_STORAGE_NODES,
  ...ECOMMERCE_NODES,
  ...PRODUCTIVITY_NODES,
  ...SOCIAL_MEDIA_NODES,
  ...DEVOPS_NODES,
  ...AI_ML_NODES,
  ...ANALYTICS_NODES,
  ...MARKETING_NODES,
  ...HR_RECRUITMENT_NODES,
  ...FINANCE_NODES,
  ...SUPPORT_NODES,
  ...MISCELLANEOUS_NODES,
};

/**
 * Get count of nodes by category
 */
export function getIntegrationNodeCounts(): Record<string, number> {
  return {
    communication: Object.keys(COMMUNICATION_NODES).length,
    email: Object.keys(EMAIL_NODES).length,
    crm: Object.keys(CRM_NODES).length,
    projectManagement: Object.keys(PROJECT_MANAGEMENT_NODES).length,
    database: Object.keys(DATABASE_NODES).length,
    cloudStorage: Object.keys(CLOUD_STORAGE_NODES).length,
    ecommerce: Object.keys(ECOMMERCE_NODES).length,
    productivity: Object.keys(PRODUCTIVITY_NODES).length,
    socialMedia: Object.keys(SOCIAL_MEDIA_NODES).length,
    devops: Object.keys(DEVOPS_NODES).length,
    aiMl: Object.keys(AI_ML_NODES).length,
    analytics: Object.keys(ANALYTICS_NODES).length,
    marketing: Object.keys(MARKETING_NODES).length,
    hrRecruitment: Object.keys(HR_RECRUITMENT_NODES).length,
    finance: Object.keys(FINANCE_NODES).length,
    support: Object.keys(SUPPORT_NODES).length,
    miscellaneous: Object.keys(MISCELLANEOUS_NODES).length,
    total: Object.keys(INTEGRATION_NODES).length,
  };
}
