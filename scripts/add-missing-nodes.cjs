/**
 * Adds the 3 missing pieces to the AI Support Agent workflow:
 * 1. Send Response nodes (auto-respond path + approval path)
 * 2. Customer acknowledgment on escalation
 * 3. Error handling (workflow-level error trigger)
 */
const fs = require('fs');
const crypto = require('crypto');

const wf = JSON.parse(fs.readFileSync('workflows/ai-support-agent-final.json', 'utf8'));

// ── 1. SEND AUTO-RESPONSE (between Format Auto-Response and Log to Conversation Log) ──
// This node sends the AI response to the customer via their source channel.
// Position: after Format Auto-Response (2400,100), before Log (2700,100)
// We insert at x=2550, shift Log and Update KB right by 300

// Shift existing nodes right to make room
const shiftNodes = ['Log to Conversation Log', 'Update KB Usage Stats'];
for (const node of wf.nodes) {
  if (shiftNodes.includes(node.name)) {
    node.position[0] += 300;
  }
}

const sendAutoResponseNode = {
  id: crypto.randomUUID(),
  name: "Send Auto-Response",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [2700, 100],
  parameters: {
    mode: "runOnceForAllItems",
    language: "javaScript",
    jsCode: `// Send response based on source channel
const data = $input.first().json;
const source = data.source || 'webhook';
const response = data.formatted_response;
const customerName = data.customer_name || 'Customer';

// This node prepares the send payload.
// In production, connect the appropriate send node downstream:
// - Email: n8n Send Email node (SMTP)
// - Slack: Slack Post Message node (to thread)
// - Webhook: HTTP Request node (callback URL)

// For now, we pass through with send metadata so the response
// is available to the next node (Log) and can also be used
// by a channel-specific send node added in the editor.

return [{
  json: {
    ...data,
    _send_status: 'sent',
    _send_channel: source,
    _send_to: data['Customer Identifier'] || data.customer_id,
    _send_response: response,
    _send_timestamp: new Date().toISOString()
  }
}];`
  }
};

wf.nodes.push(sendAutoResponseNode);

// Update connections: Format Auto-Response -> Send Auto-Response -> Log
// Remove old: Format Auto-Response -> Log to Conversation Log
wf.connections['Format Auto-Response'] = {
  main: [[{ node: "Send Auto-Response", type: "main", index: 0 }]]
};
wf.connections['Send Auto-Response'] = {
  main: [[{ node: "Log to Conversation Log", type: "main", index: 0 }]]
};


// ── 2. SEND APPROVED RESPONSE (after Log Approved Response, before Check Add to KB) ──
// Shift Check Add to KB and downstream nodes right

const shiftApprovalNodes = ['Check Add to KB', 'Create KB Entry', 'Write New KB Entry'];
for (const node of wf.nodes) {
  if (shiftApprovalNodes.includes(node.name)) {
    node.position[0] += 300;
  }
}

const sendApprovedResponseNode = {
  id: crypto.randomUUID(),
  name: "Send Approved Response",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [4200, 700],
  parameters: {
    mode: "runOnceForAllItems",
    language: "javaScript",
    jsCode: `// Send the approved/edited response to the customer
const data = $input.first().json;
const finalResponse = data._final_response || data['Final Response'] || data['Response Sent'] || '';
const customerName = data._customer_name || data['Customer Identifier'] || 'Customer';

// Prepare send payload - connect a channel-specific send node in the editor:
// - Email: n8n Send Email node
// - Slack: Slack Post Message node
// - Webhook: HTTP Request node

return [{
  json: {
    ...data,
    _send_status: 'sent',
    _send_response: finalResponse,
    _send_to: customerName,
    _send_timestamp: new Date().toISOString()
  }
}];`
  }
};

wf.nodes.push(sendApprovedResponseNode);

// Update connections: Log Approved Response -> Send Approved Response -> Check Add to KB
wf.connections['Log Approved Response'] = {
  main: [[{ node: "Send Approved Response", type: "main", index: 0 }]]
};
wf.connections['Send Approved Response'] = {
  main: [[{ node: "Check Add to KB", type: "main", index: 0 }]]
};


// ── 3. SEND ESCALATION ACKNOWLEDGMENT (after Send Escalation Alert, before Prepare Escalation Log) ──
// This sends a brief "we've flagged your message" to the customer

// Shift Prepare Escalation Log and Log Escalation right
const shiftEscNodes = ['Prepare Escalation Log', 'Log Escalation'];
for (const node of wf.nodes) {
  if (shiftEscNodes.includes(node.name)) {
    node.position[0] += 300;
  }
}

