import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { N8nClient } from "./n8n-client.js";
import type { Execution, Workflow } from "./n8n-client.js";
import {
  NODE_CATALOG,
  WORKFLOW_TEMPLATES,
  EXPRESSION_REFERENCE,
  getNodeByType,
  getAllNodeTypes,
  getNodesForCategory,
  searchNodes,
  getWorkflowTemplate,
  getAllWorkflowTemplates,
  type NodeSchema,
  type NodeCategory,
} from "./node-catalog.js";

// Helper to resolve the correct typeVersion for a node
function resolveTypeVersion(nodeType: string, explicit?: number): number {
  if (explicit !== undefined) return explicit;
  const catalogNode = getNodeByType(nodeType);
  return catalogNode?.typeVersion ?? 1;
}

// ============ EXECUTION ANALYSIS HELPERS ============

interface NodeRunData {
  startTime?: number;
  executionTime?: number;
  executionStatus?: string;
  error?: { message?: string; description?: string; stack?: string };
  data?: {
    main?: Array<Array<{ json: Record<string, unknown> }>>;
  };
  metadata?: Record<string, unknown>;
}

function extractRunData(execution: Execution): Record<string, NodeRunData[]> {
  const data = execution.data as Record<string, unknown> | undefined;
  if (!data) return {};

  const resultData = data.resultData as Record<string, unknown> | undefined;
  if (!resultData) return {};

  return (resultData.runData as Record<string, NodeRunData[]>) ?? {};
}

function extractLastError(execution: Execution): { node?: string; message?: string } | undefined {
  const data = execution.data as Record<string, unknown> | undefined;
  if (!data) return undefined;

  const resultData = data.resultData as Record<string, unknown> | undefined;
  if (!resultData) return undefined;

  const lastNodeExecuted = resultData.lastNodeExecuted as string | undefined;
  const error = resultData.error as { message?: string } | undefined;

  if (lastNodeExecuted || error) {
    return { node: lastNodeExecuted, message: error?.message };
  }
  return undefined;
}

function formatExecutionSummary(execution: Execution): string {
  const lines: string[] = [];
  lines.push(`Execution ID: ${execution.id}`);
  lines.push(`Status: ${execution.status}`);
  lines.push(`Started: ${execution.startedAt}`);
  lines.push(`Finished: ${execution.stoppedAt || "still running"}`);
  lines.push("");

  const runData = extractRunData(execution);
  const nodeNames = Object.keys(runData);

  if (nodeNames.length === 0) {
    lines.push("No per-node data available. Ensure n8n is configured to save execution data.");
    lines.push(`\nRaw execution:\n${JSON.stringify(execution, null, 2)}`);
    return lines.join("\n");
  }

  lines.push(`Nodes executed: ${nodeNames.length}`);
  lines.push("");

  for (const nodeName of nodeNames) {
    const runs = runData[nodeName];
    for (const run of runs) {
      const status = run.error ? "FAILED" : (run.executionStatus || "success");
      const time = run.executionTime != null ? `${run.executionTime}ms` : "?";
      lines.push(`  [${status}] ${nodeName} (${time})`);

      if (run.error) {
        lines.push(`    Error: ${run.error.message || "Unknown error"}`);
        if (run.error.description) {
          lines.push(`    Detail: ${run.error.description}`);
        }
      }

      // Show output item count
      if (run.data?.main) {
        const itemCounts = run.data.main.map((output, i) =>
          `output[${i}]: ${output?.length ?? 0} items`
        );
        lines.push(`    Data: ${itemCounts.join(", ")}`);
      }
    }
  }

  return lines.join("\n");
}

