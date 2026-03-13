import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { N8nClient } from "../n8n-client.js";

describe("Self-Healing Features", () => {
  let client: N8nClient;
  const mockBaseUrl = "http://localhost:5678/api/v1";
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    client = new N8nClient(mockBaseUrl, mockApiKey, {
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 10,
    });
  });

  describe("executeWorkflow", () => {
    it("should try /execute first and return executionId", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "exec-abc" } }), { status: 200 })
      );

      const result = await client.executeWorkflow("wf-1");
      expect(result.executionId).toBe("exec-abc");

      const url = (fetchSpy.mock.calls[0] as [string])[0];
      expect(url).toContain("/workflows/wf-1/execute");

      fetchSpy.mockRestore();
    });

    it("should fall back to /run on 404", async () => {
      const fetchSpy = spyOn(global, "fetch")
        .mockResolvedValueOnce(new Response("Not found", { status: 404 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: { id: "exec-fallback" } }), { status: 200 })
        );

      const result = await client.executeWorkflow("wf-1");
      expect(result.executionId).toBe("exec-fallback");
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      const secondUrl = (fetchSpy.mock.calls[1] as [string])[0];
      expect(secondUrl).toContain("/workflows/wf-1/run");

      fetchSpy.mockRestore();
    });

    it("should throw descriptive error when both endpoints return 404", async () => {
      const fetchSpy = spyOn(global, "fetch")
        .mockResolvedValueOnce(new Response("Not found", { status: 404 }))
        .mockResolvedValueOnce(new Response("Not found", { status: 404 }));

      await expect(client.executeWorkflow("wf-1")).rejects.toThrow(
        /Workflow execution endpoint not available/
      );

      fetchSpy.mockRestore();
    });

    it("should pass payload in request body", async () => {
      const payload = { triggerData: { value: 42 } };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "exec-1" } }), { status: 200 })
      );

      await client.executeWorkflow("wf-1", payload);

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual(payload);

      fetchSpy.mockRestore();
    });

    it("should propagate non-404 errors from /execute", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("Forbidden", { status: 403 })
      );

      await expect(client.executeWorkflow("wf-1")).rejects.toThrow();

      fetchSpy.mockRestore();
    });
  });

  describe("getExecution with includeData", () => {
    it("should add includeData=true query param", async () => {
      const mockExecution = {
        id: "exec-1",
        finished: true,
        status: "success",
        data: { resultData: { runData: {} } },
      };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockExecution), { status: 200 })
      );

      await client.getExecution("exec-1", true);

      const url = (fetchSpy.mock.calls[0] as [string])[0];
      expect(url).toContain("includeData=true");

      fetchSpy.mockRestore();
    });

    it("should not add includeData param by default", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "exec-1", finished: true, status: "success" }), { status: 200 })
      );

      await client.getExecution("exec-1");

      const url = (fetchSpy.mock.calls[0] as [string])[0];
      expect(url).not.toContain("includeData");

      fetchSpy.mockRestore();
    });
  });

  describe("waitForExecution", () => {
    it("should return immediately when execution is already finished", async () => {
      const mockExecution = {
        id: "exec-1",
        finished: true,
        status: "success",
        startedAt: "2026-01-01T00:00:00Z",
        stoppedAt: "2026-01-01T00:00:01Z",
        data: { resultData: { runData: {} } },
      };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockExecution), { status: 200 })
      );

      const result = await client.waitForExecution("exec-1", { timeoutMs: 5000 });
      expect(result.finished).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });

    it("should return on error status even if not finished", async () => {
      const mockExecution = {
        id: "exec-1",
        finished: false,
        status: "error",
        startedAt: "2026-01-01T00:00:00Z",
        data: { resultData: { runData: {} } },
      };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockExecution), { status: 200 })
      );

      const result = await client.waitForExecution("exec-1");
      expect(result.status).toBe("error");

      fetchSpy.mockRestore();
    });

    it("should poll until execution finishes", async () => {
      const running = {
        id: "exec-1",
        finished: false,
        status: "running",
        startedAt: "2026-01-01T00:00:00Z",
      };
      const done = {
        id: "exec-1",
        finished: true,
        status: "success",
        startedAt: "2026-01-01T00:00:00Z",
        stoppedAt: "2026-01-01T00:00:02Z",
        data: { resultData: { runData: { "Node1": [{ executionTime: 100 }] } } },
      };

      const fetchSpy = spyOn(global, "fetch")
        .mockResolvedValueOnce(new Response(JSON.stringify(running), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(done), { status: 200 }));

      const result = await client.waitForExecution("exec-1", {
        timeoutMs: 10000,
        pollIntervalMs: 50,
      });

      expect(result.finished).toBe(true);
      expect(result.status).toBe("success");
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });

    it("should timeout if execution never finishes", async () => {
      const running = {
        id: "exec-1",
        finished: false,
        status: "running",
        startedAt: "2026-01-01T00:00:00Z",
      };

      // mockImplementation creates a fresh Response for each call
      const fetchSpy = spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(running), { status: 200 }))
      );

      try {
        await client.waitForExecution("exec-1", { timeoutMs: 200, pollIntervalMs: 50 });
        throw new Error("Should have thrown");
      } catch (error) {
        expect((error as Error).message).toMatch(/timed out/);
      } finally {
        // Restore immediately to avoid leaking into other test files
        fetchSpy.mockRestore();
      }
    });
  });
});
