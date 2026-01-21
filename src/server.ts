#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables from custom path if specified
// This allows the MCP to be used from other projects with a separate .env file
if (process.env.DOTENV_CONFIG_PATH) {
  dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  dotenv.config(); // Default .env in current directory
}

import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { N8nClient } from "./n8n-client.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { logger, createChildLogger } from "./logger.js";

const serverLogger = createChildLogger("server");

// ============ CONFIGURATION ============

interface Config {
  n8nApiUrl: string;
  n8nApiKey: string;
  port: number;
  allowedOrigins: string[];
  nodeEnv: string;
  requestTimeout: number;
  maxRetries: number;
}

function loadConfig(): Config {
  const config: Config = {
    n8nApiUrl: process.env.N8N_API_URL || "http://localhost:5678/api/v1",
    n8nApiKey: process.env.N8N_API_KEY || "",
    port: parseInt(process.env.PORT || "3000", 10),
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
    nodeEnv: process.env.NODE_ENV || "development",
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "30000", 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || "3", 10),
  };

  // Validate required config
  if (!config.n8nApiKey) {
    serverLogger.warn("N8N_API_KEY not set - API calls will fail");
  }

  return config;
}

const config = loadConfig();
const isStdioMode = process.argv.includes("--stdio");

// Create n8n client with production settings
const n8nClient = new N8nClient(config.n8nApiUrl, config.n8nApiKey, {
  timeout: config.requestTimeout,
  maxRetries: config.maxRetries,
});

// ============ SERVER FACTORY ============

function createServer(): McpServer {
  const server = new McpServer({
    name: "n8n-mcp-server",
    version: "1.0.0",
  });

  registerTools(server, n8nClient);
  registerResources(server, n8nClient);

  return server;
}

// ============ STDIO MODE ============

async function startStdioServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  serverLogger.info({ n8nUrl: config.n8nApiUrl }, "MCP server running in stdio mode");
}

// ============ HTTP MODE ============

function createCorsOptions() {
  // In production, require explicit allowed origins
  if (config.nodeEnv === "production") {
    if (config.allowedOrigins.length === 0) {
      serverLogger.warn(
        "No ALLOWED_ORIGINS set in production - CORS will reject all cross-origin requests"
      );
    }
    return {
      origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : false,
      exposedHeaders: ["mcp-session-id"],
      allowedHeaders: ["Content-Type", "mcp-session-id"],
      credentials: true,
    };
  }

  // In development, allow all origins
  return {
    origin: true,
    exposedHeaders: ["mcp-session-id"],
    allowedHeaders: ["Content-Type", "mcp-session-id"],
  };
}

function setupMiddleware(app: Express): void {
  // Security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    if (config.nodeEnv === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.use(express.json({ limit: "1mb" }));
  app.use(cors(createCorsOptions()));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      serverLogger.info({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: Date.now() - start,
      });
    });
    next();
  });

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: "Rate limit exceeded - try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/mcp", limiter);
}

function setupRoutes(app: Express): void {
  // MCP endpoint - stateless mode
  app.post("/mcp", async (req: Request, res: Response) => {
    const requestId = Math.random().toString(36).slice(2, 11);
    const reqLogger = serverLogger.child({ requestId });

    try {
      reqLogger.debug("Processing MCP request");

      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless
      });

      res.on("close", () => {
        transport.close();
        reqLogger.debug("Transport closed");
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      reqLogger.error({ error: (error as Error).message }, "MCP request failed");

      if (!res.headersSent) {
        res.status(500).json({
          error: config.nodeEnv === "production"
            ? "Internal server error"
            : (error as Error).message,
        });
      }
    }
  });

  // Method not allowed for GET on /mcp
  app.get("/mcp", (req: Request, res: Response) => {
    res.status(405).json({
      error: "Method not allowed",
      message: "Use POST for MCP requests",
    });
  });

  // Session cleanup acknowledgment (stateless mode)
  app.delete("/mcp", (req: Request, res: Response) => {
    res.status(200).json({ message: "Session cleanup acknowledged" });
  });

  // Health check
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      n8n_url: config.n8nApiUrl,
      mode: "http",
      version: "1.0.0",
      uptime: process.uptime(),
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });
}

async function startHttpServer(): Promise<() => Promise<void>> {
  const app = express();

  setupMiddleware(app);
  setupRoutes(app);

  return new Promise((resolve) => {
    const server = app.listen(config.port, () => {
      serverLogger.info({
        port: config.port,
        n8nUrl: config.n8nApiUrl,
        env: config.nodeEnv,
      }, "MCP server running");

      serverLogger.info(`Health check: http://localhost:${config.port}/health`);
      serverLogger.info(`MCP endpoint: http://localhost:${config.port}/mcp`);

      // Return shutdown function
      resolve(async () => {
        return new Promise<void>((resolveShutdown, rejectShutdown) => {
          serverLogger.info("Shutting down gracefully...");

          server.close((err) => {
            if (err) {
              serverLogger.error({ error: err.message }, "Error during shutdown");
              rejectShutdown(err);
            } else {
              serverLogger.info("Server closed");
              resolveShutdown();
            }
          });

          // Force close after timeout
          setTimeout(() => {
            serverLogger.warn("Forcing shutdown after timeout");
            resolveShutdown();
          }, 10000);
        });
      });
    });

    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        serverLogger.fatal({ port: config.port }, "Port already in use");
        process.exit(1);
      }
      serverLogger.error({ error: error.message }, "Server error");
    });
  });
}

// ============ GRACEFUL SHUTDOWN ============

function setupGracefulShutdown(shutdown: () => Promise<void>): void {
  let isShuttingDown = false;

  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    serverLogger.info({ signal }, "Received shutdown signal");

    try {
      await shutdown();
      process.exit(0);
    } catch (error) {
      serverLogger.error({ error: (error as Error).message }, "Shutdown error");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    serverLogger.fatal({ error: error.message, stack: error.stack }, "Uncaught exception");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    serverLogger.fatal({ reason }, "Unhandled rejection");
    process.exit(1);
  });
}

// ============ MAIN ============

async function main(): Promise<void> {
  serverLogger.info({
    mode: isStdioMode ? "stdio" : "http",
    nodeEnv: config.nodeEnv,
  }, "Starting n8n MCP server");

  if (isStdioMode) {
    await startStdioServer();
    // stdio mode doesn't need graceful shutdown handling
  } else {
    const shutdown = await startHttpServer();
    setupGracefulShutdown(shutdown);
  }
}

main().catch((error) => {
  serverLogger.fatal({ error: error.message }, "Fatal error during startup");
  process.exit(1);
});
