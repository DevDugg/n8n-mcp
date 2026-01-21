/**
 * Workflow Templates - Pre-built workflow patterns
 */

export interface WorkflowTemplate {
  name: string;
  description: string;
  nodes: {
    name: string;
    type: string;
    position: [number, number];
    parameters: Record<string, unknown>;
  }[];
  connections: Record<string, unknown>;
}

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  "webhook-to-slack": {
    name: "Webhook to Slack Notification",
    description: "Receive webhook data and send a formatted Slack message",
    nodes: [
      {
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [250, 300],
        parameters: {
          httpMethod: "POST",
          path: "incoming-data",
          responseMode: "onReceived",
        },
      },
      {
        name: "Send to Slack",
        type: "n8n-nodes-base.slack",
        position: [500, 300],
        parameters: {
          resource: "message",
          operation: "post",
          channel: "#notifications",
          text: "New webhook received:\n```{{ JSON.stringify($json, null, 2) }}```",
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: "Send to Slack", type: "main", index: 0 }]],
      },
    },
  },

  "scheduled-api-to-sheets": {
    name: "Scheduled API to Google Sheets",
    description: "Fetch data from API on schedule and append to Google Sheets",
    nodes: [
      {
        name: "Schedule Trigger",
        type: "n8n-nodes-base.scheduleTrigger",
        position: [250, 300],
        parameters: {
          rule: {
            interval: [{ field: "hours", hoursInterval: 1 }],
          },
        },
      },
      {
        name: "HTTP Request",
        type: "n8n-nodes-base.httpRequest",
        position: [450, 300],
        parameters: {
          method: "GET",
          url: "https://api.example.com/data",
          authentication: "none",
        },
      },
      {
        name: "Append to Sheet",
        type: "n8n-nodes-base.googleSheets",
        position: [650, 300],
        parameters: {
          operation: "append",
          documentId: "your-sheet-id",
          sheetName: "Sheet1",
        },
      },
    ],
    connections: {
      "Schedule Trigger": {
        main: [[{ node: "HTTP Request", type: "main", index: 0 }]],
      },
      "HTTP Request": {
        main: [[{ node: "Append to Sheet", type: "main", index: 0 }]],
      },
    },
  },

  "conditional-processing": {
    name: "Conditional Data Processing",
    description: "Route data through different paths based on conditions",
    nodes: [
      {
        name: "Manual Trigger",
        type: "n8n-nodes-base.manualTrigger",
        position: [250, 300],
        parameters: {},
      },
      {
        name: "Check Condition",
        type: "n8n-nodes-base.if",
        position: [450, 300],
        parameters: {
          conditions: {
            string: [
              {
                value1: "={{ $json.status }}",
                operation: "equals",
                value2: "approved",
              },
            ],
          },
        },
      },
      {
        name: "Approved Path",
        type: "n8n-nodes-base.set",
        position: [650, 200],
        parameters: {
          mode: "manual",
          fields: {
            values: [{ name: "processed", stringValue: "true" }],
          },
        },
      },
      {
        name: "Rejected Path",
        type: "n8n-nodes-base.set",
        position: [650, 400],
        parameters: {
          mode: "manual",
          fields: {
            values: [{ name: "processed", stringValue: "false" }],
          },
        },
      },
    ],
    connections: {
      "Manual Trigger": {
        main: [[{ node: "Check Condition", type: "main", index: 0 }]],
      },
      "Check Condition": {
        main: [
          [{ node: "Approved Path", type: "main", index: 0 }],
          [{ node: "Rejected Path", type: "main", index: 0 }],
        ],
      },
    },
  },

  "expense-tracker-telegram-notion": {
    name: "Expense Tracker: Telegram Receipt to Notion",
    description: "Receive receipt images via Telegram, extract expense data with GPT-4o Vision, confirm with user if uncertain, and save to Notion database",
    nodes: [
      {
        name: "Telegram Trigger",
        type: "n8n-nodes-base.telegramTrigger",
        position: [0, 300],
        parameters: {
          updates: ["message"],
        },
      },
      {
        name: "Check Has Image",
        type: "n8n-nodes-base.if",
        position: [200, 300],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
            conditions: [
              {
                id: "has_photo",
                leftValue: "={{ $json.message.photo }}",
                rightValue: "",
                operator: { type: "array", operation: "notEmpty" },
              },
            ],
            combinator: "or",
          },
        },
      },
      {
        name: "Send No Image Error",
        type: "n8n-nodes-base.telegram",
        position: [400, 150],
        parameters: {
          operation: "sendMessage",
          chatId: "={{ $json.message.chat.id }}",
          text: "Please send a receipt image or screenshot. I can only process expenses from images.",
        },
      },
      {
        name: "Get File Info",
        type: "n8n-nodes-base.telegram",
        position: [400, 450],
        parameters: {
          operation: "getFile",
          fileId: "={{ $json.message.photo.slice(-1)[0].file_id }}",
        },
      },
      {
        name: "Download Image",
        type: "n8n-nodes-base.httpRequest",
        position: [600, 450],
        parameters: {
          method: "GET",
          url: "=https://api.telegram.org/file/bot{{ $credentials.telegramApi.accessToken }}/{{ $json.result.file_path }}",
          options: { response: { response: { responseFormat: "file" } } },
        },
      },
      {
        name: "Extract with GPT-4o Vision",
        type: "n8n-nodes-base.httpRequest",
        position: [800, 450],
        parameters: {
          method: "POST",
          url: "https://api.openai.com/v1/chat/completions",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "openAiApi",
          sendHeaders: true,
          headerParameters: { parameters: [{ name: "Content-Type", value: "application/json" }] },
          sendBody: true,
          specifyBody: "json",
          jsonBody: `={
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert receipt analyzer. Extract expense data from receipt images. Return ONLY valid JSON."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this receipt and extract: date, description, amount, currency, category, type, merchant, payment_method, confidence, notes. Return JSON only."
        },
        {
          "type": "image_url",
          "image_url": { "url": "data:image/jpeg;base64,{{ $binary.data.data }}" }
        }
      ]
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.1
}`,
        },
      },
      {
        name: "Create Notion Entry",
        type: "n8n-nodes-base.notion",
        position: [1600, 300],
        parameters: {
          resource: "databasePage",
          operation: "create",
          databaseId: "={{ $env.NOTION_EXPENSES_DB_ID }}",
        },
      },
    ],
    connections: {
      "Telegram Trigger": {
        main: [[{ node: "Check Has Image", type: "main", index: 0 }]],
      },
      "Check Has Image": {
        main: [
          [{ node: "Get File Info", type: "main", index: 0 }],
          [{ node: "Send No Image Error", type: "main", index: 0 }],
        ],
      },
      "Get File Info": {
        main: [[{ node: "Download Image", type: "main", index: 0 }]],
      },
      "Download Image": {
        main: [[{ node: "Extract with GPT-4o Vision", type: "main", index: 0 }]],
      },
    },
  },
};

export function getWorkflowTemplate(name: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES[name];
}

export function getAllWorkflowTemplates(): string[] {
  return Object.keys(WORKFLOW_TEMPLATES);
}
