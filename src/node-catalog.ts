/**
 * Node Catalog - Comprehensive schemas for common n8n nodes
 *
 * This provides the MCP with knowledge about node parameters,
 * enabling it to create valid, production-ready workflows.
 */

export interface NodeParameter {
  name: string;
  type: "string" | "number" | "boolean" | "options" | "collection" | "fixedCollection" | "json";
  required?: boolean;
  default?: unknown;
  description: string;
  options?: { name: string; value: string; description?: string }[];
  placeholder?: string;
}

export interface NodeCredential {
  name: string;
  required: boolean;
  description: string;
}

export interface NodeSchema {
  type: string;
  displayName: string;
  description: string;
  category: "trigger" | "core" | "action" | "data" | "flow" | "ai";
  typeVersion: number;
  inputs: string[];
  outputs: string[];
  parameters: NodeParameter[];
  credentials?: NodeCredential[];
  examples: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }[];
}

export const NODE_CATALOG: Record<string, NodeSchema> = {
  // ============ TRIGGER NODES ============

  "n8n-nodes-base.manualTrigger": {
    type: "n8n-nodes-base.manualTrigger",
    displayName: "Manual Trigger",
    description: "Starts the workflow on manual execution. Required for test executions.",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Basic Manual Trigger",
        description: "Simple manual trigger for testing",
        parameters: {},
      },
    ],
  },

  "n8n-nodes-base.scheduleTrigger": {
    type: "n8n-nodes-base.scheduleTrigger",
    displayName: "Schedule Trigger",
    description: "Starts the workflow at specified intervals",
    category: "trigger",
    typeVersion: 1.2,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "rule",
        type: "fixedCollection",
        required: true,
        description: "Schedule rule configuration",
      },
    ],
    examples: [
      {
        name: "Every Hour",
        description: "Run every hour at minute 0",
        parameters: {
          rule: {
            interval: [{ field: "hours", hoursInterval: 1 }],
          },
        },
      },
      {
        name: "Daily at 9 AM",
        description: "Run daily at 9:00 AM",
        parameters: {
          rule: {
            interval: [{ field: "cronExpression", expression: "0 9 * * *" }],
          },
        },
      },
    ],
  },

  "n8n-nodes-base.webhook": {
    type: "n8n-nodes-base.webhook",
    displayName: "Webhook",
    description: "Starts workflow when webhook is called. Creates an HTTP endpoint.",
    category: "trigger",
    typeVersion: 2,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "httpMethod",
        type: "options",
        required: true,
        default: "GET",
        description: "HTTP method to accept",
        options: [
          { name: "DELETE", value: "DELETE" },
          { name: "GET", value: "GET" },
          { name: "HEAD", value: "HEAD" },
          { name: "PATCH", value: "PATCH" },
          { name: "POST", value: "POST" },
          { name: "PUT", value: "PUT" },
        ],
      },
      {
        name: "path",
        type: "string",
        required: true,
        default: "",
        description: "Webhook path (e.g., 'my-webhook'). Full URL will be: {n8n-url}/webhook/{path}",
        placeholder: "my-webhook",
      },
      {
        name: "authentication",
        type: "options",
        required: false,
        default: "none",
        description: "Authentication method",
        options: [
          { name: "None", value: "none" },
          { name: "Basic Auth", value: "basicAuth" },
          { name: "Header Auth", value: "headerAuth" },
        ],
      },
      {
        name: "responseMode",
        type: "options",
        required: false,
        default: "onReceived",
        description: "When to respond to the webhook",
        options: [
          { name: "When Received", value: "onReceived", description: "Respond immediately" },
          { name: "Last Node", value: "lastNode", description: "Respond with last node data" },
          { name: "Response Node", value: "responseNode", description: "Use Respond to Webhook node" },
        ],
      },
    ],
    examples: [
      {
        name: "POST Webhook",
        description: "Receive POST requests with JSON body",
        parameters: {
          httpMethod: "POST",
          path: "incoming-data",
          authentication: "none",
          responseMode: "onReceived",
        },
      },
    ],
  },

  // ============ CORE NODES ============

  "n8n-nodes-base.httpRequest": {
    type: "n8n-nodes-base.httpRequest",
    displayName: "HTTP Request",
    description: "Make HTTP requests to any API endpoint",
    category: "core",
    typeVersion: 4.2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "method",
        type: "options",
        required: true,
        default: "GET",
        description: "HTTP request method",
        options: [
          { name: "DELETE", value: "DELETE" },
          { name: "GET", value: "GET" },
          { name: "HEAD", value: "HEAD" },
          { name: "OPTIONS", value: "OPTIONS" },
          { name: "PATCH", value: "PATCH" },
          { name: "POST", value: "POST" },
          { name: "PUT", value: "PUT" },
        ],
      },
      {
        name: "url",
        type: "string",
        required: true,
        default: "",
        description: "URL to make the request to. Supports expressions like {{ $json.url }}",
        placeholder: "https://api.example.com/endpoint",
      },
      {
        name: "authentication",
        type: "options",
        required: false,
        default: "none",
        description: "Authentication method",
        options: [
          { name: "None", value: "none" },
          { name: "Predefined Credential Type", value: "predefinedCredentialType" },
          { name: "Generic Credential Type", value: "genericCredentialType" },
        ],
      },
      {
        name: "sendHeaders",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to send custom headers",
      },
      {
        name: "headerParameters",
        type: "fixedCollection",
        required: false,
        description: "Custom headers to send. Only used when sendHeaders is true.",
      },
      {
        name: "sendQuery",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to send query parameters",
      },
      {
        name: "queryParameters",
        type: "fixedCollection",
        required: false,
        description: "Query parameters to send. Only used when sendQuery is true.",
      },
      {
        name: "sendBody",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to send a body (for POST, PUT, PATCH)",
      },
      {
        name: "bodyParameters",
        type: "fixedCollection",
        required: false,
        description: "Body parameters. Only used when sendBody is true.",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options like timeout, response format, etc.",
      },
    ],
    credentials: [
      {
        name: "httpBasicAuth",
        required: false,
        description: "Basic Auth credentials",
      },
      {
        name: "httpHeaderAuth",
        required: false,
        description: "Header-based API key auth",
      },
      {
        name: "oAuth2Api",
        required: false,
        description: "OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "GET Request",
        description: "Simple GET request to an API",
        parameters: {
          method: "GET",
          url: "https://api.example.com/users",
          authentication: "none",
        },
      },
      {
        name: "POST with JSON Body",
        description: "POST request with JSON payload",
        parameters: {
          method: "POST",
          url: "https://api.example.com/users",
          authentication: "none",
          sendBody: true,
          specifyBody: "json",
          jsonBody: '={{ JSON.stringify({ "name": $json.name, "email": $json.email }) }}',
        },
      },
      {
        name: "GET with API Key Header",
        description: "GET request with API key in header",
        parameters: {
          method: "GET",
          url: "https://api.example.com/data",
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: "Accept", value: "application/json" },
            ],
          },
        },
      },
    ],
  },

  "n8n-nodes-base.code": {
    type: "n8n-nodes-base.code",
    displayName: "Code",
    description: "Execute custom JavaScript/Python code to transform data",
    category: "core",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "runOnceForAllItems",
        description: "How to run the code",
        options: [
          { name: "Run Once for All Items", value: "runOnceForAllItems", description: "Process all items in one execution" },
          { name: "Run Once for Each Item", value: "runOnceForEachItem", description: "Run code for each item separately" },
        ],
      },
      {
        name: "language",
        type: "options",
        required: true,
        default: "javaScript",
        description: "Programming language",
        options: [
          { name: "JavaScript", value: "javaScript" },
          { name: "Python", value: "python" },
        ],
      },
      {
        name: "jsCode",
        type: "string",
        required: true,
        default: "",
        description: "JavaScript code to execute. Access input with $input.all() or $input.item",
        placeholder: "// Your code here\nreturn $input.all();",
      },
    ],
    examples: [
      {
        name: "Transform Data",
        description: "Transform incoming JSON data",
        parameters: {
          mode: "runOnceForAllItems",
          language: "javaScript",
          jsCode: `// Transform each item
const items = $input.all();
return items.map(item => ({
  json: {
    id: item.json.id,
    fullName: \`\${item.json.firstName} \${item.json.lastName}\`,
    email: item.json.email.toLowerCase(),
  }
}));`,
        },
      },
      {
        name: "Filter Items",
        description: "Filter items based on condition",
        parameters: {
          mode: "runOnceForAllItems",
          language: "javaScript",
          jsCode: `// Filter items where status is 'active'
const items = $input.all();
return items.filter(item => item.json.status === 'active');`,
        },
      },
    ],
  },

  "n8n-nodes-base.set": {
    type: "n8n-nodes-base.set",
    displayName: "Edit Fields (Set)",
    description: "Set, modify, or delete fields in the data",
    category: "data",
    typeVersion: 3.4,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "manual",
        description: "How to set the data",
        options: [
          { name: "Manual Mapping", value: "manual" },
          { name: "JSON", value: "raw" },
        ],
      },
      {
        name: "fields",
        type: "fixedCollection",
        required: false,
        description: "Fields to set (when mode is manual)",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Set Fixed Values",
        description: "Add new fields with fixed values",
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "status", stringValue: "processed" },
              { name: "timestamp", stringValue: "={{ $now.toISO() }}" },
            ],
          },
        },
      },
    ],
  },

  // ============ FLOW CONTROL NODES ============

  "n8n-nodes-base.if": {
    type: "n8n-nodes-base.if",
    displayName: "IF",
    description: "Split workflow based on conditions (true/false paths)",
    category: "flow",
    typeVersion: 2.2,
    inputs: ["main"],
    outputs: ["main", "main"],
    parameters: [
      {
        name: "conditions",
        type: "fixedCollection",
        required: true,
        description: "Conditions to evaluate. Items matching go to 'true' output, others to 'false'.",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options like loose type checking",
      },
    ],
    examples: [
      {
        name: "Check Status",
        description: "Route based on status field",
        parameters: {
          conditions: {
            string: [
              {
                value1: "={{ $json.status }}",
                operation: "equals",
                value2: "active",
              },
            ],
          },
        },
      },
      {
        name: "Check Number Greater Than",
        description: "Route based on numeric comparison",
        parameters: {
          conditions: {
            number: [
              {
                value1: "={{ $json.amount }}",
                operation: "largerEqual",
                value2: 100,
              },
            ],
          },
        },
      },
    ],
  },

  "n8n-nodes-base.switch": {
    type: "n8n-nodes-base.switch",
    displayName: "Switch",
    description: "Route data to different outputs based on multiple conditions",
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
        description: "How to route the data",
        options: [
          { name: "Rules", value: "rules", description: "Route based on multiple rules" },
          { name: "Expression", value: "expression", description: "Route based on expression result" },
        ],
      },
      {
        name: "rules",
        type: "fixedCollection",
        required: false,
        description: "Rules to evaluate (when mode is rules)",
      },
    ],
    examples: [
      {
        name: "Route by Priority",
        description: "Route items to different outputs based on priority",
        parameters: {
          mode: "rules",
          rules: {
            values: [
              {
                conditions: {
                  string: [{ value1: "={{ $json.priority }}", operation: "equals", value2: "high" }],
                },
                outputIndex: 0,
              },
              {
                conditions: {
                  string: [{ value1: "={{ $json.priority }}", operation: "equals", value2: "medium" }],
                },
                outputIndex: 1,
              },
              {
                conditions: {
                  string: [{ value1: "={{ $json.priority }}", operation: "equals", value2: "low" }],
                },
                outputIndex: 2,
              },
            ],
          },
          fallbackOutput: 3,
        },
      },
    ],
  },

  "n8n-nodes-base.merge": {
    type: "n8n-nodes-base.merge",
    displayName: "Merge",
    description: "Combine data from multiple branches",
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
          { name: "Combine", value: "combine", description: "Match items by position or field" },
          { name: "Choose Branch", value: "chooseBranch", description: "Output data from selected branch only" },
        ],
      },
    ],
    examples: [
      {
        name: "Append Items",
        description: "Combine all items from both inputs into one list",
        parameters: {
          mode: "append",
        },
      },
      {
        name: "Merge by Field",
        description: "Match items by a common field",
        parameters: {
          mode: "combine",
          mergeByFields: {
            values: [
              { field1: "id", field2: "userId" },
            ],
          },
          joinMode: "inner",
        },
      },
    ],
  },

  "n8n-nodes-base.splitInBatches": {
    type: "n8n-nodes-base.splitInBatches",
    displayName: "Loop Over Items",
    description: "Process items in batches to avoid rate limits or memory issues",
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
        description: "Number of items to process in each batch",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Process in Batches of 10",
        description: "Split items into batches of 10 for API rate limiting",
        parameters: {
          batchSize: 10,
        },
      },
    ],
  },

  "n8n-nodes-base.wait": {
    type: "n8n-nodes-base.wait",
    displayName: "Wait",
    description: "Pause workflow execution for a specified time or until resumed",
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
          { name: "After Time Interval", value: "timeInterval" },
          { name: "At Specific Time", value: "specificTime" },
          { name: "On Webhook Call", value: "webhook" },
        ],
      },
      {
        name: "amount",
        type: "number",
        required: false,
        default: 1,
        description: "Amount of time to wait (when resume is timeInterval)",
      },
      {
        name: "unit",
        type: "options",
        required: false,
        default: "minutes",
        description: "Time unit (when resume is timeInterval)",
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
        name: "Wait 30 Seconds",
        description: "Pause for 30 seconds",
        parameters: {
          resume: "timeInterval",
          amount: 30,
          unit: "seconds",
        },
      },
    ],
  },

  "n8n-nodes-base.noOp": {
    type: "n8n-nodes-base.noOp",
    displayName: "No Operation (No-Op)",
    description: "Does nothing. Useful as a placeholder or for flow control",
    category: "flow",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Placeholder",
        description: "No operation placeholder",
        parameters: {},
      },
    ],
  },

  "n8n-nodes-base.respondToWebhook": {
    type: "n8n-nodes-base.respondToWebhook",
    displayName: "Respond to Webhook",
    description: "Send response back to webhook caller. Use with Webhook trigger responseMode: responseNode",
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
        description: "What data to respond with",
        options: [
          { name: "First Incoming Item", value: "firstIncomingItem" },
          { name: "Text", value: "text" },
          { name: "JSON", value: "json" },
          { name: "Binary", value: "binary" },
          { name: "No Data", value: "noData" },
        ],
      },
      {
        name: "responseBody",
        type: "string",
        required: false,
        description: "Response body (when respondWith is text or json)",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Response options like status code and headers",
      },
    ],
    examples: [
      {
        name: "JSON Response",
        description: "Return JSON data to webhook caller",
        parameters: {
          respondWith: "json",
          responseBody: '={{ JSON.stringify({ success: true, data: $json }) }}',
          options: {
            responseCode: 200,
            responseHeaders: {
              entries: [
                { name: "Content-Type", value: "application/json" },
              ],
            },
          },
        },
      },
    ],
  },

  // ============ APP NODES ============

  "n8n-nodes-base.slack": {
    type: "n8n-nodes-base.slack",
    displayName: "Slack",
    description: "Send messages and interact with Slack",
    category: "action",
    typeVersion: 2.2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "message",
        description: "Resource to operate on",
        options: [
          { name: "Channel", value: "channel" },
          { name: "Message", value: "message" },
          { name: "Reaction", value: "reaction" },
          { name: "Star", value: "star" },
          { name: "File", value: "file" },
          { name: "User", value: "user" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "post",
        description: "Operation to perform",
        options: [
          { name: "Post", value: "post" },
          { name: "Update", value: "update" },
          { name: "Delete", value: "delete" },
        ],
      },
      {
        name: "channel",
        type: "string",
        required: true,
        description: "Channel, private group, or IM channel to send message to. Can be ID or name like #general",
        placeholder: "#general",
      },
      {
        name: "text",
        type: "string",
        required: true,
        description: "Message text. Supports Slack markdown and expressions.",
        placeholder: "Hello from n8n!",
      },
    ],
    credentials: [
      {
        name: "slackApi",
        required: true,
        description: "Slack API credentials (Bot Token)",
      },
    ],
    examples: [
      {
        name: "Post Message",
        description: "Send a message to a Slack channel",
        parameters: {
          resource: "message",
          operation: "post",
          channel: "#notifications",
          text: "🚀 New deployment successful!\n\n*Project:* {{ $json.projectName }}\n*Version:* {{ $json.version }}",
        },
      },
    ],
  },

  "n8n-nodes-base.gmail": {
    type: "n8n-nodes-base.gmail",
    displayName: "Gmail",
    description: "Send and manage emails via Gmail",
    category: "action",
    typeVersion: 2.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "message",
        description: "Resource to operate on",
        options: [
          { name: "Message", value: "message" },
          { name: "Draft", value: "draft" },
          { name: "Label", value: "label" },
          { name: "Thread", value: "thread" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "send",
        description: "Operation to perform",
        options: [
          { name: "Send", value: "send" },
          { name: "Reply", value: "reply" },
          { name: "Get", value: "get" },
          { name: "Get Many", value: "getAll" },
          { name: "Delete", value: "delete" },
        ],
      },
      {
        name: "sendTo",
        type: "string",
        required: true,
        description: "Email address of recipient",
        placeholder: "recipient@example.com",
      },
      {
        name: "subject",
        type: "string",
        required: true,
        description: "Email subject line",
      },
      {
        name: "message",
        type: "string",
        required: true,
        description: "Email body content",
      },
    ],
    credentials: [
      {
        name: "gmailOAuth2",
        required: true,
        description: "Gmail OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "Send Email",
        description: "Send an email via Gmail",
        parameters: {
          resource: "message",
          operation: "send",
          sendTo: "={{ $json.email }}",
          subject: "Order Confirmation #{{ $json.orderId }}",
          message: "Thank you for your order!\n\nOrder ID: {{ $json.orderId }}\nTotal: ${{ $json.total }}",
        },
      },
    ],
  },

  "n8n-nodes-base.googleSheets": {
    type: "n8n-nodes-base.googleSheets",
    displayName: "Google Sheets",
    description: "Read and write data to Google Sheets",
    category: "action",
    typeVersion: 4.5,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "read",
        description: "Operation to perform",
        options: [
          { name: "Append Row", value: "append" },
          { name: "Clear", value: "clear" },
          { name: "Create", value: "create" },
          { name: "Delete", value: "delete" },
          { name: "Read Rows", value: "read" },
          { name: "Update Row", value: "update" },
        ],
      },
      {
        name: "documentId",
        type: "string",
        required: true,
        description: "Google Sheet document ID (from URL)",
        placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      },
      {
        name: "sheetName",
        type: "string",
        required: true,
        description: "Sheet name or gid",
        placeholder: "Sheet1",
      },
    ],
    credentials: [
      {
        name: "googleSheetsOAuth2Api",
        required: true,
        description: "Google Sheets OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "Append Row",
        description: "Add a new row to the sheet",
        parameters: {
          operation: "append",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          columns: {
            mappingMode: "defineBelow",
            value: {
              Name: "={{ $json.name }}",
              Email: "={{ $json.email }}",
              Date: "={{ $now.toISODate() }}",
            },
          },
        },
      },
      {
        name: "Read All Rows",
        description: "Read all rows from a sheet",
        parameters: {
          operation: "read",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
        },
      },
    ],
  },

  "@n8n/n8n-nodes-langchain.openAi": {
    type: "@n8n/n8n-nodes-langchain.openAi",
    displayName: "OpenAI",
    description: "Use OpenAI's models for chat, text generation, and more",
    category: "ai",
    typeVersion: 1.8,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "chat",
        description: "Resource to use",
        options: [
          { name: "Chat", value: "chat" },
          { name: "Text", value: "text" },
          { name: "Image", value: "image" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "message",
        description: "Operation to perform",
        options: [
          { name: "Message", value: "message" },
          { name: "Complete", value: "complete" },
        ],
      },
      {
        name: "model",
        type: "options",
        required: true,
        default: "gpt-4o",
        description: "Model to use",
        options: [
          { name: "GPT-4o", value: "gpt-4o" },
          { name: "GPT-4o Mini", value: "gpt-4o-mini" },
          { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
          { name: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
        ],
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        description: "Prompt to send to the model",
        placeholder: "Summarize the following text...",
      },
    ],
    credentials: [
      {
        name: "openAiApi",
        required: true,
        description: "OpenAI API key credentials",
      },
    ],
    examples: [
      {
        name: "Chat Message",
        description: "Send a chat message to GPT-4",
        parameters: {
          resource: "chat",
          operation: "message",
          model: "gpt-4o",
          prompt: "={{ $json.userMessage }}",
          options: {
            systemMessage: "You are a helpful assistant.",
            temperature: 0.7,
          },
        },
      },
    ],
  },

  "n8n-nodes-base.postgres": {
    type: "n8n-nodes-base.postgres",
    displayName: "Postgres",
    description: "Query PostgreSQL databases",
    category: "action",
    typeVersion: 2.5,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "executeQuery",
        description: "Operation to perform",
        options: [
          { name: "Execute Query", value: "executeQuery" },
          { name: "Insert", value: "insert" },
          { name: "Update", value: "update" },
          { name: "Delete", value: "delete" },
          { name: "Select", value: "select" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        description: "SQL query to execute",
        placeholder: "SELECT * FROM users WHERE id = $1",
      },
    ],
    credentials: [
      {
        name: "postgres",
        required: true,
        description: "PostgreSQL database credentials",
      },
    ],
    examples: [
      {
        name: "Select Query",
        description: "Query the database",
        parameters: {
          operation: "executeQuery",
          query: "SELECT * FROM users WHERE status = 'active' LIMIT 100",
        },
      },
    ],
  },

  // ============ DATA TRANSFORMATION NODES ============

  "n8n-nodes-base.aggregate": {
    type: "n8n-nodes-base.aggregate",
    displayName: "Aggregate",
    description: "Combine multiple items into a single item or aggregate values",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "aggregate",
        type: "options",
        required: true,
        default: "aggregateIndividualFields",
        description: "Aggregation mode",
        options: [
          { name: "Aggregate Individual Fields", value: "aggregateIndividualFields" },
          { name: "Aggregate All Item Data", value: "aggregateAllItemData" },
        ],
      },
      {
        name: "fieldsToAggregate",
        type: "fixedCollection",
        required: false,
        description: "Fields to aggregate and how",
      },
    ],
    examples: [
      {
        name: "Sum Values",
        description: "Sum all values from a field",
        parameters: {
          aggregate: "aggregateIndividualFields",
          fieldsToAggregate: {
            fieldToAggregate: [
              { fieldToAggregate: "amount", aggregation: "sum", outputFieldName: "totalAmount" },
            ],
          },
        },
      },
    ],
  },

  "n8n-nodes-base.filter": {
    type: "n8n-nodes-base.filter",
    displayName: "Filter",
    description: "Filter items based on conditions",
    category: "data",
    typeVersion: 2.2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "conditions",
        type: "fixedCollection",
        required: true,
        description: "Conditions to filter items",
      },
      {
        name: "combineConditions",
        type: "options",
        required: false,
        default: "and",
        description: "How to combine multiple conditions",
        options: [
          { name: "AND", value: "and" },
          { name: "OR", value: "or" },
        ],
      },
    ],
    examples: [
      {
        name: "Filter Active Users",
        description: "Keep only items where status is active",
        parameters: {
          conditions: {
            string: [
              { value1: "={{ $json.status }}", operation: "equals", value2: "active" },
            ],
          },
        },
      },
    ],
  },

  "n8n-nodes-base.sort": {
    type: "n8n-nodes-base.sort",
    displayName: "Sort",
    description: "Sort items by field values",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "sortFieldsUi",
        type: "fixedCollection",
        required: true,
        description: "Fields to sort by",
      },
    ],
    examples: [
      {
        name: "Sort by Date",
        description: "Sort items by date descending",
        parameters: {
          sortFieldsUi: {
            sortField: [
              { fieldName: "createdAt", order: "descending" },
            ],
          },
        },
      },
    ],
  },

  "n8n-nodes-base.limit": {
    type: "n8n-nodes-base.limit",
    displayName: "Limit",
    description: "Limit number of items passed through",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "maxItems",
        type: "number",
        required: true,
        default: 10,
        description: "Maximum number of items to keep",
      },
      {
        name: "keep",
        type: "options",
        required: false,
        default: "firstItems",
        description: "Which items to keep",
        options: [
          { name: "First Items", value: "firstItems" },
          { name: "Last Items", value: "lastItems" },
        ],
      },
    ],
    examples: [
      {
        name: "Keep First 10",
        description: "Keep only the first 10 items",
        parameters: {
          maxItems: 10,
          keep: "firstItems",
        },
      },
    ],
  },

  "n8n-nodes-base.removeDuplicates": {
    type: "n8n-nodes-base.removeDuplicates",
    displayName: "Remove Duplicates",
    description: "Remove duplicate items based on field values",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "compare",
        type: "options",
        required: true,
        default: "allFields",
        description: "How to compare items",
        options: [
          { name: "All Fields", value: "allFields" },
          { name: "Selected Fields", value: "selectedFields" },
        ],
      },
      {
        name: "fieldsToCompare",
        type: "string",
        required: false,
        description: "Comma-separated field names to compare (when compare is selectedFields)",
      },
    ],
    examples: [
      {
        name: "Remove by Email",
        description: "Remove duplicates based on email field",
        parameters: {
          compare: "selectedFields",
          fieldsToCompare: "email",
        },
      },
    ],
  },

  "n8n-nodes-base.splitOut": {
    type: "n8n-nodes-base.splitOut",
    displayName: "Split Out",
    description: "Split an array field into separate items",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "fieldToSplitOut",
        type: "string",
        required: true,
        description: "Name of the array field to split",
        placeholder: "items",
      },
      {
        name: "include",
        type: "options",
        required: false,
        default: "noOtherFields",
        description: "What other fields to include",
        options: [
          { name: "No Other Fields", value: "noOtherFields" },
          { name: "All Other Fields", value: "allOtherFields" },
          { name: "Selected Fields", value: "selectedFields" },
        ],
      },
    ],
    examples: [
      {
        name: "Split Array",
        description: "Split an items array into separate items",
        parameters: {
          fieldToSplitOut: "items",
          include: "allOtherFields",
        },
      },
    ],
  },
};

