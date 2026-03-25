const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('workflows/ai-support-agent-layer2.json', 'utf8'));

// === LAYER 4: Replace escalation placeholders ===
wf.nodes = wf.nodes.filter(n => n.id !== 'placeholder-escalate' && n.id !== 'placeholder-escalate-end');

// Escalation nodes
wf.nodes.push({
  id: 'read-team-escalation',
  name: 'Read Team Directory (Escalation)',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [2400, 500],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Team Directory'
  }
});

const routeEscalationCode = [
  "const data = $('Parse Claude Response').first().json;",
  "const teamMembers = $('Read Team Directory (Escalation)').all().map(i => i.json);",
  "const classification = data.classification || 'Unknown';",
  "",
  "let owner = teamMembers.find(m => {",
  "  if (String(m.Status).toLowerCase() === 'away') return false;",
  "  const cats = (m['Owns Categories'] || '').split(',').map(c => c.trim().toLowerCase());",
  "  return cats.includes(classification.toLowerCase());",
  "});",
  "if (!owner) owner = teamMembers.find(m => String(m['Is Default']).toLowerCase() === 'yes' && String(m.Status).toLowerCase() !== 'away');",
  "if (!owner) owner = teamMembers.find(m => String(m.Status).toLowerCase() !== 'away') || teamMembers[0] || { Name: 'Support Team', 'Slack ID': '', Email: '' };",
  "",
  "const alertText = '*URGENT: Support Message Requires Immediate Attention*\\n\\n' +",
  "  '*From:* ' + data.customer_name + ' (' + data.customer_id + ')\\n' +",
  "  '*Category:* ' + data.classification + ' | *Sentiment:* ' + data.sentiment + '\\n' +",
  "  '*Intent:* ' + data.detected_intent + '\\n\\n' +",
  "  '*Full Message:*\\n> ' + data.message + '\\n\\n' +",
  "  '*AI Reasoning:* ' + data.reasoning + '\\n\\n' +",
  "  '_Routed to: ' + owner.Name + '_';",
  "",
  "return [{ json: {",
  "  owner_name: owner.Name, owner_email: owner.Email || '', owner_slack_id: owner['Slack ID'] || '',",
  "  alert_text: alertText,",
  "  customer_id: data.customer_id, customer_name: data.customer_name, source: data.source,",
  "  message: data.message, subject: data.subject, timestamp: data.timestamp,",
  "  thread_id: data.thread_id, classification: data.classification, confidence: data.confidence,",
  "  sentiment: data.sentiment, reasoning: data.reasoning",
  "} }];"
].join('\n');

wf.nodes.push({
  id: 'route-escalation',
  name: 'Route Escalation',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [2700, 500],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: routeEscalationCode }
});

wf.nodes.push({
  id: 'send-escalation-alert',
  name: 'Send Escalation Alert',
  type: 'n8n-nodes-base.slack',
  typeVersion: 2,
  position: [3000, 500],
  parameters: {
    resource: 'message', operation: 'post',
    channel: '={{ $json.owner_slack_id }}',
    text: '={{ $json.alert_text }}'
  }
});

const prepareEscalationLogCode = [
  "const data = $input.first().json;",
  "return [{ json: {",
  "  Timestamp: data.timestamp,",
  "  'Source Channel': data.source,",
  "  'Customer Identifier': data.customer_id,",
  "  'Original Message': (data.message || '').substring(0, 500),",
  "  'AI Classification': data.classification,",
  "  'Confidence Score': data.confidence,",
  "  'Action Taken': 'Escalated to ' + data.owner_name,",
  "  'Response Sent': \"I've flagged your message for our team and someone will get back to you shortly.\",",
  "  'Response Source': 'Escalation auto-ack',",
  "  'Thread ID': data.thread_id || '',",
  "  'Resolution Status': 'Escalated',",
  "  'Time to Response': Math.floor((Date.now() - new Date(data.timestamp).getTime()) / 1000)",
  "} }];"
].join('\n');

wf.nodes.push({
  id: 'prepare-escalation-log',
  name: 'Prepare Escalation Log',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [3300, 500],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: prepareEscalationLogCode }
});

