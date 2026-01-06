import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { N8nClient } from "./n8n-client.js";

export function registerTools(server: McpServer, n8nClient: N8nClient): void {
  // ============ WORKFLOW TOOLS ============

  server.tool(
    "list_workflows",
    "Retrieve all workflows from n8n. Optionally filter by active status or tags.",
    {
      active: z.boolean().optional().describe("Filter by active status"),
      tags: z.string().optional().describe("Comma-separated tag names to filter by"),
      limit: z.number().int().min(1).max(100).default(50).describe("Maximum results to return"),
    },
    async ({ active, tags, limit }) => {
      try {
        const result = await n8nClient.listWorkflows({ active, tags, limit });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
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
    "Retrieve detailed information about a specific workflow including nodes and connections.",
    {
      workflowId: z.string().describe("The ID of the workflow to retrieve"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.getWorkflow(workflowId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(workflow, null, 2),
            },
          ],
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
    "Create a new workflow in n8n with specified nodes and connections.",
    {
      name: z.string().describe("Name for the new workflow"),
      nodes: z
        .array(
          z.object({
            name: z.string().describe("Node name"),
            type: z.string().describe("Node type (e.g., 'n8n-nodes-base.webhook')"),
            position: z.tuple([z.number(), z.number()]).describe("Node position [x, y]"),
            parameters: z.record(z.unknown()).optional().describe("Node parameters"),
          })
        )
        .describe("Array of node definitions"),
      connections: z.record(z.unknown()).describe("Node connection mappings"),
      active: z.boolean().default(false).describe("Activate workflow after creation"),
    },
    async ({ name, nodes, connections, active }) => {
      try {
        const workflow = await n8nClient.createWorkflow({
          name,
          nodes: nodes.map((n) => ({
            ...n,
            position: n.position as [number, number],
          })),
          connections,
          active,
        });
        return {
          content: [
            {
              type: "text",
              text: `Workflow created: ${workflow.id}\n${JSON.stringify(workflow, null, 2)}`,
            },
          ],
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
    "update_workflow",
    "Update an existing workflow. Note: Updating an active workflow automatically reactivates it.",
    {
      workflowId: z.string().describe("ID of workflow to update"),
      name: z.string().optional().describe("New name for the workflow"),
      nodes: z.array(z.record(z.unknown())).optional().describe("Updated node definitions"),
      connections: z.record(z.unknown()).optional().describe("Updated connections"),
      active: z.boolean().optional().describe("Activation status"),
    },
    async ({ workflowId, name, nodes, connections, active }) => {
      try {
        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (nodes !== undefined) updates.nodes = nodes;
        if (connections !== undefined) updates.connections = connections;
        if (active !== undefined) updates.active = active;

        const workflow = await n8nClient.updateWorkflow(workflowId, updates);
        return {
          content: [
            {
              type: "text",
              text: `Workflow updated: ${workflow.id}\n${JSON.stringify(workflow, null, 2)}`,
            },
          ],
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
      workflowId: z.string().describe("ID of workflow to delete"),
    },
    async ({ workflowId }) => {
      try {
        await n8nClient.deleteWorkflow(workflowId);
        return {
          content: [
            {
              type: "text",
              text: `Workflow ${workflowId} deleted successfully.`,
            },
          ],
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
    "Activate a workflow. Requires the workflow to have a valid trigger node.",
    {
      workflowId: z.string().describe("ID of workflow to activate"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.activateWorkflow(workflowId);
        return {
          content: [
            {
              type: "text",
              text: `Workflow ${workflowId} activated. Active: ${workflow.active}`,
            },
          ],
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
    "Deactivate a running workflow.",
    {
      workflowId: z.string().describe("ID of workflow to deactivate"),
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.deactivateWorkflow(workflowId);
        return {
          content: [
            {
              type: "text",
              text: `Workflow ${workflowId} deactivated. Active: ${workflow.active}`,
            },
          ],
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
      status: z
        .enum(["success", "error", "running", "waiting"])
        .optional()
        .describe("Filter by execution status"),
      limit: z.number().int().min(1).max(100).default(25).describe("Maximum results"),
    },
    async ({ workflowId, status, limit }) => {
      try {
        const result = await n8nClient.listExecutions({ workflowId, status, limit });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
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
    "Retrieve detailed information about a specific execution including output data.",
    {
      executionId: z.string().describe("The execution ID"),
    },
    async ({ executionId }) => {
      try {
        const execution = await n8nClient.getExecution(executionId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(execution, null, 2),
            },
          ],
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
    "Retry a failed execution. Optionally use the latest workflow version.",
    {
      executionId: z.string().describe("ID of the failed execution"),
      loadWorkflow: z
        .boolean()
        .default(false)
        .describe("Use latest workflow version instead of original"),
    },
    async ({ executionId, loadWorkflow }) => {
      try {
        const execution = await n8nClient.retryExecution(executionId, loadWorkflow);
        return {
          content: [
            {
              type: "text",
              text: `Execution retried. New execution ID: ${execution.id}`,
            },
          ],
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
    "Trigger a workflow via its webhook endpoint.",
    {
      webhookPath: z
        .string()
        .describe("Webhook path (e.g., 'my-workflow' for /webhook/my-workflow)"),
      data: z.record(z.unknown()).optional().describe("JSON data to send to the webhook"),
      username: z.string().optional().describe("Basic auth username (if webhook requires auth)"),
      password: z.string().optional().describe("Basic auth password (if webhook requires auth)"),
    },
    async ({ webhookPath, data, username, password }) => {
      try {
        const auth = username && password ? { username, password } : undefined;
        const result = await n8nClient.executeWebhook(webhookPath, data || {}, auth);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
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
    "Execute a workflow directly by ID. Returns execution results. Use this to test workflows without needing a webhook trigger.",
    {
      workflowId: z.string().describe("ID of the workflow to execute"),
      inputData: z
        .record(z.unknown())
        .optional()
        .describe("Input data to pass to the workflow (available in the first node)"),
    },
    async ({ workflowId, inputData }) => {
      try {
        const execution = await n8nClient.runWorkflow(workflowId, inputData);
        return {
          content: [
            {
              type: "text",
              text: `Workflow executed. Execution ID: ${execution.id}\nStatus: ${execution.status}\n\n${JSON.stringify(execution, null, 2)}`,
            },
          ],
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
    "List all tags available for organizing workflows.",
    {},
    async () => {
      try {
        const result = await n8nClient.listTags();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
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
    "List all credentials configured in n8n (names only, not secrets).",
    {},
    async () => {
      try {
        const result = await n8nClient.listCredentials();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
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
    "Get the parameter schema for a credential type. Use this to understand what fields are required when creating credentials of a specific type.",
    {
      credentialType: z
        .string()
        .describe("The credential type name (e.g., 'slackApi', 'githubApi', 'httpBasicAuth')"),
    },
    async ({ credentialType }) => {
      try {
        const schema = await n8nClient.getCredentialSchema(credentialType);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(schema, null, 2),
            },
          ],
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
    "List environment variables configured in n8n (Pro/Enterprise feature).",
    {},
    async () => {
      try {
        const result = await n8nClient.listVariables();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
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
      categories: z.array(z.string()).optional().describe("Audit categories to include"),
    },
    async ({ categories }) => {
      try {
        const result = await n8nClient.runAudit(categories);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
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