// ============ HELPER FUNCTIONS ============

export function getNodeByType(type: string): NodeSchema | undefined {
  return NODE_CATALOG[type];
}

export function getAllNodeTypes(): string[] {
  return Object.keys(NODE_CATALOG);
}

export function getNodesByCategory(category: NodeSchema["category"]): NodeSchema[] {
  return Object.values(NODE_CATALOG).filter((node) => node.category === category);
}

export function searchNodes(query: string): NodeSchema[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(NODE_CATALOG).filter(
    (node) =>
      node.displayName.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.type.toLowerCase().includes(lowerQuery)
  );
}

export function getNodeCategories(): NodeSchema["category"][] {
  return ["trigger", "core", "action", "data", "flow", "ai"];
}

// ============ WORKFLOW TEMPLATES ============

export interface WorkflowTemplate {
  name: string;
  description: string;
  nodes: {
    name: string;
    type: string;
    position: [number, number];
    parameters: Record<string, unknown>;
  }[];
  connections: Record<string, unknown>;
}

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  "webhook-to-slack": {
    name: "Webhook to Slack Notification",
    description: "Receive webhook data and send a formatted Slack message",
    nodes: [
      {
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [250, 300],
        parameters: {
          httpMethod: "POST",
          path: "incoming-data",
          responseMode: "onReceived",
        },
      },
      {
        name: "Send to Slack",
        type: "n8n-nodes-base.slack",
        position: [500, 300],
        parameters: {
          resource: "message",
          operation: "post",
          channel: "#notifications",
          text: "New webhook received:\n```{{ JSON.stringify($json, null, 2) }}```",
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: "Send to Slack", type: "main", index: 0 }]],
      },
    },
  },

  "scheduled-api-to-sheets": {
    name: "Scheduled API to Google Sheets",
    description: "Fetch data from API on schedule and append to Google Sheets",
    nodes: [
      {
        name: "Schedule Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
        position: [250, 300],
        parameters: {
          rule: {
            interval: [{ field: "hours", hoursInterval: 1 }],
          },
        },
      },
      {
        name: "HTTP Request",
        type: "n8n-nodes-base.httpRequest",
        position: [450, 300],
        parameters: {
          method: "GET",
          url: "https://api.example.com/data",
          authentication: "none",
        },
      },
      {
        name: "Append to Sheet",
        type: "n8n-nodes-base.googleSheets",
        position: [650, 300],
        parameters: {
          operation: "append",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
        },
      },
    ],
    connections: {
      "Schedule Trigger": {
        main: [[{ node: "HTTP Request", type: "main", index: 0 }]],
      },
      "HTTP Request": {
        main: [[{ node: "Append to Sheet", type: "main", index: 0 }]],
      },
    },
  },

  "conditional-processing": {
    name: "Conditional Data Processing",
    description: "Route data through different paths based on conditions",
    nodes: [
      {
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        position: [250, 300],
        parameters: {},
      },
      {
        name: "Check Condition",
        type: "n8n-nodes-base.if",
        position: [450, 300],
        parameters: {
          conditions: {
            string: [
              {
                value1: "={{ $json.status }}",
                operation: "equals",
                value2: "approved",
              },
            ],
          },
        },
      },
      {
        name: "Approved Path",
        type: "n8n-nodes-base.set",
        position: [650, 200],
        parameters: {
          mode: "manual",
          fields: {
            values: [{ name: "processed", stringValue: "true" }],
          },
        },
      },
      {
        name: "Rejected Path",
        type: "n8n-nodes-base.set",
        position: [650, 400],
        parameters: {
          mode: "manual",
          fields: {
            values: [{ name: "processed", stringValue: "false" }],
          },
        },
      },
    ],
    connections: {
      "Manual Trigger": {
        main: [[{ node: "Check Condition", type: "main", index: 0 }]],
      },
      "Check Condition": {
        main: [
          [{ node: "Approved Path", type: "main", index: 0 }],
          [{ node: "Rejected Path", type: "main", index: 0 }],
        ],
      },
    },
  },
};

