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
    description: "Send messages, manage channels, files, reactions, and users in Slack",
    category: "action",
    typeVersion: 2.4,
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
          { name: "Channel", value: "channel", description: "Manage Slack channels" },
          { name: "File", value: "file", description: "Upload and manage files" },
          { name: "Message", value: "message", description: "Send and manage messages" },
          { name: "Reaction", value: "reaction", description: "Add/remove emoji reactions" },
          { name: "Star", value: "star", description: "Star/unstar items" },
          { name: "User", value: "user", description: "Get user information" },
          { name: "User Group", value: "userGroup", description: "Manage user groups" },
          { name: "User Profile", value: "userProfile", description: "Get/update user profiles" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "post",
        description: "Operation to perform. Available operations depend on resource selected.",
        options: [
          // Channel operations (17)
          { name: "Archive", value: "archive", description: "Archive a channel" },
          { name: "Close", value: "close", description: "Close a DM or multi-person DM" },
          { name: "Create", value: "create", description: "Create a new channel" },
          { name: "Get", value: "get", description: "Get channel information" },
          { name: "Get Many", value: "getAll", description: "Get many channels" },
          { name: "History", value: "history", description: "Get channel message history" },
          { name: "Invite", value: "invite", description: "Invite user to channel" },
          { name: "Join", value: "join", description: "Join a channel" },
          { name: "Kick", value: "kick", description: "Remove user from channel" },
          { name: "Leave", value: "leave", description: "Leave a channel" },
          { name: "Member", value: "member", description: "List channel members" },
          { name: "Open", value: "open", description: "Open/resume a DM" },
          { name: "Rename", value: "rename", description: "Rename a channel" },
          { name: "Replies", value: "replies", description: "Get thread replies" },
          { name: "Set Purpose", value: "setPurpose", description: "Set channel purpose" },
          { name: "Set Topic", value: "setTopic", description: "Set channel topic" },
          { name: "Unarchive", value: "unarchive", description: "Unarchive a channel" },
          // Message operations (6)
          { name: "Delete", value: "delete", description: "Delete a message" },
          { name: "Get Permalink", value: "getPermalink", description: "Get message permalink" },
          { name: "Post", value: "post", description: "Post a message" },
          { name: "Search", value: "search", description: "Search messages" },
          { name: "Update", value: "update", description: "Update a message" },
          // Reaction operations
          { name: "Add", value: "add", description: "Add reaction to message" },
          { name: "Remove", value: "remove", description: "Remove reaction from message" },
          // File operations
          { name: "Upload", value: "upload", description: "Upload a file" },
          // User operations
          { name: "Get User", value: "getUser", description: "Get user by ID or email" },
          { name: "Get Presence", value: "getPresence", description: "Get user presence" },
        ],
      },
      {
        name: "select",
        type: "options",
        required: false,
        default: "channel",
        description: "How to select the channel (for channel operations)",
        options: [
          { name: "By ID", value: "id", description: "Use channel ID" },
          { name: "By Name", value: "name", description: "Use channel name (e.g., #general)" },
          { name: "By URL", value: "url", description: "Use channel URL" },
        ],
      },
      {
        name: "channelId",
        type: "string",
        required: false,
        description: "Channel ID. Use channel ID (C0123456) or name (#general)",
        placeholder: "C0123456789 or #general",
      },
      {
        name: "user",
        type: "string",
        required: false,
        description: "User ID or email (for user operations)",
        placeholder: "U0123456789 or user@example.com",
      },
      {
        name: "messageType",
        type: "options",
        required: false,
        default: "text",
        description: "Type of message to send",
        options: [
          { name: "Simple Text", value: "text", description: "Plain text message with markdown" },
          { name: "Blocks", value: "block", description: "Rich message using Block Kit" },
          { name: "Attachments", value: "attachment", description: "Message with attachments (legacy)" },
        ],
      },
      {
        name: "text",
        type: "string",
        required: false,
        description: "Message text. Supports Slack mrkdwn formatting: *bold*, _italic_, ~strikethrough~, `code`, ```code block```, <url|link text>",
        placeholder: "Hello from n8n!",
      },
      {
        name: "blocksUi",
        type: "fixedCollection",
        required: false,
        description: "Slack Block Kit blocks. Use Slack Block Kit Builder: https://app.slack.com/block-kit-builder",
      },
      {
        name: "timestamp",
        type: "string",
        required: false,
        description: "Message timestamp (ts) for update/delete operations",
        placeholder: "1234567890.123456",
      },
      {
        name: "otherOptions",
        type: "collection",
        required: false,
        description: "Additional options: thread_ts (reply in thread), unfurl_links, unfurl_media, link_names, mrkdwn, reply_broadcast",
      },
    ],
    credentials: [
      {
        name: "slackApi",
        required: true,
        description: "Slack Bot Token (xoxb-) or User Token (xoxp-). Bot token recommended.",
      },
      {
        name: "slackOAuth2Api",
        required: false,
        description: "Slack OAuth2 credentials for user token operations",
      },
    ],
    examples: [
      {
        name: "Post Simple Message",
        description: "Send a text message to a channel",
        parameters: {
          resource: "message",
          operation: "post",
          select: "name",
          channelId: "#general",
          messageType: "text",
          text: "Hello from n8n! :wave:",
        },
      },
      {
        name: "Post Formatted Message",
        description: "Send a message with Slack markdown formatting",
        parameters: {
          resource: "message",
          operation: "post",
          select: "name",
          channelId: "#notifications",
          messageType: "text",
          text: "*Deployment Complete* :rocket:\n\n*Project:* {{ $json.projectName }}\n*Version:* `{{ $json.version }}`\n*Environment:* {{ $json.env }}\n\n<{{ $json.url }}|View Deployment>",
        },
      },
      {
        name: "Reply in Thread",
        description: "Reply to a message in a thread",
        parameters: {
          resource: "message",
          operation: "post",
          select: "id",
          channelId: "={{ $json.channel }}",
          messageType: "text",
          text: "This is a threaded reply",
          otherOptions: {
            thread_ts: "={{ $json.ts }}",
          },
        },
      },
      {
        name: "Update Message",
        description: "Update an existing message",
        parameters: {
          resource: "message",
          operation: "update",
          select: "id",
          channelId: "={{ $json.channel }}",
          timestamp: "={{ $json.ts }}",
          text: "Updated message content :pencil:",
        },
      },
      {
        name: "Get Channel Members",
        description: "List all members of a channel",
        parameters: {
          resource: "channel",
          operation: "member",
          select: "name",
          channelId: "#general",
        },
      },
      {
        name: "Create Channel",
        description: "Create a new public channel",
        parameters: {
          resource: "channel",
          operation: "create",
          channelId: "new-project-channel",
          additionalFields: {
            isPrivate: false,
          },
        },
      },
      {
        name: "Add Reaction",
        description: "Add an emoji reaction to a message",
        parameters: {
          resource: "reaction",
          operation: "add",
          select: "id",
          channelId: "={{ $json.channel }}",
          timestamp: "={{ $json.ts }}",
          emojiCode: "thumbsup",
        },
      },
      {
        name: "Upload File",
        description: "Upload a file to a channel",
        parameters: {
          resource: "file",
          operation: "upload",
          channelId: "#files",
          binaryPropertyName: "data",
          options: {
            fileName: "report.pdf",
            initialComment: "Here's the latest report",
          },
        },
      },
      {
        name: "Get User Info",
        description: "Get information about a user",
        parameters: {
          resource: "user",
          operation: "getUser",
          user: "={{ $json.user_id }}",
        },
      },
      {
        name: "Search Messages",
        description: "Search for messages containing specific text",
        parameters: {
          resource: "message",
          operation: "search",
          query: "from:@user in:#channel keyword",
          options: {
            sort: "timestamp",
            sortDirection: "desc",
          },
        },
      },
    ],
  },

  "n8n-nodes-base.gmail": {
    type: "n8n-nodes-base.gmail",
    displayName: "Gmail",
    description: "Send, receive, and manage emails, drafts, labels, and threads via Gmail",
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
          { name: "Draft", value: "draft", description: "Create and manage email drafts" },
          { name: "Label", value: "label", description: "Create and manage Gmail labels" },
          { name: "Message", value: "message", description: "Send, get, and manage emails" },
          { name: "Thread", value: "thread", description: "Manage email threads/conversations" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "send",
        description: "Operation to perform. Available operations depend on resource.",
        options: [
          // Message operations
          { name: "Send", value: "send", description: "Send a new email (Message resource)" },
          { name: "Reply", value: "reply", description: "Reply to an email (Message resource)" },
          { name: "Get", value: "get", description: "Get a specific email (Message resource)" },
          { name: "Get Many", value: "getAll", description: "Get multiple emails (Message resource)" },
          { name: "Delete", value: "delete", description: "Delete an email (Message resource)" },
          { name: "Mark as Read", value: "markAsRead", description: "Mark email as read (Message resource)" },
          { name: "Mark as Unread", value: "markAsUnread", description: "Mark email as unread (Message resource)" },
          { name: "Add Labels", value: "addLabels", description: "Add labels to email (Message resource)" },
          { name: "Remove Labels", value: "removeLabels", description: "Remove labels from email (Message resource)" },
          // Draft operations
          { name: "Create", value: "create", description: "Create a draft (Draft resource)" },
          // Label operations (uses create, delete, get, getAll)
          // Thread operations
          { name: "Trash", value: "trash", description: "Move thread to trash (Thread resource)" },
          { name: "Untrash", value: "untrash", description: "Remove thread from trash (Thread resource)" },
        ],
      },
      {
        name: "sendTo",
        type: "string",
        required: false,
        description: "Email recipient(s). Separate multiple addresses with commas.",
        placeholder: "recipient@example.com, another@example.com",
      },
      {
        name: "subject",
        type: "string",
        required: false,
        description: "Email subject line",
        placeholder: "Hello from n8n",
      },
      {
        name: "message",
        type: "string",
        required: false,
        description: "Email body content. Can be plain text or HTML.",
        placeholder: "Your message content here",
      },
      {
        name: "emailType",
        type: "options",
        required: false,
        default: "text",
        description: "Email body format",
        options: [
          { name: "Text", value: "text", description: "Plain text email" },
          { name: "HTML", value: "html", description: "HTML formatted email" },
        ],
      },
      {
        name: "messageId",
        type: "string",
        required: false,
        description: "Message ID for get, delete, reply, or label operations",
        placeholder: "18a1b2c3d4e5f6g7",
      },
      {
        name: "threadId",
        type: "string",
        required: false,
        description: "Thread ID for thread operations",
      },
      {
        name: "labelIds",
        type: "string",
        required: false,
        description: "Label IDs to add/remove. Comma-separated for multiple.",
        placeholder: "Label_1, Label_2",
      },
      {
        name: "filters",
        type: "collection",
        required: false,
        description: "Search filters for getAll: q (Gmail search query), labelIds, includeSpamTrash, maxResults",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: cc, bcc, replyTo, attachments, senderName",
      },
    ],
    credentials: [
      {
        name: "gmailOAuth2",
        required: true,
        description: "Gmail OAuth2 credentials. Requires Gmail API scope.",
      },
    ],
    examples: [
      {
        name: "Send Email",
        description: "Send a plain text email",
        parameters: {
          resource: "message",
          operation: "send",
          sendTo: "={{ $json.email }}",
          subject: "Order Confirmation #{{ $json.orderId }}",
          message: "Thank you for your order!\n\nOrder ID: {{ $json.orderId }}\nTotal: ${{ $json.total }}",
          emailType: "text",
        },
      },
      {
        name: "Send HTML Email",
        description: "Send a formatted HTML email",
        parameters: {
          resource: "message",
          operation: "send",
          sendTo: "={{ $json.email }}",
          subject: "Welcome to Our Service",
          message: `<html>
<body>
<h1>Welcome, {{ $json.name }}!</h1>
<p>Thank you for signing up.</p>
<a href="{{ $json.confirmUrl }}">Confirm your email</a>
</body>
</html>`,
          emailType: "html",
          options: {
            senderName: "My Company",
          },
        },
      },
      {
        name: "Send with Attachments",
        description: "Send email with file attachments",
        parameters: {
          resource: "message",
          operation: "send",
          sendTo: "={{ $json.email }}",
          subject: "Report Attached",
          message: "Please find the report attached.",
          options: {
            attachmentsUi: {
              attachmentsBinary: [
                { property: "data" },
              ],
            },
          },
        },
      },
      {
        name: "Reply to Email",
        description: "Reply to an existing email thread",
        parameters: {
          resource: "message",
          operation: "reply",
          messageId: "={{ $json.messageId }}",
          message: "Thank you for your message. We'll get back to you shortly.",
        },
      },
      {
        name: "Get Recent Emails",
        description: "Get emails from inbox",
        parameters: {
          resource: "message",
          operation: "getAll",
          returnAll: false,
          limit: 10,
          filters: {
            q: "is:unread",
            labelIds: ["INBOX"],
          },
        },
      },
      {
        name: "Search Emails",
        description: "Search emails with Gmail query",
        parameters: {
          resource: "message",
          operation: "getAll",
          returnAll: false,
          limit: 50,
          filters: {
            q: "from:notifications@github.com subject:pull request after:2024/01/01",
          },
        },
      },
      {
        name: "Mark as Read",
        description: "Mark an email as read",
        parameters: {
          resource: "message",
          operation: "markAsRead",
          messageId: "={{ $json.id }}",
        },
      },
      {
        name: "Add Label",
        description: "Add a label to an email",
        parameters: {
          resource: "message",
          operation: "addLabels",
          messageId: "={{ $json.id }}",
          labelIds: "Label_processed",
        },
      },
      {
        name: "Create Draft",
        description: "Create a draft email",
        parameters: {
          resource: "draft",
          operation: "create",
          sendTo: "={{ $json.email }}",
          subject: "Draft: {{ $json.subject }}",
          message: "This is a draft message.",
        },
      },
      {
        name: "Get All Drafts",
        description: "Get all draft emails",
        parameters: {
          resource: "draft",
          operation: "getAll",
          returnAll: true,
        },
      },
      {
        name: "Create Label",
        description: "Create a new Gmail label",
        parameters: {
          resource: "label",
          operation: "create",
          name: "n8n-processed",
          options: {
            labelListVisibility: "labelShow",
            messageListVisibility: "show",
          },
        },
      },
      {
        name: "Get Thread",
        description: "Get all messages in a thread",
        parameters: {
          resource: "thread",
          operation: "get",
          threadId: "={{ $json.threadId }}",
        },
      },
      {
        name: "Trash Thread",
        description: "Move entire thread to trash",
        parameters: {
          resource: "thread",
          operation: "trash",
          threadId: "={{ $json.threadId }}",
        },
      },
    ],
  },

  "n8n-nodes-base.googleSheets": {
    type: "n8n-nodes-base.googleSheets",
    displayName: "Google Sheets",
    description: "Read, write, update, and manage data in Google Sheets spreadsheets",
    category: "action",
    typeVersion: 4.5,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "sheet",
        description: "Resource to operate on",
        options: [
          { name: "Document", value: "document", description: "Create or delete spreadsheets" },
          { name: "Sheet Within Document", value: "sheet", description: "Row and sheet operations" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "read",
        description: "Operation to perform",
        options: [
          // Document operations
          { name: "Create Spreadsheet", value: "create", description: "Create a new spreadsheet" },
          { name: "Delete Spreadsheet", value: "deleteSpreadsheet", description: "Delete a spreadsheet" },
          // Sheet/Row operations
          { name: "Append Row", value: "append", description: "Append a new row at the end" },
          { name: "Append or Update Row", value: "appendOrUpdate", description: "Append or update row based on matching column" },
          { name: "Clear Sheet", value: "clear", description: "Clear all data from sheet" },
          { name: "Create Sheet", value: "createSheet", description: "Create a new sheet within spreadsheet" },
          { name: "Delete Row", value: "delete", description: "Delete rows by row number" },
          { name: "Delete Sheet", value: "deleteSheet", description: "Delete a sheet from spreadsheet" },
          { name: "Get Many Rows", value: "read", description: "Read multiple rows from sheet" },
          { name: "Update Row", value: "update", description: "Update an existing row" },
        ],
      },
      {
        name: "documentId",
        type: "string",
        required: true,
        description: "Google Sheet document ID. Find in URL: docs.google.com/spreadsheets/d/{documentId}/edit",
        placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      },
      {
        name: "sheetName",
        type: "string",
        required: true,
        description: "Sheet name (tab name) or gid number. Use 'gid=0' for first sheet.",
        placeholder: "Sheet1",
      },
      {
        name: "columns",
        type: "fixedCollection",
        required: false,
        description: "Column values to write. Can use 'mappingMode' to auto-map from input or define manually.",
      },
      {
        name: "dataMode",
        type: "options",
        required: false,
        default: "autoMapInputData",
        description: "How to map input data to columns",
        options: [
          { name: "Auto-Map Input Data", value: "autoMapInputData", description: "Automatically map input fields to columns with matching headers" },
          { name: "Map Each Column Manually", value: "defineBelow", description: "Manually define each column value" },
          { name: "Raw Data", value: "raw", description: "Send data as raw array of arrays" },
        ],
      },
      {
        name: "matchingColumns",
        type: "string",
        required: false,
        description: "Column name(s) to match for update operations. Comma-separated for multiple columns.",
        placeholder: "Email",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: headerRow, range, valueInputOption, valueRenderOption, dateTimeRenderOption",
      },
    ],
    credentials: [
      {
        name: "googleSheetsOAuth2Api",
        required: true,
        description: "Google Sheets OAuth2 credentials",
      },
      {
        name: "serviceAccountCredentials",
        required: false,
        description: "Google Service Account credentials (alternative to OAuth2)",
      },
    ],
    examples: [
      {
        name: "Append Row (Auto-Map)",
        description: "Append a row, auto-mapping input fields to sheet columns",
        parameters: {
          resource: "sheet",
          operation: "append",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          dataMode: "autoMapInputData",
          options: {
            headerRow: 1,
          },
        },
      },
      {
        name: "Append Row (Manual)",
        description: "Append a row with manually defined column values",
        parameters: {
          resource: "sheet",
          operation: "append",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          dataMode: "defineBelow",
          columns: {
            mappingMode: "defineBelow",
            values: {
              Name: "={{ $json.name }}",
              Email: "={{ $json.email }}",
              "Created At": "={{ $now.toISODate() }}",
              Status: "New",
            },
          },
        },
      },
      {
        name: "Read All Rows",
        description: "Read all rows from a sheet",
        parameters: {
          resource: "sheet",
          operation: "read",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          options: {
            headerRow: 1,
          },
        },
      },
      {
        name: "Read Specific Range",
        description: "Read rows from a specific range",
        parameters: {
          resource: "sheet",
          operation: "read",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          options: {
            range: "A2:D100",
            headerRow: 1,
          },
        },
      },
      {
        name: "Update Row by Matching Column",
        description: "Update row where Email column matches",
        parameters: {
          resource: "sheet",
          operation: "update",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          matchingColumns: "Email",
          dataMode: "autoMapInputData",
        },
      },
      {
        name: "Append or Update",
        description: "Append new row or update if exists (based on Email)",
        parameters: {
          resource: "sheet",
          operation: "appendOrUpdate",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          matchingColumns: "Email",
          dataMode: "autoMapInputData",
        },
      },
      {
        name: "Create New Spreadsheet",
        description: "Create a new Google Spreadsheet",
        parameters: {
          resource: "document",
          operation: "create",
          title: "={{ 'Report - ' + $now.toISODate() }}",
          options: {
            sheetNames: "Data, Summary",
          },
        },
      },
      {
        name: "Clear Sheet",
        description: "Clear all data from a sheet (keeps headers)",
        parameters: {
          resource: "sheet",
          operation: "clear",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          options: {
            startRowNumber: 2,
          },
        },
      },
      {
        name: "Delete Rows",
        description: "Delete specific row numbers",
        parameters: {
          resource: "sheet",
          operation: "delete",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
          startRowNumber: 5,
          numberOfRows: 3,
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

  // ============ AIRTABLE NODE ============

  "n8n-nodes-base.airtable": {
    type: "n8n-nodes-base.airtable",
    displayName: "Airtable",
    description: "Read, create, update, delete, and search records in Airtable bases",
    category: "action",
    typeVersion: 2.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "record",
        description: "Resource to operate on",
        options: [
          { name: "Record", value: "record", description: "CRUD operations on table records" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a new record" },
          { name: "Create or Update", value: "upsert", description: "Create or update record based on field match" },
          { name: "Delete", value: "delete", description: "Delete a record" },
          { name: "Get", value: "get", description: "Get a record by ID" },
          { name: "Search", value: "search", description: "Search records with filters or get all" },
          { name: "Update", value: "update", description: "Update an existing record" },
        ],
      },
      {
        name: "base",
        type: "string",
        required: true,
        description: "Airtable Base ID. Find in URL: airtable.com/{baseId}/... or use resourceLocator",
        placeholder: "appXXXXXXXXXXXXXX",
      },
      {
        name: "table",
        type: "string",
        required: true,
        description: "Table name or ID within the base",
        placeholder: "Table 1 or tblXXXXXXXXXXXXXX",
      },
      {
        name: "id",
        type: "string",
        required: false,
        description: "Record ID for get, update, delete operations",
        placeholder: "recXXXXXXXXXXXXXX",
      },
      {
        name: "columns",
        type: "fixedCollection",
        required: false,
        description: "Field values to set. Map input data to Airtable columns.",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: typecast (auto-convert values), bulkSize, returnAll, limit, filterByFormula, sort, view",
      },
    ],
    credentials: [
      {
        name: "airtableTokenApi",
        required: true,
        description: "Airtable Personal Access Token. Create at airtable.com/create/tokens",
      },
      {
        name: "airtableOAuth2Api",
        required: false,
        description: "Airtable OAuth2 credentials (alternative)",
      },
    ],
    examples: [
      {
        name: "Create Record",
        description: "Create a new record in a table",
        parameters: {
          resource: "record",
          operation: "create",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          columns: {
            fieldValues: {
              Name: "={{ $json.name }}",
              Email: "={{ $json.email }}",
              Phone: "={{ $json.phone }}",
              Status: "Active",
            },
          },
          options: {
            typecast: true,
          },
        },
      },
      {
        name: "Get All Records",
        description: "Get all records from a table",
        parameters: {
          resource: "record",
          operation: "search",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          returnAll: true,
        },
      },
      {
        name: "Search with Filter",
        description: "Search records using Airtable formula",
        parameters: {
          resource: "record",
          operation: "search",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          returnAll: false,
          limit: 100,
          options: {
            filterByFormula: "{Status} = 'Active'",
            sort: [
              { field: "Created", direction: "desc" },
            ],
          },
        },
      },
      {
        name: "Search from View",
        description: "Get records from a specific view",
        parameters: {
          resource: "record",
          operation: "search",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          options: {
            view: "Active Contacts",
          },
        },
      },
      {
        name: "Get Record by ID",
        description: "Get a single record by its ID",
        parameters: {
          resource: "record",
          operation: "get",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          id: "={{ $json.airtable_id }}",
        },
      },
      {
        name: "Update Record",
        description: "Update fields on an existing record",
        parameters: {
          resource: "record",
          operation: "update",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          id: "={{ $json.id }}",
          columns: {
            fieldValues: {
              Status: "Updated",
              "Last Modified": "={{ $now.toISODate() }}",
            },
          },
        },
      },
      {
        name: "Upsert Record",
        description: "Create or update based on Email field",
        parameters: {
          resource: "record",
          operation: "upsert",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          columns: {
            fieldValues: {
              Name: "={{ $json.name }}",
              Email: "={{ $json.email }}",
              Phone: "={{ $json.phone }}",
            },
          },
          options: {
            fieldsToMergeOn: ["Email"],
            typecast: true,
          },
        },
      },
      {
        name: "Delete Record",
        description: "Delete a record by ID",
        parameters: {
          resource: "record",
          operation: "delete",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          id: "={{ $json.id }}",
        },
      },
      {
        name: "Bulk Create Records",
        description: "Create multiple records efficiently",
        parameters: {
          resource: "record",
          operation: "create",
          base: "appXXXXXXXXXXXXXX",
          table: "Contacts",
          columns: {
            fieldValues: {
              Name: "={{ $json.name }}",
              Email: "={{ $json.email }}",
            },
          },
          options: {
            bulkSize: 10,
            typecast: true,
          },
        },
      },
    ],
  },

  // ============ DISCORD NODE ============

  "n8n-nodes-base.discord": {
    type: "n8n-nodes-base.discord",
    displayName: "Discord",
    description: "Send messages, manage channels, and interact with Discord servers",
    category: "action",
    typeVersion: 2,
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
          { name: "Channel", value: "channel", description: "Manage Discord channels" },
          { name: "Member", value: "member", description: "Manage server members" },
          { name: "Message", value: "message", description: "Send and manage messages" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "send",
        description: "Operation to perform",
        options: [
          // Message operations
          { name: "Send", value: "send", description: "Send a message to a channel" },
          { name: "Delete", value: "delete", description: "Delete a message" },
          { name: "Get", value: "get", description: "Get message info" },
          { name: "Get Many", value: "getAll", description: "Get multiple messages" },
          // Channel operations
          { name: "Create", value: "create", description: "Create a channel" },
          { name: "Update", value: "update", description: "Update a channel" },
          // Member operations
          { name: "Get Member", value: "getMember", description: "Get member info" },
          { name: "Role Add", value: "roleAdd", description: "Add role to member" },
          { name: "Role Remove", value: "roleRemove", description: "Remove role from member" },
        ],
      },
      {
        name: "guildId",
        type: "string",
        required: false,
        description: "Discord Server (Guild) ID. Right-click server > Copy ID (enable Developer Mode)",
        placeholder: "123456789012345678",
      },
      {
        name: "channelId",
        type: "string",
        required: false,
        description: "Discord Channel ID. Right-click channel > Copy ID",
        placeholder: "123456789012345678",
      },
      {
        name: "content",
        type: "string",
        required: false,
        description: "Message content. Supports Discord markdown and mentions.",
        placeholder: "Hello from n8n!",
      },
      {
        name: "messageId",
        type: "string",
        required: false,
        description: "Message ID for get/delete operations",
      },
      {
        name: "userId",
        type: "string",
        required: false,
        description: "User ID for member operations",
      },
      {
        name: "roleId",
        type: "string",
        required: false,
        description: "Role ID for add/remove role operations",
      },
      {
        name: "embeds",
        type: "fixedCollection",
        required: false,
        description: "Rich embeds to include with the message (title, description, color, fields, footer, etc.)",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: tts, files (attachments), flags",
      },
    ],
    credentials: [
      {
        name: "discordBotApi",
        required: true,
        description: "Discord Bot Token. Create at discord.com/developers/applications",
      },
      {
        name: "discordOAuth2Api",
        required: false,
        description: "Discord OAuth2 credentials",
      },
      {
        name: "discordWebhookApi",
        required: false,
        description: "Discord Webhook URL (for simple message sending only)",
      },
    ],
    examples: [
      {
        name: "Send Simple Message",
        description: "Send a text message to a channel",
        parameters: {
          resource: "message",
          operation: "send",
          channelId: "123456789012345678",
          content: "Hello from n8n! :wave:",
        },
      },
      {
        name: "Send Rich Embed",
        description: "Send a message with rich embed",
        parameters: {
          resource: "message",
          operation: "send",
          channelId: "123456789012345678",
          content: "",
          embeds: {
            values: [
              {
                title: "Deployment Complete",
                description: "Your application has been deployed successfully.",
                color: "00FF00",
                fields: [
                  { name: "Project", value: "={{ $json.project }}", inline: true },
                  { name: "Version", value: "={{ $json.version }}", inline: true },
                  { name: "Environment", value: "={{ $json.env }}", inline: true },
                ],
                footer: {
                  text: "Deployed via n8n automation",
                },
                timestamp: "={{ $now.toISO() }}",
              },
            ],
          },
        },
      },
      {
        name: "Send Alert Message",
        description: "Send an alert with mention",
        parameters: {
          resource: "message",
          operation: "send",
          channelId: "123456789012345678",
          content: "@here :warning: **Alert**: {{ $json.alertMessage }}",
        },
      },
      {
        name: "Send with Buttons",
        description: "Send message with action buttons",
        parameters: {
          resource: "message",
          operation: "send",
          channelId: "123456789012345678",
          content: "Please confirm your action:",
          components: [
            {
              type: 1,
              components: [
                { type: 2, style: 3, label: "Confirm", custom_id: "confirm" },
                { type: 2, style: 4, label: "Cancel", custom_id: "cancel" },
              ],
            },
          ],
        },
      },
      {
        name: "Delete Message",
        description: "Delete a specific message",
        parameters: {
          resource: "message",
          operation: "delete",
          channelId: "={{ $json.channel_id }}",
          messageId: "={{ $json.message_id }}",
        },
      },
      {
        name: "Get Channel Messages",
        description: "Get recent messages from a channel",
        parameters: {
          resource: "message",
          operation: "getAll",
          channelId: "123456789012345678",
          returnAll: false,
          limit: 50,
        },
      },
      {
        name: "Add Role to Member",
        description: "Add a role to a server member",
        parameters: {
          resource: "member",
          operation: "roleAdd",
          guildId: "123456789012345678",
          userId: "={{ $json.user_id }}",
          roleId: "987654321098765432",
        },
      },
      {
        name: "Get Member Info",
        description: "Get information about a server member",
        parameters: {
          resource: "member",
          operation: "getMember",
          guildId: "123456789012345678",
          userId: "={{ $json.user_id }}",
        },
      },
    ],
  },

  // ============ TELEGRAM NODES ============

  "n8n-nodes-base.telegramTrigger": {
    type: "n8n-nodes-base.telegramTrigger",
    displayName: "Telegram Trigger",
    description: "Starts workflow when a Telegram message is received. Create a bot via @BotFather first.",
    category: "trigger",
    typeVersion: 1.1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "updates",
        type: "options",
        required: true,
        default: "message",
        description: "Which updates to listen for",
        options: [
          { name: "Message", value: "message", description: "New incoming message" },
          { name: "Edited Message", value: "edited_message", description: "Message was edited" },
          { name: "Channel Post", value: "channel_post", description: "New channel post" },
          { name: "Callback Query", value: "callback_query", description: "Inline button was pressed" },
          { name: "Pre Checkout Query", value: "pre_checkout_query", description: "Payment pre-checkout" },
          { name: "*", value: "*", description: "All updates" },
        ],
      },
    ],
    credentials: [
      {
        name: "telegramApi",
        required: true,
        description: "Telegram Bot API token from @BotFather",
      },
    ],
    examples: [
      {
        name: "Listen for Messages",
        description: "Trigger on any new message to the bot",
        parameters: {
          updates: ["message"],
        },
      },
      {
        name: "Listen for Button Clicks",
        description: "Trigger when inline keyboard button is pressed",
        parameters: {
          updates: ["callback_query"],
        },
      },
    ],
  },

  "n8n-nodes-base.telegram": {
    type: "n8n-nodes-base.telegram",
    displayName: "Telegram",
    description: "Send messages, photos, files, manage chats, and interact with Telegram Bot API",
    category: "action",
    typeVersion: 1.2,
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
          { name: "Chat", value: "chat", description: "Get chat info, members, or manage chat settings" },
          { name: "Callback", value: "callback", description: "Answer callback queries from inline keyboards" },
          { name: "File", value: "file", description: "Get file info for downloading" },
          { name: "Message", value: "message", description: "Send, edit, delete, or pin messages" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "sendMessage",
        description: "Operation to perform. Available operations depend on resource.",
        options: [
          // Chat operations
          { name: "Get", value: "get", description: "Get chat information (Chat resource)" },
          { name: "Get Administrators", value: "getAdministrators", description: "Get list of chat admins (Chat resource)" },
          { name: "Get Member", value: "getChatMember", description: "Get info about a chat member (Chat resource)" },
          { name: "Leave", value: "leaveChat", description: "Leave a group, supergroup, or channel (Chat resource)" },
          { name: "Set Description", value: "setDescription", description: "Set chat description (Chat resource)" },
          { name: "Set Title", value: "setTitle", description: "Set chat title (Chat resource)" },
          // Callback operations
          { name: "Answer Query", value: "answerQuery", description: "Answer callback query from inline keyboard (Callback resource)" },
          { name: "Answer Inline Query", value: "answerInlineQuery", description: "Answer inline query from inline bot (Callback resource)" },
          // File operations
          { name: "Get File", value: "getFile", description: "Get file info for downloading (File resource)" },
          // Message operations
          { name: "Delete Message", value: "deleteMessage", description: "Delete a message (Message resource)" },
          { name: "Edit Message Text", value: "editMessageText", description: "Edit text of a message (Message resource)" },
          { name: "Pin Message", value: "pinChatMessage", description: "Pin a message in chat (Message resource)" },
          { name: "Send Animation", value: "sendAnimation", description: "Send GIF or video animation (Message resource)" },
          { name: "Send Audio", value: "sendAudio", description: "Send audio file (Message resource)" },
          { name: "Send Chat Action", value: "sendChatAction", description: "Show typing, uploading indicator (Message resource)" },
          { name: "Send Document", value: "sendDocument", description: "Send a file/document (Message resource)" },
          { name: "Send Location", value: "sendLocation", description: "Send GPS location (Message resource)" },
          { name: "Send Media Group", value: "sendMediaGroup", description: "Send album of photos/videos (Message resource)" },
          { name: "Send Message", value: "sendMessage", description: "Send text message (Message resource)" },
          { name: "Send Photo", value: "sendPhoto", description: "Send a photo (Message resource)" },
          { name: "Send Sticker", value: "sendSticker", description: "Send a sticker (Message resource)" },
          { name: "Send Video", value: "sendVideo", description: "Send a video (Message resource)" },
          { name: "Unpin Message", value: "unpinChatMessage", description: "Unpin a message (Message resource)" },
        ],
      },
      {
        name: "chatId",
        type: "string",
        required: true,
        description: "Chat ID. For replies use {{ $json.message.chat.id }}. Can be numeric ID or @username for public chats.",
        placeholder: "123456789 or @channelname",
      },
      {
        name: "text",
        type: "string",
        required: false,
        description: "Message text. Supports Markdown or HTML based on parse_mode setting.",
        placeholder: "Hello from n8n!",
      },
      {
        name: "messageId",
        type: "string",
        required: false,
        description: "Message ID for edit, delete, pin, unpin operations. Get from {{ $json.message.message_id }}",
      },
      {
        name: "userId",
        type: "string",
        required: false,
        description: "User ID for getChatMember operation",
      },
      {
        name: "fileId",
        type: "string",
        required: false,
        description: "File ID for getFile operation. Get from message.photo[].file_id, message.document.file_id, etc.",
      },
      {
        name: "queryId",
        type: "string",
        required: false,
        description: "Query ID for answerQuery. Get from {{ $json.callback_query.id }}",
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Name of binary property containing file to send (for sendPhoto, sendDocument, etc.)",
      },
      {
        name: "action",
        type: "options",
        required: false,
        default: "typing",
        description: "Chat action to show (for sendChatAction)",
        options: [
          { name: "Typing", value: "typing" },
          { name: "Upload Photo", value: "upload_photo" },
          { name: "Record Video", value: "record_video" },
          { name: "Upload Video", value: "upload_video" },
          { name: "Record Audio", value: "record_voice" },
          { name: "Upload Audio", value: "upload_voice" },
          { name: "Upload Document", value: "upload_document" },
          { name: "Find Location", value: "find_location" },
        ],
      },
      {
        name: "additionalFields",
        type: "collection",
        required: false,
        description: "Additional options: parse_mode (Markdown|HTML), reply_markup (inline_keyboard, keyboard), disable_notification, protect_content, reply_to_message_id, caption",
      },
    ],
    credentials: [
      {
        name: "telegramApi",
        required: true,
        description: "Telegram Bot API token. Create a bot via @BotFather to get the token.",
      },
    ],
    examples: [
      {
        name: "Send Text Message",
        description: "Send a simple text message",
        parameters: {
          resource: "message",
          operation: "sendMessage",
          chatId: "={{ $json.message.chat.id }}",
          text: "Hello! Your message was received.",
        },
      },
      {
        name: "Send Markdown Message",
        description: "Send formatted message with Markdown",
        parameters: {
          resource: "message",
          operation: "sendMessage",
          chatId: "={{ $json.message.chat.id }}",
          text: "*Bold* and _italic_ text\n\n`code block`\n\n```python\nprint('Hello')\n```\n\n[Link](https://example.com)",
          additionalFields: {
            parse_mode: "Markdown",
          },
        },
      },
      {
        name: "Send with Inline Keyboard",
        description: "Send message with clickable buttons",
        parameters: {
          resource: "message",
          operation: "sendMessage",
          chatId: "={{ $json.message.chat.id }}",
          text: "Choose an option:",
          additionalFields: {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Confirm", callback_data: "confirm" },
                  { text: "❌ Cancel", callback_data: "cancel" },
                ],
                [
                  { text: "🔗 Open Link", url: "https://example.com" },
                ],
              ],
            },
          },
        },
      },
      {
        name: "Send with Reply Keyboard",
        description: "Send message with reply keyboard",
        parameters: {
          resource: "message",
          operation: "sendMessage",
          chatId: "={{ $json.message.chat.id }}",
          text: "Select a quick reply:",
          additionalFields: {
            reply_markup: {
              keyboard: [
                [{ text: "Option 1" }, { text: "Option 2" }],
                [{ text: "Option 3" }],
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          },
        },
      },
      {
        name: "Edit Message",
        description: "Edit an existing message's text",
        parameters: {
          resource: "message",
          operation: "editMessageText",
          chatId: "={{ $json.message.chat.id }}",
          messageId: "={{ $json.message.message_id }}",
          text: "Message has been updated!",
          additionalFields: {
            parse_mode: "Markdown",
          },
        },
      },
      {
        name: "Delete Message",
        description: "Delete a message",
        parameters: {
          resource: "message",
          operation: "deleteMessage",
          chatId: "={{ $json.message.chat.id }}",
          messageId: "={{ $json.message.message_id }}",
        },
      },
      {
        name: "Send Photo",
        description: "Send a photo from binary data",
        parameters: {
          resource: "message",
          operation: "sendPhoto",
          chatId: "={{ $json.message.chat.id }}",
          binaryPropertyName: "data",
          additionalFields: {
            caption: "Photo caption here",
            parse_mode: "Markdown",
          },
        },
      },
      {
        name: "Send Document",
        description: "Send a file as document",
        parameters: {
          resource: "message",
          operation: "sendDocument",
          chatId: "={{ $json.message.chat.id }}",
          binaryPropertyName: "data",
          additionalFields: {
            caption: "Here's your file",
            filename: "report.pdf",
          },
        },
      },
      {
        name: "Get File for Download",
        description: "Get file path to download (use with HTTP Request)",
        parameters: {
          resource: "file",
          operation: "getFile",
          fileId: "={{ $json.message.photo.slice(-1)[0].file_id }}",
        },
      },
      {
        name: "Answer Callback Query",
        description: "Respond to inline button press",
        parameters: {
          resource: "callback",
          operation: "answerQuery",
          queryId: "={{ $json.callback_query.id }}",
          additionalFields: {
            text: "Button clicked!",
            show_alert: false,
          },
        },
      },
      {
        name: "Show Typing Indicator",
        description: "Show 'typing...' status in chat",
        parameters: {
          resource: "message",
          operation: "sendChatAction",
          chatId: "={{ $json.message.chat.id }}",
          action: "typing",
        },
      },
      {
        name: "Get Chat Info",
        description: "Get information about a chat",
        parameters: {
          resource: "chat",
          operation: "get",
          chatId: "={{ $json.message.chat.id }}",
        },
      },
      {
        name: "Get Chat Administrators",
        description: "Get list of chat administrators",
        parameters: {
          resource: "chat",
          operation: "getAdministrators",
          chatId: "={{ $json.message.chat.id }}",
        },
      },
      {
        name: "Pin Message",
        description: "Pin a message in the chat",
        parameters: {
          resource: "message",
          operation: "pinChatMessage",
          chatId: "={{ $json.message.chat.id }}",
          messageId: "={{ $json.message.message_id }}",
          additionalFields: {
            disable_notification: true,
          },
        },
      },
      {
        name: "Send Location",
        description: "Send GPS coordinates",
        parameters: {
          resource: "message",
          operation: "sendLocation",
          chatId: "={{ $json.message.chat.id }}",
          latitude: "={{ $json.latitude }}",
          longitude: "={{ $json.longitude }}",
        },
      },
    ],
  },

  // ============ NOTION NODE ============

  "n8n-nodes-base.notion": {
    type: "n8n-nodes-base.notion",
    displayName: "Notion",
    description: "Create, read, update pages, databases, and blocks in Notion",
    category: "action",
    typeVersion: 2.2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "databasePage",
        description: "Resource to operate on",
        options: [
          { name: "Block", value: "block", description: "Append or retrieve page blocks/content" },
          { name: "Database", value: "database", description: "Get, list, or search databases" },
          { name: "Database Page", value: "databasePage", description: "CRUD operations on database entries (rows)" },
          { name: "Page", value: "page", description: "Create, archive, or search pages" },
          { name: "User", value: "user", description: "Get user information" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform. Available operations depend on resource.",
        options: [
          // Block operations
          { name: "Append", value: "append", description: "Append blocks to a page (Block resource)" },
          { name: "Get All", value: "getAll", description: "Get all children blocks of a page (Block resource)" },
          // Database operations
          { name: "Get", value: "get", description: "Get a database by ID (Database resource)" },
          { name: "Search", value: "search", description: "Search databases by title (Database resource)" },
          // DatabasePage operations
          { name: "Create", value: "create", description: "Create a new database entry (DatabasePage resource)" },
          { name: "Update", value: "update", description: "Update a database entry (DatabasePage resource)" },
          // Page operations
          { name: "Archive", value: "archive", description: "Archive a page (Page resource)" },
          // User operations - uses get, getAll
        ],
      },
      {
        name: "databaseId",
        type: "string",
        required: false,
        description: "Database ID. Find in database URL: notion.so/{workspace}/{database_id}?v=... Required for database and databasePage operations.",
        placeholder: "a1b2c3d4e5f6...",
      },
      {
        name: "pageId",
        type: "string",
        required: false,
        description: "Page ID for page/block operations. Find in page URL after the workspace name.",
        placeholder: "a1b2c3d4e5f6...",
      },
      {
        name: "blockId",
        type: "string",
        required: false,
        description: "Block ID for block operations. Use page ID to get root blocks.",
      },
      {
        name: "title",
        type: "string",
        required: false,
        description: "Page title (for page create operation)",
      },
      {
        name: "propertiesUi",
        type: "fixedCollection",
        required: false,
        description: "Properties to set for database page. Property types: title, richText, number, select, multiSelect, date, checkbox, url, email, phone, files, relation, people, status.",
      },
      {
        name: "blockUi",
        type: "fixedCollection",
        required: false,
        description: "Blocks to append. Block types: paragraph, heading_1, heading_2, heading_3, bulleted_list_item, numbered_list_item, to_do, toggle, code, quote, callout, divider.",
      },
      {
        name: "filterType",
        type: "options",
        required: false,
        default: "none",
        description: "How to filter database query results",
        options: [
          { name: "None", value: "none" },
          { name: "Define Below", value: "manual", description: "Build filter with UI" },
          { name: "JSON", value: "json", description: "Provide filter as JSON" },
        ],
      },
      {
        name: "filters",
        type: "fixedCollection",
        required: false,
        description: "Filter conditions for database queries. Use property name and filter type (equals, contains, starts_with, etc.)",
      },
      {
        name: "sortUi",
        type: "fixedCollection",
        required: false,
        description: "Sort results by property or timestamp (created_time, last_edited_time)",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: returnAll, limit, simple (simplified output), downloadFiles",
      },
    ],
    credentials: [
      {
        name: "notionApi",
        required: true,
        description: "Notion API integration token. Create at notion.so/my-integrations. Must share pages/databases with integration.",
      },
    ],
    examples: [
      {
        name: "Create Database Entry",
        description: "Add a new row to a Notion database with various property types",
        parameters: {
          resource: "databasePage",
          operation: "create",
          databaseId: "your-database-id",
          propertiesUi: {
            propertyValues: [
              { key: "Name", type: "title", title: "={{ $json.name }}" },
              { key: "Status", type: "select", selectValue: "In Progress" },
              { key: "Due Date", type: "date", date: "={{ $json.dueDate }}" },
              { key: "Amount", type: "number", number: "={{ $json.amount }}" },
              { key: "Tags", type: "multiSelect", multiSelectValue: ["urgent", "review"] },
              { key: "Completed", type: "checkbox", checkboxValue: false },
              { key: "Notes", type: "richText", richText: "={{ $json.notes }}" },
              { key: "Website", type: "url", urlValue: "={{ $json.url }}" },
            ],
          },
        },
      },
      {
        name: "Query Database with Filter",
        description: "Get entries where Status equals Active",
        parameters: {
          resource: "databasePage",
          operation: "getAll",
          databaseId: "your-database-id",
          returnAll: false,
          limit: 50,
          filterType: "manual",
          filters: {
            conditions: [
              {
                property: "Status",
                type: "select",
                condition: "equals",
                value: "Active",
              },
            ],
          },
          sortUi: {
            sortValues: [
              { property: "Due Date", direction: "ascending" },
            ],
          },
        },
      },
      {
        name: "Query Database with JSON Filter",
        description: "Complex filter using JSON format",
        parameters: {
          resource: "databasePage",
          operation: "getAll",
          databaseId: "your-database-id",
          filterType: "json",
          filters: {
            json: `{
  "and": [
    { "property": "Status", "select": { "equals": "Active" } },
    { "property": "Due Date", "date": { "on_or_before": "{{ $now.toISODate() }}" } }
  ]
}`,
          },
        },
      },
      {
        name: "Update Database Entry",
        description: "Update properties of an existing entry",
        parameters: {
          resource: "databasePage",
          operation: "update",
          pageId: "={{ $json.notion_page_id }}",
          propertiesUi: {
            propertyValues: [
              { key: "Status", type: "select", selectValue: "Completed" },
              { key: "Completed", type: "checkbox", checkboxValue: true },
            ],
          },
        },
      },
      {
        name: "Create Page with Content",
        description: "Create a page under a parent with blocks",
        parameters: {
          resource: "page",
          operation: "create",
          parentPageId: "parent-page-id",
          title: "={{ $json.title }}",
          blockUi: {
            blockValues: [
              { type: "heading_2", text: "Overview" },
              { type: "paragraph", text: "={{ $json.summary }}" },
              { type: "heading_2", text: "Details" },
              { type: "bulleted_list_item", text: "Item 1" },
              { type: "bulleted_list_item", text: "Item 2" },
              { type: "to_do", text: "Task to complete", checked: false },
            ],
          },
        },
      },
      {
        name: "Append Blocks to Page",
        description: "Add content blocks to an existing page",
        parameters: {
          resource: "block",
          operation: "append",
          blockId: "={{ $json.page_id }}",
          blockUi: {
            blockValues: [
              { type: "paragraph", text: "New paragraph added via automation" },
              { type: "callout", text: "Important note", icon: "💡" },
            ],
          },
        },
      },
      {
        name: "Get Page Blocks",
        description: "Retrieve all blocks/content from a page",
        parameters: {
          resource: "block",
          operation: "getAll",
          blockId: "={{ $json.page_id }}",
          returnAll: true,
        },
      },
      {
        name: "Search Databases",
        description: "Find databases by title",
        parameters: {
          resource: "database",
          operation: "search",
          searchText: "Projects",
        },
      },
      {
        name: "Get User Info",
        description: "Get information about a Notion user",
        parameters: {
          resource: "user",
          operation: "get",
          userId: "={{ $json.user_id }}",
        },
      },
      {
        name: "Archive Page",
        description: "Archive/soft-delete a page",
        parameters: {
          resource: "page",
          operation: "archive",
          pageId: "={{ $json.page_id }}",
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

  "expense-tracker-telegram-notion": {
    name: "Expense Tracker: Telegram Receipt to Notion",
    description: "Receive receipt images via Telegram, extract expense data with GPT-4o Vision, confirm with user if uncertain, and save to Notion database",
    nodes: [
      {
        name: "Telegram Trigger",
        type: "n8n-nodes-base.telegramTrigger",
        position: [0, 300],
        parameters: {
          updates: ["message"],
        },
      },
      {
        name: "Check Has Image",
        type: "n8n-nodes-base.if",
        position: [200, 300],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
            conditions: [
              {
                id: "has_photo",
                leftValue: "={{ $json.message.photo }}",
                rightValue: "",
                operator: { type: "array", operation: "notEmpty" },
              },
            ],
            combinator: "or",
          },
        },
      },
      {
        name: "Send No Image Error",
        type: "n8n-nodes-base.telegram",
        position: [400, 150],
        parameters: {
          operation: "sendMessage",
          chatId: "={{ $json.message.chat.id }}",
          text: "Please send a receipt image or screenshot. I can only process expenses from images.",
        },
      },
      {
        name: "Get File Info",
        type: "n8n-nodes-base.telegram",
        position: [400, 450],
        parameters: {
          operation: "getFile",
          fileId: "={{ $json.message.photo.slice(-1)[0].file_id }}",
        },
      },
      {
        name: "Download Image",
        type: "n8n-nodes-base.httpRequest",
        position: [600, 450],
        parameters: {
          method: "GET",
          url: "=https://api.telegram.org/file/bot{{ $credentials.telegramApi.accessToken }}/{{ $json.result.file_path }}",
          options: { response: { response: { responseFormat: "file" } } },
        },
      },
      {
        name: "Extract with GPT-4o Vision",
        type: "n8n-nodes-base.httpRequest",
        position: [800, 450],
        parameters: {
          method: "POST",
          url: "https://api.openai.com/v1/chat/completions",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "openAiApi",
          sendHeaders: true,
          headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
          sendBody: true,
          specifyBody: "json",
          jsonBody: `={
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert receipt analyzer. Extract expense data from receipt images. Return ONLY valid JSON."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this receipt and extract:\\n- date (YYYY-MM-DD)\\n- description (brief, max 100 chars)\\n- amount (number only)\\n- currency (3-letter code)\\n- category (Groceries|Restaurants|Gas|Transportation|Uber|Amazon|Netflix|Subscriptions|Utilities|Healthcare|Entertainment|Shopping|Travel|Education|Insurance|Rent|Other)\\n- type (Expense|Reimbursable)\\n- merchant (store name)\\n- payment_method (Credit Card|Debit Card|Cash|PayPal|Apple Pay|Google Pay|Bank Transfer|Other)\\n- confidence (0-1, your certainty)\\n- notes (any uncertainties)\\n\\nReturn JSON only."
        },
        {
          "type": "image_url",
          "image_url": { "url": "data:image/jpeg;base64,{{ $binary.data.data }}" }
        }
      ]
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.1
}`,
        },
      },
      {
        name: "Parse AI Response",
        type: "n8n-nodes-base.code",
        position: [1000, 450],
        parameters: {
          mode: "runOnceForAllItems",
          language: "javaScript",
          jsCode: `const items = $input.all();
const results = [];

for (const item of items) {
  try {
    const content = item.json.choices[0].message.content;
    let extracted;
    const jsonMatch = content.match(/\\\`\\\`\\\`json?\\n?([\\s\\S]*?)\\\`\\\`\\\`/);
    if (jsonMatch) {
      extracted = JSON.parse(jsonMatch[1]);
    } else {
      extracted = JSON.parse(content);
    }

    // Add chat info for replies
    extracted.chat_id = $node['Telegram Trigger'].json.message.chat.id;
    extracted.file_id = $node['Telegram Trigger'].json.message.photo?.slice(-1)[0]?.file_id;
    extracted.confidence = extracted.confidence || 0.5;
    extracted.date = extracted.date || new Date().toISOString().split('T')[0];
    extracted.currency = extracted.currency || 'USD';

    results.push({ json: extracted });
  } catch (error) {
    results.push({
      json: {
        error: true,
        message: error.message,
        confidence: 0,
        chat_id: $node['Telegram Trigger'].json.message.chat.id,
      }
    });
  }
}

return results;`,
        },
      },
      {
        name: "Confidence Check",
        type: "n8n-nodes-base.if",
        position: [1200, 450],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
            conditions: [
              {
                id: "high_confidence",
                leftValue: "={{ $json.confidence }}",
                rightValue: 0.85,
                operator: { type: "number", operation: "gte" },
              },
            ],
            combinator: "and",
          },
        },
      },
      {
        name: "Send Confirmation Request",
        type: "n8n-nodes-base.telegram",
        position: [1400, 600],
        parameters: {
          operation: "sendMessage",
          chatId: "={{ $json.chat_id }}",
          text: `=I extracted the following expense. Please confirm:

*Date:* {{ $json.date }}
*Merchant:* {{ $json.merchant }}
*Amount:* {{ $json.currency }} {{ $json.amount }}
*Category:* {{ $json.category }}
*Description:* {{ $json.description }}

Confidence: {{ Math.round($json.confidence * 100) }}%
{{ $json.notes ? '⚠️ ' + $json.notes : '' }}

Reply with:
✅ *confirm* - Save as-is
✏️ *edit amount=XX* - Correct a field
❌ *cancel* - Discard`,
          additionalFields: {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Confirm", callback_data: "confirm" },
                  { text: "❌ Cancel", callback_data: "cancel" },
                ],
              ],
            },
          },
        },
      },
      {
        name: "Create Notion Entry",
        type: "n8n-nodes-base.notion",
        position: [1600, 300],
        parameters: {
          resource: "databasePage",
          operation: "create",
          databaseId: "={{ $env.NOTION_EXPENSES_DB_ID }}",
          propertiesUi: {
            propertyValues: [
              { key: "Description", type: "title", title: "={{ $json.description }}" },
              { key: "Date", type: "date", date: "={{ $json.date }}" },
              { key: "Amount", type: "number", number: "={{ $json.amount }}" },
              { key: "Currency", type: "select", selectValue: "={{ $json.currency }}" },
              { key: "Category", type: "select", selectValue: "={{ $json.category }}" },
              { key: "Type", type: "select", selectValue: "={{ $json.type || 'Expense' }}" },
              { key: "Merchant", type: "richText", richText: "={{ $json.merchant }}" },
              { key: "Payment Method", type: "select", selectValue: "={{ $json.payment_method }}" },
              { key: "Notes", type: "richText", richText: "={{ $json.notes || '' }}" },
              { key: "Confidence", type: "number", number: "={{ Math.round($json.confidence * 100) }}" },
            ],
          },
        },
      },
      {
        name: "Send Success Message",
        type: "n8n-nodes-base.telegram",
        position: [1800, 300],
        parameters: {
          operation: "sendMessage",
          chatId: "={{ $node['Parse AI Response'].json.chat_id }}",
          text: `=✅ *Expense recorded!*

{{ $node['Parse AI Response'].json.description }}
*{{ $node['Parse AI Response'].json.currency }} {{ $node['Parse AI Response'].json.amount }}* - {{ $node['Parse AI Response'].json.category }}

Merchant: {{ $node['Parse AI Response'].json.merchant }}
Date: {{ $node['Parse AI Response'].json.date }}`,
          additionalFields: {
            parse_mode: "Markdown",
          },
        },
      },
    ],
    connections: {
      "Telegram Trigger": {
        main: [[{ node: "Check Has Image", type: "main", index: 0 }]],
      },
      "Check Has Image": {
        main: [
          [{ node: "Get File Info", type: "main", index: 0 }],
          [{ node: "Send No Image Error", type: "main", index: 0 }],
        ],
      },
      "Get File Info": {
        main: [[{ node: "Download Image", type: "main", index: 0 }]],
      },
      "Download Image": {
        main: [[{ node: "Extract with GPT-4o Vision", type: "main", index: 0 }]],
      },
      "Extract with GPT-4o Vision": {
        main: [[{ node: "Parse AI Response", type: "main", index: 0 }]],
      },
      "Parse AI Response": {
        main: [[{ node: "Confidence Check", type: "main", index: 0 }]],
      },
      "Confidence Check": {
        main: [
          [{ node: "Create Notion Entry", type: "main", index: 0 }],
          [{ node: "Send Confirmation Request", type: "main", index: 0 }],
        ],
      },
      "Create Notion Entry": {
        main: [[{ node: "Send Success Message", type: "main", index: 0 }]],
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
