/**
 * Finance Integration Nodes
 *
 * QuickBooks, Xero, FreshBooks, Wave, Wise, etc.
 */

import type { NodeSchema } from "../types.js";

export const FINANCE_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.quickbooks": {
    type: "n8n-nodes-base.quickbooks",
    displayName: "QuickBooks Online",
    description: "Manage invoices, customers, and payments in QuickBooks",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "quickBooksOAuth2Api", required: true, description: "QuickBooks OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "invoice",
        description: "Resource to operate on",
        options: [
          { name: "Bill", value: "bill", description: "Manage bills" },
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Employee", value: "employee", description: "Manage employees" },
          { name: "Estimate", value: "estimate", description: "Manage estimates" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
          { name: "Item", value: "item", description: "Manage items" },
          { name: "Payment", value: "payment", description: "Manage payments" },
          { name: "Purchase", value: "purchase", description: "Manage purchases" },
          { name: "Vendor", value: "vendor", description: "Manage vendors" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Delete", value: "delete", description: "Delete an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
          { name: "Send", value: "send", description: "Send an invoice" },
          { name: "Update", value: "update", description: "Update an invoice" },
          { name: "Void", value: "void", description: "Void an invoice" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
      {
        name: "invoiceId",
        type: "string",
        required: true,
        default: "",
        description: "Invoice ID",
        displayOptions: { show: { resource: ["invoice"], operation: ["get", "delete", "send", "update", "void"] } },
      },
      {
        name: "additionalFields",
        type: "collection",
        required: false,
        default: {},
        description: "Additional fields",
      },
    ],
    examples: [
      {
        name: "Get Invoices",
        description: "Get all invoices",
        parameters: {
          resource: "invoice",
          operation: "getAll",
        },
      },
      {
        name: "Create Customer",
        description: "Create a new customer",
        parameters: {
          resource: "customer",
          operation: "create",
          additionalFields: { displayName: "John Doe" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.quickbooks/",
  },

  "n8n-nodes-base.xero": {
    type: "n8n-nodes-base.xero",
    displayName: "Xero",
    description: "Manage invoices, contacts, and payments in Xero",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "xeroOAuth2Api", required: true, description: "Xero OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "invoice",
        description: "Resource to operate on",
        options: [
          { name: "Contact", value: "contact", description: "Manage contacts" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
          { name: "Update", value: "update", description: "Update an invoice" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
      {
        name: "organizationId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Organization (Tenant) ID",
      },
      {
        name: "invoiceId",
        type: "string",
        required: true,
        default: "",
        description: "Invoice ID",
        displayOptions: { show: { resource: ["invoice"], operation: ["get", "update"] } },
      },
    ],
    examples: [
      {
        name: "Get Invoices",
        description: "Get all invoices",
        parameters: {
          resource: "invoice",
          operation: "getAll",
          organizationId: "org-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.xero/",
  },

  "n8n-nodes-base.freshbooks": {
    type: "n8n-nodes-base.freshbooks",
    displayName: "FreshBooks",
    description: "Manage invoices, clients, and expenses in FreshBooks",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "freshBooksOAuth2Api", required: true, description: "FreshBooks OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "invoice",
        description: "Resource to operate on",
        options: [
          { name: "Client", value: "client", description: "Manage clients" },
          { name: "Estimate", value: "estimate", description: "Manage estimates" },
          { name: "Expense", value: "expense", description: "Manage expenses" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Delete", value: "delete", description: "Delete an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
          { name: "Update", value: "update", description: "Update an invoice" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
      {
        name: "accountId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Account ID",
      },
      {
        name: "invoiceId",
        type: "string",
        required: true,
        default: "",
        description: "Invoice ID",
        displayOptions: { show: { resource: ["invoice"], operation: ["get", "delete", "update"] } },
      },
    ],
    examples: [
      {
        name: "Get Invoices",
        description: "Get all invoices",
        parameters: {
          resource: "invoice",
          operation: "getAll",
          accountId: "account-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.freshbooks/",
  },

  "n8n-nodes-base.wise": {
    type: "n8n-nodes-base.wise",
    displayName: "Wise",
    description: "Manage transfers and accounts in Wise",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "wiseApi", required: true, description: "Wise API token" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "transfer",
        description: "Resource to operate on",
        options: [
          { name: "Account", value: "account", description: "Manage accounts" },
          { name: "Exchange Rate", value: "exchangeRate", description: "Get exchange rates" },
          { name: "Profile", value: "profile", description: "Get profile info" },
          { name: "Quote", value: "quote", description: "Get quotes" },
          { name: "Recipient", value: "recipient", description: "Manage recipients" },
          { name: "Transfer", value: "transfer", description: "Manage transfers" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a transfer" },
          { name: "Delete", value: "delete", description: "Delete a transfer" },
          { name: "Execute", value: "execute", description: "Execute a transfer" },
          { name: "Get", value: "get", description: "Get a transfer" },
          { name: "Get All", value: "getAll", description: "Get all transfers" },
        ],
        displayOptions: { show: { resource: ["transfer"] } },
      },
      {
        name: "profileId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Profile ID",
      },
    ],
    examples: [
      {
        name: "Get Transfers",
        description: "Get all transfers",
        parameters: {
          resource: "transfer",
          operation: "getAll",
          profileId: "profile-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wise/",
  },

  "n8n-nodes-base.harvest": {
    type: "n8n-nodes-base.harvest",
    displayName: "Harvest",
    description: "Track time and manage invoices in Harvest",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "harvestApi", required: true, description: "Harvest API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "timeEntry",
        description: "Resource to operate on",
        options: [
          { name: "Client", value: "client" },
          { name: "Company", value: "company" },
          { name: "Contact", value: "contact" },
          { name: "Estimate", value: "estimate" },
          { name: "Expense", value: "expense" },
          { name: "Invoice", value: "invoice" },
          { name: "Project", value: "project" },
          { name: "Task", value: "task" },
          { name: "Time Entry", value: "timeEntry" },
          { name: "User", value: "user" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Delete", value: "delete", description: "Delete an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
          { name: "Update", value: "update", description: "Update an invoice" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
    ],
    examples: [
      {
        name: "Get Time Entries",
        description: "Get all time entries",
        parameters: {
          resource: "timeEntry",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.harvest/",
  },

  "n8n-nodes-base.zohoBooks": {
    type: "n8n-nodes-base.zohoBooks",
    displayName: "Zoho Books",
    description: "Manage invoices, contacts, and bills in Zoho Books",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "zohoBooksOAuth2Api", required: true, description: "Zoho Books OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "invoice",
        description: "Resource to operate on",
        options: [
          { name: "Contact", value: "contact", description: "Manage contacts" },
          { name: "Estimate", value: "estimate", description: "Manage estimates" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
          { name: "Item", value: "item", description: "Manage items" },
          { name: "Purchase Order", value: "purchaseOrder", description: "Manage purchase orders" },
          { name: "Sales Order", value: "salesOrder", description: "Manage sales orders" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Delete", value: "delete", description: "Delete an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
          { name: "Update", value: "update", description: "Update an invoice" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
      {
        name: "organizationId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Organization ID",
      },
    ],
    examples: [
      {
        name: "Get Invoices",
        description: "Get all invoices",
        parameters: {
          resource: "invoice",
          operation: "getAll",
          organizationId: "org-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zohobooks/",
  },

  "n8n-nodes-base.waveAccounting": {
    type: "n8n-nodes-base.waveAccounting",
    displayName: "Wave",
    description: "Manage invoices and customers in Wave",
    category: "finance",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "waveApi", required: true, description: "Wave API token" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "invoice",
        description: "Resource to operate on",
        options: [
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Estimate", value: "estimate", description: "Manage estimates" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Delete", value: "delete", description: "Delete an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
          { name: "Send", value: "send", description: "Send an invoice" },
          { name: "Update", value: "update", description: "Update an invoice" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
      {
        name: "businessId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Business ID",
      },
    ],
    examples: [
      {
        name: "Get Invoices",
        description: "Get all invoices",
        parameters: {
          resource: "invoice",
          operation: "getAll",
          businessId: "business-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wave/",
  },

  "n8n-nodes-base.coinbase": {
    type: "n8n-nodes-base.coinbase",
    displayName: "Coinbase",
    description: "Interact with Coinbase accounts",
    category: "finance",
    subcategory: "crypto",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "coinbaseApi", required: true, description: "Coinbase API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "account",
        description: "Resource to operate on",
        options: [
          { name: "Account", value: "account", description: "Get account info" },
          { name: "Exchange Rates", value: "exchangeRates", description: "Get exchange rates" },
          { name: "Price", value: "price", description: "Get prices" },
          { name: "Time", value: "time", description: "Get server time" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get account" },
          { name: "Get All", value: "getAll", description: "Get all accounts" },
        ],
        displayOptions: { show: { resource: ["account"] } },
      },
    ],
    examples: [
      {
        name: "Get Accounts",
        description: "Get all Coinbase accounts",
        parameters: {
          resource: "account",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.coinbase/",
  },
};