export function getWorkflowTemplate(name: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES[name];
}

export function getAllWorkflowTemplates(): string[] {
  return Object.keys(WORKFLOW_TEMPLATES);
}

// ============ EXPRESSION REFERENCE ============

export const EXPRESSION_REFERENCE = {
  basics: {
    description: "n8n uses expressions in the format {{ expression }}",
    examples: [
      { expression: "{{ $json.fieldName }}", description: "Access field from current item" },
      { expression: "{{ $json.nested.field }}", description: "Access nested field" },
      { expression: "{{ $json['field-name'] }}", description: "Access field with special characters" },
    ],
  },
  variables: {
    $json: "Current item's JSON data",
    $input: "Input data accessor ($input.all(), $input.first(), $input.item)",
    $node: "Access other nodes' data ($node['NodeName'].json)",
    $now: "Current datetime ($now.toISO(), $now.toISODate())",
    $today: "Today's date",
    $runIndex: "Current execution's run index",
    $itemIndex: "Current item's index in the array",
    $workflow: "Workflow metadata ($workflow.name, $workflow.id)",
    $execution: "Execution metadata ($execution.id, $execution.mode)",
    $env: "Environment variables ($env.MY_VAR)",
    $vars: "n8n Variables ($vars.myVariable)",
  },
  methods: {
    string: ["toLowerCase()", "toUpperCase()", "trim()", "split()", "replace()", "slice()"],
    array: ["filter()", "map()", "find()", "length", "join()", "includes()"],
    date: ["toISO()", "toISODate()", "toISOTime()", "plus({days: 1})", "minus({hours: 2})"],
    object: ["Object.keys()", "Object.values()", "JSON.stringify()", "JSON.parse()"],
  },
  examples: [
    {
      scenario: "Format date",
      expression: "{{ $now.toFormat('yyyy-MM-dd') }}",
    },
    {
      scenario: "Conditional value",
      expression: "{{ $json.status === 'active' ? 'Yes' : 'No' }}",
    },
    {
      scenario: "Array length",
      expression: "{{ $json.items.length }}",
    },
    {
      scenario: "Join array",
      expression: "{{ $json.tags.join(', ') }}",
    },
    {
      scenario: "Reference previous node",
      expression: "{{ $node['HTTP Request'].json.data }}",
    },
    {
      scenario: "Environment variable",
      expression: "{{ $env.API_KEY }}",
    },
  ],
};
