/**
 * Golden-Path Workflow Examples
 *
 * Complete, annotated workflow patterns that demonstrate best practices.
 * Unlike templates (minimal starters), these are comprehensive reference
 * implementations showing correct configuration, connection patterns,
 * and real-world usage.
 */

export interface WorkflowExampleNode {
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  /** Annotation explaining why this node is configured this way */
  annotation?: string;
}

export interface WorkflowExample {
  name: string;
  description: string;
  /** Short label for the workflow pattern (e.g., "webhook→process→respond") */
  pattern: string;
  tags: string[];
  nodes: WorkflowExampleNode[];
  connections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }>;
  /** Human-readable connection flow annotations */
  connectionAnnotations?: string[];
}

export const WORKFLOW_EXAMPLES: Record<string, WorkflowExample> = {
  "webhook-transform-respond": {
    name: "Webhook Receive, Transform, and Respond",
    description:
      "Receives data via webhook, transforms it with a Set node, and returns a response. " +
      "This is the most common pattern for building API endpoints with n8n.",
    pattern: "webhook → transform → respond",
    tags: ["webhook", "api", "transform", "beginner"],
    nodes: [
      {
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [250, 300],
        parameters: {
          httpMethod: "POST",
          path: "process-data",
          responseMode: "responseNode",
          options: {},
        },
        annotation:
          "Uses responseMode='responseNode' so a downstream 'Respond to Webhook' node controls the response. " +
          "This allows processing before responding. The path becomes /webhook/process-data.",
      },
      {
        name: "Transform Data",
        type: "n8n-nodes-base.set",
        position: [450, 300],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              {
                name: "processed",
                stringValue: "true",
              },
              {
                name: "receivedAt",
                stringValue: "={{ $now.toISO() }}",
              },
              {
                name: "originalData",
                stringValue: "={{ JSON.stringify($json) }}",
              },
            ],
          },
          options: {
            includeBinary: false,
          },
        },
        annotation:
          "Uses the Set node to reshape data. $json refers to the incoming webhook body. " +
          "$now.toISO() is an n8n expression for the current timestamp in ISO format.",
      },
      {
        name: "Respond to Webhook",
        type: "n8n-nodes-base.respondToWebhook",
        position: [650, 300],
        parameters: {
          respondWith: "json",
          responseBody:
            '={{ { "status": "ok", "processed": true, "timestamp": $json.receivedAt } }}',
          options: {
            responseCode: 200,
          },
        },
        annotation:
          "Sends the response back to the webhook caller. respondWith='json' lets us construct " +
          "a JSON response body using an expression. The responseCode defaults to 200.",
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: "Transform Data", type: "main", index: 0 }]],
      },
      "Transform Data": {
        main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]],
      },
    },
    connectionAnnotations: [
      "Webhook → Transform Data: All incoming webhook data flows to the Set node for transformation",
      "Transform Data → Respond to Webhook: Transformed data is sent back as the HTTP response",
    ],
  },

  "schedule-fetch-filter-notify": {
    name: "Scheduled Data Fetch with Filtering and Notification",
    description:
      "Runs on a schedule, fetches data from an API, filters results based on conditions, " +
      "and sends a notification for matching items. Demonstrates the schedule→fetch→branch→notify pattern.",
    pattern: "schedule → http request → filter → notification",
    tags: ["schedule", "api", "filter", "notification", "intermediate"],
    nodes: [
      {
        name: "Run Every Hour",
        type: "n8n-nodes-base.scheduleTrigger",
        position: [250, 300],
        parameters: {
          rule: {
            interval: [
              {
                field: "hours",
                hoursInterval: 1,
              },
            ],
          },
        },
        annotation:
          "Triggers the workflow every hour. The 'rule' parameter uses the interval format. " +
          "Other options: field='minutes' with minutesInterval, field='cronExpression' for cron syntax.",
      },
      {
        name: "Fetch Data",
        type: "n8n-nodes-base.httpRequest",
        position: [450, 300],
        parameters: {
          method: "GET",
          url: "https://api.example.com/items",
          authentication: "none",
          options: {
            timeout: 10000,
            response: {
              response: {
                responseFormat: "autodetect",
              },
            },
          },
        },
        annotation:
          "Makes a GET request. Set authentication='predefinedCredentialType' and " +
          "nodeCredentialType='httpHeaderAuth' (or similar) for authenticated APIs. " +
          "The timeout option prevents hanging on slow endpoints.",
      },
      {
        name: "Filter Important",
        type: "n8n-nodes-base.filter",
        position: [650, 300],
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.priority }}",
                rightValue: "high",
                operator: {
                  type: "string",
                  operation: "equals",
                },
              },
            ],
          },
        },
        annotation:
          "Filters items where priority='high'. Only matching items pass through. " +
          "Use the IF node instead if you need to handle both branches (match and no-match).",
      },
      {
        name: "Send Slack Alert",
        type: "n8n-nodes-base.slack",
        position: [850, 300],
        parameters: {
          resource: "message",
          operation: "post",
          channel: "#alerts",
          text: "=High priority item detected: {{ $json.name }} (ID: {{ $json.id }})",
          otherOptions: {},
        },
        annotation:
          "Posts to Slack. Requires slackApi or slackOAuth2Api credentials configured in n8n. " +
          "The text field uses expressions to include data from the filtered items.",
      },
    ],
    connections: {
      "Run Every Hour": {
        main: [[{ node: "Fetch Data", type: "main", index: 0 }]],
      },
      "Fetch Data": {
        main: [[{ node: "Filter Important", type: "main", index: 0 }]],
      },
      "Filter Important": {
        main: [[{ node: "Send Slack Alert", type: "main", index: 0 }]],
      },
    },
    connectionAnnotations: [
      "Run Every Hour → Fetch Data: Timer triggers the HTTP request on schedule",
      "Fetch Data → Filter Important: All fetched items are evaluated against the filter condition",
      "Filter Important → Send Slack Alert: Only high-priority items trigger a Slack notification",
    ],
  },

  "manual-branch-merge": {
    name: "Branching and Merging Data Flow",
    description:
      "Demonstrates IF-based conditional branching with separate processing paths " +
      "that merge back together. Essential pattern for workflows with decision logic.",
    pattern: "trigger → IF branch → [path A | path B] → merge → output",
    tags: ["branching", "merge", "conditional", "intermediate"],
    nodes: [
      {
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        position: [250, 300],
        parameters: {},
        annotation:
          "Start node for manual execution. In production, replace with a webhook, schedule, " +
          "or event trigger appropriate for your use case.",
      },
      {
        name: "Check Status",
        type: "n8n-nodes-base.if",
        position: [450, 300],
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.status }}",
                rightValue: "active",
                operator: {
                  type: "string",
                  operation: "equals",
                },
              },
            ],
          },
        },
        annotation:
          "IF node has TWO outputs: output 0 (true/match) and output 1 (false/no-match). " +
          "The connections must map output index 0 to the 'true' path and output index 1 to the 'false' path.",
      },
      {
        name: "Process Active",
        type: "n8n-nodes-base.set",
        position: [700, 200],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "result", stringValue: "processed-active" },
              { name: "action", stringValue: "enable" },
            ],
          },
        },
        annotation:
          "Handles the 'true' branch (status=active). The Set node adds fields to the item " +
          "that downstream nodes can use.",
      },
      {
        name: "Process Inactive",
        type: "n8n-nodes-base.set",
        position: [700, 400],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "result", stringValue: "processed-inactive" },
              { name: "action", stringValue: "archive" },
            ],
          },
        },
        annotation:
          "Handles the 'false' branch (status!=active). Separate processing path for inactive items.",
      },
      {
        name: "Merge Results",
        type: "n8n-nodes-base.merge",
        position: [950, 300],
        parameters: {
          mode: "append",
        },
        annotation:
          "Merge node with mode='append' combines items from both branches. " +
          "It has TWO inputs (index 0 and index 1). Each branch connects to a different input. " +
          "Other modes: 'combine' (join by field), 'chooseBranch' (pick one).",
      },
      {
        name: "Final Output",
        type: "n8n-nodes-base.set",
        position: [1150, 300],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              {
                name: "completedAt",
                stringValue: "={{ $now.toISO() }}",
              },
            ],
          },
          options: {
            includeBinary: false,
          },
        },
        annotation:
          "Final processing after merge. All items (from both branches) pass through here.",
      },
    ],
    connections: {
      "Manual Trigger": {
        main: [[{ node: "Check Status", type: "main", index: 0 }]],
      },
      "Check Status": {
        main: [
          [{ node: "Process Active", type: "main", index: 0 }],
          [{ node: "Process Inactive", type: "main", index: 0 }],
        ],
      },
      "Process Active": {
        main: [[{ node: "Merge Results", type: "main", index: 0 }]],
      },
      "Process Inactive": {
        main: [[{ node: "Merge Results", type: "main", index: 1 }]],
      },
      "Merge Results": {
        main: [[{ node: "Final Output", type: "main", index: 0 }]],
      },
    },
    connectionAnnotations: [
      "Manual Trigger → Check Status: Input data flows to the IF condition",
      "Check Status [output 0] → Process Active: Items where status='active' go to the true branch",
      "Check Status [output 1] → Process Inactive: Items where status!='active' go to the false branch",
      "Process Active → Merge Results [input 0]: Active results connect to Merge input 0",
      "Process Inactive → Merge Results [input 1]: Inactive results connect to Merge input 1 (IMPORTANT: index=1, not 0)",
      "Merge Results → Final Output: Combined items from both branches flow to final processing",
    ],
  },

  "error-handling-pattern": {
    name: "Workflow with Error Handling",
    description:
      "Shows how to handle errors gracefully using the Error Trigger and node-level error outputs. " +
      "Critical for production workflows that must not fail silently.",
    pattern: "trigger → risky operation (with error output) → success path | error path",
    tags: ["error-handling", "production", "resilience", "intermediate"],
    nodes: [
      {
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        position: [250, 300],
        parameters: {},
        annotation: "Start node. Replace with appropriate trigger for your use case.",
      },
      {
        name: "Call External API",
        type: "n8n-nodes-base.httpRequest",
        position: [450, 300],
        parameters: {
          method: "GET",
          url: "https://api.example.com/data",
          authentication: "none",
          options: {
            timeout: 15000,
            response: {
              response: {
                responseFormat: "autodetect",
              },
            },
          },
        },
        annotation:
          "This node has onError='continueErrorOutput' which means if it fails, " +
          "execution continues through the error output (output index 1) instead of stopping the workflow. " +
          "Without this setting, any HTTP error would halt the entire workflow.",
      },
      {
        name: "Process Success",
        type: "n8n-nodes-base.set",
        position: [700, 200],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "status", stringValue: "success" },
              { name: "data", stringValue: "={{ JSON.stringify($json) }}" },
            ],
          },
        },
        annotation:
          "Handles successful API responses. Connected to output 0 (success) of the HTTP Request node.",
      },
      {
        name: "Handle Error",
        type: "n8n-nodes-base.set",
        position: [700, 400],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "status", stringValue: "error" },
              {
                name: "errorMessage",
                stringValue: "={{ $json.error?.message || 'Unknown error occurred' }}",
              },
              {
                name: "timestamp",
                stringValue: "={{ $now.toISO() }}",
              },
            ],
          },
        },
        annotation:
          "Handles API errors. Connected to output 1 (error) of the HTTP Request node. " +
          "The error details are available in $json.error when the node uses continueErrorOutput.",
      },
      {
        name: "Log Result",
        type: "n8n-nodes-base.set",
        position: [950, 300],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              {
                name: "logEntry",
                stringValue: "={{ $json.status }}: {{ $json.status === 'error' ? $json.errorMessage : 'Data processed successfully' }}",
              },
            ],
          },
        },
        annotation: "Both success and error paths converge here for logging/final processing.",
      },
    ],
    connections: {
      "Manual Trigger": {
        main: [[{ node: "Call External API", type: "main", index: 0 }]],
      },
      "Call External API": {
        main: [
          [{ node: "Process Success", type: "main", index: 0 }],
          [{ node: "Handle Error", type: "main", index: 0 }],
        ],
      },
      "Process Success": {
        main: [[{ node: "Log Result", type: "main", index: 0 }]],
      },
      "Handle Error": {
        main: [[{ node: "Log Result", type: "main", index: 0 }]],
      },
    },
    connectionAnnotations: [
      "Manual Trigger → Call External API: Start the workflow",
      "Call External API [output 0] → Process Success: Successful responses go here",
      "Call External API [output 1] → Handle Error: Failed requests go here (requires onError='continueErrorOutput' on the node)",
      "Process Success → Log Result: Success data flows to logging",
      "Handle Error → Log Result: Error data also flows to logging for unified handling",
    ],
  },

  "loop-batch-processing": {
    name: "Loop Over Items with Batch Processing",
    description:
      "Processes a large set of items in batches using the Split In Batches node. " +
      "Essential for avoiding rate limits and memory issues when processing many items.",
    pattern: "trigger → split batches → process → loop back",
    tags: ["loop", "batch", "rate-limit", "advanced"],
    nodes: [
      {
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        position: [250, 300],
        parameters: {},
        annotation: "Start with test data. Replace with real data source in production.",
      },
      {
        name: "Generate Test Items",
        type: "n8n-nodes-base.code",
        position: [450, 300],
        parameters: {
          language: "javaScript",
          jsCode:
            "// Generate sample items for testing\n" +
            "const items = [];\n" +
            "for (let i = 1; i <= 20; i++) {\n" +
            "  items.push({ json: { id: i, name: `Item ${i}`, value: Math.random() * 100 } });\n" +
            "}\n" +
            "return items;",
        },
        annotation:
          "Code node generates test data. language='javaScript' uses the V8 sandbox. " +
          "Must return an array of objects with { json: { ... } } structure.",
      },
      {
        name: "Split In Batches",
        type: "n8n-nodes-base.splitInBatches",
        position: [650, 300],
        parameters: {
          batchSize: 5,
          options: {},
        },
        annotation:
          "Splits input into batches of 5 items. Output 0 sends the current batch, " +
          "output 1 fires when all batches are done. The loop back from 'Wait' connects to this node " +
          "to process the next batch.",
      },
      {
        name: "Process Batch",
        type: "n8n-nodes-base.set",
        position: [850, 200],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              {
                name: "processed",
                stringValue: "true",
              },
              {
                name: "batchTimestamp",
                stringValue: "={{ $now.toISO() }}",
              },
            ],
          },
          options: {
            includeBinary: false,
          },
        },
        annotation:
          "Process each batch of items. In a real workflow, this could be an HTTP request, " +
          "database write, or any operation you want to rate-limit.",
      },
      {
        name: "Wait Between Batches",
        type: "n8n-nodes-base.wait",
        position: [1050, 200],
        parameters: {
          amount: 1,
          unit: "seconds",
        },
        annotation:
          "Adds a delay between batches to avoid rate limiting. The Wait node pauses execution " +
          "for the specified duration before looping back to Split In Batches for the next batch.",
      },
      {
        name: "All Done",
        type: "n8n-nodes-base.set",
        position: [850, 400],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "status", stringValue: "complete" },
              {
                name: "completedAt",
                stringValue: "={{ $now.toISO() }}",
              },
            ],
          },
        },
        annotation:
          "Runs after ALL batches have been processed. Connected to output 1 of Split In Batches.",
      },
    ],
    connections: {
      "Manual Trigger": {
        main: [[{ node: "Generate Test Items", type: "main", index: 0 }]],
      },
      "Generate Test Items": {
        main: [[{ node: "Split In Batches", type: "main", index: 0 }]],
      },
      "Split In Batches": {
        main: [
          [{ node: "Process Batch", type: "main", index: 0 }],
          [{ node: "All Done", type: "main", index: 0 }],
        ],
      },
      "Process Batch": {
        main: [[{ node: "Wait Between Batches", type: "main", index: 0 }]],
      },
      "Wait Between Batches": {
        main: [[{ node: "Split In Batches", type: "main", index: 0 }]],
      },
    },
    connectionAnnotations: [
      "Manual Trigger → Generate Test Items: Create sample data",
      "Generate Test Items → Split In Batches: Feed all items into the batch splitter",
      "Split In Batches [output 0] → Process Batch: Current batch (5 items) goes for processing",
      "Split In Batches [output 1] → All Done: Fires once when all batches are complete",
      "Process Batch → Wait Between Batches: After processing, wait before next batch",
      "Wait Between Batches → Split In Batches: LOOP BACK to get the next batch (this creates the processing loop)",
    ],
  },

  "multi-service-orchestration": {
    name: "Multi-Service Data Sync with Enrichment",
    description:
      "Fetches data from one service, enriches it by calling another service, " +
      "then stores results in a third. Shows how to chain HTTP requests with data transformation.",
    pattern: "trigger → fetch → transform → enrich → store",
    tags: ["integration", "http", "transform", "advanced"],
    nodes: [
      {
        name: "Schedule Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
        position: [250, 300],
        parameters: {
          rule: {
            interval: [
              {
                field: "hours",
                hoursInterval: 6,
              },
            ],
          },
        },
        annotation: "Runs every 6 hours. Adjust interval based on how often data needs syncing.",
      },
      {
        name: "Fetch Source Data",
        type: "n8n-nodes-base.httpRequest",
        position: [450, 300],
        parameters: {
          method: "GET",
          url: "https://api.source-service.com/items",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "httpHeaderAuth",
          options: {
            timeout: 30000,
            response: {
              response: {
                responseFormat: "autodetect",
              },
            },
          },
        },
        annotation:
          "Fetches data from the source service. Uses predefinedCredentialType with httpHeaderAuth " +
          "for API key authentication. The credential must be configured in n8n with the header name and value.",
      },
      {
        name: "Extract Fields",
        type: "n8n-nodes-base.set",
        position: [650, 300],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "itemId", stringValue: "={{ $json.id }}" },
              { name: "itemName", stringValue: "={{ $json.name }}" },
              { name: "itemEmail", stringValue: "={{ $json.email || '' }}" },
            ],
          },
          options: {
            includeBinary: false,
          },
        },
        annotation:
          "Extracts and normalizes the fields we need. The '|| \"\"' fallback prevents errors " +
          "when the email field is missing. Always provide fallback values for optional fields.",
      },
      {
        name: "Enrich from CRM",
        type: "n8n-nodes-base.httpRequest",
        position: [850, 300],
        parameters: {
          method: "GET",
          url: "=https://api.crm-service.com/contacts?email={{ encodeURIComponent($json.itemEmail) }}",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "httpHeaderAuth",
          options: {
            timeout: 10000,
            response: {
              response: {
                responseFormat: "autodetect",
              },
            },
          },
        },
        annotation:
          "Looks up the contact in a CRM using the email from the previous node. " +
          "The URL uses an expression with encodeURIComponent() to safely embed the email as a query parameter.",
      },
      {
        name: "Combine Data",
        type: "n8n-nodes-base.set",
        position: [1050, 300],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "id", stringValue: "={{ $('Extract Fields').item.json.itemId }}" },
              { name: "name", stringValue: "={{ $('Extract Fields').item.json.itemName }}" },
              { name: "email", stringValue: "={{ $('Extract Fields').item.json.itemEmail }}" },
              { name: "crmId", stringValue: "={{ $json.results?.[0]?.id || 'not-found' }}" },
              {
                name: "enrichedData",
                stringValue: "={{ JSON.stringify($json.results?.[0] || {}) }}",
              },
              { name: "syncedAt", stringValue: "={{ $now.toISO() }}" },
            ],
          },
        },
        annotation:
          "Merges source data with CRM data. Uses $('Extract Fields') to reference data from a " +
          "previous node by name (not just the immediately preceding node). " +
          "Optional chaining (?.) prevents errors when CRM returns no results.",
      },
      {
        name: "Store in Database",
        type: "n8n-nodes-base.httpRequest",
        position: [1250, 300],
        parameters: {
          method: "POST",
          url: "https://api.destination-service.com/synced-records",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "httpHeaderAuth",
          sendBody: true,
          specifyBody: "json",
          jsonBody: '={{ JSON.stringify({ id: $json.id, name: $json.name, email: $json.email, crmId: $json.crmId, enrichedData: $json.enrichedData, syncedAt: $json.syncedAt }) }}',
          options: {
            timeout: 10000,
          },
        },
        annotation:
          "Stores the enriched record in the destination. Uses sendBody=true with specifyBody='json' " +
          "to send a JSON body constructed from the combined data.",
      },
    ],
    connections: {
      "Schedule Trigger": {
        main: [[{ node: "Fetch Source Data", type: "main", index: 0 }]],
      },
      "Fetch Source Data": {
        main: [[{ node: "Extract Fields", type: "main", index: 0 }]],
      },
      "Extract Fields": {
        main: [[{ node: "Enrich from CRM", type: "main", index: 0 }]],
      },
      "Enrich from CRM": {
        main: [[{ node: "Combine Data", type: "main", index: 0 }]],
      },
      "Combine Data": {
        main: [[{ node: "Store in Database", type: "main", index: 0 }]],
      },
    },
    connectionAnnotations: [
      "Schedule Trigger → Fetch Source Data: Timer kicks off the data sync",
      "Fetch Source Data → Extract Fields: Raw API response is normalized to consistent field names",
      "Extract Fields → Enrich from CRM: Normalized data is used to look up CRM records",
      "Enrich from CRM → Combine Data: CRM response is merged with original data",
      "Combine Data → Store in Database: Final enriched record is stored in the destination",
    ],
  },

  "switch-multi-path": {
    name: "Multi-Path Routing with Switch Node",
    description:
      "Routes items to different processing paths using the Switch node. " +
      "More flexible than IF for cases with 3+ possible outcomes.",
    pattern: "trigger → switch → [path A | path B | path C | default]",
    tags: ["routing", "switch", "multi-path", "intermediate"],
    nodes: [
      {
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [250, 300],
        parameters: {
          httpMethod: "POST",
          path: "route-event",
          responseMode: "onReceived",
        },
        annotation:
          "Receives events. responseMode='onReceived' sends an immediate 200 response " +
          "before processing. Use this when the caller doesn't need the processing result.",
      },
      {
        name: "Route by Type",
        type: "n8n-nodes-base.switch",
        position: [450, 300],
        parameters: {
          dataType: "string",
          value1: "={{ $json.eventType }}",
          rules: {
            rules: [
              { value2: "user.created", output: 0 },
              { value2: "order.completed", output: 1 },
              { value2: "payment.failed", output: 2 },
            ],
          },
          fallbackOutput: 3,
        },
        annotation:
          "Switch node with 4 outputs: 3 named rules + 1 fallback. Each rule matches " +
          "the eventType field against a specific value and routes to the corresponding output index. " +
          "Unmatched events go to fallbackOutput (index 3).",
      },
      {
        name: "Handle New User",
        type: "n8n-nodes-base.set",
        position: [700, 100],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "action", stringValue: "send_welcome_email" },
              { name: "handler", stringValue: "user_service" },
            ],
          },
        },
        annotation: "Output 0: Handles user.created events.",
      },
      {
        name: "Handle Order",
        type: "n8n-nodes-base.set",
        position: [700, 250],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "action", stringValue: "fulfill_order" },
              { name: "handler", stringValue: "order_service" },
            ],
          },
        },
        annotation: "Output 1: Handles order.completed events.",
      },
      {
        name: "Handle Payment Failure",
        type: "n8n-nodes-base.set",
        position: [700, 400],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "action", stringValue: "retry_payment" },
              { name: "handler", stringValue: "payment_service" },
            ],
          },
        },
        annotation: "Output 2: Handles payment.failed events.",
      },
      {
        name: "Handle Unknown",
        type: "n8n-nodes-base.set",
        position: [700, 550],
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "action", stringValue: "log_unknown_event" },
              { name: "eventType", stringValue: "={{ $json.eventType }}" },
            ],
          },
        },
        annotation:
          "Output 3 (fallback): Catches any event type not explicitly handled. " +
          "Always include a fallback to prevent silent data loss.",
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: "Route by Type", type: "main", index: 0 }]],
      },
      "Route by Type": {
        main: [
          [{ node: "Handle New User", type: "main", index: 0 }],
          [{ node: "Handle Order", type: "main", index: 0 }],
          [{ node: "Handle Payment Failure", type: "main", index: 0 }],
          [{ node: "Handle Unknown", type: "main", index: 0 }],
        ],
      },
    },
    connectionAnnotations: [
      "Webhook → Route by Type: Incoming events are evaluated by the Switch node",
      "Route by Type [output 0] → Handle New User: user.created events",
      "Route by Type [output 1] → Handle Order: order.completed events",
      "Route by Type [output 2] → Handle Payment Failure: payment.failed events",
      "Route by Type [output 3] → Handle Unknown: Fallback for unrecognized event types",
    ],
  },
};

export function getWorkflowExample(name: string): WorkflowExample | undefined {
  return WORKFLOW_EXAMPLES[name];
}

export function getAllWorkflowExampleNames(): string[] {
  return Object.keys(WORKFLOW_EXAMPLES);
}