function diagnoseExecution(execution: Execution): string {
  const lines: string[] = [];
  const runData = extractRunData(execution);
  const nodeNames = Object.keys(runData);
  const lastError = extractLastError(execution);

  if (nodeNames.length === 0) {
    if (execution.status === "error") {
      lines.push("Execution failed but no per-node data is available.");
      lines.push("This usually means the workflow failed before any node could run.");
      lines.push("");
      if (lastError) {
        lines.push(`Last error: ${lastError.message || "Unknown"}`);
        if (lastError.node) lines.push(`Failed at: ${lastError.node}`);
      }
      lines.push("");
      lines.push("Common causes:");
      lines.push("- Invalid workflow structure (missing connections)");
      lines.push("- Missing credentials");
      lines.push("- Trigger node configuration error");
    } else {
      lines.push("No execution data available. Check n8n settings:");
      lines.push("- Settings → Save Manual Executions: enabled");
      lines.push("- Settings → Save Execution Progress: enabled");
    }
    lines.push(`\nRaw execution:\n${JSON.stringify(execution, null, 2)}`);
    return lines.join("\n");
  }

  const failed: string[] = [];
  const slow: string[] = [];
  const succeeded: string[] = [];

  for (const nodeName of nodeNames) {
    const runs = runData[nodeName];
    for (const run of runs) {
      if (run.error) {
        failed.push(nodeName);
        lines.push(`### FAILED: ${nodeName}`);
        lines.push(`- Error: ${run.error.message || "Unknown"}`);
        if (run.error.description) {
          lines.push(`- Description: ${run.error.description}`);
        }
        if (run.error.stack) {
          // Show first 3 lines of stack
          const stackLines = run.error.stack.split("\n").slice(0, 3);
          lines.push(`- Stack: ${stackLines.join("\n  ")}`);
        }
        lines.push(classifyError(nodeName, run.error));
        lines.push("");
      } else {
        succeeded.push(nodeName);
        if (run.executionTime != null && run.executionTime > 10000) {
          slow.push(`${nodeName} (${run.executionTime}ms)`);
        }
      }
    }
  }

  // Add last node error info if available
  if (lastError && lastError.node && !failed.includes(lastError.node)) {
    lines.push(`### FAILED: ${lastError.node} (workflow-level error)`);
    lines.push(`- Error: ${lastError.message || "Unknown"}`);
    lines.push("");
  }

  // Summary section
  lines.push("### Summary");
  lines.push(`- Passed: ${succeeded.length} nodes (${succeeded.join(", ") || "none"})`);
  lines.push(`- Failed: ${failed.length} nodes (${failed.join(", ") || "none"})`);
  if (slow.length > 0) {
    lines.push(`- Slow (>10s): ${slow.join(", ")}`);
  }

  return lines.join("\n");
}

function classifyError(nodeName: string, error: { message?: string; description?: string }): string {
  const msg = ((error.message || "") + " " + (error.description || "")).toLowerCase();

  if (msg.includes("credential") || msg.includes("authentication") || msg.includes("unauthorized") || msg.includes("401")) {
    return `- Classification: CREDENTIALS_MISSING — Configure credentials for "${nodeName}" in n8n Settings → Credentials`;
  }
  if (msg.includes("could not find property option") || msg.includes("property")) {
    return `- Classification: WRONG_PARAMETER — A parameter value doesn't match the node's schema. Use get_node_schema to check valid options.`;
  }
  if (msg.includes("typeversion") || msg.includes("type version") || msg.includes("could not find node")) {
    return `- Classification: WRONG_TYPE_VERSION — Node typeVersion may be incorrect. Use get_node_schema to find the correct version.`;
  }
  if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("econnrefused")) {
    return `- Classification: CONNECTION_ERROR — The target service is unreachable. Check URL, network, and service availability.`;
  }
  if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many")) {
    return `- Classification: RATE_LIMITED — Slow down requests or add a Wait node before this node.`;
  }
  if (msg.includes("expression") || msg.includes("referenceerror") || msg.includes("typeerror")) {
    return `- Classification: EXPRESSION_ERROR — An n8n expression failed. Check that referenced fields exist. Use get_expression_help for syntax.`;
  }
  if (msg.includes("json") || msg.includes("parse") || msg.includes("unexpected token")) {
    return `- Classification: PARSE_ERROR — Response is not valid JSON. Check the URL or add a response format option.`;
  }
  if (msg.includes("404") || msg.includes("not found")) {
    return `- Classification: NOT_FOUND — The requested resource/endpoint doesn't exist. Check URLs and IDs.`;
  }
  if (msg.includes("permission") || msg.includes("403") || msg.includes("forbidden")) {
    return `- Classification: PERMISSION_DENIED — Insufficient permissions. Check API key scopes or user permissions.`;
  }
  return `- Classification: UNKNOWN — Review the error message and node configuration.`;
}

