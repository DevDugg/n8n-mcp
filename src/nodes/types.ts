/**
 * Node Catalog Type Definitions
 *
 * Shared interfaces for all node schema definitions.
 */

export interface NodeParameter {
  name: string;
  type: "string" | "number" | "boolean" | "options" | "collection" | "fixedCollection" | "json" | "resourceLocator" | "resourceMapper";
  required?: boolean;
  default?: unknown;
  description: string;
  options?: { name: string; value: string; description?: string }[];
  placeholder?: string;
  displayOptions?: {
    show?: Record<string, unknown[]>;
    hide?: Record<string, unknown[]>;
  };
}

export interface NodeCredential {
  name: string;
  required: boolean;
  description: string;
}

export interface NodeExample {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export type NodeCategory =
  | "trigger"
  | "core"
  | "flow"
  | "data"
  | "action"
  | "ai"
  | "communication"
  | "email"
  | "crm"
  | "project"
  | "database"
  | "storage"
  | "ecommerce"
  | "productivity"
  | "social"
  | "devops"
  | "analytics"
  | "marketing"
  | "hr"
  | "finance"
  | "support"
  | "utility";

export interface NodeSchema {
  type: string;
  displayName: string;
  description: string;
  category: NodeCategory;
  subcategory?: string;
  typeVersion: number;
  inputs: string[];
  outputs: string[];
  parameters: NodeParameter[];
  credentials?: NodeCredential[];
  examples: NodeExample[];
  documentationUrl?: string;
}
