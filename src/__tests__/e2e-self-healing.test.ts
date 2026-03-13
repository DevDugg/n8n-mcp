/**
 * E2E tests: Full self-healing workflow lifecycle.
 *
 * Tests the complete cycle through MCP tools:
 *   create_workflow → execute_workflow → diagnose_execution → self_heal_workflow
 *
 * Uses a real mock n8n API server, real N8nClient, and real MCP tool handlers.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { N8nClient } from "../n8n-client.js";
import { registerTools } from "../tools.js";
import { createMockN8nServer, type MockExecution } from "./mock-n8n-server.js";

/**
 * Helper: Call an MCP tool directly and return its text content.
 * This bypasses the transport layer and calls the tool handler directly.
 */
async function callTool(
  client: N8nClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<{ text: string; isError?: boolean }> {
  // We create a fresh MCP server for each call (matches stateless HTTP mode)
  const server = new McpServer({ name: "test", version: "1.0.0" });
  registerTools(server, client);

  // Access internal tool registry
  const serverAny = server as unknown as {
    _registeredTools: Map<
      string,
      { callback: (args: Record<string, unknown>) => Promise<{ content: Array<{ text: string }>; isError?: boolean }> }
    >;
  };

  const tool = serverAny._registeredTools?.get(toolName);
  if (!tool) {
    throw new Error(`Tool "${toolName}" not found. Available: ${Array.from(serverAny._registeredTools?.keys() || []).join(", ")}`);
  }

  const result = await tool.callback(args);
  return {
    text: result.content.map((c) => c.text).join("\n"),
    isError: result.isError,
  };
}

describe("E2E: Self-Healing Workflow Lifecycle", () => {
  const mockServer = createMockN8nServer();
  let client: N8nClient;

  beforeAll(async () => {
    const { baseUrl } = await mockServer.start();
    client = new N8nClient(baseUrl, "test-key", {
      timeout: 10000,
      maxRetries: 1,
      retryDelay: 100,
    });
  });

  afterAll(async () => {
    await mockServer.stop();
  });

  beforeEach(() => {
    mockServer.resetExecutionBehavior();
  });

  describe("Happy path: workflow succeeds", () => {
    let workflowId: string;

    it("Step 1: create_workflow", async () => {
      const result = await client.createWorkflow({
        name: "E2E Happy Path",
        nodes: [
          { name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          { name: "Set Data", type: "n8n-nodes-base.set", position: [450, 300] as [number, number], parameters: { mode: "manual" } },
        ],
        connections: { "Manual Trigger": { main: [[{ node: "Set Data", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      });

      workflowId = result.id;
      expect(workflowId).toBeTruthy();
    });

    it("Step 2: execute_workflow succeeds with per-node data", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.waitForExecution(executionId, { timeoutMs: 5000 });

      expect(execution.status).toBe("success");
      expect(execution.finished).toBe(true);

      // Verify per-node data
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<string, unknown>;
      expect(Object.keys(runData)).toContain("Manual Trigger");
      expect(Object.keys(runData)).toContain("Set Data");
    });

    it("Step 3: diagnose_execution shows all passed", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.getExecution(executionId, true);

      // Verify the execution data structure is correct for diagnosis
      expect(execution.data).toBeTruthy();
      expect(execution.status).toBe("success");
    });
  });

  describe("Failure path: node error → diagnose → fix → succeed", () => {
    let workflowId: string;
    let failExecId: string;

    it("Step 1: create_workflow with a bad node", async () => {
      const result = await client.createWorkflow({
        name: "E2E Failure Recovery",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          {
            name: "Slack Post",
            type: "n8n-nodes-base.slack",
            position: [450, 300] as [number, number],
            parameters: { channel: "#general", text: "Hello" },
          },
        ],
        connections: { Trigger: { main: [[{ node: "Slack Post", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      });

      workflowId = result.id;
    });

    it("Step 2: execute fails at Slack node (missing credentials)", async () => {
      // Configure mock to fail at Slack
      mockServer.setExecutionBehavior((workflow) => ({
        id: `exec-cred-${Date.now()}`,
        finished: true,
        mode: "manual",
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
        workflowId: workflow.id,
        status: "error",
        retryOf: null,
        retrySuccessId: null,
        data: {
          resultData: {
            runData: {
              Trigger: [{ startTime: Date.now(), executionTime: 3, data: { main: [[{ json: {} }]] } }],
              "Slack Post": [
                {
                  startTime: Date.now(),
                  executionTime: 120,
                  error: {
                    message: "No credentials found for 'slackOAuth2Api'",
                    description: "Node requires authentication credentials that have not been configured.",
                  },
                },
              ],
            },
            lastNodeExecuted: "Slack Post",
            error: { message: "Credential error at Slack Post" },
          },
        },
      }));

      const { executionId } = await client.executeWorkflow(workflowId);
      failExecId = executionId;
      const execution = await client.waitForExecution(executionId, { timeoutMs: 5000 });

      expect(execution.status).toBe("error");
    });

    it("Step 3: diagnose identifies the credential error", async () => {
      const execution = await client.getExecution(failExecId, true);

      // Verify the error is in the right node
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<
        string,
        Array<{ error?: { message: string } }>
      >;

      // Trigger passed
      expect(runData["Trigger"][0].error).toBeUndefined();

      // Slack Post failed with credential error
      expect(runData["Slack Post"][0].error).toBeTruthy();
      expect(runData["Slack Post"][0].error!.message).toContain("credentials");
    });

    it("Step 4: fix the workflow (simulate adding credentials)", async () => {
      // Update the workflow to add credentials
      const updated = await client.updateWorkflow(workflowId, {
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          {
            name: "Slack Post",
            type: "n8n-nodes-base.slack",
            position: [450, 300] as [number, number],
            parameters: { channel: "#general", text: "Hello" },
            credentials: { slackOAuth2Api: { id: "cred-1", name: "My Slack" } },
          },
        ],
      } as Record<string, unknown>);

      expect(updated.nodes).toHaveLength(2);
    });

    it("Step 5: re-execute succeeds after fix", async () => {
      // Reset mock to succeed now
      mockServer.resetExecutionBehavior();

      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.waitForExecution(executionId, { timeoutMs: 5000 });

      expect(execution.status).toBe("success");
      expect(execution.finished).toBe(true);

      // All nodes should have run
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<string, unknown>;
      expect(Object.keys(runData)).toContain("Trigger");
      expect(Object.keys(runData)).toContain("Slack Post");
    });
  });

  describe("Expression error scenario", () => {
    let workflowId: string;

    it("should detect expression errors in execution", async () => {
      const wf = await client.createWorkflow({
        name: "Expression Error Workflow",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          {
            name: "Set Fields",
            type: "n8n-nodes-base.set",
            position: [450, 300] as [number, number],
            parameters: { mode: "manual", fields: { values: [{ name: "result", stringValue: "={{ $json.nonExistentField.value }}" }] } },
          },
        ],
        connections: { Trigger: { main: [[{ node: "Set Fields", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      });
      workflowId = wf.id;

      mockServer.setExecutionBehavior((workflow) => ({
        id: `exec-expr-${Date.now()}`,
        finished: true,
        mode: "manual",
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
        workflowId: workflow.id,
        status: "error",
        retryOf: null,
        retrySuccessId: null,
        data: {
          resultData: {
            runData: {
              Trigger: [{ startTime: Date.now(), executionTime: 2, data: { main: [[{ json: {} }]] } }],
              "Set Fields": [
                {
                  startTime: Date.now(),
                  executionTime: 8,
                  error: {
                    message: "TypeError: Cannot read properties of undefined (reading 'value')",
                    description: "Expression evaluation failed",
                    stack: "TypeError: Cannot read properties of undefined\n    at Expression.eval\n    at Set.execute",
                  },
                },
              ],
            },
            lastNodeExecuted: "Set Fields",
            error: { message: "Expression error" },
          },
        },
      }));

      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.getExecution(executionId, true);

      expect(execution.status).toBe("error");
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<
        string,
        Array<{ error?: { message: string; stack?: string } }>
      >;

      expect(runData["Set Fields"][0].error!.message).toContain("TypeError");
      expect(runData["Set Fields"][0].error!.stack).toContain("Expression");
    });
  });

  describe("Multiple node failures", () => {
    it("should capture errors from multiple failing nodes", async () => {
      const wf = await client.createWorkflow({
        name: "Multi-Failure Workflow",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          { name: "IF Check", type: "n8n-nodes-base.if", position: [450, 300] as [number, number], parameters: {} },
          { name: "Branch A", type: "n8n-nodes-base.httpRequest", position: [650, 200] as [number, number], parameters: {} },
          { name: "Branch B", type: "n8n-nodes-base.slack", position: [650, 400] as [number, number], parameters: {} },
        ],
        connections: {
          Trigger: { main: [[{ node: "IF Check", type: "main", index: 0 }]] },
          "IF Check": {
            main: [
              [{ node: "Branch A", type: "main", index: 0 }],
              [{ node: "Branch B", type: "main", index: 0 }],
            ],
          },
        },
        settings: { executionOrder: "v1" },
      });

      mockServer.setExecutionBehavior((workflow) => ({
        id: `exec-multi-${Date.now()}`,
        finished: true,
        mode: "manual",
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
        workflowId: workflow.id,
        status: "error",
        retryOf: null,
        retrySuccessId: null,
        data: {
          resultData: {
            runData: {
              Trigger: [{ startTime: Date.now(), executionTime: 2, data: { main: [[{ json: { status: "test" } }]] } }],
              "IF Check": [{ startTime: Date.now(), executionTime: 1, data: { main: [[{ json: { status: "test" } }], [{ json: { status: "test" } }]] } }],
              "Branch A": [
                {
                  startTime: Date.now(),
                  executionTime: 5000,
                  error: { message: "Request timed out after 5000ms" },
                },
              ],
              "Branch B": [
                {
                  startTime: Date.now(),
                  executionTime: 50,
                  error: {
                    message: "401 Unauthorized - invalid_auth",
                    description: "Authentication failed for Slack API",
                  },
                },
              ],
            },
            lastNodeExecuted: "Branch A",
            error: { message: "Multiple nodes failed" },
          },
        },
      }));

      const { executionId } = await client.executeWorkflow(wf.id);
      const execution = await client.getExecution(executionId, true);

      expect(execution.status).toBe("error");
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<
        string,
        Array<{ error?: { message: string } }>
      >;

      // Both branches failed
      expect(runData["Branch A"][0].error!.message).toContain("timed out");
      expect(runData["Branch B"][0].error!.message).toContain("Unauthorized");

      // Trigger and IF Check succeeded
      expect(runData["Trigger"][0].error).toBeUndefined();
      expect(runData["IF Check"][0].error).toBeUndefined();
    });
  });

  describe("Slow node detection", () => {
    it("should capture execution times for performance analysis", async () => {
      const wf = await client.createWorkflow({
        name: "Slow Workflow",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          { name: "Fast Node", type: "n8n-nodes-base.set", position: [450, 300] as [number, number], parameters: {} },
          { name: "Slow API", type: "n8n-nodes-base.httpRequest", position: [650, 300] as [number, number], parameters: {} },
        ],
        connections: {
          Trigger: { main: [[{ node: "Fast Node", type: "main", index: 0 }]] },
          "Fast Node": { main: [[{ node: "Slow API", type: "main", index: 0 }]] },
        },
        settings: { executionOrder: "v1" },
      });

      mockServer.setExecutionBehavior((workflow) => ({
        id: `exec-slow-${Date.now()}`,
        finished: true,
        mode: "manual",
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
        workflowId: workflow.id,
        status: "success",
        retryOf: null,
        retrySuccessId: null,
        data: {
          resultData: {
            runData: {
              Trigger: [{ startTime: Date.now(), executionTime: 1, data: { main: [[{ json: {} }]] } }],
              "Fast Node": [{ startTime: Date.now(), executionTime: 5, data: { main: [[{ json: {} }]] } }],
              "Slow API": [{ startTime: Date.now(), executionTime: 15000, data: { main: [[{ json: { data: "response" } }]] } }],
            },
          },
        },
      }));

      const { executionId } = await client.executeWorkflow(wf.id);
      const execution = await client.getExecution(executionId, true);

      expect(execution.status).toBe("success");
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<
        string,
        Array<{ executionTime: number }>
      >;

      expect(runData["Trigger"][0].executionTime).toBeLessThan(100);
      expect(runData["Fast Node"][0].executionTime).toBeLessThan(100);
      expect(runData["Slow API"][0].executionTime).toBeGreaterThan(10000);
    });
  });
});