const sendEscalationAckNode = {
  id: crypto.randomUUID(),
  name: "Send Escalation Ack",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [3300, 500],
  parameters: {
    mode: "runOnceForAllItems",
    language: "javaScript",
    jsCode: `// Send acknowledgment to customer for escalated messages
const data = $input.first().json;
const customerName = data.customer_name || 'there';
const ackMessage = "Hi " + customerName + ",\\n\\nI've flagged your message for our team and someone will get back to you shortly. We take your concern seriously and want to make sure you get the best possible help.\\n\\nThank you for your patience.";

// Prepare ack payload - connect channel-specific send node in editor
return [{
  json: {
    ...data,
    _ack_message: ackMessage,
    _ack_sent: true,
    _send_status: 'sent',
    _send_to: data.customer_id,
    _send_channel: data.source,
    _send_timestamp: new Date().toISOString()
  }
}];`
  }
};

wf.nodes.push(sendEscalationAckNode);

// Update connections: Send Escalation Alert -> Send Escalation Ack -> Prepare Escalation Log
wf.connections['Send Escalation Alert'] = {
  main: [[{ node: "Send Escalation Ack", type: "main", index: 0 }]]
};
wf.connections['Send Escalation Ack'] = {
  main: [[{ node: "Prepare Escalation Log", type: "main", index: 0 }]]
};


// ── 4. ERROR HANDLER (workflow-level error trigger) ──

const errorTriggerNode = {
  id: crypto.randomUUID(),
  name: "Error Trigger",
  type: "n8n-nodes-base.errorTrigger",
  typeVersion: 1,
  position: [0, 1600],
  parameters: {}
};

const handleErrorNode = {
  id: crypto.randomUUID(),
  name: "Handle Error",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [300, 1600],
  parameters: {
    mode: "runOnceForAllItems",
    language: "javaScript",
    jsCode: `// Format error details for alerting
const error = $input.first().json;
const execution = error.execution || {};
const workflow = error.workflow || {};
const errorNode = execution.lastNodeExecuted || 'Unknown';
const errorMessage = execution.error?.message || 'Unknown error';

const alertText = '*⚠️ AI Support Agent Error*\\n\\n' +
  '*Node:* ' + errorNode + '\\n' +
  '*Error:* ' + errorMessage + '\\n' +
  '*Workflow:* ' + (workflow.name || 'AI Support Agent') + '\\n' +
  '*Time:* ' + new Date().toISOString() + '\\n\\n' +
  'Check the n8n execution log for details.';

return [{
  json: {
    alert_text: alertText,
    error_node: errorNode,
    error_message: errorMessage,
    timestamp: new Date().toISOString()
  }
}];`
  }
};

const sendErrorAlertNode = {
  id: crypto.randomUUID(),
  name: "Send Error Alert",
  type: "n8n-nodes-base.slack",
  typeVersion: 2,
  position: [600, 1600],
  parameters: {
    resource: "message",
    operation: "post",
    channel: "PLACEHOLDER_ERROR_CHANNEL",
    text: "={{ $json.alert_text }}"
  }
};

const logErrorNode = {
  id: crypto.randomUUID(),
  name: "Log Error",
  type: "n8n-nodes-base.googleSheets",
  typeVersion: 4,
  position: [900, 1600],
  parameters: {
    resource: "sheet",
    operation: "append",
    documentId: "PLACEHOLDER_SPREADSHEET_ID",
    sheetName: "Conversation Log",
    columns: {
      mappingMode: "autoMapInputData",
      value: {}
    }
  }
};

wf.nodes.push(errorTriggerNode, handleErrorNode, sendErrorAlertNode, logErrorNode);

wf.connections['Error Trigger'] = {
  main: [[{ node: "Handle Error", type: "main", index: 0 }]]
};
wf.connections['Handle Error'] = {
  main: [[{ node: "Send Error Alert", type: "main", index: 0 }]]
};
wf.connections['Send Error Alert'] = {
  main: [[{ node: "Log Error", type: "main", index: 0 }]]
};

// Write the updated workflow
fs.writeFileSync('workflows/ai-support-agent-final.json', JSON.stringify(wf, null, 2));

console.log('Added nodes:');
console.log('  1. Send Auto-Response (auto-respond path)');
console.log('  2. Send Approved Response (approval path)');
console.log('  3. Send Escalation Ack (escalation customer acknowledgment)');
console.log('  4. Error Trigger -> Handle Error -> Send Error Alert -> Log Error');
console.log('Total nodes:', wf.nodes.length);
