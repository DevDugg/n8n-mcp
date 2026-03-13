import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";
import { N8nClient, N8nApiError, N8nTimeoutError } from "../n8n-client.js";

describe("N8nClient", () => {
  let client: N8nClient;
  const mockBaseUrl = "http://localhost:5678/api/v1";
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    client = new N8nClient(mockBaseUrl, mockApiKey, {
      timeout: 5000,
      maxRetries: 2,
      retryDelay: 100,
    });
  });

  describe("constructor", () => {
    it("should use default options when not provided", () => {
      const defaultClient = new N8nClient(mockBaseUrl, mockApiKey);
      expect(defaultClient).toBeDefined();
    });

    it("should accept custom options", () => {
      const customClient = new N8nClient(mockBaseUrl, mockApiKey, {
        timeout: 10000,
        maxRetries: 5,
        retryDelay: 2000,
      });
      expect(customClient).toBeDefined();
    });
  });

  describe("listWorkflows", () => {
    it("should make GET request to /workflows", async () => {
      const mockResponse = {
        data: [
          { id: "1", name: "Test Workflow", active: true },
        ],
      };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await client.listWorkflows();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Test Workflow");

      fetchSpy.mockRestore();
    });

    it("should include query parameters", async () => {
      const mockResponse = { data: [] };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      await client.listWorkflows({ active: true, limit: 10 });

      const calledUrl = (fetchSpy.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain("active=true");
      expect(calledUrl).toContain("limit=10");

      fetchSpy.mockRestore();
    });
  });

  describe("getWorkflow", () => {
    it("should make GET request to /workflows/:id", async () => {
      const mockWorkflow = {
        id: "123",
        name: "Test",
        active: false,
        nodes: [],
        connections: {},
      };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockWorkflow), { status: 200 })
      );

      const result = await client.getWorkflow("123");

      expect(result.id).toBe("123");
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });

    it("should encode special characters in ID", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "test/id" }), { status: 200 })
      );

      await client.getWorkflow("test/id");

      const calledUrl = (fetchSpy.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain(encodeURIComponent("test/id"));

      fetchSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("should throw N8nApiError on 4xx responses", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("Not found", { status: 404 })
      );

      await expect(client.getWorkflow("nonexistent")).rejects.toThrow(N8nApiError);

      fetchSpy.mockRestore();
    });

    it("should throw N8nApiError on 5xx responses after retries", async () => {
      const fetchSpy = spyOn(global, "fetch")
        .mockResolvedValueOnce(new Response("Server error", { status: 500 }))
        .mockResolvedValueOnce(new Response("Server error", { status: 500 }));

      await expect(client.getWorkflow("123")).rejects.toThrow(N8nApiError);
      expect(fetchSpy).toHaveBeenCalledTimes(2); // Should retry once

      fetchSpy.mockRestore();
    });

    it("should retry on 429 rate limit", async () => {
      const mockWorkflow = { id: "123", name: "Test" };

      const fetchSpy = spyOn(global, "fetch")
        .mockResolvedValueOnce(new Response("Rate limited", { status: 429 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockWorkflow), { status: 200 })
        );

      const result = await client.getWorkflow("123");

      expect(result.id).toBe("123");
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });

    it("should not retry on 4xx errors (except 429)", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("Bad request", { status: 400 })
      );

      await expect(client.getWorkflow("123")).rejects.toThrow(N8nApiError);
      expect(fetchSpy).toHaveBeenCalledTimes(1); // No retry

      fetchSpy.mockRestore();
    });
  });

  describe("createWorkflow", () => {
    it("should make POST request with workflow data", async () => {
      const newWorkflow = {
        name: "New Workflow",
        nodes: [],
        connections: {},
      };

      const mockResponse = { id: "new-id", ...newWorkflow };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await client.createWorkflow(newWorkflow);

      expect(result.id).toBe("new-id");

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body as string)).toEqual(newWorkflow);

      fetchSpy.mockRestore();
    });
  });

  describe("deleteWorkflow", () => {
    it("should make DELETE request", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("", { status: 200 })
      );

      await client.deleteWorkflow("123");

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe("DELETE");

      fetchSpy.mockRestore();
    });
  });

  describe("activateWorkflow", () => {
    it("should make POST to /activate endpoint", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "123", active: true }), { status: 200 })
      );

      const result = await client.activateWorkflow("123");

      expect(result.active).toBe(true);
      const calledUrl = (fetchSpy.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain("/activate");

      fetchSpy.mockRestore();
    });
  });

  describe("executeWorkflow", () => {
    it("should try /execute endpoint first", async () => {
      const mockResponse = { data: { id: "exec-1" } };

      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await client.executeWorkflow("123", { key: "value" });

      expect(result.executionId).toBe("exec-1");

      const calledUrl = (fetchSpy.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain("/workflows/123/execute");

      fetchSpy.mockRestore();
    });

    it("should fall back to /run when /execute returns 404", async () => {
      const mockRunResponse = { data: { id: "exec-2" } };

      const fetchSpy = spyOn(global, "fetch")
        .mockResolvedValueOnce(new Response("Not found", { status: 404 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockRunResponse), { status: 200 })
        );

      const result = await client.executeWorkflow("123");

      expect(result.executionId).toBe("exec-2");
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      const secondUrl = (fetchSpy.mock.calls[1] as [string, RequestInit])[0];
      expect(secondUrl).toContain("/workflows/123/run");

      fetchSpy.mockRestore();
    });
  });

  describe("executeWebhook", () => {
    it("should POST to webhook URL", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const result = await client.executeWebhook("my-webhook", { data: "test" });

      expect(result).toEqual({ success: true });

      const calledUrl = (fetchSpy.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain("/webhook/my-webhook");

      fetchSpy.mockRestore();
    });

    it("should include basic auth when provided", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      await client.executeWebhook("my-webhook", {}, {
        username: "user",
        password: "pass",
      });

      const calledUrl = (fetchSpy.mock.calls[0] as [string, RequestInit])[0];
      expect(calledUrl).toContain("/webhook/my-webhook");
      // Auth header is set via the headers object passed to fetch
      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const headers = new Headers(options.headers as HeadersInit);
      expect(headers.get("Authorization")).toContain("Basic");

      fetchSpy.mockRestore();
    });
  });

  describe("headers", () => {
    it("should include API key in all requests", async () => {
      const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), { status: 200 })
      );

      await client.listWorkflows();

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const headers = new Headers(options.headers as HeadersInit);
      expect(headers.get("X-N8N-API-KEY")).toBe(mockApiKey);

      fetchSpy.mockRestore();
    });
  });
});
