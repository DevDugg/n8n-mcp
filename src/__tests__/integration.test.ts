/**
 * Integration tests: MCP tools against a mock n8n API server.
 * Tests the full stack: N8nClient → mock HTTP → real response parsing.
 */
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { N8nClient } from "../n8n-client.js";
import { createMockN8nServer } from "./mock-n8n-server.js";

describe("Integration: N8nClient against mock n8n API", () => {
  const mockServer = createMockN8nServer();
  let client: N8nClient;

  beforeAll(async () => {
    const { baseUrl } = await mockServer.start();
    client = new N8nClient(baseUrl, "test-key", {
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 100,
    });
  });

  afterAll(async () => {
    await mockServer.stop();
  });

  describe("Workflow CRUD", () => {
    let workflowId: string;

    it("should create a workflow", async () => {
      const result = await client.createWorkflow({
        name: "Integration Test Workflow",
        nodes: [
          {
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger",
            position: [250, 300] as [number, number],
            parameters: {},
          },
          {
            name: "Set Data",
            type: "n8n-nodes-base.set",
            position: [450, 300] as [number, number],
            parameters: { mode: "manual", fields: { values: [{ name: "test", stringValue: "hello" }] } },
          },
        ],
        connections: {
          "Manual Trigger": { main: [[{ node: "Set Data", type: "main", index: 0 }]] },
        },
        settings: { executionOrder: "v1" },
      });

      expect(result.id).toBeTruthy();
      expect(result.name).toBe("Integration Test Workflow");
      expect(result.active).toBe(false);
      workflowId = result.id;
    });

    it("should get a workflow by ID", async () => {
      const result = await client.getWorkflow(workflowId);
      expect(result.id).toBe(workflowId);
      expect(result.name).toBe("Integration Test Workflow");
      expect(result.nodes).toHaveLength(2);
    });

    it("should list workflows", async () => {
      const result = await client.listWorkflows();
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const found = result.data.find((w) => w.id === workflowId);
      expect(found).toBeTruthy();
    });

    it("should update a workflow", async () => {
      const result = await client.updateWorkflow(workflowId, {
        name: "Updated Integration Test",
      });
      expect(result.name).toBe("Updated Integration Test");
    });

    it("should activate a workflow", async () => {
      const result = await client.activateWorkflow(workflowId);
      expect(result.active).toBe(true);
    });

    it("should deactivate a workflow", async () => {
      const result = await client.deactivateWorkflow(workflowId);
      expect(result.active).toBe(false);
    });

    it("should delete a workflow", async () => {
      await client.deleteWorkflow(workflowId);
      await expect(client.getWorkflow(workflowId)).rejects.toThrow();
    });

    it("should return 404 for non-existent workflow", async () => {
      await expect(client.getWorkflow("nonexistent-id")).rejects.toThrow();
    });
  });

  describe("Workflow Execution", () => {
    let workflowId: string;

    beforeAll(async () => {
      const wf = await client.createWorkflow({
        name: "Execution Test Workflow",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          { name: "HTTP Request", type: "n8n-nodes-base.httpRequest", position: [450, 300] as [number, number], parameters: { url: "https://api.example.com" } },
        ],
        connections: { Trigger: { main: [[{ node: "HTTP Request", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      });
      workflowId = wf.id;
    });

    it("should execute a workflow and get execution ID", async () => {
      const result = await client.executeWorkflow(workflowId);
      expect(result.executionId).toBeTruthy();
      expect(result.executionId).toMatch(/^exec-/);
    });

    it("should wait for execution and get full data", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.waitForExecution(executionId, { timeoutMs: 5000 });

      expect(execution.finished).toBe(true);
      expect(execution.status).toBe("success");
      expect(execution.workflowId).toBe(workflowId);
      expect(execution.data).toBeTruthy();
    });

    it("should include per-node run data with includeData", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.getExecution(executionId, true);

      expect(execution.data).toBeTruthy();
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<string, unknown>;

      expect(runData["Trigger"]).toBeTruthy();
      expect(runData["HTTP Request"]).toBeTruthy();
    });

    it("should exclude data without includeData flag", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.getExecution(executionId, false);

      expect(execution.data).toBeUndefined();
    });

    it("should list executions filtered by workflow", async () => {
      const result = await client.listExecutions({ workflowId });
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.data.every((e) => e.workflowId === workflowId)).toBe(true);
    });
  });

  describe("Execution with failures", () => {
    let workflowId: string;

    beforeAll(async () => {
      const wf = await client.createWorkflow({
        name: "Failing Workflow",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          { name: "Bad HTTP", type: "n8n-nodes-base.httpRequest", position: [450, 300] as [number, number], parameters: { url: "https://nonexistent.example.com" } },
          { name: "Never Reached", type: "n8n-nodes-base.set", position: [650, 300] as [number, number], parameters: {} },
        ],
        connections: {
          Trigger: { main: [[{ node: "Bad HTTP", type: "main", index: 0 }]] },
          "Bad HTTP": { main: [[{ node: "Never Reached", type: "main", index: 0 }]] },
        },
        settings: { executionOrder: "v1" },
      });
      workflowId = wf.id;

      // Configure mock to simulate a failure at "Bad HTTP"
      mockServer.setExecutionBehavior((workflow) => {
        const execId = `exec-fail-${Date.now()}`;
        return {
          id: execId,
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
                Trigger: [
                  {
                    startTime: Date.now(),
                    executionTime: 5,
                    data: { main: [[{ json: {} }]] },
                  },
                ],
                "Bad HTTP": [
                  {
                    startTime: Date.now(),
                    executionTime: 3200,
                    error: {
                      message: "ECONNREFUSED - connect ECONNREFUSED 127.0.0.1:443",
                      description: "The service refused the connection. Check the URL and ensure the service is running.",
                    },
                  },
                ],
              },
              lastNodeExecuted: "Bad HTTP",
              error: { message: "ECONNREFUSED - connect ECONNREFUSED 127.0.0.1:443" },
            },
          },
        };
      });
    });

    afterAll(() => {
      mockServer.resetExecutionBehavior();
    });

    it("should execute and return error status", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.waitForExecution(executionId, { timeoutMs: 5000 });

      expect(execution.status).toBe("error");
      expect(execution.finished).toBe(true);
    });

    it("should include per-node error data", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.getExecution(executionId, true);

      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<
        string,
        Array<{ error?: { message: string } }>
      >;

      // Trigger succeeded
      expect(runData["Trigger"]).toBeTruthy();
      expect(runData["Trigger"][0].error).toBeUndefined();

      // Bad HTTP failed
      expect(runData["Bad HTTP"]).toBeTruthy();
      expect(runData["Bad HTTP"][0].error).toBeTruthy();
      expect(runData["Bad HTTP"][0].error!.message).toContain("ECONNREFUSED");

      // Never Reached wasn't executed
      expect(runData["Never Reached"]).toBeUndefined();
    });
  });

  describe("Credential and auth errors", () => {
    let workflowId: string;

    beforeAll(async () => {
      const wf = await client.createWorkflow({
        name: "Auth Error Workflow",
        nodes: [
          { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [250, 300] as [number, number], parameters: {} },
          { name: "Slack", type: "n8n-nodes-base.slack", position: [450, 300] as [number, number], parameters: { channel: "#test" } },
        ],
        connections: { Trigger: { main: [[{ node: "Slack", type: "main", index: 0 }]] } },
        settings: { executionOrder: "v1" },
      });
      workflowId = wf.id;

      mockServer.setExecutionBehavior((workflow) => ({
        id: `exec-auth-${Date.now()}`,
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
              Slack: [
                {
                  startTime: Date.now(),
                  executionTime: 150,
                  error: {
                    message: "No credentials found for 'slackOAuth2Api'. Please configure credentials in n8n.",
                    description: "Authentication failed. Please check your credentials.",
                  },
                },
              ],
            },
            lastNodeExecuted: "Slack",
            error: { message: "Credential error" },
          },
        },
      }));
    });

    afterAll(() => {
      mockServer.resetExecutionBehavior();
    });

    it("should detect credential errors in execution data", async () => {
      const { executionId } = await client.executeWorkflow(workflowId);
      const execution = await client.getExecution(executionId, true);

      expect(execution.status).toBe("error");
      const resultData = execution.data as Record<string, unknown>;
      const runData = (resultData.resultData as Record<string, unknown>).runData as Record<
        string,
        Array<{ error?: { message: string } }>
      >;

      expect(runData["Slack"][0].error!.message).toContain("credentials");
    });
  });
});
