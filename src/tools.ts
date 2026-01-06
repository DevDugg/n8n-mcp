import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { N8nClient } from "./n8n-client.js";

// ============ SHARED SCHEMAS ============

const nodeSchema = z.object({
  id: z.string().optional().describe("Unique node ID (auto-generated if not provided)"),
  name: z.string().describe("Display name for the node"),
  type: z.string().describe("Node type (e.g., 'n8n-nodes-base.manualTrigger', 'n8n-nodes-base.set', 'n8n-nodes-base.httpRequest')"),
  position: z.tuple([z.number(), z.number()]).describe("Node position [x, y] on canvas"),
  parameters: z.record(z.unknown()).default({}).describe("Node-specific parameters"),
  typeVersion: z.number().default(1).describe("Node type version (check n8n docs for latest)"),
  credentials: z.record(z.unknown()).optional().describe("Credential references for this node"),
});

const connectionSchema = z.record(
  z.object({
    main: z.array(
      z.array(
        z.object({
          node: z.string().describe("Target node name"),
          type: z.literal("main").default("main"),
          index: z.number().default(0).describe("Output/input index"),
        })
      )
    ).describe("Array of output connections"),
  })
).describe("Connection mappings: { 'SourceNodeName': { main: [[{ node: 'TargetNodeName', type: 'main', index: 0 }]] } }");

const workflowSettingsSchema = z.object({
  executionOrder: z.enum(["v0", "v1"]).default("v1").describe("Execution order version"),
  saveManualExecutions: z.boolean().optional().describe("Save manual execution results"),
  callerPolicy: z.enum(["any", "none", "workflowsFromAList", "workflowsFromSameOwner"]).optional(),
  errorWorkflow: z.string().optional().describe("Workflow ID to run on error"),
  timezone: z.string().optional().describe("Timezone for scheduled workflows"),
}).describe("Workflow settings");

