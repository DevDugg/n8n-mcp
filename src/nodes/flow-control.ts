/**
 * Flow Control Nodes - Control workflow execution flow
 */

import type { NodeSchema } from "./types.js";

export const FLOW_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.if": {
    type: "n8n-nodes-base.if",
    displayName: "If",
    description: "Route items to different branches based on conditions (true/false)",
    category: "flow",
    typeVersion: 2.2,
    inputs: ["main"],
    outputs: ["main", "main"],
    parameters: [
      {
        name: "conditions",
        type: "fixedCollection",
        required: true,
        description: "Conditions to evaluate. Items go to 'true' branch if conditions match, 'false' branch otherwise.",
      },
      {
        name: "combineOperation",
        type: "options",
        required: false,
        default: "all",
        description: "How to combine multiple conditions",
        options: [
          { name: "All", value: "all", description: "All conditions must be true" },
          { name: "Any", value: "any", description: "Any condition must be true" },
        ],
      },
    ],
    examples: [
      {
        name: "Check Status",
        description: "Route based on status field",
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.status }}",
                rightValue: "active",
                operator: { type: "string", operation: "equals" },
              },
            ],
          },
        },
      },
      {
        name: "Check Number",
        description: "Route based on numeric comparison",
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.amount }}",
                rightValue: 100,
                operator: { type: "number", operation: "gte" },
              },
            ],
          },
        },
      },
      {
        name: "Multiple Conditions",
        description: "Check multiple conditions",
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.status }}",
                rightValue: "active",
                operator: { type: "string", operation: "equals" },
              },
              {
                leftValue: "={{ $json.verified }}",
                rightValue: true,
                operator: { type: "boolean", operation: "equals" },
              },
            ],
            combinator: "and",
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/",
  },

  "n8n-nodes-base.switch": {
    type: "n8n-nodes-base.switch",
    displayName: "Switch",
    description: "Route items to multiple outputs based on value matching",
    category: "flow",
    typeVersion: 3.2,
    inputs: ["main"],
    outputs: ["main", "main", "main", "main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "rules",
        description: "Mode of operation",
        options: [
          { name: "Rules", value: "rules", description: "Define rules for each output" },
          { name: "Expression", value: "expression", description: "Use expression to determine output" },
        ],
      },
      {
        name: "rules",
        type: "fixedCollection",
        required: false,
        description: "Rules to evaluate for routing",
      },
      {
        name: "fallbackOutput",
        type: "options",
        required: false,
        default: "none",
        description: "Where to send items that don't match any rule",
        options: [
          { name: "None", value: "none" },
          { name: "Extra Output", value: "extra" },
        ],
      },
    ],
    examples: [
      {
        name: "Route by Status",
        description: "Route to different outputs based on status",
        parameters: {
          mode: "rules",
          rules: {
            rules: [
              {
                output: 0,
                conditions: {
                  conditions: [
                    { leftValue: "={{ $json.status }}", rightValue: "pending", operator: { type: "string", operation: "equals" } },
                  ],
                },
              },
              {
                output: 1,
                conditions: {
                  conditions: [
                    { leftValue: "={{ $json.status }}", rightValue: "approved", operator: { type: "string", operation: "equals" } },
                  ],
                },
              },
              {
                output: 2,
                conditions: {
                  conditions: [
                    { leftValue: "={{ $json.status }}", rightValue: "rejected", operator: { type: "string", operation: "equals" } },
                  ],
                },
              },
            ],
          },
          fallbackOutput: "extra",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.switch/",
  },

  "n8n-nodes-base.merge": {
    type: "n8n-nodes-base.merge",
    displayName: "Merge",
    description: "Merge data from multiple inputs into a single stream",
    category: "flow",
    typeVersion: 3,
    inputs: ["main", "main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "append",
        description: "How to merge the data",
        options: [
          { name: "Append", value: "append", description: "Combine all items from both inputs" },
          { name: "Combine", value: "combine", description: "Merge items by position or field" },
          { name: "Choose Branch", value: "chooseBranch", description: "Output items from one branch only" },
        ],
      },
      {
        name: "joinMode",
        type: "options",
        required: false,
        default: "inner",
        description: "Join mode (when mode is 'combine')",
        options: [
          { name: "Inner Join", value: "inner", description: "Only matching items from both" },
          { name: "Left Join", value: "left", description: "All from input 1, matched from input 2" },
          { name: "Outer Join", value: "outer", description: "All items from both inputs" },
        ],
      },
      {
        name: "mergeByFields",
        type: "fixedCollection",
        required: false,
        description: "Fields to match on when combining",
      },
      {
        name: "clashHandling",
        type: "collection",
        required: false,
        description: "How to handle field name clashes",
      },
    ],
    examples: [
      {
        name: "Append Items",
        description: "Combine all items from both branches",
        parameters: {
          mode: "append",
        },
      },
      {
        name: "Join by ID",
        description: "Inner join on 'id' field",
        parameters: {
          mode: "combine",
          joinMode: "inner",
          mergeByFields: {
            values: [
              { field1: "id", field2: "id" },
            ],
          },
        },
      },
      {
        name: "Enrich Data",
        description: "Left join to enrich data",
        parameters: {
          mode: "combine",
          joinMode: "left",
          mergeByFields: {
            values: [
              { field1: "userId", field2: "id" },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/",
  },

  "n8n-nodes-base.splitInBatches": {
    type: "n8n-nodes-base.splitInBatches",
    displayName: "Loop Over Items",
    description: "Process items in batches/loops",
    category: "flow",
    typeVersion: 3,
    inputs: ["main"],
    outputs: ["main", "main"],
    parameters: [
      {
        name: "batchSize",
        type: "number",
        required: true,
        default: 10,
        description: "Number of items per batch",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: reset",
      },
    ],
    examples: [
      {
        name: "Batch Processing",
        description: "Process 10 items at a time",
        parameters: {
          batchSize: 10,
        },
      },
      {
        name: "Rate Limiting",
        description: "Process 1 at a time with wait",
        parameters: {
          batchSize: 1,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/",
  },

  "n8n-nodes-base.wait": {
    type: "n8n-nodes-base.wait",
    displayName: "Wait",
    description: "Pause workflow execution for a specified time or until webhook/event",
    category: "flow",
    typeVersion: 1.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resume",
        type: "options",
        required: true,
        default: "timeInterval",
        description: "When to resume execution",
        options: [
          { name: "After Time Interval", value: "timeInterval", description: "Wait for specified time" },
          { name: "At Specified Time", value: "specificTime", description: "Wait until specific datetime" },
          { name: "On Webhook Call", value: "webhook", description: "Wait for webhook to be called" },
        ],
      },
      {
        name: "amount",
        type: "number",
        required: false,
        default: 1,
        description: "Amount of time to wait",
      },
      {
        name: "unit",
        type: "options",
        required: false,
        default: "minutes",
        description: "Time unit",
        options: [
          { name: "Seconds", value: "seconds" },
          { name: "Minutes", value: "minutes" },
          { name: "Hours", value: "hours" },
          { name: "Days", value: "days" },
        ],
      },
    ],
    examples: [
      {
        name: "Wait 5 Minutes",
        description: "Pause for 5 minutes",
        parameters: {
          resume: "timeInterval",
          amount: 5,
          unit: "minutes",
        },
      },
      {
        name: "Wait for Webhook",
        description: "Pause until webhook is called",
        parameters: {
          resume: "webhook",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/",
  },

  "n8n-nodes-base.noOp": {
    type: "n8n-nodes-base.noOp",
    displayName: "No Operation",
    description: "Pass-through node that does nothing. Useful for organization.",
    category: "flow",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Pass Through",
        description: "Use as a placeholder or connector",
        parameters: {},
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.noop/",
  },

  "n8n-nodes-base.respondToWebhook": {
    type: "n8n-nodes-base.respondToWebhook",
    displayName: "Respond to Webhook",
    description: "Send custom response to webhook that triggered the workflow",
    category: "flow",
    typeVersion: 1.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "respondWith",
        type: "options",
        required: true,
        default: "firstIncomingItem",
        description: "What to respond with",
        options: [
          { name: "First Incoming Item", value: "firstIncomingItem" },
          { name: "Text", value: "text" },
          { name: "JSON", value: "json" },
          { name: "Binary", value: "binary" },
          { name: "No Data", value: "noData" },
        ],
      },
      {
        name: "responseCode",
        type: "number",
        required: false,
        default: 200,
        description: "HTTP status code",
      },
      {
        name: "responseBody",
        type: "string",
        required: false,
        description: "Response body (for text/json)",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: headers, contentType",
      },
    ],
    examples: [
      {
        name: "JSON Response",
        description: "Return JSON response",
        parameters: {
          respondWith: "json",
          responseBody: '={{ JSON.stringify({ success: true, data: $json }) }}',
          responseCode: 200,
        },
      },
      {
        name: "Success Message",
        description: "Return success text",
        parameters: {
          respondWith: "text",
          responseBody: "Request processed successfully",
          responseCode: 200,
        },
      },
      {
        name: "Error Response",
        description: "Return error",
        parameters: {
          respondWith: "json",
          responseBody: '={{ JSON.stringify({ error: true, message: $json.error }) }}',
          responseCode: 400,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/",
  },

  "n8n-nodes-base.stopAndError": {
    type: "n8n-nodes-base.stopAndError",
    displayName: "Stop and Error",
    description: "Stop the workflow and throw an error",
    category: "flow",
    typeVersion: 1,
    inputs: ["main"],
    outputs: [],
    parameters: [
      {
        name: "errorType",
        type: "options",
        required: true,
        default: "errorMessage",
        description: "Type of error",
        options: [
          { name: "Error Message", value: "errorMessage", description: "Provide custom error message" },
        ],
      },
      {
        name: "errorMessage",
        type: "string",
        required: true,
        description: "Error message to display",
      },
    ],
    examples: [
      {
        name: "Validation Error",
        description: "Stop with validation error",
        parameters: {
          errorType: "errorMessage",
          errorMessage: "Validation failed: {{ $json.validationError }}",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/",
  },

  "n8n-nodes-base.executeWorkflowTrigger": {
    type: "n8n-nodes-base.executeWorkflowTrigger",
    displayName: "Execute Workflow Trigger",
    description: "Entry point for workflows called by Execute Workflow node",
    category: "flow",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Sub-workflow Entry",
        description: "Entry point for sub-workflow",
        parameters: {},
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflowtrigger/",
  },

  "n8n-nodes-base.compareDatasets": {
    type: "n8n-nodes-base.compareDatasets",
    displayName: "Compare Datasets",
    description: "Compare two datasets and identify differences",
    category: "flow",
    typeVersion: 2.4,
    inputs: ["main", "main"],
    outputs: ["main", "main", "main", "main"],
    parameters: [
      {
        name: "mergeByFields",
        type: "fixedCollection",
        required: true,
        description: "Fields to compare by",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: skipFields, fuzzyCompare",
      },
    ],
    examples: [
      {
        name: "Find Changes",
        description: "Compare two lists by ID",
        parameters: {
          mergeByFields: {
            values: [
              { field1: "id", field2: "id" },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.comparedatasets/",
  },

  "n8n-nodes-base.loopOverItems": {
    type: "n8n-nodes-base.loopOverItems",
    displayName: "Loop Over Items",
    description: "Process items one at a time with loop context",
    category: "flow",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main", "main"],
    parameters: [
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Options for looping behavior",
      },
    ],
    examples: [
      {
        name: "Process Items",
        description: "Loop through items one by one",
        parameters: {},
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.loopoveritems/",
  },
};
