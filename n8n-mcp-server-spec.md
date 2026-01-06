# Custom n8n MCP Server: Complete Build Specification

## Purpose
Build a custom MCP (Model Context Protocol) server for n8n workflow automation with **maximum control** over tools, resources, and transport configuration. This spec is for Claude Code to implement from scratch.

---

## Primary References (Verified Sources)

### MCP TypeScript SDK
- **Package**: `@modelcontextprotocol/sdk` (npm)
- **Repository**: https://github.com/modelcontextprotocol/typescript-sdk
- **Docs**: `docs/server.md` in the repository
- **Version**: 2.x (current generation, uses `McpServer` class)
- **Protocol**: MCP specification 2025-03-26 (Streamable HTTP)

### n8n Public API
- **Base Path**: `/api/v1`
- **OpenAPI Spec**: Available at `<n8n-instance>/api/v1/openapi.yml`
- **Swagger UI**: Available at `<n8n-instance>/api/v1/docs`
- **Docs**: https://docs.n8n.io/api/

### Reference Implementation
- **leonardsellem/n8n-mcp-server**: https://github.com/leonardsellem/n8n-mcp-server
- **npm**: `@leonardsellem/n8n-mcp-server`

---

## Project Setup

### Dependencies (package.json)

```json
{
  "name": "n8n-mcp-server-custom",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "inspector": "npx @modelcontextprotocol/inspector"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^2.0.0",
    "express": "^4.21.0",
    "zod": "^3.24.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.5.0",
    "pino": "^9.5.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/cors": "^2.8.17",
    "typescript": "^5.7.0",
    "tsx": "^4.19.0"
  }
}
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Core Architecture

### Transport Options

The MCP SDK supports three transport mechanisms:

| Transport | Use Case | Protocol Version |
|-----------|----------|------------------|
| **Streamable HTTP** | Remote servers, Claude Code, VS Code, Cursor | 2025-03-26 (current) |
| **stdio** | Local process spawning, Claude Desktop | All versions |
| **SSE** | Backwards compatibility only | 2024-11-05 (deprecated) |

**Recommendation**: Use Streamable HTTP for maximum flexibility and remote access capability.

### SDK Import Paths (Critical)

```typescript
// Server class
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Transport classes
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"; // deprecated

// Type utilities
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

// Schema validation (required)
import { z } from "zod";
```

---

## Server Implementation

### Base Server Structure (src/server.ts)

```typescript
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { N8nClient } from "./n8n-client.js";

// Environment configuration
const N8N_API_URL = process.env.N8N_API_URL || "http://localhost:5678/api/v1";
const N8N_API_KEY = process.env.N8N_API_KEY || "";
const PORT = parseInt(process.env.PORT || "3000");

// Initialize n8n API client
const n8nClient = new N8nClient(N8N_API_URL, N8N_API_KEY);

// Create MCP server instance
const server = new McpServer({
  name: "n8n-mcp-server",
  version: "1.0.0"
});

// Express app setup
const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", // Configure for production
  exposedHeaders: ["Mcp-Session-Id"],
  allowedHeaders: ["Content-Type", "mcp-session-id"]
}));

// Session management for stateful mode
const transports: Map<string, StreamableHTTPServerTransport> = new Map();

// MCP endpoint handler
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    // Reuse existing transport
    transport = transports.get(sessionId)!;
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New session initialization
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableDnsRebindingProtection: true,
      allowedHosts: ["127.0.0.1", "localhost"]
    });
    
    // Store transport for session reuse
    const newSessionId = randomUUID();
    transports.set(newSessionId, transport);
    
    // Connect server to transport
    await server.connect(transport);
    
    // Cleanup on close
    res.on("close", () => {
      transports.delete(newSessionId);
      transport.close();
    });
  } else {
    res.status(400).json({ error: "Invalid session" });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", n8n_url: N8N_API_URL });
});

