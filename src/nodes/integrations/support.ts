/**
 * Support Integration Nodes
 *
 * Zendesk, Intercom, Freshdesk, HelpScout, Crisp, etc.
 */

import type { NodeSchema } from "../types.js";

export const SUPPORT_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.zendesk": {
    type: "n8n-nodes-base.zendesk",
    displayName: "Zendesk",
    description: "Manage tickets, users, and organizations in Zendesk",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "zendeskApi", required: false, description: "Zendesk API credentials" },
      { name: "zendeskOAuth2Api", required: false, description: "Zendesk OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "ticket",
        description: "Resource to operate on",
        options: [
          { name: "Organization", value: "organization", description: "Manage organizations" },
          { name: "Ticket", value: "ticket", description: "Manage tickets" },
          { name: "Ticket Field", value: "ticketField", description: "Get ticket fields" },
          { name: "User", value: "user", description: "Manage users" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a ticket" },
          { name: "Delete", value: "delete", description: "Delete a ticket" },
          { name: "Get", value: "get", description: "Get a ticket" },
          { name: "Get All", value: "getAll", description: "Get all tickets" },
          { name: "Recover", value: "recover", description: "Recover a deleted ticket" },
          { name: "Update", value: "update", description: "Update a ticket" },
        ],
        displayOptions: { show: { resource: ["ticket"] } },
      },
      {
        name: "ticketId",
        type: "string",
        required: true,
        default: "",
        description: "Ticket ID",
        displayOptions: { show: { resource: ["ticket"], operation: ["get", "delete", "update", "recover"] } },
      },
      {
        name: "description",
        type: "string",
        required: true,
        default: "",
        description: "Ticket description",
        displayOptions: { show: { resource: ["ticket"], operation: ["create"] } },
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
        name: "Create Ticket",
        description: "Create a support ticket",
        parameters: {
          resource: "ticket",
          operation: "create",
          description: "Customer needs help with login",
          additionalFields: { subject: "Login Issue", priority: "normal" },
        },
      },
      {
        name: "Get All Tickets",
        description: "Retrieve all tickets",
        parameters: {
          resource: "ticket",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zendesk/",
  },

  "n8n-nodes-base.intercom": {
    type: "n8n-nodes-base.intercom",
    displayName: "Intercom",
    description: "Manage leads, users, and conversations in Intercom",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "intercomApi", required: true, description: "Intercom API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "user",
        description: "Resource to operate on",
        options: [
          { name: "Company", value: "company", description: "Manage companies" },
          { name: "Lead", value: "lead", description: "Manage leads" },
          { name: "User", value: "user", description: "Manage users" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a user" },
          { name: "Delete", value: "delete", description: "Delete a user" },
          { name: "Get", value: "get", description: "Get a user" },
          { name: "Get All", value: "getAll", description: "Get all users" },
          { name: "Update", value: "update", description: "Update a user" },
        ],
        displayOptions: { show: { resource: ["user"] } },
      },
      {
        name: "id",
        type: "string",
        required: true,
        default: "",
        description: "User ID",
        displayOptions: { show: { resource: ["user"], operation: ["get", "delete", "update"] } },
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
        name: "Create User",
        description: "Create an Intercom user",
        parameters: {
          resource: "user",
          operation: "create",
          additionalFields: { email: "user@example.com", name: "John Doe" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.intercom/",
  },

  "n8n-nodes-base.freshdesk": {
    type: "n8n-nodes-base.freshdesk",
    displayName: "Freshdesk",
    description: "Manage tickets and contacts in Freshdesk",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "freshdeskApi", required: true, description: "Freshdesk API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "ticket",
        description: "Resource to operate on",
        options: [
          { name: "Company", value: "company", description: "Manage companies" },
          { name: "Contact", value: "contact", description: "Manage contacts" },
          { name: "Ticket", value: "ticket", description: "Manage tickets" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a ticket" },
          { name: "Delete", value: "delete", description: "Delete a ticket" },
          { name: "Get", value: "get", description: "Get a ticket" },
          { name: "Get All", value: "getAll", description: "Get all tickets" },
          { name: "Update", value: "update", description: "Update a ticket" },
        ],
        displayOptions: { show: { resource: ["ticket"] } },
      },
      {
        name: "ticketId",
        type: "string",
        required: true,
        default: "",
        description: "Ticket ID",
        displayOptions: { show: { resource: ["ticket"], operation: ["get", "delete", "update"] } },
      },
      {
        name: "requester",
        type: "options",
        required: true,
        default: "email",
        description: "Requester identifier",
        options: [
          { name: "Email", value: "email" },
          { name: "ID", value: "requesterId" },
        ],
        displayOptions: { show: { resource: ["ticket"], operation: ["create"] } },
      },
      {
        name: "requesterIdentificationValue",
        type: "string",
        required: true,
        default: "",
        description: "Requester email or ID",
        displayOptions: { show: { resource: ["ticket"], operation: ["create"] } },
      },
      {
        name: "status",
        type: "options",
        required: true,
        default: "2",
        description: "Ticket status",
        options: [
          { name: "Open", value: "2" },
          { name: "Pending", value: "3" },
          { name: "Resolved", value: "4" },
          { name: "Closed", value: "5" },
        ],
        displayOptions: { show: { resource: ["ticket"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Ticket",
        description: "Create a support ticket",
        parameters: {
          resource: "ticket",
          operation: "create",
          requester: "email",
          requesterIdentificationValue: "customer@example.com",
          status: "2",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.freshdesk/",
  },

  "n8n-nodes-base.helpScout": {
    type: "n8n-nodes-base.helpScout",
    displayName: "Help Scout",
    description: "Manage conversations and customers in Help Scout",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "helpScoutOAuth2Api", required: true, description: "Help Scout OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "conversation",
        description: "Resource to operate on",
        options: [
          { name: "Conversation", value: "conversation", description: "Manage conversations" },
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Mailbox", value: "mailbox", description: "Get mailboxes" },
          { name: "Thread", value: "thread", description: "Manage threads" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a conversation" },
          { name: "Delete", value: "delete", description: "Delete a conversation" },
          { name: "Get", value: "get", description: "Get a conversation" },
          { name: "Get All", value: "getAll", description: "Get all conversations" },
        ],
        displayOptions: { show: { resource: ["conversation"] } },
      },
      {
        name: "mailboxId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Mailbox ID",
        displayOptions: { show: { resource: ["conversation"], operation: ["create", "getAll"] } },
      },
    ],
    examples: [
      {
        name: "Get Conversations",
        description: "Get all conversations",
        parameters: {
          resource: "conversation",
          operation: "getAll",
          mailboxId: "mailbox-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.helpscout/",
  },

  "n8n-nodes-base.crisp": {
    type: "n8n-nodes-base.crisp",
    displayName: "Crisp",
    description: "Manage conversations and people in Crisp",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "crispApi", required: true, description: "Crisp API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "message",
        description: "Resource to operate on",
        options: [
          { name: "Message", value: "message", description: "Send messages" },
          { name: "People", value: "people", description: "Manage people" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "send",
        description: "Operation to perform",
        options: [
          { name: "Send", value: "send", description: "Send a message" },
        ],
        displayOptions: { show: { resource: ["message"] } },
      },
      {
        name: "websiteId",
        type: "string",
        required: true,
        default: "",
        description: "Website ID",
      },
      {
        name: "sessionId",
        type: "string",
        required: true,
        default: "",
        description: "Session ID",
        displayOptions: { show: { resource: ["message"] } },
      },
      {
        name: "content",
        type: "string",
        required: true,
        default: "",
        description: "Message content",
        displayOptions: { show: { resource: ["message"], operation: ["send"] } },
      },
    ],
    examples: [
      {
        name: "Send Message",
        description: "Send a message in Crisp",
        parameters: {
          resource: "message",
          operation: "send",
          websiteId: "website-id",
          sessionId: "session-id",
          content: "Hello! How can I help you?",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.crisp/",
  },

  "n8n-nodes-base.drift": {
    type: "n8n-nodes-base.drift",
    displayName: "Drift",
    description: "Manage contacts and conversations in Drift",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "driftApi", required: false, description: "Drift API credentials" },
      { name: "driftOAuth2Api", required: false, description: "Drift OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "contact",
        description: "Resource to operate on",
        options: [
          { name: "Contact", value: "contact", description: "Manage contacts" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a contact" },
          { name: "Get Custom Attributes", value: "getCustomAttributes", description: "Get custom attributes" },
          { name: "Update", value: "update", description: "Update a contact" },
        ],
        displayOptions: { show: { resource: ["contact"] } },
      },
      {
        name: "email",
        type: "string",
        required: true,
        default: "",
        description: "Contact email",
        displayOptions: { show: { resource: ["contact"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Contact",
        description: "Create a Drift contact",
        parameters: {
          resource: "contact",
          operation: "create",
          email: "contact@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.drift/",
  },

  "n8n-nodes-base.front": {
    type: "n8n-nodes-base.front",
    displayName: "Front",
    description: "Manage conversations and messages in Front",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "frontApi", required: true, description: "Front API token" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "conversation",
        description: "Resource to operate on",
        options: [
          { name: "Comment", value: "comment", description: "Add comments" },
          { name: "Conversation", value: "conversation", description: "Manage conversations" },
          { name: "Message", value: "message", description: "Send messages" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get a conversation" },
          { name: "Update", value: "update", description: "Update a conversation" },
        ],
        displayOptions: { show: { resource: ["conversation"] } },
      },
      {
        name: "conversationId",
        type: "string",
        required: true,
        default: "",
        description: "Conversation ID",
        displayOptions: { show: { resource: ["conversation", "comment", "message"] } },
      },
    ],
    examples: [
      {
        name: "Get Conversation",
        description: "Get a conversation from Front",
        parameters: {
          resource: "conversation",
          operation: "get",
          conversationId: "conversation-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.front/",
  },

  "n8n-nodes-base.serviceNow": {
    type: "n8n-nodes-base.serviceNow",
    displayName: "ServiceNow",
    description: "Manage incidents and users in ServiceNow",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "serviceNowOAuth2Api", required: false, description: "ServiceNow OAuth2 credentials" },
      { name: "serviceNowBasicApi", required: false, description: "ServiceNow Basic Auth" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "incident",
        description: "Resource to operate on",
        options: [
          { name: "Attachment", value: "attachment", description: "Manage attachments" },
          { name: "Business Service", value: "businessService", description: "Get services" },
          { name: "Configuration Items", value: "configurationItems", description: "Get config items" },
          { name: "Department", value: "department", description: "Get departments" },
          { name: "Dictionary", value: "dictionary", description: "Get dictionary" },
          { name: "Incident", value: "incident", description: "Manage incidents" },
          { name: "Table Record", value: "tableRecord", description: "Query tables" },
          { name: "User", value: "user", description: "Manage users" },
          { name: "User Group", value: "userGroup", description: "Manage groups" },
          { name: "User Role", value: "userRole", description: "Manage roles" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an incident" },
          { name: "Delete", value: "delete", description: "Delete an incident" },
          { name: "Get", value: "get", description: "Get an incident" },
          { name: "Get All", value: "getAll", description: "Get all incidents" },
          { name: "Update", value: "update", description: "Update an incident" },
        ],
        displayOptions: { show: { resource: ["incident"] } },
      },
      {
        name: "shortDescription",
        type: "string",
        required: true,
        default: "",
        description: "Short description",
        displayOptions: { show: { resource: ["incident"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Incident",
        description: "Create a ServiceNow incident",
        parameters: {
          resource: "incident",
          operation: "create",
          shortDescription: "Server down",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.servicenow/",
  },

  "n8n-nodes-base.jiraSoftware": {
    type: "n8n-nodes-base.jiraSoftware",
    displayName: "Jira Service Management",
    description: "Manage service requests in Jira Service Management",
    category: "support",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "jiraSoftwareCloudApi", required: false, description: "Jira Cloud API credentials" },
      { name: "jiraSoftwareServerApi", required: false, description: "Jira Server API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "issue",
        description: "Resource to operate on",
        options: [
          { name: "Issue", value: "issue", description: "Manage issues" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an issue" },
          { name: "Get", value: "get", description: "Get an issue" },
          { name: "Update", value: "update", description: "Update an issue" },
        ],
        displayOptions: { show: { resource: ["issue"] } },
      },
    ],
    examples: [
      {
        name: "Create Service Request",
        description: "Create a service request",
        parameters: {
          resource: "issue",
          operation: "create",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.jira/",
  },
};