wf.nodes.push({
  id: 'log-escalation',
  name: 'Log Escalation',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [3600, 500],
  parameters: {
    resource: 'sheet', operation: 'append',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Conversation Log',
    columns: { mappingMode: 'autoMapInputData', value: {} }
  }
});

// === LAYER 3: Learning Loop ===
wf.nodes.push({
  id: 'check-add-to-kb',
  name: 'Check Add to KB',
  type: 'n8n-nodes-base.if',
  typeVersion: 2,
  position: [4200, 700],
  parameters: {
    conditions: {
      options: { caseSensitive: false },
      combinator: 'and',
      conditions: [{
        leftValue: '={{ $json._add_to_kb }}',
        rightValue: 'Yes',
        operator: { type: 'string', operation: 'equals' }
      }]
    }
  }
});

const createKbCode = [
  "const data = $input.first().json;",
  "return [{ json: {",
  "  Category: data._new_kb_category || data['AI Classification'] || 'General',",
  "  'Question Pattern': (data._original_message || data['Original Message'] || '').substring(0, 300),",
  "  'Approved Answer': data._final_response || data['Final Response'] || data['Response Sent'] || '',",
  "  Source: 'Learned from ' + (data._approver || 'human') + ' on ' + new Date().toISOString().split('T')[0],",
  "  'Times Used': 0,",
  "  'Last Used': '',",
  "  'Confidence Threshold Override': ''",
  "} }];"
].join('\n');

wf.nodes.push({
  id: 'create-kb-entry',
  name: 'Create KB Entry',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [4500, 600],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: createKbCode }
});

wf.nodes.push({
  id: 'write-new-kb-entry',
  name: 'Write New KB Entry',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [4800, 600],
  parameters: {
    resource: 'sheet', operation: 'append',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Knowledge Base',
    columns: { mappingMode: 'autoMapInputData', value: {} }
  }
});

// === LAYER 4: Thread History ===
wf.nodes.push({
  id: 'read-thread-history',
  name: 'Read Thread History',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [1050, 300],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Conversation Log'
  }
});