function generateFixPlan(workflow: Workflow, execution: Execution): string {
  const lines: string[] = [];
  const runData = extractRunData(execution);
  const lastError = extractLastError(execution);

  if (execution.status === "success") {
    lines.push("No fixes needed — all nodes executed successfully.");
    return lines.join("\n");
  }

  const failedNodes: Array<{ name: string; error: { message?: string; description?: string } }> = [];

  for (const nodeName of Object.keys(runData)) {
    for (const run of runData[nodeName]) {
      if (run.error) {
        failedNodes.push({ name: nodeName, error: run.error });
      }
    }
  }

  // Also check workflow-level last error
  if (lastError?.node && !failedNodes.find(n => n.name === lastError.node)) {
    failedNodes.push({ name: lastError.node, error: { message: lastError.message } });
  }

  if (failedNodes.length === 0) {
    lines.push("Execution failed but no specific node errors were captured.");
    lines.push("Try running the workflow in the n8n editor for more details.");
    return lines.join("\n");
  }

  lines.push(`${failedNodes.length} node(s) need fixes:\n`);

  for (const { name, error } of failedNodes) {
    const workflowNode = workflow.nodes.find(n => n.name === name);
    const msg = ((error.message || "") + " " + (error.description || "")).toLowerCase();
    lines.push(`### ${name} (${workflowNode?.type || "unknown"})`);

    if (msg.includes("credential") || msg.includes("authentication") || msg.includes("401")) {
      lines.push("**Fix**: Add or update credentials for this node.");
      lines.push("1. In n8n UI: Settings → Credentials → Add credential for this service");
      lines.push("2. Then update the node's credentials field via update_workflow");
      if (workflowNode) {
        const catalogNode = getNodeByType(workflowNode.type);
        if (catalogNode?.credentials?.length) {
          lines.push(`3. Required credential types: ${catalogNode.credentials.map(c => c.name).join(", ")}`);
        }
      }
    } else if (msg.includes("could not find property option") || msg.includes("property")) {
      lines.push("**Fix**: A parameter has an invalid value for this node version.");
      lines.push("1. Use get_node_schema to see valid parameter options");
      lines.push("2. Update the node parameters via update_workflow");
      if (workflowNode) {
        lines.push(`3. Current parameters: ${JSON.stringify(workflowNode.parameters, null, 2)}`);
      }
    } else if (msg.includes("expression") || msg.includes("referenceerror")) {
      lines.push("**Fix**: An expression references data that doesn't exist.");
      lines.push("1. Check that the previous node outputs the expected fields");
      lines.push("2. Use {{ $json.fieldName }} syntax to reference output data");
      lines.push("3. Add a Set node before this one to ensure required fields exist");
    } else if (msg.includes("timeout") || msg.includes("econnrefused")) {
      lines.push("**Fix**: Cannot reach the target service.");
      lines.push("1. Verify the URL/host is correct and accessible from the n8n server");
      lines.push("2. Check if the service requires VPN or allowlisting");
      lines.push("3. Consider increasing the node's timeout setting");
    } else {
      lines.push(`**Error**: ${error.message || "Unknown"}`);
      lines.push("1. Review the error message above");
      lines.push("2. Use get_node_schema to check correct configuration");
      lines.push("3. Verify all required parameters are set");
    }

    lines.push("");
  }

  lines.push("### Next Steps");
  lines.push("1. Apply fixes using update_workflow");
  lines.push("2. Run self_heal_workflow again to verify");
  lines.push("3. Repeat until all nodes pass");

  return lines.join("\n");
}

// ============ SCHEMAS MATCHING n8n OpenAPI SPEC ============

// Node schema - matches /components/schemas/node
const nodeSchema = z.object({
  id: z.string().optional().describe("Unique node ID (UUID format recommended)"),
  name: z.string().describe("Display name for the node"),
  type: z.string().describe("Node type (e.g., 'n8n-nodes-base.manualTrigger')"),
  typeVersion: z.number().optional().describe("Node type version (auto-detected from catalog if omitted)"),
  position: z.array(z.number()).length(2).describe("Node position [x, y] on canvas"),
  parameters: z.record(z.unknown()).optional().describe("Node-specific parameters"),
  disabled: z.boolean().optional().describe("Whether the node is disabled"),
  notes: z.string().optional().describe("Notes for the node"),
  notesInFlow: z.boolean().optional().describe("Show notes in flow"),
  executeOnce: z.boolean().optional().describe("Execute only once"),
  alwaysOutputData: z.boolean().optional().describe("Always output data"),
  retryOnFail: z.boolean().optional().describe("Retry on failure"),
  maxTries: z.number().optional().describe("Max retry attempts"),
  waitBetweenTries: z.number().optional().describe("Wait time between retries (ms)"),
  onError: z.enum(["stopWorkflow", "continueRegularOutput", "continueErrorOutput"]).optional().describe("Error handling behavior"),
  credentials: z.record(z.unknown()).optional().describe("Credential references"),
});

