/**
 * Core Nodes - Essential utility nodes
 */

import type { NodeSchema } from "./types.js";

export const CORE_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.httpRequest": {
    type: "n8n-nodes-base.httpRequest",
    displayName: "HTTP Request",
    description: "Make HTTP requests to any URL. Supports all methods, authentication, headers, body, and pagination.",
    category: "core",
    typeVersion: 4.2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "method",
        type: "options",
        required: true,
        default: "GET",
        description: "HTTP method",
        options: [
          { name: "DELETE", value: "DELETE" },
          { name: "GET", value: "GET" },
          { name: "HEAD", value: "HEAD" },
          { name: "OPTIONS", value: "OPTIONS" },
          { name: "PATCH", value: "PATCH" },
          { name: "POST", value: "POST" },
          { name: "PUT", value: "PUT" },
        ],
      },
      {
        name: "url",
        type: "string",
        required: true,
        default: "",
        description: "URL to request. Supports expressions.",
        placeholder: "https://api.example.com/endpoint",
      },
      {
        name: "authentication",
        type: "options",
        required: false,
        default: "none",
        description: "Authentication method",
        options: [
          { name: "None", value: "none" },
          { name: "Predefined Credential Type", value: "predefinedCredentialType" },
          { name: "Generic Credential Type", value: "genericCredentialType" },
        ],
      },
      {
        name: "sendHeaders",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to send custom headers",
      },
      {
        name: "headerParameters",
        type: "fixedCollection",
        required: false,
        description: "Custom headers to send",
      },
      {
        name: "sendQuery",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to send query parameters",
      },
      {
        name: "queryParameters",
        type: "fixedCollection",
        required: false,
        description: "Query parameters to append to URL",
      },
      {
        name: "sendBody",
        type: "boolean",
        required: false,
        default: false,
        description: "Whether to send a request body",
      },
      {
        name: "specifyBody",
        type: "options",
        required: false,
        default: "keypair",
        description: "How to specify the body",
        options: [
          { name: "Using Fields Below", value: "keypair" },
          { name: "Using JSON", value: "json" },
          { name: "Using Raw", value: "raw" },
        ],
      },
      {
        name: "jsonBody",
        type: "json",
        required: false,
        description: "JSON body (when specifyBody is 'json')",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: timeout, redirect, response format, pagination, proxy, SSL",
      },
    ],
    examples: [
      {
        name: "GET Request",
        description: "Simple GET request",
        parameters: {
          method: "GET",
          url: "https://api.example.com/users",
          authentication: "none",
        },
      },
      {
        name: "POST with JSON",
        description: "POST request with JSON body",
        parameters: {
          method: "POST",
          url: "https://api.example.com/users",
          sendHeaders: true,
          headerParameters: {
            parameters: [{ name: "Content-Type", value: "application/json" }],
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody: '={{ JSON.stringify({ name: $json.name, email: $json.email }) }}',
        },
      },
      {
        name: "Authenticated Request",
        description: "Request with Bearer token",
        parameters: {
          method: "GET",
          url: "https://api.example.com/me",
          sendHeaders: true,
          headerParameters: {
            parameters: [{ name: "Authorization", value: "Bearer {{ $env.API_TOKEN }}" }],
          },
        },
      },
      {
        name: "With Query Parameters",
        description: "GET with query string",
        parameters: {
          method: "GET",
          url: "https://api.example.com/search",
          sendQuery: true,
          queryParameters: {
            parameters: [
              { name: "q", value: "={{ $json.searchTerm }}" },
              { name: "limit", value: "10" },
            ],
          },
        },
      },
      {
        name: "Paginated Request",
        description: "Request with pagination",
        parameters: {
          method: "GET",
          url: "https://api.example.com/items",
          options: {
            pagination: {
              paginationMode: "off",
            },
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/",
  },

  "n8n-nodes-base.code": {
    type: "n8n-nodes-base.code",
    displayName: "Code",
    description: "Execute custom JavaScript or Python code. Has access to incoming data and can return modified data.",
    category: "core",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "runOnceForAllItems",
        description: "How to run the code",
        options: [
          { name: "Run Once for All Items", value: "runOnceForAllItems", description: "Code runs once with access to all items" },
          { name: "Run Once for Each Item", value: "runOnceForEachItem", description: "Code runs once per item" },
        ],
      },
      {
        name: "language",
        type: "options",
        required: true,
        default: "javaScript",
        description: "Programming language",
        options: [
          { name: "JavaScript", value: "javaScript" },
          { name: "Python", value: "python" },
        ],
      },
      {
        name: "jsCode",
        type: "string",
        required: false,
        description: "JavaScript code to execute",
      },
      {
        name: "pythonCode",
        type: "string",
        required: false,
        description: "Python code to execute",
      },
    ],
    examples: [
      {
        name: "Transform Data",
        description: "Transform incoming items",
        parameters: {
          mode: "runOnceForAllItems",
          language: "javaScript",
          jsCode: `const items = $input.all();
return items.map(item => ({
  json: {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString()
  }
}));`,
        },
      },
      {
        name: "Filter Items",
        description: "Filter items based on condition",
        parameters: {
          mode: "runOnceForAllItems",
          language: "javaScript",
          jsCode: `const items = $input.all();
return items.filter(item => item.json.status === 'active');`,
        },
      },
      {
        name: "Aggregate Data",
        description: "Calculate totals",
        parameters: {
          mode: "runOnceForAllItems",
          language: "javaScript",
          jsCode: `const items = $input.all();
const total = items.reduce((sum, item) => sum + item.json.amount, 0);
return [{ json: { total, count: items.length } }];`,
        },
      },
      {
        name: "Parse JSON String",
        description: "Parse JSON from string field",
        parameters: {
          mode: "runOnceForEachItem",
          language: "javaScript",
          jsCode: `const data = JSON.parse($input.item.json.jsonString);
return { json: { ...data } };`,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/",
  },

  "n8n-nodes-base.function": {
    type: "n8n-nodes-base.function",
    displayName: "Function",
    description: "Execute custom JavaScript code (legacy node, use Code node instead)",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "functionCode",
        type: "string",
        required: true,
        description: "JavaScript code to execute",
      },
    ],
    examples: [
      {
        name: "Basic Function",
        description: "Simple transformation",
        parameters: {
          functionCode: `items = items.map(item => {
  item.json.processed = true;
  return item;
});
return items;`,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.function/",
  },

  "n8n-nodes-base.executeCommand": {
    type: "n8n-nodes-base.executeCommand",
    displayName: "Execute Command",
    description: "Execute shell commands on the host system",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "command",
        type: "string",
        required: true,
        description: "Shell command to execute",
        placeholder: "ls -la",
      },
      {
        name: "executeOnce",
        type: "boolean",
        required: false,
        default: true,
        description: "Execute command once or for each item",
      },
    ],
    examples: [
      {
        name: "List Files",
        description: "List files in a directory",
        parameters: {
          command: "ls -la /data",
          executeOnce: true,
        },
      },
      {
        name: "Run Script",
        description: "Execute a shell script",
        parameters: {
          command: "/scripts/process.sh {{ $json.filename }}",
          executeOnce: false,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/",
  },

  "n8n-nodes-base.executeWorkflow": {
    type: "n8n-nodes-base.executeWorkflow",
    displayName: "Execute Workflow",
    description: "Execute another workflow and optionally return data",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "source",
        type: "options",
        required: true,
        default: "database",
        description: "Where to get the workflow from",
        options: [
          { name: "Database", value: "database", description: "Select from saved workflows" },
          { name: "URL", value: "url", description: "Load from URL" },
        ],
      },
      {
        name: "workflowId",
        type: "string",
        required: false,
        description: "ID of the workflow to execute",
      },
      {
        name: "mode",
        type: "options",
        required: true,
        default: "once",
        description: "Execution mode",
        options: [
          { name: "Once", value: "once", description: "Execute once with all items" },
          { name: "Each Item", value: "each", description: "Execute for each item" },
        ],
      },
    ],
    examples: [
      {
        name: "Call Sub-workflow",
        description: "Execute a saved workflow",
        parameters: {
          source: "database",
          workflowId: "123",
          mode: "once",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/",
  },

  "n8n-nodes-base.crypto": {
    type: "n8n-nodes-base.crypto",
    displayName: "Crypto",
    description: "Perform cryptographic operations (hash, encrypt, decrypt, sign, verify)",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "action",
        type: "options",
        required: true,
        default: "hash",
        description: "Action to perform",
        options: [
          { name: "Hash", value: "hash" },
          { name: "Hmac", value: "hmac" },
          { name: "Sign", value: "sign" },
          { name: "Generate", value: "generate" },
        ],
      },
      {
        name: "type",
        type: "options",
        required: true,
        default: "SHA256",
        description: "Algorithm type",
        options: [
          { name: "MD5", value: "MD5" },
          { name: "SHA256", value: "SHA256" },
          { name: "SHA384", value: "SHA384" },
          { name: "SHA512", value: "SHA512" },
        ],
      },
      {
        name: "value",
        type: "string",
        required: true,
        description: "Value to process",
      },
      {
        name: "encoding",
        type: "options",
        required: false,
        default: "hex",
        description: "Output encoding",
        options: [
          { name: "BASE64", value: "base64" },
          { name: "HEX", value: "hex" },
        ],
      },
    ],
    examples: [
      {
        name: "SHA256 Hash",
        description: "Hash a value with SHA256",
        parameters: {
          action: "hash",
          type: "SHA256",
          value: "={{ $json.password }}",
          encoding: "hex",
        },
      },
      {
        name: "Generate UUID",
        description: "Generate a random UUID",
        parameters: {
          action: "generate",
          type: "uuid",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.crypto/",
  },

  "n8n-nodes-base.dateTime": {
    type: "n8n-nodes-base.dateTime",
    displayName: "Date & Time",
    description: "Manipulate date and time values",
    category: "core",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "action",
        type: "options",
        required: true,
        default: "calculate",
        description: "Action to perform",
        options: [
          { name: "Calculate a Date", value: "calculate" },
          { name: "Format a Date", value: "format" },
          { name: "Get Current Date", value: "now" },
          { name: "Get Time Between Dates", value: "timeBetweenDates" },
          { name: "Extract Part of a Date", value: "extractDate" },
          { name: "Round a Date", value: "round" },
        ],
      },
      {
        name: "value",
        type: "string",
        required: false,
        description: "Date value to process",
      },
      {
        name: "duration",
        type: "number",
        required: false,
        description: "Duration to add/subtract",
      },
      {
        name: "timeUnit",
        type: "options",
        required: false,
        description: "Time unit",
        options: [
          { name: "Seconds", value: "seconds" },
          { name: "Minutes", value: "minutes" },
          { name: "Hours", value: "hours" },
          { name: "Days", value: "days" },
          { name: "Weeks", value: "weeks" },
          { name: "Months", value: "months" },
          { name: "Years", value: "years" },
        ],
      },
      {
        name: "outputFormat",
        type: "string",
        required: false,
        default: "yyyy-MM-dd",
        description: "Output date format",
      },
    ],
    examples: [
      {
        name: "Add Days",
        description: "Add 7 days to a date",
        parameters: {
          action: "calculate",
          value: "={{ $json.date }}",
          operation: "add",
          duration: 7,
          timeUnit: "days",
        },
      },
      {
        name: "Format Date",
        description: "Format date to ISO",
        parameters: {
          action: "format",
          value: "={{ $json.date }}",
          outputFormat: "yyyy-MM-dd'T'HH:mm:ss",
        },
      },
      {
        name: "Get Current Time",
        description: "Get current timestamp",
        parameters: {
          action: "now",
          outputFormat: "yyyy-MM-dd HH:mm:ss",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datetime/",
  },

  "n8n-nodes-base.jwt": {
    type: "n8n-nodes-base.jwt",
    displayName: "JWT",
    description: "Create and verify JSON Web Tokens",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "sign",
        description: "Operation to perform",
        options: [
          { name: "Sign", value: "sign", description: "Create a new JWT" },
          { name: "Decode", value: "decode", description: "Decode a JWT without verification" },
          { name: "Verify", value: "verify", description: "Verify and decode a JWT" },
        ],
      },
      {
        name: "payload",
        type: "json",
        required: false,
        description: "JWT payload (for sign operation)",
      },
      {
        name: "token",
        type: "string",
        required: false,
        description: "JWT token (for decode/verify operations)",
      },
      {
        name: "algorithm",
        type: "options",
        required: false,
        default: "HS256",
        description: "Signing algorithm",
        options: [
          { name: "HS256", value: "HS256" },
          { name: "HS384", value: "HS384" },
          { name: "HS512", value: "HS512" },
          { name: "RS256", value: "RS256" },
          { name: "RS384", value: "RS384" },
          { name: "RS512", value: "RS512" },
        ],
      },
    ],
    credentials: [
      {
        name: "jwtAuth",
        required: true,
        description: "JWT secret or key pair",
      },
    ],
    examples: [
      {
        name: "Create JWT",
        description: "Sign a new token",
        parameters: {
          operation: "sign",
          payload: '={{ JSON.stringify({ userId: $json.id, email: $json.email }) }}',
          algorithm: "HS256",
        },
      },
      {
        name: "Verify JWT",
        description: "Verify and decode a token",
        parameters: {
          operation: "verify",
          token: "={{ $json.token }}",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.jwt/",
  },

  "n8n-nodes-base.ssh": {
    type: "n8n-nodes-base.ssh",
    displayName: "SSH",
    description: "Execute commands on remote servers via SSH",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "execute",
        description: "Operation to perform",
        options: [
          { name: "Execute Command", value: "execute" },
          { name: "Download File", value: "download" },
          { name: "Upload File", value: "upload" },
        ],
      },
      {
        name: "command",
        type: "string",
        required: false,
        description: "Command to execute",
      },
      {
        name: "cwd",
        type: "string",
        required: false,
        description: "Working directory",
      },
    ],
    credentials: [
      {
        name: "sshPassword",
        required: false,
        description: "SSH credentials (password)",
      },
      {
        name: "sshPrivateKey",
        required: false,
        description: "SSH credentials (private key)",
      },
    ],
    examples: [
      {
        name: "Remote Command",
        description: "Execute command on remote server",
        parameters: {
          operation: "execute",
          command: "ls -la /var/log",
        },
      },
      {
        name: "Download File",
        description: "Download file from remote server",
        parameters: {
          operation: "download",
          path: "/var/log/app.log",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ssh/",
  },

  "n8n-nodes-base.ftp": {
    type: "n8n-nodes-base.ftp",
    displayName: "FTP",
    description: "Upload, download, and manage files on FTP/SFTP servers",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "protocol",
        type: "options",
        required: true,
        default: "ftp",
        description: "Protocol to use",
        options: [
          { name: "FTP", value: "ftp" },
          { name: "SFTP", value: "sftp" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "list",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete" },
          { name: "Download", value: "download" },
          { name: "List", value: "list" },
          { name: "Rename", value: "rename" },
          { name: "Upload", value: "upload" },
        ],
      },
      {
        name: "path",
        type: "string",
        required: true,
        description: "Remote path",
        placeholder: "/uploads/",
      },
    ],
    credentials: [
      {
        name: "ftp",
        required: false,
        description: "FTP credentials",
      },
      {
        name: "sftp",
        required: false,
        description: "SFTP credentials",
      },
    ],
    examples: [
      {
        name: "Upload File",
        description: "Upload a file to FTP server",
        parameters: {
          protocol: "sftp",
          operation: "upload",
          path: "/uploads/",
          binaryPropertyName: "data",
        },
      },
      {
        name: "List Directory",
        description: "List files in a directory",
        parameters: {
          protocol: "sftp",
          operation: "list",
          path: "/uploads/",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ftp/",
  },

  "n8n-nodes-base.graphql": {
    type: "n8n-nodes-base.graphql",
    displayName: "GraphQL",
    description: "Execute GraphQL queries and mutations",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "endpoint",
        type: "string",
        required: true,
        description: "GraphQL endpoint URL",
        placeholder: "https://api.example.com/graphql",
      },
      {
        name: "requestMethod",
        type: "options",
        required: true,
        default: "POST",
        description: "HTTP method",
        options: [
          { name: "GET", value: "GET" },
          { name: "POST", value: "POST" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        description: "GraphQL query or mutation",
      },
      {
        name: "variables",
        type: "json",
        required: false,
        description: "GraphQL variables",
      },
      {
        name: "headerParametersJson",
        type: "json",
        required: false,
        description: "Custom headers",
      },
    ],
    examples: [
      {
        name: "Query",
        description: "Execute a GraphQL query",
        parameters: {
          endpoint: "https://api.example.com/graphql",
          requestMethod: "POST",
          query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`,
          variables: '={{ JSON.stringify({ id: $json.userId }) }}',
        },
      },
      {
        name: "Mutation",
        description: "Execute a GraphQL mutation",
        parameters: {
          endpoint: "https://api.example.com/graphql",
          requestMethod: "POST",
          query: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}`,
          variables: '={{ JSON.stringify({ input: { name: $json.name, email: $json.email } }) }}',
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.graphql/",
  },

  "n8n-nodes-base.git": {
    type: "n8n-nodes-base.git",
    displayName: "Git",
    description: "Perform Git operations (clone, push, pull, commit)",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "clone",
        description: "Git operation",
        options: [
          { name: "Add Config", value: "addConfig" },
          { name: "Clone", value: "clone" },
          { name: "Commit", value: "commit" },
          { name: "Fetch", value: "fetch" },
          { name: "List Config", value: "listConfig" },
          { name: "Log", value: "log" },
          { name: "Pull", value: "pull" },
          { name: "Push", value: "push" },
          { name: "Push Tags", value: "pushTags" },
          { name: "Status", value: "status" },
          { name: "Tag", value: "tag" },
        ],
      },
      {
        name: "repositoryPath",
        type: "string",
        required: true,
        description: "Local repository path",
      },
      {
        name: "sourceRepository",
        type: "string",
        required: false,
        description: "Remote repository URL (for clone)",
      },
    ],
    credentials: [
      {
        name: "gitPassword",
        required: false,
        description: "Git credentials",
      },
    ],
    examples: [
      {
        name: "Clone Repository",
        description: "Clone a Git repository",
        parameters: {
          operation: "clone",
          sourceRepository: "https://github.com/user/repo.git",
          repositoryPath: "/data/repo",
        },
      },
      {
        name: "Commit Changes",
        description: "Commit changes to repository",
        parameters: {
          operation: "commit",
          repositoryPath: "/data/repo",
          message: "Automated commit from n8n",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.git/",
  },

  "n8n-nodes-base.readBinaryFile": {
    type: "n8n-nodes-base.readBinaryFile",
    displayName: "Read Binary File",
    description: "Read a binary file from disk",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "filePath",
        type: "string",
        required: true,
        description: "Path to the file",
        placeholder: "/data/file.pdf",
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Name for the binary property",
      },
    ],
    examples: [
      {
        name: "Read File",
        description: "Read a file from disk",
        parameters: {
          filePath: "/data/uploads/{{ $json.filename }}",
          binaryPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.readbinaryfile/",
  },

  "n8n-nodes-base.writeBinaryFile": {
    type: "n8n-nodes-base.writeBinaryFile",
    displayName: "Write Binary File",
    description: "Write a binary file to disk",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "fileName",
        type: "string",
        required: true,
        description: "Path and filename to write",
        placeholder: "/data/output.pdf",
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Name of binary property to write",
      },
    ],
    examples: [
      {
        name: "Write File",
        description: "Write binary data to file",
        parameters: {
          fileName: "/data/exports/{{ $json.filename }}",
          binaryPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.writebinaryfile/",
  },

  "n8n-nodes-base.readPdf": {
    type: "n8n-nodes-base.readPdf",
    displayName: "Read PDF",
    description: "Extract text from PDF files",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Name of binary property containing PDF",
      },
    ],
    examples: [
      {
        name: "Extract PDF Text",
        description: "Extract text from a PDF file",
        parameters: {
          binaryPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.readpdf/",
  },

  "n8n-nodes-base.spreadsheetFile": {
    type: "n8n-nodes-base.spreadsheetFile",
    displayName: "Spreadsheet File",
    description: "Read and write spreadsheet files (CSV, XLSX, ODS)",
    category: "core",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "read",
        description: "Operation to perform",
        options: [
          { name: "Read from File", value: "read" },
          { name: "Write to File", value: "write" },
        ],
      },
      {
        name: "fileFormat",
        type: "options",
        required: true,
        default: "autodetect",
        description: "File format",
        options: [
          { name: "Autodetect", value: "autodetect" },
          { name: "CSV", value: "csv" },
          { name: "HTML", value: "html" },
          { name: "ODS", value: "ods" },
          { name: "RTF", value: "rtf" },
          { name: "XLSX", value: "xlsx" },
        ],
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Binary property name",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: headerRow, sheetName, range",
      },
    ],
    examples: [
      {
        name: "Read Excel",
        description: "Read data from Excel file",
        parameters: {
          operation: "read",
          fileFormat: "xlsx",
          binaryPropertyName: "data",
          options: {
            headerRow: true,
          },
        },
      },
      {
        name: "Write CSV",
        description: "Write data to CSV file",
        parameters: {
          operation: "write",
          fileFormat: "csv",
          binaryPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.spreadsheetfile/",
  },

  "n8n-nodes-base.compression": {
    type: "n8n-nodes-base.compression",
    displayName: "Compression",
    description: "Compress or decompress files (ZIP, GZIP)",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "compress",
        description: "Operation to perform",
        options: [
          { name: "Compress", value: "compress" },
          { name: "Decompress", value: "decompress" },
        ],
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Binary property to process",
      },
      {
        name: "outputFormat",
        type: "options",
        required: false,
        default: "zip",
        description: "Output format",
        options: [
          { name: "GZIP", value: "gzip" },
          { name: "ZIP", value: "zip" },
        ],
      },
    ],
    examples: [
      {
        name: "Create ZIP",
        description: "Compress files into a ZIP",
        parameters: {
          operation: "compress",
          outputFormat: "zip",
          binaryPropertyName: "data",
        },
      },
      {
        name: "Extract ZIP",
        description: "Extract files from ZIP",
        parameters: {
          operation: "decompress",
          binaryPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.compression/",
  },

  "n8n-nodes-base.xml": {
    type: "n8n-nodes-base.xml",
    displayName: "XML",
    description: "Convert between JSON and XML",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "xmlToJson",
        description: "Conversion mode",
        options: [
          { name: "JSON to XML", value: "jsonToXml" },
          { name: "XML to JSON", value: "xmlToJson" },
        ],
      },
      {
        name: "dataPropertyName",
        type: "string",
        required: true,
        default: "data",
        description: "Property containing data to convert",
      },
    ],
    examples: [
      {
        name: "XML to JSON",
        description: "Convert XML string to JSON",
        parameters: {
          mode: "xmlToJson",
          dataPropertyName: "xml",
        },
      },
      {
        name: "JSON to XML",
        description: "Convert JSON to XML string",
        parameters: {
          mode: "jsonToXml",
          dataPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.xml/",
  },

  "n8n-nodes-base.html": {
    type: "n8n-nodes-base.html",
    displayName: "HTML",
    description: "Extract data from HTML or generate HTML from templates",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "extractHtmlContent",
        description: "Operation to perform",
        options: [
          { name: "Extract HTML Content", value: "extractHtmlContent" },
          { name: "Generate HTML Template", value: "generateHtmlTemplate" },
        ],
      },
      {
        name: "sourceData",
        type: "options",
        required: false,
        default: "json",
        description: "Source of HTML",
        options: [
          { name: "JSON", value: "json" },
          { name: "Binary", value: "binary" },
        ],
      },
      {
        name: "extractionValues",
        type: "fixedCollection",
        required: false,
        description: "Values to extract (CSS selectors)",
      },
      {
        name: "html",
        type: "string",
        required: false,
        description: "HTML template",
      },
    ],
    examples: [
      {
        name: "Extract Links",
        description: "Extract all links from HTML",
        parameters: {
          operation: "extractHtmlContent",
          sourceData: "json",
          dataPropertyName: "html",
          extractionValues: {
            values: [
              { key: "links", cssSelector: "a", returnValue: "attribute", attribute: "href" },
            ],
          },
        },
      },
      {
        name: "Generate HTML",
        description: "Generate HTML from template",
        parameters: {
          operation: "generateHtmlTemplate",
          html: `<html>
<body>
<h1>{{ $json.title }}</h1>
<p>{{ $json.content }}</p>
</body>
</html>`,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.html/",
  },

  "n8n-nodes-base.markdown": {
    type: "n8n-nodes-base.markdown",
    displayName: "Markdown",
    description: "Convert between Markdown and HTML",
    category: "core",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "markdownToHtml",
        description: "Conversion mode",
        options: [
          { name: "HTML to Markdown", value: "htmlToMarkdown" },
          { name: "Markdown to HTML", value: "markdownToHtml" },
        ],
      },
      {
        name: "markdownOrHtml",
        type: "string",
        required: true,
        description: "Content to convert",
      },
    ],
    examples: [
      {
        name: "MD to HTML",
        description: "Convert Markdown to HTML",
        parameters: {
          mode: "markdownToHtml",
          markdownOrHtml: "={{ $json.markdown }}",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.markdown/",
  },

  "n8n-nodes-base.emailSend": {
    type: "n8n-nodes-base.emailSend",
    displayName: "Send Email",
    description: "Send emails via SMTP",
    category: "core",
    typeVersion: 2.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "fromEmail",
        type: "string",
        required: true,
        description: "From email address",
      },
      {
        name: "toEmail",
        type: "string",
        required: true,
        description: "To email address(es)",
      },
      {
        name: "subject",
        type: "string",
        required: true,
        description: "Email subject",
      },
      {
        name: "emailFormat",
        type: "options",
        required: true,
        default: "text",
        description: "Email format",
        options: [
          { name: "Text", value: "text" },
          { name: "HTML", value: "html" },
        ],
      },
      {
        name: "text",
        type: "string",
        required: false,
        description: "Plain text body",
      },
      {
        name: "html",
        type: "string",
        required: false,
        description: "HTML body",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: cc, bcc, replyTo, attachments",
      },
    ],
    credentials: [
      {
        name: "smtp",
        required: true,
        description: "SMTP credentials",
      },
    ],
    examples: [
      {
        name: "Send Email",
        description: "Send a plain text email",
        parameters: {
          fromEmail: "sender@example.com",
          toEmail: "={{ $json.email }}",
          subject: "Notification from n8n",
          emailFormat: "text",
          text: "Hello,\n\nThis is an automated message.",
        },
      },
      {
        name: "HTML Email",
        description: "Send an HTML email",
        parameters: {
          fromEmail: "sender@example.com",
          toEmail: "={{ $json.email }}",
          subject: "Welcome!",
          emailFormat: "html",
          html: "<h1>Welcome!</h1><p>Thank you for signing up.</p>",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.emailsend/",
  },
};
