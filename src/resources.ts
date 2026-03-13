import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { N8nClient } from "./n8n-client.js";
import { WORKFLOW_EXAMPLES, getWorkflowExample, getAllWorkflowExampleNames } from "./examples.js";

export function registerResources(server: McpServer, n8nClient: N8nClient): void {
  // Static resource: All workflows list
  server.resource(
    "workflows-list",
    "n8n://workflows",
    {
      description: "List of all n8n workflows",
      mimeType: "application/json",
    },
    async (uri) => {
      const result = await n8nClient.listWorkflows({ limit: 100 });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // Dynamic resource: Individual workflow details
  server.resource(
    "workflow",
    new ResourceTemplate("n8n://workflow/{workflowId}", { list: undefined }),
    {
      description: "Details of a specific workflow including nodes and connections",
      mimeType: "application/json",
    },
    async (uri, { workflowId }) => {
      const workflow = await n8nClient.getWorkflow(workflowId as string);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(workflow, null, 2),
          },
        ],
      };
    }
  );

  // Dynamic resource: Executions for a workflow
  server.resource(
    "workflow-executions",
    new ResourceTemplate("n8n://workflow/{workflowId}/executions", { list: undefined }),
    {
      description: "Execution history for a specific workflow",
      mimeType: "application/json",
    },
    async (uri, { workflowId }) => {
      const result = await n8nClient.listExecutions({
        workflowId: workflowId as string,
        limit: 50,
      });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // Dynamic resource: Individual execution details
  server.resource(
    "execution",
    new ResourceTemplate("n8n://execution/{executionId}", { list: undefined }),
    {
      description: "Detailed execution information including output data",
      mimeType: "application/json",
    },
    async (uri, { executionId }) => {
      const execution = await n8nClient.getExecution(executionId as string);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(execution, null, 2),
          },
        ],
      };
    }
  );

  // Static resource: All tags
  server.resource(
    "tags",
    "n8n://tags",
    {
      description: "List of all workflow tags",
      mimeType: "application/json",
    },
    async (uri) => {
      const result = await n8nClient.listTags();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // Static resource: All credentials
  server.resource(
    "credentials",
    "n8n://credentials",
    {
      description: "List of configured credentials (names only, no secrets)",
      mimeType: "application/json",
    },
    async (uri) => {
      const result = await n8nClient.listCredentials();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );

  // Static resource: List all golden-path workflow examples
  server.resource(
    "workflow-examples",
    "n8n://examples",
    {
      description: "List of all golden-path workflow examples with descriptions, patterns, and tags",
      mimeType: "application/json",
    },
    async (uri) => {
      const names = getAllWorkflowExampleNames();
      const summary = names.map(name => {
        const example = WORKFLOW_EXAMPLES[name];
        return {
          name,
          displayName: example.name,
          description: example.description,
          pattern: example.pattern,
          tags: example.tags,
          nodeCount: example.nodes.length,
        };
      });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }
  );

  // Dynamic resource: Individual workflow example with full definition
  server.resource(
    "workflow-example",
    new ResourceTemplate("n8n://examples/{exampleName}", { list: undefined }),
    {
      description: "Complete golden-path workflow example with annotated nodes, connections, and ready-to-use JSON",
      mimeType: "application/json",
    },
    async (uri, { exampleName }) => {
      const example = getWorkflowExample(exampleName as string);
      if (!example) {
        const available = getAllWorkflowExampleNames();
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify({
                error: `Example '${exampleName}' not found`,
                available,
              }, null, 2),
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(example, null, 2),
          },
        ],
      };
    }
  );
}