// Connection schema - matches n8n connections format
const connectionSchema = z.record(
  z.object({
    main: z.array(
      z.array(
        z.object({
          node: z.string().describe("Target node name"),
          type: z.enum(["main"]).default("main"),
          index: z.number().default(0).describe("Input index on target node"),
        })
      )
    ),
  })
).describe("Connections between nodes. Format: { 'SourceNodeName': { main: [[{ node: 'TargetNodeName', type: 'main', index: 0 }]] } }");

// WorkflowSettings schema - matches /components/schemas/workflowSettings
const workflowSettingsSchema = z.object({
  saveExecutionProgress: z.boolean().optional().describe("Save execution progress"),
  saveManualExecutions: z.boolean().optional().describe("Save manual execution results"),
  saveDataErrorExecution: z.enum(["all", "none"]).optional().describe("Save data on error"),
  saveDataSuccessExecution: z.enum(["all", "none"]).optional().describe("Save data on success"),
  executionTimeout: z.number().max(3600).optional().describe("Execution timeout in seconds (max 3600)"),
  errorWorkflow: z.string().optional().describe("Workflow ID to run on error"),
  timezone: z.string().optional().describe("Timezone (e.g., 'America/New_York')"),
  executionOrder: z.enum(["v0", "v1"]).default("v1").describe("Execution order version"),
}).describe("Workflow settings");