// Start server
app.listen(PORT, () => {
  console.error(`n8n MCP Server running at http://localhost:${PORT}/mcp`);
  console.error(`Test with: npx @modelcontextprotocol/inspector`);
});
```

### Stateless Mode (Simpler Alternative)

For simpler deployments without session tracking:

```typescript
app.post("/mcp", async (req, res) => {
  // Create new server instance per request (stateless)
  const statelessServer = new McpServer({
    name: "n8n-mcp-server",
    version: "1.0.0"
  });
  
  // Register tools/resources on this instance
  registerTools(statelessServer);
  registerResources(statelessServer);
  
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // No session tracking
    enableJsonResponse: true
  });

  res.on("close", () => transport.close());
  
  await statelessServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

---

## n8n API Client (src/n8n-client.ts)

```typescript
export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: any[];
  connections: any;
  settings?: any;
  tags?: { id: string; name: string }[];
}

export interface Execution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf: string | null;
  retrySuccessId: string | null;
  startedAt: string;
  stoppedAt: string | null;
  workflowId: string;
  status: "success" | "error" | "running" | "waiting" | "crashed";
  data?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
}

export class N8nClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-N8N-API-KEY": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`n8n API error ${response.status}: ${error}`);
    }

    return response.json();
  }

  // ============ WORKFLOWS ============

  async listWorkflows(params?: {
    active?: boolean;
    tags?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Workflow>> {
    const query = new URLSearchParams();
    if (params?.active !== undefined) query.set("active", String(params.active));
    if (params?.tags) query.set("tags", params.tags);
    if (params?.cursor) query.set("cursor", params.cursor);
    if (params?.limit) query.set("limit", String(params.limit));
    
    const queryString = query.toString();
    return this.request(`/workflows${queryString ? `?${queryString}` : ""}`);
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request(`/workflows/${id}`);
  }

  async createWorkflow(workflow: {
    name: string;
    nodes: any[];
    connections: any;
    settings?: any;
    active?: boolean;
  }): Promise<Workflow> {
    return this.request("/workflows", {
      method: "POST",
      body: JSON.stringify(workflow)
    });
  }

  async updateWorkflow(
    id: string,
    workflow: Partial<Workflow>
  ): Promise<Workflow> {
    return this.request(`/workflows/${id}`, {
      method: "PUT",
      body: JSON.stringify(workflow)
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.request(`/workflows/${id}`, { method: "DELETE" });
  }

  async activateWorkflow(id: string): Promise<Workflow> {
    return this.request(`/workflows/${id}/activate`, { method: "POST" });
  }

  async deactivateWorkflow(id: string): Promise<Workflow> {
    return this.request(`/workflows/${id}/deactivate`, { method: "POST" });
  }

  // ============ EXECUTIONS ============

  async listExecutions(params?: {
    workflowId?: string;
    status?: "success" | "error" | "running" | "waiting";
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Execution>> {
    const query = new URLSearchParams();
    if (params?.workflowId) query.set("workflowId", params.workflowId);
    if (params?.status) query.set("status", params.status);
    if (params?.cursor) query.set("cursor", params.cursor);
    if (params?.limit) query.set("limit", String(params.limit));
    
    const queryString = query.toString();
    return this.request(`/executions${queryString ? `?${queryString}` : ""}`);
  }

  async getExecution(id: string): Promise<Execution> {
    return this.request(`/executions/${id}`);
  }

  async deleteExecution(id: string): Promise<void> {
    await this.request(`/executions/${id}`, { method: "DELETE" });
  }

  async retryExecution(id: string, loadWorkflow = false): Promise<Execution> {
    return this.request(`/executions/${id}/retry`, {
      method: "POST",
      body: JSON.stringify({ loadWorkflow })
    });
  }

  // ============ CREDENTIALS ============

  async listCredentials(): Promise<PaginatedResponse<any>> {
    return this.request("/credentials");
  }

  async getCredentialSchema(type: string): Promise<any> {
    return this.request(`/credentials/schema/${type}`);
  }

  // ============ TAGS ============

  async listTags(): Promise<{ data: { id: string; name: string }[] }> {
    return this.request("/tags");
  }

  async createTag(name: string): Promise<{ id: string; name: string }> {
    return this.request("/tags", {
      method: "POST",
      body: JSON.stringify({ name })
    });
  }

  // ============ VARIABLES ============

  async listVariables(): Promise<{ data: { key: string; value: string }[] }> {
    return this.request("/variables");
  }

  // ============ AUDIT ============

  async runAudit(categories?: string[]): Promise<any> {
    return this.request("/audit", {
      method: "POST",
      body: JSON.stringify({ categories })
    });
  }

  // ============ WEBHOOK EXECUTION ============

  async executeWebhook(
    webhookPath: string,
    data: any,
    auth?: { username: string; password: string }
  ): Promise<any> {
    // Webhook URL is different from API URL
    const webhookBaseUrl = this.baseUrl.replace("/api/v1", "");
    const url = `${webhookBaseUrl}/webhook/${webhookPath}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (auth) {
      const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Webhook error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }
}
```

---

## Tool Registration

### Tool Registration Pattern (src/tools.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { N8nClient } from "./n8n-client.js";

export function registerTools(server: McpServer, n8nClient: N8nClient): void {
  
  // ============ WORKFLOW TOOLS ============

  server.registerTool(
    "list_workflows",
    {
      title: "List n8n Workflows",
      description: "Retrieve all workflows from n8n. Optionally filter by active status or tags.",
      inputSchema: {
        active: z.boolean().optional().describe("Filter by active status"),
        tags: z.string().optional().describe("Comma-separated tag names to filter by"),
        limit: z.number().int().min(1).max(100).default(50).describe("Maximum results to return")
      }
    },
    async ({ active, tags, limit }) => {
      try {
        const result = await n8nClient.listWorkflows({ active, tags, limit });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "get_workflow",
    {
      title: "Get Workflow Details",
      description: "Retrieve detailed information about a specific workflow including nodes and connections.",
      inputSchema: {
        workflowId: z.string().describe("The ID of the workflow to retrieve")
      }
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.getWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(workflow, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "create_workflow",
    {
      title: "Create Workflow",
      description: "Create a new workflow in n8n with specified nodes and connections.",
      inputSchema: {
        name: z.string().describe("Name for the new workflow"),
        nodes: z.array(z.object({
          name: z.string(),
          type: z.string(),
          position: z.array(z.number()).length(2),
          parameters: z.record(z.any()).optional()
        })).describe("Array of node definitions"),
        connections: z.record(z.any()).describe("Node connection mappings"),
        active: z.boolean().default(false).describe("Activate workflow after creation")
      }
    },
    async ({ name, nodes, connections, active }) => {
      try {
        const workflow = await n8nClient.createWorkflow({
          name,
          nodes,
          connections,
          active
        });
        return {
          content: [{
            type: "text",
            text: `Workflow created: ${workflow.id}\n${JSON.stringify(workflow, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "update_workflow",
    {
      title: "Update Workflow",
      description: "Update an existing workflow. Note: Updating an active workflow automatically reactivates it.",
      inputSchema: {
        workflowId: z.string().describe("ID of workflow to update"),
        name: z.string().optional().describe("New name for the workflow"),
        nodes: z.array(z.any()).optional().describe("Updated node definitions"),
        connections: z.record(z.any()).optional().describe("Updated connections"),
        active: z.boolean().optional().describe("Activation status")
      }
    },
    async ({ workflowId, name, nodes, connections, active }) => {
      try {
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (nodes !== undefined) updates.nodes = nodes;
        if (connections !== undefined) updates.connections = connections;
        if (active !== undefined) updates.active = active;
        
        const workflow = await n8nClient.updateWorkflow(workflowId, updates);
        return {
          content: [{
            type: "text",
            text: `Workflow updated: ${workflow.id}\n${JSON.stringify(workflow, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "delete_workflow",
    {
      title: "Delete Workflow",
      description: "Permanently delete a workflow. This action cannot be undone.",
      inputSchema: {
        workflowId: z.string().describe("ID of workflow to delete")
      }
    },
    async ({ workflowId }) => {
      try {
        await n8nClient.deleteWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} deleted successfully.`
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "activate_workflow",
    {
      title: "Activate Workflow",
      description: "Activate a workflow. Requires the workflow to have a valid trigger node.",
      inputSchema: {
        workflowId: z.string().describe("ID of workflow to activate")
      }
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.activateWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} activated. Active: ${workflow.active}`
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "deactivate_workflow",
    {
      title: "Deactivate Workflow",
      description: "Deactivate a running workflow.",
      inputSchema: {
        workflowId: z.string().describe("ID of workflow to deactivate")
      }
    },
    async ({ workflowId }) => {
      try {
        const workflow = await n8nClient.deactivateWorkflow(workflowId);
        return {
          content: [{
            type: "text",
            text: `Workflow ${workflowId} deactivated. Active: ${workflow.active}`
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  // ============ EXECUTION TOOLS ============

  server.registerTool(
    "list_executions",
    {
      title: "List Executions",
      description: "List workflow executions. Filter by workflow ID or status.",
      inputSchema: {
        workflowId: z.string().optional().describe("Filter by workflow ID"),
        status: z.enum(["success", "error", "running", "waiting"]).optional().describe("Filter by status"),
        limit: z.number().int().min(1).max(100).default(25).describe("Maximum results")
      }
    },
    async ({ workflowId, status, limit }) => {
      try {
        const result = await n8nClient.listExecutions({ workflowId, status, limit });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "get_execution",
    {
      title: "Get Execution Details",
      description: "Retrieve detailed information about a specific execution including output data.",
      inputSchema: {
        executionId: z.string().describe("The execution ID")
      }
    },
    async ({ executionId }) => {
      try {
        const execution = await n8nClient.getExecution(executionId);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(execution, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "retry_execution",
    {
      title: "Retry Failed Execution",
      description: "Retry a failed execution. Optionally use the latest workflow version.",
      inputSchema: {
        executionId: z.string().describe("ID of the failed execution"),
        loadWorkflow: z.boolean().default(false).describe("Use latest workflow version instead of original")
      }
    },
    async ({ executionId, loadWorkflow }) => {
      try {
        const execution = await n8nClient.retryExecution(executionId, loadWorkflow);
        return {
          content: [{
            type: "text",
            text: `Execution retried. New execution ID: ${execution.id}`
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "execute_webhook",
    {
      title: "Execute Webhook Workflow",
      description: "Trigger a workflow via its webhook endpoint.",
      inputSchema: {
        webhookPath: z.string().describe("Webhook path (e.g., 'my-workflow' for /webhook/my-workflow)"),
        data: z.record(z.any()).optional().describe("JSON data to send to the webhook"),
        username: z.string().optional().describe("Basic auth username (if webhook requires auth)"),
        password: z.string().optional().describe("Basic auth password (if webhook requires auth)")
      }
    },
    async ({ webhookPath, data, username, password }) => {
      try {
        const auth = username && password ? { username, password } : undefined;
        const result = await n8nClient.executeWebhook(webhookPath, data || {}, auth);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  // ============ METADATA TOOLS ============

  server.registerTool(
    "list_tags",
    {
      title: "List Tags",
      description: "List all tags available for organizing workflows.",
      inputSchema: {}
    },
    async () => {
      try {
        const result = await n8nClient.listTags();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "list_credentials",
    {
      title: "List Credentials",
      description: "List all credentials configured in n8n (names only, not secrets).",
      inputSchema: {}
    },
    async () => {
      try {
        const result = await n8nClient.listCredentials();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "list_variables",
    {
      title: "List Variables",
      description: "List environment variables configured in n8n (Pro/Enterprise feature).",
      inputSchema: {}
    },
    async () => {
      try {
        const result = await n8nClient.listVariables();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "run_audit",
    {
      title: "Run Security Audit",
      description: "Run a security audit on the n8n instance.",
      inputSchema: {
        categories: z.array(z.string()).optional().describe("Audit categories to include")
      }
    },
    async ({ categories }) => {
      try {
        const result = await n8nClient.runAudit(categories);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );
}
```

---

## Resource Registration (src/resources.ts)

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { N8nClient } from "./n8n-client.js";

export function registerResources(server: McpServer, n8nClient: N8nClient): void {

  // Workflow list resource (static)
  server.registerResource(
    "workflows-list",
    "n8n://workflows",
    {
      title: "All Workflows",
      description: "List of all n8n workflows",
      mimeType: "application/json"
    },
    async (uri) => {
      const result = await n8nClient.listWorkflows({ limit: 100 });
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(result.data, null, 2)
        }]
      };
    }
  );

  // Individual workflow resource (dynamic template)
  server.registerResource(
    "workflow",
    new ResourceTemplate("n8n://workflow/{workflowId}", { list: undefined }),
    {
      title: "Workflow Details",
      description: "Details of a specific workflow"
    },
    async (uri, { workflowId }) => {
      const workflow = await n8nClient.getWorkflow(workflowId as string);
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(workflow, null, 2)
        }]
      };
    }
  );

  // Executions for a workflow
  server.registerResource(
    "workflow-executions",
    new ResourceTemplate("n8n://workflow/{workflowId}/executions", { list: undefined }),
    {
      title: "Workflow Executions",
      description: "Execution history for a specific workflow"
    },
    async (uri, { workflowId }) => {
      const result = await n8nClient.listExecutions({ 
        workflowId: workflowId as string,
        limit: 50 
      });
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(result.data, null, 2)
        }]
      };
    }
  );

  // Individual execution details
  server.registerResource(
    "execution",
    new ResourceTemplate("n8n://execution/{executionId}", { list: undefined }),
    {
      title: "Execution Details",
      description: "Detailed execution information including output data"
    },
    async (uri, { executionId }) => {
      const execution = await n8nClient.getExecution(executionId as string);
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(execution, null, 2)
        }]
      };
    }
  );

  // Tags resource
  server.registerResource(
    "tags",
    "n8n://tags",
    {
      title: "All Tags",
      description: "List of all workflow tags",
      mimeType: "application/json"
    },
    async (uri) => {
      const result = await n8nClient.listTags();
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(result.data, null, 2)
        }]
      };
    }
  );

  // Credentials list resource
  server.registerResource(
    "credentials",
    "n8n://credentials",
    {
      title: "All Credentials",
      description: "List of configured credentials (names only)",
      mimeType: "application/json"
    },
    async (uri) => {
      const result = await n8nClient.listCredentials();
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(result.data, null, 2)
        }]
      };
    }
  );
}
```

---

## Critical Implementation Notes

### stdio Transport Rules (If Using stdio Instead of HTTP)

When using stdio transport, **NEVER** use `console.log()` - it corrupts JSON-RPC communication:

```typescript
// WRONG - corrupts protocol
console.log("Debug message");

