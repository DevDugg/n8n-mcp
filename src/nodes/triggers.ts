/**
 * Trigger Nodes - Nodes that start workflows
 */

import type { NodeSchema } from "./types.js";

export const TRIGGER_NODES: Record<string, NodeSchema> = {
  // ============ CORE TRIGGERS ============

  "n8n-nodes-base.manualTrigger": {
    type: "n8n-nodes-base.manualTrigger",
    displayName: "Manual Trigger",
    description: "Starts the workflow on manual execution. Required for test executions.",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Basic Manual Trigger",
        description: "Simple manual trigger for testing",
        parameters: {},
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.manualtrigger/",
  },

  "n8n-nodes-base.scheduleTrigger": {
    type: "n8n-nodes-base.scheduleTrigger",
    displayName: "Schedule Trigger",
    description: "Starts the workflow at specified intervals or cron expressions",
    category: "trigger",
    typeVersion: 1.2,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "rule",
        type: "fixedCollection",
        required: true,
        description: "Schedule rule configuration",
      },
    ],
    examples: [
      {
        name: "Every Hour",
        description: "Run every hour at minute 0",
        parameters: {
          rule: {
            interval: [{ field: "hours", hoursInterval: 1 }],
          },
        },
      },
      {
        name: "Daily at 9 AM",
        description: "Run daily at 9:00 AM",
        parameters: {
          rule: {
            interval: [{ field: "cronExpression", expression: "0 9 * * *" }],
          },
        },
      },
      {
        name: "Every 5 Minutes",
        description: "Run every 5 minutes",
        parameters: {
          rule: {
            interval: [{ field: "minutes", minutesInterval: 5 }],
          },
        },
      },
      {
        name: "Weekdays at 8 AM",
        description: "Run Monday-Friday at 8 AM",
        parameters: {
          rule: {
            interval: [{ field: "cronExpression", expression: "0 8 * * 1-5" }],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/",
  },

  "n8n-nodes-base.webhook": {
    type: "n8n-nodes-base.webhook",
    displayName: "Webhook",
    description: "Starts workflow when webhook is called. Creates an HTTP endpoint.",
    category: "trigger",
    typeVersion: 2,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "httpMethod",
        type: "options",
        required: true,
        default: "GET",
        description: "HTTP method to accept",
        options: [
          { name: "DELETE", value: "DELETE" },
          { name: "GET", value: "GET" },
          { name: "HEAD", value: "HEAD" },
          { name: "PATCH", value: "PATCH" },
          { name: "POST", value: "POST" },
          { name: "PUT", value: "PUT" },
        ],
      },
      {
        name: "path",
        type: "string",
        required: true,
        default: "",
        description: "Webhook path (e.g., 'my-webhook'). Full URL will be: {n8n-url}/webhook/{path}",
        placeholder: "my-webhook",
      },
      {
        name: "authentication",
        type: "options",
        required: false,
        default: "none",
        description: "Authentication method",
        options: [
          { name: "None", value: "none" },
          { name: "Basic Auth", value: "basicAuth" },
          { name: "Header Auth", value: "headerAuth" },
        ],
      },
      {
        name: "responseMode",
        type: "options",
        required: false,
        default: "onReceived",
        description: "When to respond to the webhook",
        options: [
          { name: "When Received", value: "onReceived", description: "Respond immediately when webhook is received" },
          { name: "Last Node", value: "lastNode", description: "Respond after workflow completes" },
          { name: "Using Respond to Webhook", value: "responseNode", description: "Use Respond to Webhook node" },
        ],
      },
      {
        name: "responseData",
        type: "options",
        required: false,
        default: "firstEntryJson",
        description: "What data to return",
        options: [
          { name: "All Entries", value: "allEntries" },
          { name: "First Entry JSON", value: "firstEntryJson" },
          { name: "First Entry Binary", value: "firstEntryBinary" },
          { name: "No Response Body", value: "noData" },
        ],
      },
    ],
    examples: [
      {
        name: "POST Webhook",
        description: "Receive POST requests with JSON body",
        parameters: {
          httpMethod: "POST",
          path: "incoming-data",
          responseMode: "onReceived",
          responseData: "firstEntryJson",
        },
      },
      {
        name: "Authenticated Webhook",
        description: "Webhook with header authentication",
        parameters: {
          httpMethod: "POST",
          path: "secure-endpoint",
          authentication: "headerAuth",
          responseMode: "lastNode",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
  },

  "n8n-nodes-base.errorTrigger": {
    type: "n8n-nodes-base.errorTrigger",
    displayName: "Error Trigger",
    description: "Starts workflow when an error occurs in another workflow",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Error Handler Workflow",
        description: "Catch errors from other workflows and send alerts",
        parameters: {},
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/",
  },

  "n8n-nodes-base.n8nTrigger": {
    type: "n8n-nodes-base.n8nTrigger",
    displayName: "n8n Trigger",
    description: "Triggers when n8n events occur (workflow activated, user invited, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        default: "workflowActivated",
        description: "Event to listen for",
        options: [
          { name: "Instance Started", value: "n8n.instance.started" },
          { name: "Workflow Activated", value: "n8n.workflow.activated" },
          { name: "Workflow Updated", value: "n8n.workflow.updated" },
          { name: "Workflow Deleted", value: "n8n.workflow.deleted" },
          { name: "User Invited", value: "n8n.user.invited" },
          { name: "User Signed Up", value: "n8n.user.signedup" },
        ],
      },
    ],
    examples: [
      {
        name: "Track Workflow Changes",
        description: "Trigger when workflows are updated",
        parameters: {
          events: "n8n.workflow.updated",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.n8ntrigger/",
  },

  "n8n-nodes-base.workflowTrigger": {
    type: "n8n-nodes-base.workflowTrigger",
    displayName: "Execute Workflow Trigger",
    description: "Starts workflow when called by another workflow using Execute Workflow node",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [],
    examples: [
      {
        name: "Sub-workflow Entry Point",
        description: "Entry point for a workflow called by another workflow",
        parameters: {},
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflowtrigger/",
  },

  "n8n-nodes-base.formTrigger": {
    type: "n8n-nodes-base.formTrigger",
    displayName: "n8n Form Trigger",
    description: "Starts workflow when a form is submitted. Creates a hosted form.",
    category: "trigger",
    typeVersion: 2,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "formTitle",
        type: "string",
        required: true,
        default: "Contact Form",
        description: "Title displayed at top of form",
      },
      {
        name: "formDescription",
        type: "string",
        required: false,
        description: "Description shown below title",
      },
      {
        name: "formFields",
        type: "fixedCollection",
        required: true,
        description: "Fields to include in the form",
      },
      {
        name: "responseMode",
        type: "options",
        required: false,
        default: "onReceived",
        description: "When to respond",
        options: [
          { name: "When Received", value: "onReceived" },
          { name: "Last Node", value: "lastNode" },
          { name: "Using Respond to Webhook", value: "responseNode" },
        ],
      },
    ],
    examples: [
      {
        name: "Contact Form",
        description: "Simple contact form",
        parameters: {
          formTitle: "Contact Us",
          formDescription: "We'll get back to you within 24 hours",
          formFields: {
            values: [
              { fieldLabel: "Name", fieldType: "text", requiredField: true },
              { fieldLabel: "Email", fieldType: "email", requiredField: true },
              { fieldLabel: "Message", fieldType: "textarea", requiredField: true },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/",
  },

  "n8n-nodes-base.emailReadImap": {
    type: "n8n-nodes-base.emailReadImap",
    displayName: "Email Trigger (IMAP)",
    description: "Triggers when new emails arrive via IMAP",
    category: "trigger",
    typeVersion: 2,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "mailbox",
        type: "string",
        required: true,
        default: "INBOX",
        description: "Mailbox to monitor",
      },
      {
        name: "postProcessAction",
        type: "options",
        required: true,
        default: "nothing",
        description: "What to do with email after processing",
        options: [
          { name: "Nothing", value: "nothing" },
          { name: "Mark as Read", value: "read" },
          { name: "Delete", value: "delete" },
        ],
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: downloadAttachments, forceReconnect",
      },
    ],
    credentials: [
      {
        name: "imap",
        required: true,
        description: "IMAP connection credentials (server, port, user, password)",
      },
    ],
    examples: [
      {
        name: "Monitor Inbox",
        description: "Trigger when new emails arrive in inbox",
        parameters: {
          mailbox: "INBOX",
          postProcessAction: "read",
          options: {
            downloadAttachments: true,
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.emailreadimap/",
  },

  "n8n-nodes-base.localFileTrigger": {
    type: "n8n-nodes-base.localFileTrigger",
    displayName: "Local File Trigger",
    description: "Triggers when files are added, changed, or deleted in a folder",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "path",
        type: "string",
        required: true,
        description: "Path to the folder to watch",
        placeholder: "/data/uploads",
      },
      {
        name: "events",
        type: "options",
        required: true,
        default: "add",
        description: "Events to trigger on",
        options: [
          { name: "File Added", value: "add" },
          { name: "File Changed", value: "change" },
          { name: "File Deleted", value: "unlink" },
          { name: "Folder Added", value: "addDir" },
          { name: "Folder Deleted", value: "unlinkDir" },
        ],
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: awaitWriteFinish, ignoreInitial, ignored patterns",
      },
    ],
    examples: [
      {
        name: "Watch Upload Folder",
        description: "Trigger when files are added to uploads folder",
        parameters: {
          path: "/data/uploads",
          events: "add",
          options: {
            awaitWriteFinish: true,
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.localfiletrigger/",
  },

  "n8n-nodes-base.sseTriger": {
    type: "n8n-nodes-base.sseTrigger",
    displayName: "SSE Trigger",
    description: "Triggers when receiving Server-Sent Events from a URL",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "SSE endpoint URL",
        placeholder: "https://api.example.com/events",
      },
    ],
    examples: [
      {
        name: "Listen to SSE Stream",
        description: "Receive events from an SSE endpoint",
        parameters: {
          url: "https://api.example.com/stream",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ssetrigger/",
  },

  "n8n-nodes-base.rssFeedReadTrigger": {
    type: "n8n-nodes-base.rssFeedReadTrigger",
    displayName: "RSS Feed Trigger",
    description: "Triggers when new items are added to an RSS feed",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "feedUrl",
        type: "string",
        required: true,
        description: "URL of the RSS feed",
        placeholder: "https://example.com/feed.xml",
      },
    ],
    examples: [
      {
        name: "Monitor Blog RSS",
        description: "Trigger when new blog posts are published",
        parameters: {
          feedUrl: "https://blog.example.com/rss",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeedreadtrigger/",
  },

  // ============ APP TRIGGERS ============

  "n8n-nodes-base.telegramTrigger": {
    type: "n8n-nodes-base.telegramTrigger",
    displayName: "Telegram Trigger",
    description: "Starts workflow when a Telegram message is received. Create a bot via @BotFather first.",
    category: "trigger",
    typeVersion: 1.1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "updates",
        type: "options",
        required: true,
        default: "message",
        description: "Which updates to listen for",
        options: [
          { name: "Message", value: "message", description: "New incoming message" },
          { name: "Edited Message", value: "edited_message", description: "Message was edited" },
          { name: "Channel Post", value: "channel_post", description: "New channel post" },
          { name: "Callback Query", value: "callback_query", description: "Inline button was pressed" },
          { name: "Pre Checkout Query", value: "pre_checkout_query", description: "Payment pre-checkout" },
          { name: "*", value: "*", description: "All updates" },
        ],
      },
    ],
    credentials: [
      {
        name: "telegramApi",
        required: true,
        description: "Telegram Bot API token from @BotFather",
      },
    ],
    examples: [
      {
        name: "All Messages",
        description: "Trigger on any message",
        parameters: {
          updates: "message",
        },
      },
      {
        name: "Button Clicks",
        description: "Trigger on inline button clicks",
        parameters: {
          updates: "callback_query",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/",
  },

  "n8n-nodes-base.slackTrigger": {
    type: "n8n-nodes-base.slackTrigger",
    displayName: "Slack Trigger",
    description: "Triggers when events occur in Slack (messages, reactions, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        default: "message",
        description: "Event to listen for",
        options: [
          { name: "Any Event", value: "*" },
          { name: "Bot/App Mention", value: "app_mention" },
          { name: "File Shared", value: "file_shared" },
          { name: "Message", value: "message" },
          { name: "Reaction Added", value: "reaction_added" },
          { name: "Reaction Removed", value: "reaction_removed" },
        ],
      },
      {
        name: "channelId",
        type: "string",
        required: false,
        description: "Channel ID to filter events (leave empty for all channels)",
      },
    ],
    credentials: [
      {
        name: "slackApi",
        required: true,
        description: "Slack API credentials with appropriate event scopes",
      },
    ],
    examples: [
      {
        name: "App Mentions",
        description: "Trigger when the bot is mentioned",
        parameters: {
          events: "app_mention",
        },
      },
      {
        name: "Channel Messages",
        description: "Trigger on messages in a specific channel",
        parameters: {
          events: "message",
          channelId: "C0123456789",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.slacktrigger/",
  },

  "n8n-nodes-base.gmailTrigger": {
    type: "n8n-nodes-base.gmailTrigger",
    displayName: "Gmail Trigger",
    description: "Triggers when new emails arrive in Gmail",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "pollTimes",
        type: "fixedCollection",
        required: true,
        description: "How often to poll for new emails",
      },
      {
        name: "filters",
        type: "collection",
        required: false,
        description: "Filter emails: from, to, subject, after, before, hasAttachment, labelIds, readStatus",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: downloadAttachments, attachmentPrefix",
      },
    ],
    credentials: [
      {
        name: "gmailOAuth2",
        required: true,
        description: "Gmail OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "New Unread Emails",
        description: "Trigger on new unread emails",
        parameters: {
          pollTimes: {
            item: [{ mode: "everyMinute" }],
          },
          filters: {
            readStatus: "unread",
          },
        },
      },
      {
        name: "Emails from Specific Sender",
        description: "Trigger on emails from a specific address",
        parameters: {
          filters: {
            from: "notifications@github.com",
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/",
  },

  "n8n-nodes-base.githubTrigger": {
    type: "n8n-nodes-base.githubTrigger",
    displayName: "GitHub Trigger",
    description: "Triggers when events occur in GitHub repositories",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "owner",
        type: "string",
        required: true,
        description: "Repository owner (username or organization)",
      },
      {
        name: "repository",
        type: "string",
        required: true,
        description: "Repository name",
      },
      {
        name: "events",
        type: "options",
        required: true,
        description: "Events to listen for",
        options: [
          { name: "Push", value: "push" },
          { name: "Pull Request", value: "pull_request" },
          { name: "Issues", value: "issues" },
          { name: "Issue Comment", value: "issue_comment" },
          { name: "Create", value: "create" },
          { name: "Delete", value: "delete" },
          { name: "Fork", value: "fork" },
          { name: "Release", value: "release" },
          { name: "Star", value: "star" },
          { name: "Watch", value: "watch" },
          { name: "Workflow Run", value: "workflow_run" },
        ],
      },
    ],
    credentials: [
      {
        name: "githubApi",
        required: true,
        description: "GitHub API credentials with webhooks scope",
      },
    ],
    examples: [
      {
        name: "New Pull Requests",
        description: "Trigger on new PRs",
        parameters: {
          owner: "myorg",
          repository: "myrepo",
          events: "pull_request",
        },
      },
      {
        name: "Push Events",
        description: "Trigger on code pushes",
        parameters: {
          owner: "myorg",
          repository: "myrepo",
          events: "push",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.githubtrigger/",
  },

  "n8n-nodes-base.googleSheetsTrigger": {
    type: "n8n-nodes-base.googleSheetsTrigger",
    displayName: "Google Sheets Trigger",
    description: "Triggers when rows are added or updated in Google Sheets",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "documentId",
        type: "string",
        required: true,
        description: "Google Sheets document ID",
      },
      {
        name: "sheetName",
        type: "string",
        required: true,
        default: "Sheet1",
        description: "Sheet name within the document",
      },
      {
        name: "event",
        type: "options",
        required: true,
        default: "rowAdded",
        description: "Event to trigger on",
        options: [
          { name: "Row Added", value: "rowAdded" },
          { name: "Row Updated", value: "rowUpdated" },
          { name: "Row Added or Updated", value: "rowAddedOrUpdated" },
        ],
      },
    ],
    credentials: [
      {
        name: "googleSheetsOAuth2Api",
        required: true,
        description: "Google Sheets OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "New Rows",
        description: "Trigger when rows are added",
        parameters: {
          documentId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          sheetName: "Sheet1",
          event: "rowAdded",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.googlesheetstrigger/",
  },

  "n8n-nodes-base.airtableTrigger": {
    type: "n8n-nodes-base.airtableTrigger",
    displayName: "Airtable Trigger",
    description: "Triggers when records are created or updated in Airtable",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "baseId",
        type: "string",
        required: true,
        description: "Airtable Base ID",
      },
      {
        name: "tableId",
        type: "string",
        required: true,
        description: "Table name or ID",
      },
      {
        name: "triggerField",
        type: "string",
        required: false,
        description: "Field to use for detecting changes (e.g., 'Last Modified')",
      },
    ],
    credentials: [
      {
        name: "airtableTokenApi",
        required: true,
        description: "Airtable API credentials",
      },
    ],
    examples: [
      {
        name: "New Records",
        description: "Trigger when records are created",
        parameters: {
          baseId: "appXXXXXXXXXXXXXX",
          tableId: "Tasks",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.airtabletrigger/",
  },

  "n8n-nodes-base.hubspotTrigger": {
    type: "n8n-nodes-base.hubspotTrigger",
    displayName: "HubSpot Trigger",
    description: "Triggers when events occur in HubSpot (contacts, deals, tickets, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "eventsUi",
        type: "fixedCollection",
        required: true,
        description: "Events to listen for",
      },
    ],
    credentials: [
      {
        name: "hubspotDeveloperApi",
        required: true,
        description: "HubSpot Developer API credentials",
      },
    ],
    examples: [
      {
        name: "New Contacts",
        description: "Trigger when contacts are created",
        parameters: {
          eventsUi: {
            eventValues: [{ name: "contact.creation" }],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.hubspottrigger/",
  },

  "n8n-nodes-base.jiraTrigger": {
    type: "n8n-nodes-base.jiraTrigger",
    displayName: "Jira Trigger",
    description: "Triggers when events occur in Jira (issues created, updated, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        description: "Events to listen for",
        options: [
          { name: "Issue Created", value: "jira:issue_created" },
          { name: "Issue Updated", value: "jira:issue_updated" },
          { name: "Issue Deleted", value: "jira:issue_deleted" },
          { name: "Comment Created", value: "comment_created" },
          { name: "Comment Updated", value: "comment_updated" },
        ],
      },
    ],
    credentials: [
      {
        name: "jiraSoftwareCloudApi",
        required: true,
        description: "Jira API credentials",
      },
    ],
    examples: [
      {
        name: "New Issues",
        description: "Trigger when issues are created",
        parameters: {
          events: "jira:issue_created",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.jiratrigger/",
  },

  "n8n-nodes-base.stripeTrigger": {
    type: "n8n-nodes-base.stripeTrigger",
    displayName: "Stripe Trigger",
    description: "Triggers when events occur in Stripe (payments, subscriptions, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        description: "Events to listen for",
        options: [
          { name: "Charge Succeeded", value: "charge.succeeded" },
          { name: "Charge Failed", value: "charge.failed" },
          { name: "Customer Created", value: "customer.created" },
          { name: "Customer Subscription Created", value: "customer.subscription.created" },
          { name: "Customer Subscription Updated", value: "customer.subscription.updated" },
          { name: "Customer Subscription Deleted", value: "customer.subscription.deleted" },
          { name: "Invoice Created", value: "invoice.created" },
          { name: "Invoice Payment Succeeded", value: "invoice.payment_succeeded" },
          { name: "Invoice Payment Failed", value: "invoice.payment_failed" },
          { name: "Payment Intent Succeeded", value: "payment_intent.succeeded" },
          { name: "Checkout Session Completed", value: "checkout.session.completed" },
        ],
      },
    ],
    credentials: [
      {
        name: "stripeApi",
        required: true,
        description: "Stripe API credentials",
      },
    ],
    examples: [
      {
        name: "Successful Payments",
        description: "Trigger on successful payments",
        parameters: {
          events: "charge.succeeded",
        },
      },
      {
        name: "New Subscriptions",
        description: "Trigger when subscriptions are created",
        parameters: {
          events: "customer.subscription.created",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.stripetrigger/",
  },

  "n8n-nodes-base.shopifyTrigger": {
    type: "n8n-nodes-base.shopifyTrigger",
    displayName: "Shopify Trigger",
    description: "Triggers when events occur in Shopify (orders, products, customers, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "topic",
        type: "options",
        required: true,
        description: "Event topic to listen for",
        options: [
          { name: "Order Created", value: "orders/create" },
          { name: "Order Updated", value: "orders/updated" },
          { name: "Order Paid", value: "orders/paid" },
          { name: "Order Fulfilled", value: "orders/fulfilled" },
          { name: "Order Cancelled", value: "orders/cancelled" },
          { name: "Customer Created", value: "customers/create" },
          { name: "Customer Updated", value: "customers/update" },
          { name: "Product Created", value: "products/create" },
          { name: "Product Updated", value: "products/update" },
          { name: "Product Deleted", value: "products/delete" },
          { name: "Cart Created", value: "carts/create" },
          { name: "Checkout Create", value: "checkouts/create" },
        ],
      },
    ],
    credentials: [
      {
        name: "shopifyApi",
        required: true,
        description: "Shopify API credentials",
      },
    ],
    examples: [
      {
        name: "New Orders",
        description: "Trigger when orders are created",
        parameters: {
          topic: "orders/create",
        },
      },
      {
        name: "New Customers",
        description: "Trigger when customers are created",
        parameters: {
          topic: "customers/create",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.shopifytrigger/",
  },

  "n8n-nodes-base.discordTrigger": {
    type: "n8n-nodes-base.discordTrigger",
    displayName: "Discord Trigger",
    description: "Triggers when events occur in Discord",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "event",
        type: "options",
        required: true,
        description: "Event to listen for",
        options: [
          { name: "Bot Command", value: "command" },
          { name: "Message Sent", value: "message" },
          { name: "Reaction Added", value: "reactionAdd" },
        ],
      },
    ],
    credentials: [
      {
        name: "discordBotApi",
        required: true,
        description: "Discord Bot credentials",
      },
    ],
    examples: [
      {
        name: "Bot Commands",
        description: "Trigger when bot commands are used",
        parameters: {
          event: "command",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.discordtrigger/",
  },

  "n8n-nodes-base.typeformTrigger": {
    type: "n8n-nodes-base.typeformTrigger",
    displayName: "Typeform Trigger",
    description: "Triggers when Typeform responses are submitted",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "formId",
        type: "string",
        required: true,
        description: "Typeform form ID",
      },
    ],
    credentials: [
      {
        name: "typeformApi",
        required: true,
        description: "Typeform API credentials",
      },
    ],
    examples: [
      {
        name: "Form Submissions",
        description: "Trigger when forms are submitted",
        parameters: {
          formId: "abc123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.typeformtrigger/",
  },

  "n8n-nodes-base.calendlyTrigger": {
    type: "n8n-nodes-base.calendlyTrigger",
    displayName: "Calendly Trigger",
    description: "Triggers when events occur in Calendly (bookings, cancellations)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        description: "Events to listen for",
        options: [
          { name: "Invitee Created", value: "invitee.created" },
          { name: "Invitee Canceled", value: "invitee.canceled" },
        ],
      },
      {
        name: "scope",
        type: "options",
        required: true,
        description: "Scope of events",
        options: [
          { name: "User", value: "user" },
          { name: "Organization", value: "organization" },
        ],
      },
    ],
    credentials: [
      {
        name: "calendlyApi",
        required: true,
        description: "Calendly API credentials",
      },
    ],
    examples: [
      {
        name: "New Bookings",
        description: "Trigger when meetings are booked",
        parameters: {
          events: "invitee.created",
          scope: "user",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.calendlytrigger/",
  },

  "n8n-nodes-base.asanaTrigger": {
    type: "n8n-nodes-base.asanaTrigger",
    displayName: "Asana Trigger",
    description: "Triggers when events occur in Asana (tasks, projects, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        description: "Resource to watch",
        options: [
          { name: "Project", value: "project" },
          { name: "Task", value: "task" },
        ],
      },
      {
        name: "projectId",
        type: "string",
        required: true,
        description: "Project ID to watch",
      },
    ],
    credentials: [
      {
        name: "asanaApi",
        required: true,
        description: "Asana API credentials",
      },
    ],
    examples: [
      {
        name: "Task Changes",
        description: "Trigger when tasks change in a project",
        parameters: {
          resource: "task",
          projectId: "1234567890",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.asanatrigger/",
  },

  "n8n-nodes-base.clickUpTrigger": {
    type: "n8n-nodes-base.clickUpTrigger",
    displayName: "ClickUp Trigger",
    description: "Triggers when events occur in ClickUp",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        description: "Events to listen for",
        options: [
          { name: "Task Created", value: "taskCreated" },
          { name: "Task Updated", value: "taskUpdated" },
          { name: "Task Deleted", value: "taskDeleted" },
          { name: "Task Status Updated", value: "taskStatusUpdated" },
          { name: "Task Assignee Updated", value: "taskAssigneeUpdated" },
          { name: "Task Comment Posted", value: "taskCommentPosted" },
        ],
      },
      {
        name: "workspaceId",
        type: "string",
        required: true,
        description: "ClickUp workspace ID",
      },
    ],
    credentials: [
      {
        name: "clickUpApi",
        required: true,
        description: "ClickUp API credentials",
      },
    ],
    examples: [
      {
        name: "New Tasks",
        description: "Trigger when tasks are created",
        parameters: {
          events: "taskCreated",
          workspaceId: "123456",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.clickuptrigger/",
  },

  "n8n-nodes-base.linearTrigger": {
    type: "n8n-nodes-base.linearTrigger",
    displayName: "Linear Trigger",
    description: "Triggers when events occur in Linear (issues, comments, etc.)",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "teamId",
        type: "string",
        required: true,
        description: "Linear team ID",
      },
      {
        name: "resources",
        type: "options",
        required: true,
        description: "Resources to watch",
        options: [
          { name: "Comment", value: "Comment" },
          { name: "Cycle", value: "Cycle" },
          { name: "Issue", value: "Issue" },
          { name: "Issue Label", value: "IssueLabel" },
          { name: "Project", value: "Project" },
        ],
      },
    ],
    credentials: [
      {
        name: "linearApi",
        required: true,
        description: "Linear API credentials",
      },
    ],
    examples: [
      {
        name: "Issue Changes",
        description: "Trigger when issues change",
        parameters: {
          teamId: "team123",
          resources: "Issue",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.lineartrigger/",
  },

  "n8n-nodes-base.notionTrigger": {
    type: "n8n-nodes-base.notionTrigger",
    displayName: "Notion Trigger",
    description: "Triggers when pages are added or updated in Notion",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "event",
        type: "options",
        required: true,
        description: "Event to trigger on",
        options: [
          { name: "Page Added to Database", value: "pageAddedToDatabase" },
          { name: "Page Updated in Database", value: "pagedUpdatedInDatabase" },
        ],
      },
      {
        name: "databaseId",
        type: "string",
        required: true,
        description: "Notion database ID",
      },
    ],
    credentials: [
      {
        name: "notionApi",
        required: true,
        description: "Notion API credentials",
      },
    ],
    examples: [
      {
        name: "New Database Entries",
        description: "Trigger when pages are added to database",
        parameters: {
          event: "pageAddedToDatabase",
          databaseId: "abc123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.notiontrigger/",
  },

  "n8n-nodes-base.mondayComTrigger": {
    type: "n8n-nodes-base.mondayComTrigger",
    displayName: "Monday.com Trigger",
    description: "Triggers when events occur in Monday.com",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "boardId",
        type: "string",
        required: true,
        description: "Monday.com board ID",
      },
      {
        name: "event",
        type: "options",
        required: true,
        description: "Event to listen for",
        options: [
          { name: "Item Created", value: "create_item" },
          { name: "Item Name Changed", value: "change_name" },
          { name: "Item Deleted", value: "delete_item" },
          { name: "Column Value Changed", value: "change_column_value" },
          { name: "Status Changed", value: "change_status_column_value" },
        ],
      },
    ],
    credentials: [
      {
        name: "mondayComApi",
        required: true,
        description: "Monday.com API credentials",
      },
    ],
    examples: [
      {
        name: "New Items",
        description: "Trigger when items are created",
        parameters: {
          boardId: "123456789",
          event: "create_item",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.mondaycomtrigger/",
  },

  "n8n-nodes-base.trelloTrigger": {
    type: "n8n-nodes-base.trelloTrigger",
    displayName: "Trello Trigger",
    description: "Triggers when events occur in Trello",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Board or card ID to watch",
      },
      {
        name: "filters",
        type: "options",
        required: false,
        description: "Filter events",
        options: [
          { name: "All", value: "all" },
          { name: "Add Card To Board", value: "addCardToBoard" },
          { name: "Add Checklist To Card", value: "addChecklistToCard" },
          { name: "Add Member To Board", value: "addMemberToBoard" },
          { name: "Add Member To Card", value: "addMemberToCard" },
          { name: "Comment Card", value: "commentCard" },
          { name: "Update Card", value: "updateCard" },
        ],
      },
    ],
    credentials: [
      {
        name: "trelloApi",
        required: true,
        description: "Trello API credentials",
      },
    ],
    examples: [
      {
        name: "Board Activity",
        description: "Trigger on all board activity",
        parameters: {
          id: "boardId123",
          filters: "all",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.trellotrigger/",
  },

  "n8n-nodes-base.zendeskTrigger": {
    type: "n8n-nodes-base.zendeskTrigger",
    displayName: "Zendesk Trigger",
    description: "Triggers when events occur in Zendesk",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "conditionsUi",
        type: "fixedCollection",
        required: true,
        description: "Conditions for triggering",
      },
    ],
    credentials: [
      {
        name: "zendeskApi",
        required: true,
        description: "Zendesk API credentials",
      },
    ],
    examples: [
      {
        name: "New Tickets",
        description: "Trigger when tickets are created",
        parameters: {
          conditionsUi: {
            conditionValues: [
              { field: "status", value: "new" },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.zendesktrigger/",
  },

  "n8n-nodes-base.intercomTrigger": {
    type: "n8n-nodes-base.intercomTrigger",
    displayName: "Intercom Trigger",
    description: "Triggers when events occur in Intercom",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "topic",
        type: "options",
        required: true,
        description: "Topic to listen for",
        options: [
          { name: "Company Created", value: "company.created" },
          { name: "Contact Created", value: "contact.created" },
          { name: "Conversation Admin Assigned", value: "conversation.admin.assigned" },
          { name: "Conversation Admin Closed", value: "conversation.admin.closed" },
          { name: "Conversation Admin Opened", value: "conversation.admin.opened" },
          { name: "Conversation Admin Replied", value: "conversation.admin.replied" },
          { name: "Conversation User Created", value: "conversation.user.created" },
          { name: "Conversation User Replied", value: "conversation.user.replied" },
          { name: "User Created", value: "user.created" },
        ],
      },
    ],
    credentials: [
      {
        name: "intercomApi",
        required: true,
        description: "Intercom API credentials",
      },
    ],
    examples: [
      {
        name: "New Conversations",
        description: "Trigger when users create conversations",
        parameters: {
          topic: "conversation.user.created",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.intercomtrigger/",
  },

  "n8n-nodes-base.wooCommerceTrigger": {
    type: "n8n-nodes-base.wooCommerceTrigger",
    displayName: "WooCommerce Trigger",
    description: "Triggers when events occur in WooCommerce",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "event",
        type: "options",
        required: true,
        description: "Event to listen for",
        options: [
          { name: "Coupon Created", value: "coupon.created" },
          { name: "Coupon Updated", value: "coupon.updated" },
          { name: "Customer Created", value: "customer.created" },
          { name: "Customer Updated", value: "customer.updated" },
          { name: "Order Created", value: "order.created" },
          { name: "Order Updated", value: "order.updated" },
          { name: "Order Deleted", value: "order.deleted" },
          { name: "Product Created", value: "product.created" },
          { name: "Product Updated", value: "product.updated" },
          { name: "Product Deleted", value: "product.deleted" },
        ],
      },
    ],
    credentials: [
      {
        name: "wooCommerceApi",
        required: true,
        description: "WooCommerce API credentials",
      },
    ],
    examples: [
      {
        name: "New Orders",
        description: "Trigger when orders are created",
        parameters: {
          event: "order.created",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.woocommercetrigger/",
  },

  "n8n-nodes-base.dropboxTrigger": {
    type: "n8n-nodes-base.dropboxTrigger",
    displayName: "Dropbox Trigger",
    description: "Triggers when files are added or modified in Dropbox",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "folder",
        type: "string",
        required: true,
        default: "/",
        description: "Folder path to watch",
      },
    ],
    credentials: [
      {
        name: "dropboxOAuth2Api",
        required: true,
        description: "Dropbox OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "Watch Folder",
        description: "Trigger when files change in a folder",
        parameters: {
          folder: "/uploads",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.dropboxtrigger/",
  },

  "n8n-nodes-base.googleDriveTrigger": {
    type: "n8n-nodes-base.googleDriveTrigger",
    displayName: "Google Drive Trigger",
    description: "Triggers when files are created or modified in Google Drive",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "event",
        type: "options",
        required: true,
        description: "Event to trigger on",
        options: [
          { name: "File Created", value: "fileCreated" },
          { name: "File Updated", value: "fileUpdated" },
          { name: "Folder Created", value: "folderCreated" },
          { name: "Folder Updated", value: "folderUpdated" },
        ],
      },
      {
        name: "folderId",
        type: "string",
        required: false,
        description: "Folder ID to watch (leave empty for entire Drive)",
      },
    ],
    credentials: [
      {
        name: "googleDriveOAuth2Api",
        required: true,
        description: "Google Drive OAuth2 credentials",
      },
    ],
    examples: [
      {
        name: "New Files",
        description: "Trigger when files are created",
        parameters: {
          event: "fileCreated",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.googledrivetrigger/",
  },

  "n8n-nodes-base.activationTrigger": {
    type: "n8n-nodes-base.activationTrigger",
    displayName: "Activation Trigger",
    description: "Triggers when the workflow is activated or updated",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "events",
        type: "options",
        required: true,
        default: "activate",
        description: "Events to trigger on",
        options: [
          { name: "Workflow Activated", value: "activate", description: "When workflow is activated" },
          { name: "Workflow Updated", value: "update", description: "When workflow is updated" },
        ],
      },
    ],
    examples: [
      {
        name: "On Activation",
        description: "Run when workflow is activated",
        parameters: {
          events: "activate",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.activationtrigger/",
  },

  "n8n-nodes-base.chatTrigger": {
    type: "n8n-nodes-base.chatTrigger",
    displayName: "Chat Trigger",
    description: "Triggers workflow from chat messages in n8n chat interface",
    category: "trigger",
    typeVersion: 1,
    inputs: [],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "webhook",
        description: "How to receive messages",
        options: [
          { name: "Webhook", value: "webhook", description: "Receive via webhook" },
          { name: "Hosted Chat", value: "hostedChat", description: "Use n8n hosted chat" },
        ],
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options like allowed origins, initial messages",
      },
    ],
    examples: [
      {
        name: "Chat Interface",
        description: "Receive messages from chat",
        parameters: {
          mode: "hostedChat",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.chattrigger/",
  },

};
