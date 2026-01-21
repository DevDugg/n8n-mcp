/**
 * Marketing Integration Nodes
 *
 * HubSpot Marketing, Klaviyo, Mailerlite, Brevo, etc.
 */

import type { NodeSchema } from "../types.js";

export const MARKETING_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.klaviyo": {
    type: "n8n-nodes-base.klaviyo",
    displayName: "Klaviyo",
    description: "Manage profiles and track events in Klaviyo",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "klaviyoApi", required: true, description: "Klaviyo API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "profile",
        description: "Resource to operate on",
        options: [
          { name: "Profile", value: "profile", description: "Manage profiles" },
          { name: "Event", value: "event", description: "Track events" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a profile" },
          { name: "Get", value: "get", description: "Get a profile" },
          { name: "Update", value: "update", description: "Update a profile" },
        ],
        displayOptions: { show: { resource: ["profile"] } },
      },
      {
        name: "email",
        type: "string",
        required: true,
        default: "",
        description: "Profile email address",
        displayOptions: { show: { resource: ["profile"] } },
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
        name: "Create Profile",
        description: "Create a Klaviyo profile",
        parameters: {
          resource: "profile",
          operation: "create",
          email: "customer@example.com",
          additionalFields: { first_name: "John", last_name: "Doe" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.klaviyo/",
  },

  "n8n-nodes-base.brevo": {
    type: "n8n-nodes-base.brevo",
    displayName: "Brevo",
    description: "Send emails and manage contacts in Brevo (formerly Sendinblue)",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "brevoApi", required: true, description: "Brevo API key" },
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
          { name: "Email", value: "email", description: "Send emails" },
          { name: "Sender", value: "sender", description: "Manage senders" },
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
          { name: "Delete", value: "delete", description: "Delete a contact" },
          { name: "Get", value: "get", description: "Get a contact" },
          { name: "Get All", value: "getAll", description: "Get all contacts" },
          { name: "Update", value: "update", description: "Update a contact" },
        ],
        displayOptions: { show: { resource: ["contact"] } },
      },
      {
        name: "email",
        type: "string",
        required: true,
        default: "",
        description: "Contact email address",
        displayOptions: { show: { resource: ["contact"] } },
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
        name: "Create Contact",
        description: "Add a contact to Brevo",
        parameters: {
          resource: "contact",
          operation: "create",
          email: "contact@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.brevo/",
  },

  "n8n-nodes-base.autopilot": {
    type: "n8n-nodes-base.autopilot",
    displayName: "Autopilot",
    description: "Manage contacts and journeys in Autopilot",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "autopilotApi", required: true, description: "Autopilot API key" },
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
          { name: "Contact Journey", value: "contactJourney", description: "Manage journeys" },
          { name: "Contact List", value: "contactList", description: "Manage lists" },
          { name: "List", value: "list", description: "Get lists" },
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
          { name: "Delete", value: "delete", description: "Delete a contact" },
          { name: "Get", value: "get", description: "Get a contact" },
          { name: "Get All", value: "getAll", description: "Get all contacts" },
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
        displayOptions: { show: { resource: ["contact"], operation: ["create", "get", "delete", "update"] } },
      },
    ],
    examples: [
      {
        name: "Create Contact",
        description: "Create a contact in Autopilot",
        parameters: {
          resource: "contact",
          operation: "create",
          email: "contact@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.autopilot/",
  },

  "n8n-nodes-base.getResponse": {
    type: "n8n-nodes-base.getResponse",
    displayName: "GetResponse",
    description: "Manage contacts and campaigns in GetResponse",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "getResponseApi", required: false, description: "GetResponse API key" },
      { name: "getResponseOAuth2Api", required: false, description: "GetResponse OAuth2 credentials" },
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
          { name: "Delete", value: "delete", description: "Delete a contact" },
          { name: "Get", value: "get", description: "Get a contact" },
          { name: "Get All", value: "getAll", description: "Get all contacts" },
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
      {
        name: "campaignId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Campaign to add contact to",
        displayOptions: { show: { resource: ["contact"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Contact",
        description: "Add a contact to GetResponse",
        parameters: {
          resource: "contact",
          operation: "create",
          email: "contact@example.com",
          campaignId: "campaign-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.getresponse/",
  },

  "n8n-nodes-base.mailjet": {
    type: "n8n-nodes-base.mailjet",
    displayName: "Mailjet",
    description: "Send emails and manage contacts in Mailjet",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mailjetEmailApi", required: true, description: "Mailjet API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "email",
        description: "Resource to operate on",
        options: [
          { name: "Contact", value: "contact", description: "Manage contacts" },
          { name: "Email", value: "email", description: "Send emails" },
          { name: "SMS", value: "sms", description: "Send SMS" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "send",
        description: "Operation to perform",
        options: [
          { name: "Send", value: "send", description: "Send an email" },
          { name: "Send Template", value: "sendTemplate", description: "Send template" },
        ],
        displayOptions: { show: { resource: ["email"] } },
      },
      {
        name: "fromEmail",
        type: "string",
        required: true,
        default: "",
        description: "Sender email",
        displayOptions: { show: { resource: ["email"] } },
      },
      {
        name: "toEmail",
        type: "string",
        required: true,
        default: "",
        description: "Recipient email",
        displayOptions: { show: { resource: ["email"] } },
      },
      {
        name: "subject",
        type: "string",
        required: true,
        default: "",
        description: "Email subject",
        displayOptions: { show: { resource: ["email"], operation: ["send"] } },
      },
    ],
    examples: [
      {
        name: "Send Email",
        description: "Send an email via Mailjet",
        parameters: {
          resource: "email",
          operation: "send",
          fromEmail: "sender@example.com",
          toEmail: "recipient@example.com",
          subject: "Hello from n8n",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mailjet/",
  },

  "n8n-nodes-base.moosend": {
    type: "n8n-nodes-base.moosend",
    displayName: "Moosend",
    description: "Manage subscribers and campaigns in Moosend",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "moosendApi", required: true, description: "Moosend API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "subscriber",
        description: "Resource to operate on",
        options: [
          { name: "Subscriber", value: "subscriber", description: "Manage subscribers" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Add a subscriber" },
          { name: "Get All", value: "getAll", description: "Get all subscribers" },
          { name: "Update", value: "update", description: "Update a subscriber" },
          { name: "Unsubscribe", value: "unsubscribe", description: "Unsubscribe" },
        ],
        displayOptions: { show: { resource: ["subscriber"] } },
      },
      {
        name: "mailingListId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Mailing list ID",
      },
      {
        name: "email",
        type: "string",
        required: true,
        default: "",
        description: "Subscriber email",
        displayOptions: { show: { operation: ["create", "update", "unsubscribe"] } },
      },
    ],
    examples: [
      {
        name: "Add Subscriber",
        description: "Add a subscriber to a list",
        parameters: {
          resource: "subscriber",
          operation: "create",
          mailingListId: "list-id",
          email: "subscriber@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.moosend/",
  },

  "n8n-nodes-base.iterable": {
    type: "n8n-nodes-base.iterable",
    displayName: "Iterable",
    description: "Manage users and send events in Iterable",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "iterableApi", required: true, description: "Iterable API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "user",
        description: "Resource to operate on",
        options: [
          { name: "Event", value: "event", description: "Track events" },
          { name: "User", value: "user", description: "Manage users" },
          { name: "User List", value: "userList", description: "Manage lists" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "upsert",
        description: "Operation to perform",
        options: [
          { name: "Create or Update", value: "upsert", description: "Upsert a user" },
          { name: "Delete", value: "delete", description: "Delete a user" },
          { name: "Get", value: "get", description: "Get a user" },
        ],
        displayOptions: { show: { resource: ["user"] } },
      },
      {
        name: "identifier",
        type: "options",
        required: true,
        default: "email",
        description: "User identifier type",
        options: [
          { name: "Email", value: "email" },
          { name: "User ID", value: "userId" },
        ],
      },
      {
        name: "value",
        type: "string",
        required: true,
        default: "",
        description: "Identifier value",
      },
    ],
    examples: [
      {
        name: "Upsert User",
        description: "Create or update a user",
        parameters: {
          resource: "user",
          operation: "upsert",
          identifier: "email",
          value: "user@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.iterable/",
  },

  "n8n-nodes-base.sendPulse": {
    type: "n8n-nodes-base.sendPulse",
    displayName: "SendPulse",
    description: "Manage subscribers and send emails in SendPulse",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "sendPulseApi", required: true, description: "SendPulse API credentials" },
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
          { name: "Create", value: "create", description: "Add a contact" },
          { name: "Delete", value: "delete", description: "Delete a contact" },
          { name: "Get", value: "get", description: "Get a contact" },
          { name: "Get All", value: "getAll", description: "Get all contacts" },
        ],
        displayOptions: { show: { resource: ["contact"] } },
      },
      {
        name: "addressBookId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Address book ID",
      },
      {
        name: "email",
        type: "string",
        required: true,
        default: "",
        description: "Contact email",
        displayOptions: { show: { operation: ["create", "get", "delete"] } },
      },
    ],
    examples: [
      {
        name: "Add Contact",
        description: "Add a contact to SendPulse",
        parameters: {
          resource: "contact",
          operation: "create",
          addressBookId: "book-id",
          email: "contact@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.sendpulse/",
  },

  "n8n-nodes-base.vero": {
    type: "n8n-nodes-base.vero",
    displayName: "Vero",
    description: "Manage users and track events in Vero",
    category: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "veroApi", required: true, description: "Vero API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "user",
        description: "Resource to operate on",
        options: [
          { name: "Event", value: "event", description: "Track events" },
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
          { name: "Alias", value: "alias", description: "Create alias" },
          { name: "Create or Update", value: "create", description: "Upsert user" },
          { name: "Delete", value: "delete", description: "Delete user" },
          { name: "Resubscribe", value: "resubscribe", description: "Resubscribe" },
          { name: "Unsubscribe", value: "unsubscribe", description: "Unsubscribe" },
        ],
        displayOptions: { show: { resource: ["user"] } },
      },
      {
        name: "id",
        type: "string",
        required: true,
        default: "",
        description: "User ID",
      },
    ],
    examples: [
      {
        name: "Create User",
        description: "Create or update a user",
        parameters: {
          resource: "user",
          operation: "create",
          id: "user-123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.vero/",
  },
};