export function registerTools(server: McpServer, n8nClient: N8nClient): void {
  // ============ WORKFLOW TOOLS ============

  server.tool(
    "list_workflows",
    "Retrieve all workflows from n8n. Optionally filter by active status or tags.",
    {
      active: z.boolean().optional().describe("Filter by active status (true/false)"),
      tags: z.string().optional().describe("Comma-separated tag names to filter by"),
      limit: z.number().int().min(1).max(100).default(50).describe("Maximum results to return"),
    },
    async ({ active, tags, limit }) => {
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
      workflowId: z.string().describe("The ID of the workflow to retrieve"),
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

REQUIRED FIELDS:
- name: Workflow name
- nodes: Array of node objects
- connections: How nodes connect to each other
- settings: Must include { "executionOrder": "v1" } at minimum

NODE STRUCTURE:
{
  "id": "unique-id",           // Optional, auto-generated
  "name": "Node Name",         // Required, display name
  "type": "n8n-nodes-base.X",  // Required, node type
  "position": [250, 300],      // Required, [x, y] coordinates
  "parameters": {},            // Node-specific config
  "typeVersion": 1             // Usually 1, check docs
}

COMMON NODE TYPES:
- n8n-nodes-base.manualTrigger (Manual execution)
- n8n-nodes-base.webhook (HTTP webhook trigger)
- n8n-nodes-base.scheduleTrigger (Cron/interval trigger)
- n8n-nodes-base.set (Set/transform data)
- n8n-nodes-base.httpRequest (Make HTTP calls)
- n8n-nodes-base.code (JavaScript/Python code)
- n8n-nodes-base.if (Conditional branching)

CONNECTIONS FORMAT:
{
  "Source Node Name": {
    "main": [[{ "node": "Target Node Name", "type": "main", "index": 0 }]]
  }
}`,
    {
      name: z.string().describe("Name for the new workflow"),
      nodes: z.array(nodeSchema).min(1).describe("Array of node definitions (at least one trigger node)"),
      connections: connectionSchema,
      settings: workflowSettingsSchema,
    },
    async ({ name, nodes, connections, settings }) => {
      try {
        const workflow = await n8nClient.createWorkflow({
          name,
          nodes: nodes.map((n, idx) => ({
            id: n.id || `node-${idx}`,
            name: n.name,
            type: n.type,
            position: n.position as [number, number],
            parameters: n.parameters || {},
            typeVersion: n.typeVersion || 1,
            ...(n.credentials && { credentials: n.credentials }),
          })),
          connections,
          settings,
        });
        return {
          content: [{
            type: "text",
            text: `Workflow created successfully!\n\nID: ${workflow.id}\nName: ${workflow.name}\nActive: ${workflow.active}\n\nFull response:\n${JSON.stringify(workflow, null, 2)}`,
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
    `Update an existing workflow. You can update name, nodes, connections, and/or settings.

NOTE: To activate/deactivate a workflow, use the activate_workflow or deactivate_workflow tools instead.

Provide only the fields you want to update. The workflow ID is required.`,
    {
      workflowId: z.string().describe("ID of workflow to update"),
      name: z.string().optional().describe("New name for the workflow"),
      nodes: z.array(nodeSchema).optional().describe("Complete replacement node array"),
      connections: connectionSchema.optional(),
      settings: workflowSettingsSchema.optional(),
    },
    async ({ workflowId, name, nodes, connections, settings }) => {
      try {
        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (nodes !== undefined) {
          updates.nodes = nodes.map((n, idx) => ({
            id: n.id || `node-${idx}`,
            name: n.name,
            type: n.type,
            position: n.position as [number, number],
            parameters: n.parameters || {},
            typeVersion: n.typeVersion || 1,
            ...(n.credentials && { credentials: n.credentials }),
          }));
        }
        if (connections !== undefined) updates.connections = connections;
        if (settings !== undefined) updates.settings = settings;

        const workflow = await n8nClient.updateWorkflow(workflowId, updates);
        return {
          content: [{
            type: "text",
            text: `Workflow updated successfully!\n\nID: ${workflow.id}\nName: ${workflow.name}\nActive: ${workflow.active}\n\nFull response:\n${JSON.stringify(workflow, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error updating workflow: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "delete_workflow",
    "Permanently delete a workflow. This action cannot be undone.",
    {
      workflowId: z.string().describe("ID of workflow to delete"),
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
    "Activate a workflow so it can be triggered. The workflow must have a valid trigger node (webhook, schedule, etc.).",
    {
      workflowId: z.string().describe("ID of workflow to activate"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.activateWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} activated successfully!\nActive: ${workflow.active}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error activating workflow: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "deactivate_workflow",
    "Deactivate a running workflow. It will no longer respond to triggers.",
    {
      workflowId: z.string().describe("ID of workflow to deactivate"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.deactivateWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} deactivated successfully!\nActive: ${workflow.active}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error deactivating workflow: ${(error as Error).message}` }],
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
      status: z.enum(["success", "error", "running", "waiting"]).optional().describe("Filter by execution status"),
      limit: z.number().int().min(1).max(100).default(25).describe("Maximum results"),
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
    "Retrieve detailed information about a specific execution including input/output data for each node.",
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
    "retry_execution",
    "Retry a failed execution. Optionally use the current (latest) workflow version instead of the version that was used originally.",
    {
      executionId: z.string().describe("ID of the failed execution to retry"),
      loadWorkflow: z.boolean().default(false).describe("If true, use latest workflow version; if false, use original"),
    },
    async ({ executionId, loadWorkflow }) => {
      try {
        const execution = await n8nClient.retryExecution(executionId, loadWorkflow);
        return {
          content: [{
            type: "text",
            text: `Execution retried successfully!\nNew execution ID: ${execution.id}\nStatus: ${execution.status}`,
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
    "run_workflow",
    "Execute a workflow directly by ID (manual trigger). Returns the execution result. Use this to test workflows.",
    {
      workflowId: z.string().describe("ID of the workflow to execute"),
      inputData: z.record(z.unknown()).optional().describe("Input data to pass to the workflow (available as $input in first node)"),
    },
    async ({ workflowId, inputData }) => {
      try {
        const execution = await n8nClient.runWorkflow(workflowId, inputData);
        return {
          content: [{
            type: "text",
            text: `Workflow executed!\n\nExecution ID: ${execution.id}\nStatus: ${execution.status}\nFinished: ${execution.finished}\n\nFull result:\n${JSON.stringify(execution, null, 2)}`,
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
    "execute_webhook",
    "Trigger a workflow via its webhook endpoint. The workflow must have a Webhook trigger node and be active.",
    {
      webhookPath: z.string().describe("Webhook path from the webhook node (e.g., 'my-webhook' triggers /webhook/my-webhook)"),
      data: z.record(z.unknown()).default({}).describe("JSON data to send in the POST body"),
      username: z.string().optional().describe("Basic auth username (if webhook is protected)"),
      password: z.string().optional().describe("Basic auth password (if webhook is protected)"),
    },
    async ({ webhookPath, data, username, password }) => {
      try {
        const auth = username && password ? { username, password } : undefined;
        const result = await n8nClient.executeWebhook(webhookPath, data || {}, auth);
        return {
          content: [{
            type: "text",
            text: `Webhook executed successfully!\n\nResponse:\n${JSON.stringify(result, null, 2)}`,
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error executing webhook: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );

  // ============ METADATA TOOLS ============

  server.tool(
    "list_tags",
    "List all tags available for organizing workflows.",
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
      name: z.string().describe("Name for the new tag"),
    },
    async ({ name }) => {
      try {
        const tag = await n8nClient.createTag(name);
        return {
          content: [{
            type: "text",
            text: `Tag created!\n\nID: ${tag.id}\nName: ${tag.name}`,
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
    "list_credentials",
    "List all credentials configured in n8n. Returns names and types only (not secrets).",
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
    "Get the parameter schema for a credential type. Useful for understanding what fields are required.",
    {
      credentialType: z.string().describe("Credential type name (e.g., 'slackApi', 'githubApi', 'httpBasicAuth', 'openAiApi')"),
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
    "List environment variables configured in n8n (requires Pro/Enterprise license).",
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
    "Run a security audit on the n8n instance. Returns findings and recommendations.",
    {
      categories: z.array(z.string()).optional().describe("Audit categories to include (omit for all)"),
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
