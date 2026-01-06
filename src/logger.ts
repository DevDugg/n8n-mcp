import pino from "pino";

const isStdioMode = process.argv.includes("--stdio");

// In stdio mode, logs go to stderr (stdout is for MCP protocol)
// In HTTP mode, logs go to stdout with pretty formatting in dev
export const logger = pino({
  name: "n8n-mcp-server",
  level: process.env.LOG_LEVEL || "info",
  transport:
    !isStdioMode && process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  // In stdio mode, force output to stderr
  ...(isStdioMode && {
    destination: pino.destination(2), // stderr
  }),
});

export function createChildLogger(name: string) {
  return logger.child({ module: name });
}