export function registerTools(server: McpServer, n8nClient: N8nClient): void {
  // ============ WORKFLOW TOOLS ============

  server.tool(
    "list_workflows",
    "Retrieve all workflows from n8n. Optionally filter by active status, tags, or name.",
    {
      active: z.boolean().optional().describe("Filter by active status"),
      tags: z.string().optional().describe("Comma-separated tag names to filter by"),
      name: z.string().optional().describe("Filter by workflow name"),
      limit: z.number().int().min(1).max(250).default(50).describe("Maximum results (max 250)"),
    },
    async ({ active, tags, name, limit }) => {
      try {
        const result = await n8nClient.listWorkflows({ active, tags, limit });
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_workflow",
    "Retrieve detailed information about a specific workflow including nodes, connections, and settings.",
    {
      workflowId: z.string().describe("The workflow ID"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.getWorkflow(workflowId);
        return {
          content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "create_workflow",
    `Create a new workflow in n8n. The workflow is created in INACTIVE state.

REQUIRED FIELDS (per n8n OpenAPI spec):
- name: Workflow name (string)
- nodes: Array of node objects (at least one trigger node recommended)
- connections: Object defining how nodes connect
- settings: Workflow settings object (use { "executionOrder": "v1" } at minimum)

NODE OBJECT STRUCTURE:
{
  "name": "My Node",              // Required: display name
  "type": "n8n-nodes-base.X",     // Required: node type
  "typeVersion": 2,               // Optional: auto-detected from catalog if omitted
  "position": [250, 300],         // Required: [x, y] coordinates
  "parameters": {},               // Optional: node-specific config
  "id": "uuid-here"               // Optional: auto-generated if omitted
}

COMMON NODE TYPES:
- n8n-nodes-base.manualTrigger - Manual execution trigger
- n8n-nodes-base.webhook - HTTP webhook trigger (requires activation)
- n8n-nodes-base.scheduleTrigger - Cron/interval trigger
- n8n-nodes-base.set - Set/transform data
- n8n-nodes-base.httpRequest - Make HTTP requests
- n8n-nodes-base.code - JavaScript/Python code execution
- n8n-nodes-base.if - Conditional branching

CONNECTIONS FORMAT:
{
  "Source Node Name": {
    "main": [[{ "node": "Target Node Name", "type": "main", "index": 0 }]]
  }
}

TIP: typeVersion is auto-detected from the built-in node catalog when omitted.
Use get_node_schema to check correct parameters for each node version.

NOTE: The 'active' field is READ-ONLY. Use activate_workflow tool after creation.`,
    {
      name: z.string().describe("Workflow name"),
      nodes: z.array(nodeSchema).min(1).describe("Array of node objects"),
      connections: connectionSchema,
      settings: workflowSettingsSchema,
    },
    async ({ name, nodes, connections, settings }) => {
      try {
        const workflow = await n8nClient.createWorkflow({
          name,
          nodes: nodes.map((n, idx) => ({
            id: n.id || `${Date.now()}-${idx}`,
            name: n.name,
            type: n.type,
            typeVersion: resolveTypeVersion(n.type, n.typeVersion),
            position: n.position as [number, number],
            parameters: n.parameters || {},
            ...(n.disabled !== undefined && { disabled: n.disabled }),
            ...(n.notes && { notes: n.notes }),
            ...(n.credentials && { credentials: n.credentials }),
            ...(n.onError && { onError: n.onError }),
          })),
          connections,
          settings: {
            ...settings,
            executionOrder: settings.executionOrder || "v1",
          },
        });
        return {
          content: [{
            type: "text",
            text: `Workflow created successfully!\n\nID: ${workflow.id}\nName: ${workflow.name}\nActive: ${workflow.active}\n\nUse activate_workflow tool to activate it.\n\nFull response:\n${JSON.stringify(workflow, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating workflow: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "update_workflow",
    `Update an existing workflow. Provide only the fields you want to change.

NOTE:
- The 'active' field is READ-ONLY. Use activate_workflow/deactivate_workflow tools.
- When updating nodes, you must provide the COMPLETE nodes array (not just changes).`,
    {
      workflowId: z.string().describe("Workflow ID to update"),
      name: z.string().optional().describe("New workflow name"),
      nodes: z.array(nodeSchema).optional().describe("Complete replacement nodes array"),
      connections: connectionSchema.optional(),
      settings: workflowSettingsSchema.optional(),
    },
    async ({ workflowId, name, nodes, connections, settings }) => {
      try {
        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (nodes !== undefined) {
          updates.nodes = nodes.map((n, idx) => ({
            id: n.id || `${Date.now()}-${idx}`,
            name: n.name,
            type: n.type,
            typeVersion: resolveTypeVersion(n.type, n.typeVersion),
            position: n.position as [number, number],
            parameters: n.parameters || {},
            ...(n.disabled !== undefined && { disabled: n.disabled }),
            ...(n.notes && { notes: n.notes }),
            ...(n.credentials && { credentials: n.credentials }),
            ...(n.onError && { onError: n.onError }),
          }));
        }
        if (connections !== undefined) updates.connections = connections;
        if (settings !== undefined) updates.settings = settings;

        const workflow = await n8nClient.updateWorkflow(workflowId, updates);
        return {
          content: [{
            type: "text",
            text: `Workflow updated!\n\nID: ${workflow.id}\nName: ${workflow.name}\nActive: ${workflow.active}\n\n${JSON.stringify(workflow, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "delete_workflow",
    "Permanently delete a workflow. This action cannot be undone.",
    {
      workflowId: z.string().describe("Workflow ID to delete"),
    },
    async ({ workflowId }) => {
      try {
        await n8nClient.deleteWorkflow(workflowId);
        return {
          content: [{ type: "text", text: `Workflow ${workflowId} deleted successfully.` }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "activate_workflow",
    "Activate a workflow so it responds to triggers. The workflow must have a valid trigger node.",
    {
      workflowId: z.string().describe("Workflow ID to activate"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.activateWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} activated!\nActive: ${workflow.active}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "deactivate_workflow",
    "Deactivate a workflow so it no longer responds to triggers.",
    {
      workflowId: z.string().describe("Workflow ID to deactivate"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.deactivateWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} deactivated!\nActive: ${workflow.active}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  // ============ EXECUTION TOOLS ============

  server.tool(
    "list_executions",
    "List workflow executions. Filter by workflow ID or status.",
    {
      workflowId: z.string().optional().describe("Filter by workflow ID"),
      status: z.enum(["success", "error", "waiting"]).optional().describe("Filter by status"),
      limit: z.number().int().min(1).max(250).default(25).describe("Maximum results"),
    },
    async ({ workflowId, status, limit }) => {
      try {
        const result = await n8nClient.listExecutions({ workflowId, status, limit });
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_execution",
    "Retrieve detailed information about a specific execution.",
    {
      executionId: z.string().describe("The execution ID"),
    },
    async ({ executionId }) => {
      try {
        const execution = await n8nClient.getExecution(executionId);
        return {
          content: [{ type: "text", text: JSON.stringify(execution, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "delete_execution",
    "Delete an execution record.",
    {
      executionId: z.string().describe("The execution ID to delete"),
    },
    async ({ executionId }) => {
      try {
        await n8nClient.deleteExecution(executionId);
        return {
          content: [{ type: "text", text: `Execution ${executionId} deleted.` }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "execute_webhook",
    `Trigger a workflow via its webhook endpoint.

REQUIREMENTS:
- Workflow must have a Webhook trigger node
- Workflow must be ACTIVE
- Use the webhook path from the Webhook node configuration

The webhook URL format is: {n8n_base_url}/webhook/{path}`,
    {
      webhookPath: z.string().describe("Webhook path (e.g., 'my-webhook' for /webhook/my-webhook)"),
      data: z.record(z.unknown()).default({}).describe("JSON data to POST to the webhook"),
      username: z.string().optional().describe("Basic auth username (if protected)"),
      password: z.string().optional().describe("Basic auth password (if protected)"),
    },
    async ({ webhookPath, data, username, password }) => {
      try {
        const auth = username && password ? { username, password } : undefined;
        const result = await n8nClient.executeWebhook(webhookPath, data || {}, auth);
        return {
          content: [{
            type: "text",
            text: `Webhook executed!\n\nResponse:\n${JSON.stringify(result, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  // ============ WORKFLOW EXECUTION & SELF-HEALING TOOLS ============

  server.tool(
    "execute_workflow",
    `Execute a workflow programmatically and return the execution results.

This tool:
1. Triggers the workflow by ID
2. Waits for it to finish (up to 2 minutes)
3. Returns per-node execution results with inputs/outputs

REQUIREMENTS:
- The workflow must exist
- For webhook-triggered workflows, use execute_webhook instead
- Works best with workflows that have a Manual Trigger node

RETURNS: Full execution data including per-node results (data.resultData.runData).`,
    {
      workflowId: z.string().describe("The workflow ID to execute"),
      payload: z.record(z.unknown()).optional().describe("Optional input data to pass to the workflow"),
      timeoutMs: z.number().int().min(5000).max(300000).default(120000).describe("Max time to wait for completion (ms)"),
    },
    async ({ workflowId, payload, timeoutMs }) => {
      try {
        const { executionId } = await n8nClient.executeWorkflow(workflowId, payload);
        const execution = await n8nClient.waitForExecution(executionId, { timeoutMs });

        const summary = formatExecutionSummary(execution);
        return {
          content: [{
            type: "text",
            text: summary,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error executing workflow: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "diagnose_execution",
    `Analyze a workflow execution to identify errors, bottlenecks, and issues.

This tool inspects the per-node execution data and returns:
- Which nodes succeeded/failed
- Error messages and stack traces from failed nodes
- Execution time per node (identifies slow nodes)
- Data flow summary (what each node received/produced)
- Specific fix suggestions based on common error patterns

Use this after execute_workflow or on any execution ID from list_executions.`,
    {
      executionId: z.string().describe("The execution ID to diagnose"),
    },
    async ({ executionId }) => {
      try {
        const execution = await n8nClient.getExecution(executionId, true);
        const diagnosis = diagnoseExecution(execution);
        return {
          content: [{
            type: "text",
            text: diagnosis,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "self_heal_workflow",
    `Execute a workflow, diagnose any failures, and return a detailed fix plan.

This is the self-healing loop:
1. Execute the workflow
2. Inspect per-node results
3. Identify failures with root cause analysis
4. Generate specific fix instructions (which nodes to change and how)

After getting the fix plan, use update_workflow to apply the fixes, then run self_heal_workflow again to verify.

This is the recommended workflow development cycle:
  create_workflow → self_heal_workflow → update_workflow → self_heal_workflow → ...
  (repeat until all nodes pass)`,
    {
      workflowId: z.string().describe("The workflow ID to test and heal"),
      payload: z.record(z.unknown()).optional().describe("Optional test input data"),
      timeoutMs: z.number().int().min(5000).max(300000).default(120000).describe("Max time to wait (ms)"),
    },
    async ({ workflowId, payload, timeoutMs }) => {
      try {
        // Step 1: Get the workflow definition
        const workflow = await n8nClient.getWorkflow(workflowId);

        // Step 2: Execute
        let execution: Execution;
        try {
          const { executionId } = await n8nClient.executeWorkflow(workflowId, payload);
          execution = await n8nClient.waitForExecution(executionId, { timeoutMs });
        } catch (execError) {
          // If execution endpoint isn't available, check recent executions
          const recent = await n8nClient.listExecutions({ workflowId, limit: 1 });
          if (recent.data.length > 0) {
            execution = await n8nClient.getExecution(recent.data[0].id, true);
          } else {
            return {
              content: [{
                type: "text",
                text: `Could not execute workflow: ${(execError as Error).message}\n\n` +
                  `No recent executions found either. Try:\n` +
                  `1. Run the workflow manually in the n8n editor\n` +
                  `2. Use execute_webhook if it has a webhook trigger\n` +
                  `3. Then run diagnose_execution on the resulting execution ID`,
              }],
              isError: true,
            };
          }
        }

        // Step 3: Diagnose
        const diagnosis = diagnoseExecution(execution);

        // Step 4: Generate fix plan
        const fixPlan = generateFixPlan(workflow, execution);

        const status = execution.status === "success" ? "ALL NODES PASSED" : "ISSUES FOUND";

        return {
          content: [{
            type: "text",
            text: `# Self-Heal Report: ${workflow.name} (${status})\n\n` +
              `## Execution Summary\n` +
              `- Execution ID: ${execution.id}\n` +
              `- Status: ${execution.status}\n` +
              `- Started: ${execution.startedAt}\n` +
              `- Finished: ${execution.stoppedAt || "N/A"}\n\n` +
              `## Per-Node Diagnosis\n${diagnosis}\n\n` +
              `## Fix Plan\n${fixPlan}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  // ============ METADATA TOOLS ============

  server.tool(
    "list_tags",
    "List all tags for organizing workflows.",
    {},
    async () => {
      try {
        const result = await n8nClient.listTags();
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "create_tag",
    "Create a new tag for organizing workflows.",
    {
      name: z.string().describe("Tag name"),
    },
    async ({ name }) => {
      try {
        const tag = await n8nClient.createTag(name);
        return {
          content: [{ type: "text", text: `Tag created: ${tag.id} - ${tag.name}` }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "list_credentials",
    "List all credentials (names and types only, not secrets).",
    {},
    async () => {
      try {
        const result = await n8nClient.listCredentials();
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_credential_schema",
    "Get the parameter schema for a credential type.",
    {
      credentialType: z.string().describe("Credential type (e.g., 'githubApi', 'slackOAuth2Api')"),
    },
    async ({ credentialType }) => {
      try {
        const schema = await n8nClient.getCredentialSchema(credentialType);
        return {
          content: [{ type: "text", text: JSON.stringify(schema, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "list_variables",
    "List environment variables (Pro/Enterprise feature).",
    {},
    async () => {
      try {
        const result = await n8nClient.listVariables();
        return {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "run_audit",
    "Run a security audit on the n8n instance.",
    {
      categories: z.array(z.enum(["credentials", "database", "nodes", "filesystem", "instance"])).optional().describe("Audit categories"),
    },
    async ({ categories }) => {
      try {
        const result = await n8nClient.runAudit(categories);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  // ============ NODE INTELLIGENCE TOOLS ============

  server.tool(
    "get_node_types",
    `List all known n8n node types with their descriptions.

This MCP server includes a built-in catalog of common nodes with full parameter schemas.
Use this to discover available nodes and understand what they do.

Filter by category:
- trigger: Nodes that start workflows (Manual, Schedule, Webhook)
- core: Essential utility nodes (HTTP Request, Code)
- action: Service integrations
- data: Data transformation nodes (Set, Filter, Sort, Aggregate)
- flow: Flow control nodes (IF, Switch, Merge, Split In Batches)
- ai: AI/LLM nodes (OpenAI, Anthropic, etc.)
- communication: Messaging apps (Slack, Discord, Telegram)
- email: Email services (Gmail, SendGrid, Mailchimp)
- crm: CRM platforms (Salesforce, HubSpot, Pipedrive)
- project: Project management (Jira, Asana, ClickUp)
- database: Databases (Postgres, MySQL, MongoDB)
- storage: Cloud storage (S3, Dropbox, Google Drive)
- ecommerce: E-commerce (Shopify, Stripe, WooCommerce)
- productivity: Productivity tools (Google Sheets, Notion, Airtable)
- social: Social media (Twitter, Facebook, LinkedIn)
- devops: DevOps tools (GitHub, GitLab, Jenkins)
- analytics: Analytics platforms (Google Analytics, Mixpanel)
- marketing: Marketing automation (Klaviyo, Brevo)
- hr: HR & Recruitment (BambooHR, Workable)
- finance: Finance & Accounting (QuickBooks, Xero)
- support: Customer support (Zendesk, Intercom)
- utility: Utility nodes`,
    {
      category: z.enum(["trigger", "core", "action", "data", "flow", "ai", "communication", "email", "crm", "project", "database", "storage", "ecommerce", "productivity", "social", "devops", "analytics", "marketing", "hr", "finance", "support", "utility"]).optional().describe("Filter by category"),
    },
    async ({ category }) => {
      try {
        const nodes = category ? getNodesForCategory(category as NodeCategory) : Object.values(NODE_CATALOG);
        const summary = nodes.map((n: NodeSchema) => ({
          type: n.type,
          displayName: n.displayName,
          category: n.category,
          description: n.description,
          hasCredentials: !!n.credentials?.length,
        }));

        return {
          content: [{
            type: "text",
            text: `Found ${nodes.length} node types${category ? ` in category '${category}'` : ""}:\n\n${JSON.stringify(summary, null, 2)}\n\nUse get_node_schema tool to get full parameter details for a specific node.`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_node_schema",
    `Get the complete parameter schema for a specific node type.

Returns:
- All parameters with types, descriptions, and defaults
- Required credentials
- Working examples with real configurations

This is essential for creating workflows with correctly configured nodes.`,
    {
      nodeType: z.string().describe("Node type (e.g., 'n8n-nodes-base.httpRequest')"),
    },
    async ({ nodeType }) => {
      try {
        const schema = getNodeByType(nodeType);

        if (!schema) {
          const allTypes = getAllNodeTypes();
          const suggestions = allTypes.filter(t =>
            t.toLowerCase().includes(nodeType.toLowerCase().replace("n8n-nodes-base.", ""))
          );

          return {
            content: [{
              type: "text",
              text: `Node type '${nodeType}' not found in catalog.\n\nDid you mean one of these?\n${suggestions.slice(0, 5).map(s => `  - ${s}`).join("\n")}\n\nUse get_node_types to see all available nodes.`,
            }],
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(schema, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "search_nodes",
    "Search for nodes by name or description. Useful when you don't know the exact node type.",
    {
      query: z.string().describe("Search query (e.g., 'email', 'http', 'conditional')"),
    },
    async ({ query }) => {
      try {
        const results = searchNodes(query);

        if (results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No nodes found matching '${query}'.\n\nTry searching for: http, email, conditional, transform, api, slack, sheets, code`,
            }],
          };
        }

        const summary = results.map((n: NodeSchema) => ({
          type: n.type,
          displayName: n.displayName,
          category: n.category,
          description: n.description,
        }));

        return {
          content: [{
            type: "text",
            text: `Found ${results.length} nodes matching '${query}':\n\n${JSON.stringify(summary, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_workflow_templates",
    "List available workflow templates. Templates provide pre-built workflow patterns for common use cases.",
    {},
    async () => {
      try {
        const templates = getAllWorkflowTemplates();
        const summary = templates.map(name => {
          const template = WORKFLOW_TEMPLATES[name];
          return {
            name,
            displayName: template.name,
            description: template.description,
            nodeCount: template.nodes.length,
          };
        });

        return {
          content: [{
            type: "text",
            text: `Available workflow templates:\n\n${JSON.stringify(summary, null, 2)}\n\nUse get_workflow_template to get the full template.`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_workflow_template",
    `Get a complete workflow template that can be used with create_workflow.

Templates include:
- Pre-configured nodes with working parameters
- Proper connections between nodes
- Realistic examples you can customize`,
    {
      templateName: z.string().describe("Template name (use get_workflow_templates to see available)"),
    },
    async ({ templateName }) => {
      try {
        const template = getWorkflowTemplate(templateName);

        if (!template) {
          const available = getAllWorkflowTemplates();
          return {
            content: [{
              type: "text",
              text: `Template '${templateName}' not found.\n\nAvailable templates:\n${available.map(t => `  - ${t}`).join("\n")}`,
            }],
          };
        }

        // Format the template for direct use with create_workflow
        const workflowPayload = {
          name: template.name,
          nodes: template.nodes.map((n, idx) => ({
            id: `template-${idx}`,
            name: n.name,
            type: n.type,
            typeVersion: resolveTypeVersion(n.type),
            position: n.position,
            parameters: n.parameters,
          })),
          connections: template.connections,
          settings: { executionOrder: "v1" as const },
        };

        return {
          content: [{
            type: "text",
            text: `Template: ${template.name}\n\nDescription: ${template.description}\n\nReady to use with create_workflow:\n\n${JSON.stringify(workflowPayload, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_expression_help",
    `Get help with n8n expressions and data manipulation.

n8n uses expressions in the format {{ expression }} to:
- Access data from previous nodes
- Transform and manipulate values
- Reference environment variables
- Use date/time functions`,
    {
      topic: z.enum(["basics", "variables", "methods", "examples", "all"]).default("all").describe("Specific topic to get help on"),
    },
    async ({ topic }) => {
      try {
        let output: Record<string, unknown>;

        if (topic === "all") {
          output = EXPRESSION_REFERENCE;
        } else {
          output = { [topic]: EXPRESSION_REFERENCE[topic as keyof typeof EXPRESSION_REFERENCE] };
        }

        return {
          content: [{
            type: "text",
            text: `n8n Expression Reference${topic !== "all" ? ` - ${topic}` : ""}:\n\n${JSON.stringify(output, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );
}