// CORRECT - use stderr for logging
console.error("Debug message");

// Or disable console entirely
process.env.DISABLE_CONSOLE_OUTPUT = "true";
```

### Schema Validation Requirements

1. **Zod is required** for `inputSchema` and `outputSchema`
2. If you define `outputSchema`, you **MUST** return `structuredContent`
3. Even error responses need `structuredContent` if schema is defined

```typescript
// With outputSchema defined
server.registerTool(
  "example",
  {
    inputSchema: { query: z.string() },
    outputSchema: { result: z.string() }  // <-- If this exists...
  },
  async ({ query }) => {
    const result = { result: "data" };
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result  // <-- This is REQUIRED
    };
  }
);

// Without outputSchema - structuredContent optional
server.registerTool(
  "example2",
  {
    inputSchema: { query: z.string() }
    // No outputSchema
  },
  async ({ query }) => {
    return {
      content: [{ type: "text", text: "result" }]
      // structuredContent not required
    };
  }
);
```

### Error Response Pattern

```typescript
async ({ input }) => {
  try {
    // ... operation
    return { content: [{ type: "text", text: "success" }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
      isError: true  // <-- Signals error to client
    };
  }
}
```

---

## Testing & Debugging

### MCP Inspector

The official tool for testing MCP servers:

```bash
# Start your server first
npm run dev

# In another terminal, launch inspector
npx @modelcontextprotocol/inspector

# Enter your server URL when prompted:
# http://localhost:3000/mcp
```

### Claude Code Integration

```bash
# Add MCP server to Claude Code
claude mcp add --transport http n8n-mcp http://localhost:3000/mcp
```

### VS Code Integration

Add to VS Code settings or `settings.json`:

```json
{
  "mcp.servers": {
    "n8n": {
      "command": "node",
      "args": ["/path/to/your/dist/server.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678/api/v1",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

Or for HTTP transport:

```bash
code --add-mcp '{"name":"n8n","type":"http","url":"http://localhost:3000/mcp"}'
```

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `N8N_API_URL` | Yes | n8n API base URL with `/api/v1` | `http://localhost:5678/api/v1` |
| `N8N_API_KEY` | Yes | API key from n8n Settings > API | `n8n_api_...` |
| `N8N_WEBHOOK_USERNAME` | No | Basic auth username for webhooks | `webhook_user` |
| `N8N_WEBHOOK_PASSWORD` | No | Basic auth password for webhooks | `webhook_pass` |
| `PORT` | No | Server port (default: 3000) | `3000` |
| `DEBUG` | No | Enable debug logging | `true` |

---

## n8n API Endpoints Reference

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List all workflows |
| POST | `/workflows` | Create workflow |
| GET | `/workflows/{id}` | Get workflow details |
| PUT | `/workflows/{id}` | Update workflow (auto-reactivates if active) |
| DELETE | `/workflows/{id}` | Delete workflow |
| POST | `/workflows/{id}/activate` | Activate workflow |
| POST | `/workflows/{id}/deactivate` | Deactivate workflow |

### Executions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/executions` | List executions |
| GET | `/executions/{id}` | Get execution details |
| DELETE | `/executions/{id}` | Delete execution |
| POST | `/executions/{id}/retry` | Retry failed execution |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/credentials` | List credentials |
| GET | `/credentials/schema/{type}` | Get credential type schema |
| GET | `/tags` | List tags |
| POST | `/tags` | Create tag |
| GET | `/variables` | List variables |
| POST | `/audit` | Run security audit |

---

## File Structure

```
n8n-mcp-server/
├── src/
│   ├── server.ts          # Main entry point, Express + MCP setup
│   ├── n8n-client.ts      # n8n API client class
│   ├── tools.ts           # Tool registrations
│   ├── resources.ts       # Resource registrations
│   └── types.ts           # TypeScript interfaces (optional)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Security Considerations

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 2 requests per second average
  message: { error: "Rate limit exceeded" }
});

app.use("/mcp", limiter);
```

### DNS Rebinding Protection

```typescript
const transport = new StreamableHTTPServerTransport({
  enableDnsRebindingProtection: true,
  allowedHosts: ["127.0.0.1", "localhost", "your-domain.com"],
  allowedOrigins: ["https://your-domain.com"]
});
```

### Production Deployment

1. Use HTTPS (required for production)
2. Store API keys in environment variables, not code
3. Implement proper CORS configuration
4. Add authentication middleware for multi-user scenarios
5. Use a reverse proxy (nginx, Caddy) for SSL termination

---

## References

- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP Specification: https://modelcontextprotocol.io/specification/2025-11-25
- n8n API Docs: https://docs.n8n.io/api/
- leonardsellem/n8n-mcp-server: https://github.com/leonardsellem/n8n-mcp-server
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
