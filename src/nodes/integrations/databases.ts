/**
 * Database Integration Nodes
 *
 * Postgres, MySQL, MongoDB, Redis, Supabase, Firebase, etc.
 */

import type { NodeSchema } from "../types.js";

export const DATABASE_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.postgres": {
    type: "n8n-nodes-base.postgres",
    displayName: "Postgres",
    description: "Execute SQL queries on PostgreSQL databases",
    category: "database",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "postgres", required: true, description: "PostgreSQL database credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "executeQuery",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete rows from a table" },
          { name: "Execute Query", value: "executeQuery", description: "Execute a SQL query" },
          { name: "Insert", value: "insert", description: "Insert rows into a table" },
          { name: "Insert or Update", value: "upsert", description: "Insert or update rows" },
          { name: "Select", value: "select", description: "Select rows from a table" },
          { name: "Update", value: "update", description: "Update rows in a table" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        default: "",
        description: "SQL query to execute",
        placeholder: "SELECT * FROM users WHERE id = $1",
        displayOptions: { show: { operation: ["executeQuery"] } },
      },
      {
        name: "schema",
        type: "resourceLocator",
        required: true,
        default: "public",
        description: "Database schema",
        displayOptions: { show: { operation: ["select", "insert", "update", "delete", "upsert"] } },
      },
      {
        name: "table",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Table name",
        displayOptions: { show: { operation: ["select", "insert", "update", "delete", "upsert"] } },
      },
      {
        name: "columns",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Columns to return",
        displayOptions: { show: { operation: ["select"] } },
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Execute Query",
        description: "Run a custom SQL query",
        parameters: {
          operation: "executeQuery",
          query: "SELECT * FROM users WHERE active = true LIMIT 10",
        },
      },
      {
        name: "Insert Row",
        description: "Insert a new row into a table",
        parameters: {
          operation: "insert",
          schema: "public",
          table: "users",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/",
  },

  "n8n-nodes-base.mySql": {
    type: "n8n-nodes-base.mySql",
    displayName: "MySQL",
    description: "Execute SQL queries on MySQL databases",
    category: "database",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mySql", required: true, description: "MySQL database credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "executeQuery",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete rows" },
          { name: "Execute Query", value: "executeQuery", description: "Execute SQL" },
          { name: "Insert", value: "insert", description: "Insert rows" },
          { name: "Insert or Update", value: "upsert", description: "Insert or update" },
          { name: "Select", value: "select", description: "Select rows" },
          { name: "Update", value: "update", description: "Update rows" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        default: "",
        description: "SQL query to execute",
        displayOptions: { show: { operation: ["executeQuery"] } },
      },
      {
        name: "table",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Table name",
        displayOptions: { show: { operation: ["select", "insert", "update", "delete", "upsert"] } },
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Execute Query",
        description: "Run a SQL query",
        parameters: {
          operation: "executeQuery",
          query: "SELECT * FROM orders WHERE status = 'pending'",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mysql/",
  },

  "n8n-nodes-base.mongoDb": {
    type: "n8n-nodes-base.mongoDb",
    displayName: "MongoDB",
    description: "Perform operations on MongoDB collections",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mongoDb", required: true, description: "MongoDB connection string" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "find",
        description: "Operation to perform",
        options: [
          { name: "Aggregate", value: "aggregate", description: "Run aggregation pipeline" },
          { name: "Delete", value: "delete", description: "Delete documents" },
          { name: "Find", value: "find", description: "Find documents" },
          { name: "Find And Replace", value: "findOneAndReplace", description: "Find and replace" },
          { name: "Find And Update", value: "findOneAndUpdate", description: "Find and update" },
          { name: "Insert", value: "insert", description: "Insert documents" },
          { name: "Update", value: "update", description: "Update documents" },
        ],
      },
      {
        name: "collection",
        type: "string",
        required: true,
        default: "",
        description: "Collection name",
      },
      {
        name: "query",
        type: "json",
        required: false,
        default: "{}",
        description: "MongoDB query (JSON)",
        displayOptions: { show: { operation: ["find", "delete", "update", "findOneAndReplace", "findOneAndUpdate"] } },
      },
      {
        name: "fields",
        type: "string",
        required: false,
        default: "",
        description: "Fields to return (comma-separated)",
        displayOptions: { show: { operation: ["find"] } },
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Find Documents",
        description: "Query documents from a collection",
        parameters: {
          operation: "find",
          collection: "users",
          query: '{"status": "active"}',
        },
      },
      {
        name: "Insert Document",
        description: "Insert a new document",
        parameters: {
          operation: "insert",
          collection: "logs",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mongodb/",
  },

  "n8n-nodes-base.redis": {
    type: "n8n-nodes-base.redis",
    displayName: "Redis",
    description: "Execute commands on Redis",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "redis", required: true, description: "Redis connection credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete a key" },
          { name: "Get", value: "get", description: "Get a key value" },
          { name: "Increment", value: "incr", description: "Increment a key" },
          { name: "Info", value: "info", description: "Get server info" },
          { name: "Keys", value: "keys", description: "Get keys matching pattern" },
          { name: "Pop", value: "pop", description: "Pop from list" },
          { name: "Publish", value: "publish", description: "Publish to channel" },
          { name: "Push", value: "push", description: "Push to list" },
          { name: "Set", value: "set", description: "Set a key value" },
        ],
      },
      {
        name: "key",
        type: "string",
        required: true,
        default: "",
        description: "Key name",
        displayOptions: { show: { operation: ["get", "set", "delete", "incr", "push", "pop"] } },
      },
      {
        name: "value",
        type: "string",
        required: true,
        default: "",
        description: "Value to set",
        displayOptions: { show: { operation: ["set", "push"] } },
      },
      {
        name: "keyType",
        type: "options",
        required: true,
        default: "automatic",
        description: "Type to return",
        options: [
          { name: "Automatic", value: "automatic" },
          { name: "String", value: "string" },
          { name: "Hash", value: "hash" },
          { name: "List", value: "list" },
          { name: "Set", value: "set" },
        ],
        displayOptions: { show: { operation: ["get"] } },
      },
    ],
    examples: [
      {
        name: "Set Value",
        description: "Set a key-value pair",
        parameters: {
          operation: "set",
          key: "user:123",
          value: '{"name": "John"}',
        },
      },
      {
        name: "Get Value",
        description: "Get a value by key",
        parameters: {
          operation: "get",
          key: "user:123",
          keyType: "string",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.redis/",
  },

  "n8n-nodes-base.supabase": {
    type: "n8n-nodes-base.supabase",
    displayName: "Supabase",
    description: "Interact with Supabase database",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "supabaseApi", required: true, description: "Supabase API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "row",
        description: "Resource to operate on",
        options: [
          { name: "Row", value: "row", description: "Manage table rows" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a row" },
          { name: "Delete", value: "delete", description: "Delete rows" },
          { name: "Get", value: "get", description: "Get a row" },
          { name: "Get All", value: "getAll", description: "Get all rows" },
          { name: "Update", value: "update", description: "Update a row" },
        ],
        displayOptions: { show: { resource: ["row"] } },
      },
      {
        name: "tableId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Table name",
      },
      {
        name: "fieldsUi",
        type: "fixedCollection",
        required: false,
        default: {},
        description: "Field values",
        displayOptions: { show: { operation: ["create", "update"] } },
      },
      {
        name: "filterType",
        type: "options",
        required: true,
        default: "manual",
        description: "Filter type",
        options: [
          { name: "Manual", value: "manual" },
          { name: "String", value: "string" },
        ],
        displayOptions: { show: { operation: ["getAll", "delete", "get"] } },
      },
    ],
    examples: [
      {
        name: "Create Row",
        description: "Insert a row into Supabase",
        parameters: {
          resource: "row",
          operation: "create",
          tableId: "users",
          fieldsUi: { fieldValues: [{ fieldName: "email", fieldValue: "user@example.com" }] },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/",
  },

  "n8n-nodes-base.googleFirebaseCloudFirestore": {
    type: "n8n-nodes-base.googleFirebaseCloudFirestore",
    displayName: "Google Cloud Firestore",
    description: "Interact with Google Cloud Firestore",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "googleFirebaseCloudFirestoreOAuth2Api", required: true, description: "Firebase OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a document" },
          { name: "Create/Update", value: "upsert", description: "Create or update" },
          { name: "Delete", value: "delete", description: "Delete a document" },
          { name: "Get", value: "get", description: "Get a document" },
          { name: "Get All", value: "getAll", description: "Get all documents" },
          { name: "Query", value: "query", description: "Query documents" },
        ],
      },
      {
        name: "projectId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Firebase project ID",
      },
      {
        name: "database",
        type: "string",
        required: true,
        default: "(default)",
        description: "Database ID",
      },
      {
        name: "collection",
        type: "string",
        required: true,
        default: "",
        description: "Collection path",
      },
      {
        name: "documentId",
        type: "string",
        required: false,
        default: "",
        description: "Document ID",
        displayOptions: { show: { operation: ["get", "delete", "upsert"] } },
      },
      {
        name: "columns",
        type: "string",
        required: false,
        default: "",
        description: "Fields to return (comma-separated)",
      },
    ],
    examples: [
      {
        name: "Get Document",
        description: "Get a document from Firestore",
        parameters: {
          operation: "get",
          projectId: "my-project",
          database: "(default)",
          collection: "users",
          documentId: "user123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlefirebasecloudfirestore/",
  },

  "n8n-nodes-base.googleFirebaseRealtimeDatabase": {
    type: "n8n-nodes-base.googleFirebaseRealtimeDatabase",
    displayName: "Google Firebase Realtime Database",
    description: "Interact with Firebase Realtime Database",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "googleFirebaseRealtimeDatabaseOAuth2Api", required: true, description: "Firebase OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Write data" },
          { name: "Delete", value: "delete", description: "Delete data" },
          { name: "Get", value: "get", description: "Get data" },
          { name: "Push", value: "push", description: "Push data with auto-ID" },
          { name: "Update", value: "update", description: "Update data" },
        ],
      },
      {
        name: "projectId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Firebase project ID",
      },
      {
        name: "path",
        type: "string",
        required: true,
        default: "",
        description: "Database path",
        placeholder: "/users/user123",
      },
    ],
    examples: [
      {
        name: "Get Data",
        description: "Get data from a path",
        parameters: {
          operation: "get",
          projectId: "my-project",
          path: "/users/user123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlefirebaserealtimedatabase/",
  },

  "n8n-nodes-base.elasticsearch": {
    type: "n8n-nodes-base.elasticsearch",
    displayName: "Elasticsearch",
    description: "Interact with Elasticsearch",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "elasticsearchApi", required: true, description: "Elasticsearch credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "index",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a document" },
          { name: "Delete", value: "delete", description: "Delete a document" },
          { name: "Get", value: "get", description: "Get a document" },
          { name: "Get All", value: "getAll", description: "Get all documents" },
          { name: "Index", value: "index", description: "Index a document" },
          { name: "Update", value: "update", description: "Update a document" },
        ],
      },
      {
        name: "indexId",
        type: "string",
        required: true,
        default: "",
        description: "Index name",
      },
      {
        name: "documentId",
        type: "string",
        required: false,
        default: "",
        description: "Document ID",
        displayOptions: { show: { operation: ["get", "delete", "update", "create"] } },
      },
      {
        name: "body",
        type: "json",
        required: false,
        default: "{}",
        description: "Document body (JSON)",
        displayOptions: { show: { operation: ["index", "create", "update"] } },
      },
    ],
    examples: [
      {
        name: "Index Document",
        description: "Index a document",
        parameters: {
          operation: "index",
          indexId: "products",
          body: '{"name": "Product", "price": 99.99}',
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.elasticsearch/",
  },

  "n8n-nodes-base.qdrant": {
    type: "n8n-nodes-base.qdrant",
    displayName: "Qdrant",
    description: "Interact with Qdrant vector database",
    category: "database",
    subcategory: "vector",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "qdrantApi", required: true, description: "Qdrant API credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "upsert",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete points" },
          { name: "Get", value: "get", description: "Get points" },
          { name: "Search", value: "search", description: "Search vectors" },
          { name: "Upsert", value: "upsert", description: "Upsert points" },
        ],
      },
      {
        name: "collectionName",
        type: "string",
        required: true,
        default: "",
        description: "Collection name",
      },
    ],
    examples: [
      {
        name: "Search Vectors",
        description: "Search for similar vectors",
        parameters: {
          operation: "search",
          collectionName: "documents",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.qdrant/",
  },

  "n8n-nodes-base.pinecone": {
    type: "n8n-nodes-base.pinecone",
    displayName: "Pinecone",
    description: "Interact with Pinecone vector database",
    category: "database",
    subcategory: "vector",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "pineconeApi", required: true, description: "Pinecone API credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "upsert",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete vectors" },
          { name: "Fetch", value: "fetch", description: "Fetch vectors" },
          { name: "Query", value: "query", description: "Query vectors" },
          { name: "Upsert", value: "upsert", description: "Upsert vectors" },
        ],
      },
      {
        name: "indexName",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Index name",
      },
    ],
    examples: [
      {
        name: "Query Vectors",
        description: "Query similar vectors",
        parameters: {
          operation: "query",
          indexName: "my-index",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pinecone/",
  },

  "n8n-nodes-base.microsoftSql": {
    type: "n8n-nodes-base.microsoftSql",
    displayName: "Microsoft SQL",
    description: "Execute queries on Microsoft SQL Server",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "microsoftSql", required: true, description: "MS SQL Server credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "executeQuery",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete rows" },
          { name: "Execute Query", value: "executeQuery", description: "Execute SQL" },
          { name: "Insert", value: "insert", description: "Insert rows" },
          { name: "Update", value: "update", description: "Update rows" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        default: "",
        description: "SQL query",
        displayOptions: { show: { operation: ["executeQuery"] } },
      },
      {
        name: "table",
        type: "string",
        required: true,
        default: "",
        description: "Table name",
        displayOptions: { show: { operation: ["insert", "update", "delete"] } },
      },
    ],
    examples: [
      {
        name: "Execute Query",
        description: "Run a SQL query",
        parameters: {
          operation: "executeQuery",
          query: "SELECT TOP 10 * FROM users",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql/",
  },

  "n8n-nodes-base.sqlite": {
    type: "n8n-nodes-base.sqlite",
    displayName: "SQLite",
    description: "Execute queries on SQLite databases",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "executeQuery",
        description: "Operation to perform",
        options: [
          { name: "Execute Query", value: "executeQuery", description: "Execute SQL" },
          { name: "Insert", value: "insert", description: "Insert rows" },
          { name: "Update", value: "update", description: "Update rows" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        default: "",
        description: "SQL query",
        displayOptions: { show: { operation: ["executeQuery"] } },
      },
    ],
    examples: [
      {
        name: "Execute Query",
        description: "Run a SQLite query",
        parameters: {
          operation: "executeQuery",
          query: "SELECT * FROM users LIMIT 10",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.sqlite/",
  },

  "n8n-nodes-base.couchDb": {
    type: "n8n-nodes-base.couchDb",
    displayName: "CouchDB",
    description: "Interact with CouchDB databases",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "couchDb", required: true, description: "CouchDB credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a document" },
          { name: "Delete", value: "delete", description: "Delete a document" },
          { name: "Get", value: "get", description: "Get a document" },
          { name: "Get All", value: "getAll", description: "Get all documents" },
          { name: "Update", value: "update", description: "Update a document" },
        ],
      },
      {
        name: "database",
        type: "string",
        required: true,
        default: "",
        description: "Database name",
      },
      {
        name: "documentId",
        type: "string",
        required: false,
        default: "",
        description: "Document ID",
        displayOptions: { show: { operation: ["get", "delete", "update"] } },
      },
    ],
    examples: [
      {
        name: "Get Document",
        description: "Get a document by ID",
        parameters: {
          operation: "get",
          database: "mydb",
          documentId: "doc123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.couchdb/",
  },

  "n8n-nodes-base.cockroachDb": {
    type: "n8n-nodes-base.cockroachDb",
    displayName: "CockroachDB",
    description: "Execute queries on CockroachDB",
    category: "database",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "cockroachDb", required: true, description: "CockroachDB credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "executeQuery",
        description: "Operation to perform",
        options: [
          { name: "Execute Query", value: "executeQuery", description: "Execute SQL" },
          { name: "Insert", value: "insert", description: "Insert rows" },
          { name: "Update", value: "update", description: "Update rows" },
        ],
      },
      {
        name: "query",
        type: "string",
        required: true,
        default: "",
        description: "SQL query",
        displayOptions: { show: { operation: ["executeQuery"] } },
      },
    ],
    examples: [
      {
        name: "Execute Query",
        description: "Run a SQL query",
        parameters: {
          operation: "executeQuery",
          query: "SELECT * FROM users",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.cockroachdb/",
  },
};
