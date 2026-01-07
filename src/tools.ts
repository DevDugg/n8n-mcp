import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { N8nClient } from "./n8n-client.js";

// ============ SCHEMAS MATCHING n8n OpenAPI SPEC ============

// Node schema - matches /components/schemas/node
const nodeSchema = z.object({
  id: z.string().optional().describe("Unique node ID (UUID format recommended)"),
  name: z.string().describe("Display name for the node"),
  type: z.string().describe("Node type (e.g., 'n8n-nodes-base.manualTrigger')"),
  typeVersion: z.number().default(1).describe("Node type version"),
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
  "typeVersion": 1,               // Required: version number
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
            typeVersion: n.typeVersion ?? 1,
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
            typeVersion: n.typeVersion ?? 1,
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
}