// Update Format Context to include thread history
const formatCtx = wf.nodes.find(n => n.id === 'format-context');
const formatContextCode = [
  "const message = $('Normalize Message').first().json;",
  "const kbEntries = $('Read Knowledge Base').all().map(i => i.json);",
  "const configEntries = $('Read Agent Config').all().map(i => i.json);",
  "",
  "const config = {};",
  "for (const entry of configEntries) { config[entry.Setting] = entry.Value; }",
  "",
  "const kbFormatted = kbEntries.map((entry, i) => {",
  "  const id = entry.ID || (i + 1);",
  "  return `[KB #${id}] Category: ${entry.Category}\\nQuestion Patterns: ${entry['Question Pattern']}\\nApproved Answer: ${entry['Approved Answer']}\\nConfidence Override: ${entry['Confidence Threshold Override'] || 'default'}`;",
  "}).join('\\n\\n');",
  "",
  "const threshold = parseInt(config.confidence_threshold || '80');",
  "",
  "// Thread history for follow-up messages",
  "let threadContext = '';",
  "if (message.is_reply && message.thread_id) {",
  "  try {",
  "    const logEntries = $('Read Thread History').all().map(i => i.json);",
  "    const history = logEntries",
  "      .filter(e => e['Thread ID'] === message.thread_id)",
  "      .sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp))",
  "      .map(e => '[' + e.Timestamp + '] ' + (e['Action Taken'] || 'Customer') + ': ' + (e['Original Message'] || e['Response Sent'] || '').substring(0, 200))",
  "      .join('\\n');",
  "    if (history) threadContext = '\\n\\nCONVERSATION HISTORY (this is a follow-up):\\n' + history;",
  "  } catch (e) { /* no thread history */ }",
  "}",
  "",
  "const systemPrompt = `You are a customer support AI agent for ${config.business_name || '[Your Business Name]'}.`",
  "  + '\\n\\nYour task: analyze the incoming customer message and determine the best response.'",
  "  + `\\n\\nBUSINESS VOICE: ${config.business_voice || 'Professional but friendly. Use first names. Keep responses under 150 words.'}`",
  "  + `\\n\\nKNOWLEDGE BASE:\\n${kbFormatted || '(No entries yet)'}`",
  "  + `\\n\\nESCALATION KEYWORDS: ${config.escalation_keywords || 'urgent, refund, cancel, legal, lawyer, angry, furious, complaint, escalate'}`",
  "  + `\\n\\nCONFIDENCE THRESHOLD: ${threshold}`",
  "  + '\\n\\nINSTRUCTIONS:'",
  "  + '\\n1. Check for ESCALATION KEYWORDS first. If found, set action to \"escalate\".'",
  "  + '\\n2. Search the knowledge base semantically.'",
  "  + '\\n3. Rate confidence 0-100.'",
  "  + `\\n4. Determine action: confidence >= ${threshold} = \"auto_respond\", below = \"needs_approval\", keywords = \"escalate\".`",
  "  + '\\n5. Generate a natural, personalized response.'",
  "  + '\\n6. Return ONLY valid JSON:'",
  "  + '\\n{'",
  "  + '\\n  \"classification\": \"[category or Unknown]\",'",
  "  + '\\n  \"confidence\": [0-100],'",
  "  + '\\n  \"action\": \"auto_respond\" | \"needs_approval\" | \"escalate\",'",
  "  + '\\n  \"matched_kb_id\": [KB ID or null],'",
  "  + '\\n  \"response\": \"[response text]\",'",
  "  + '\\n  \"reasoning\": \"[one sentence]\",'",
  "  + '\\n  \"detected_intent\": \"[what customer wants]\",'",
  "  + '\\n  \"sentiment\": \"positive\" | \"neutral\" | \"frustrated\" | \"angry\"'",
  "  + '\\n}'",
  "  + threadContext;",
  "",
  "const userMessage = `From: ${message.customer_name} (${message.customer_id})\\nSubject: ${message.subject || '(none)'}\\nMessage: ${message.message}`;",
  "",
  "return [{ json: { systemPrompt, userMessage, confidence_threshold: threshold, config, original_message: message } }];"
].join('\n');
formatCtx.parameters.jsCode = formatContextCode;

// === Update connections ===
// Thread history: insert between Read Agent Config and Format Context
wf.connections['Read Agent Config'] = { main: [[{ node: 'Read Thread History', type: 'main', index: 0 }]] };
wf.connections['Read Thread History'] = { main: [[{ node: 'Format Context for Claude', type: 'main', index: 0 }]] };

// Escalation: replace placeholder connections
delete wf.connections['[Layer 4] Escalate'];
wf.connections['Confidence Router'].main[2] = [{ node: 'Read Team Directory (Escalation)', type: 'main', index: 0 }];
wf.connections['Read Team Directory (Escalation)'] = { main: [[{ node: 'Route Escalation', type: 'main', index: 0 }]] };
wf.connections['Route Escalation'] = { main: [[{ node: 'Send Escalation Alert', type: 'main', index: 0 }]] };
wf.connections['Send Escalation Alert'] = { main: [[{ node: 'Prepare Escalation Log', type: 'main', index: 0 }]] };
wf.connections['Prepare Escalation Log'] = { main: [[{ node: 'Log Escalation', type: 'main', index: 0 }]] };

// Learning Loop: Log Approved → Check Add to KB → (true) → Create KB Entry → Write New KB Entry
wf.connections['Log Approved Response'] = { main: [[{ node: 'Check Add to KB', type: 'main', index: 0 }]] };
wf.connections['Check Add to KB'] = { main: [
  [{ node: 'Create KB Entry', type: 'main', index: 0 }],
  []
] };
wf.connections['Create KB Entry'] = { main: [[{ node: 'Write New KB Entry', type: 'main', index: 0 }]] };

fs.writeFileSync('workflows/ai-support-agent-layer3-4.json', JSON.stringify(wf, null, 2));
console.log('Written. Nodes:', wf.nodes.length, 'Connections:', Object.keys(wf.connections).length);
