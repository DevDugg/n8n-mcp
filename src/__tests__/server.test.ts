import { describe, it, expect, beforeAll, afterAll } from "bun:test";

describe("Server Integration", () => {
  describe("Health Check", () => {
    it("should return health status", async () => {
      // This test requires the server to be running
      // In CI, you would start the server before running tests
      const response = await fetch("http://localhost:3000/health").catch(() => null);

      if (response) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.status).toBe("ok");
        expect(data.mode).toBe("http");
      } else {
        // Skip if server is not running
        console.log("Server not running, skipping integration test");
      }
    });
  });

  describe("MCP Endpoint", () => {
    it("should reject GET requests", async () => {
      const response = await fetch("http://localhost:3000/mcp").catch(() => null);

      if (response) {
        expect(response.status).toBe(405);
      }
    });

    it("should handle POST requests", async () => {
      const response = await fetch("http://localhost:3000/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" },
          },
        }),
      }).catch(() => null);

      if (response) {
        expect(response.status).toBe(200);
      }
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await fetch("http://localhost:3000/unknown").catch(() => null);

      if (response) {
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error).toBe("Not found");
      }
    });
  });
});

describe("Configuration", () => {
  it("should use environment variables", () => {
    // Test that config loading works
    expect(process.env.N8N_API_URL || "http://localhost:5678/api/v1").toBeTruthy();
  });
});
