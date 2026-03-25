const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('workflows/ai-support-agent-layer3-4.json', 'utf8'));

// === LAYER 5a: Follow-Up Checker (scheduled) ===

wf.nodes.push({
  id: 'followup-schedule',
  name: 'Follow-Up Schedule',
  type: 'n8n-nodes-base.scheduleTrigger',
  typeVersion: 1.2,
  position: [0, 1200],
  parameters: {
    rule: {
      interval: [{
        field: 'hours',
        hoursInterval: 4
      }]
    }
  }
});

wf.nodes.push({
  id: 'read-config-followup',
  name: 'Read Config (Follow-Up)',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [300, 1200],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Agent Config'
  }
});

wf.nodes.push({
  id: 'read-log-followup',
  name: 'Read Conversation Log (Follow-Up)',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [600, 1200],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Conversation Log'
  }
});

const findStaleCode = [
  "const configEntries = $('Read Config (Follow-Up)').all().map(i => i.json);",
  "const logEntries = $('Read Conversation Log (Follow-Up)').all().map(i => i.json);",
  "",
  "const config = {};",
  "for (const entry of configEntries) { config[entry.Setting] = entry.Value; }",
  "const followUpHours = parseInt(config.follow_up_check_hours || '4');",
  "const cutoff = new Date(Date.now() - followUpHours * 60 * 60 * 1000);",
  "const criticalCutoff = new Date(Date.now() - followUpHours * 2 * 60 * 60 * 1000);",
  "",
  "const staleItems = logEntries.filter(entry => {",
  "  const status = (entry['Resolution Status'] || '').toLowerCase();",
  "  if (status !== 'open' && status !== 'escalated') return false;",
  "  const ts = new Date(entry.Timestamp);",
  "  return ts < cutoff;",
  "}).map(entry => {",
  "  const ts = new Date(entry.Timestamp);",
  "  const hoursWaiting = Math.round((Date.now() - ts.getTime()) / (60 * 60 * 1000));",
  "  const isCritical = ts < criticalCutoff;",
  "  return {",
  "    ...entry,",
  "    _hours_waiting: hoursWaiting,",
  "    _is_critical: isCritical",
  "  };",
  "});",
  "",
  "if (staleItems.length === 0) {",
  "  return [{ json: { _no_stale: true, message: 'No stale conversations found' } }];",
  "}",
  "",
  "// Build summary alert",
  "let alertText = '*Stale Conversation Alert*\\n\\n';",
  "alertText += `Found ${staleItems.length} unresolved conversation(s):\\n\\n`;",
  "for (const item of staleItems) {",
  "  const prefix = item._is_critical ? '🔴 CRITICAL' : '🟡 Reminder';",
  "  alertText += `${prefix} | ${item['Customer Identifier']} | ${item._hours_waiting}h waiting | ${item['AI Classification'] || 'Unclassified'} | Status: ${item['Resolution Status']}\\n`;",
  "}",
  "",
  "return [{ json: {",
  "  _no_stale: false,",
  "  alert_text: alertText,",
  "  stale_count: staleItems.length,",
  "  digest_channel: config.digest_slack_channel || '',",
  "  digest_email: config.digest_email || ''",
  "} }];"
].join('\n');

wf.nodes.push({
  id: 'find-stale',
  name: 'Find Stale Conversations',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [900, 1200],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: findStaleCode }
});

wf.nodes.push({
  id: 'check-stale-exists',
  name: 'Has Stale Items?',
  type: 'n8n-nodes-base.if',
  typeVersion: 2,
  position: [1200, 1200],
  parameters: {
    conditions: {
      options: { caseSensitive: false },
      combinator: 'and',
      conditions: [{
        leftValue: '={{ $json._no_stale }}',
        rightValue: 'false',
        operator: { type: 'string', operation: 'equals' }
      }]
    }
  }
});

wf.nodes.push({
  id: 'send-stale-alert',
  name: 'Send Stale Alert',
  type: 'n8n-nodes-base.slack',
  typeVersion: 2,
  position: [1500, 1100],
  parameters: {
    resource: 'message', operation: 'post',
    channel: '={{ $json.digest_channel }}',
    text: '={{ $json.alert_text }}'
  }
});

// === LAYER 5b: Daily Digest (scheduled) ===

wf.nodes.push({
  id: 'digest-schedule',
  name: 'Daily Digest Schedule',
  type: 'n8n-nodes-base.scheduleTrigger',
  typeVersion: 1.2,
  position: [0, 1600],
  parameters: {
    rule: {
      interval: [{
        field: 'cronExpression',
        expression: '0 8 * * *'
      }]
    }
  }
});

wf.nodes.push({
  id: 'read-config-digest',
  name: 'Read Config (Digest)',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [300, 1600],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Agent Config'
  }
});

wf.nodes.push({
  id: 'read-log-digest',
  name: 'Read Conversation Log (Digest)',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [600, 1600],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Conversation Log'
  }
});

const prepareDigestCode = [
  "const configEntries = $('Read Config (Digest)').all().map(i => i.json);",
  "const logEntries = $('Read Conversation Log (Digest)').all().map(i => i.json);",
  "",
  "const config = {};",
  "for (const entry of configEntries) { config[entry.Setting] = entry.Value; }",
  "",
  "// Filter to last 24 hours",
  "const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);",
  "const recent = logEntries.filter(e => new Date(e.Timestamp) > cutoff);",
  "",
  "// Build summary data for Claude",
  "const summary = recent.map(e => {",
  "  return `[${e.Timestamp}] ${e['Source Channel']} | ${e['Customer Identifier']} | ${e['AI Classification']} | Confidence: ${e['Confidence Score']} | Action: ${e['Action Taken']} | Status: ${e['Resolution Status']} | Response Time: ${e['Time to Response']}s`;",
  "}).join('\\n');",
  "",
  "const digestPrompt = `Analyze the following 24 hours of support activity and generate a concise operations digest.",
  "",
  "DATA:",
  "${summary || '(No activity in the last 24 hours)'}",
  "",
  "Generate a digest with these sections:",
  "1. SUMMARY: Total messages, auto-resolved count, human-handled count, escalated count, average response time",
  "2. TOP TOPICS: The 5 most frequent question categories today",
  "3. KNOWLEDGE GAPS: Questions the agent could not answer confidently. These are candidates for new KB entries.",
  "4. SENTIMENT OVERVIEW: Breakdown of customer sentiment",
  "5. STALE ITEMS: Any unresolved conversations older than 24 hours",
  "6. RECOMMENDATION: One specific suggestion for improving the system",
  "",
  "Keep it under 500 words. Use bullet points. Be specific with numbers.`;",
  "",
  "return [{ json: {",
  "  digestPrompt,",
  "  total_messages: recent.length,",
  "  digest_channel: config.digest_slack_channel || '',",
  "  digest_email: config.digest_email || '',",
  "  business_name: config.business_name || 'Support'",
  "} }];"
].join('\n');

wf.nodes.push({
  id: 'prepare-digest',
  name: 'Prepare Digest Data',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [900, 1600],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: prepareDigestCode }
});

wf.nodes.push({
  id: 'claude-digest',
  name: 'Claude Generate Digest',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [1200, 1600],
  parameters: {
    method: 'POST',
    url: 'https://api.anthropic.com/v1/messages',
    sendHeaders: true,
    headerParameters: {
      parameters: [
        { name: 'x-api-key', value: 'PLACEHOLDER_ANTHROPIC_API_KEY' },
        { name: 'anthropic-version', value: '2023-06-01' },
        { name: 'content-type', value: 'application/json' }
      ]
    },
    sendBody: true,
    specifyBody: 'json',
    jsonBody: "={{ JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: $json.digestPrompt }] }) }}"
  }
});

const formatDigestCode = [
  "const response = $input.first().json;",
  "const context = $('Prepare Digest Data').first().json;",
  "",
  "let digestText = '';",
  "try {",
  "  digestText = response.content[0].text;",
  "} catch (e) {",
  "  digestText = 'Failed to generate digest: ' + e.message;",
  "}",
  "",
  "const header = `*Daily Support Digest — ${context.business_name}*\\n` +",
  "  `_${new Date().toISOString().split('T')[0]} | ${context.total_messages} messages in last 24h_\\n\\n`;",
  "",
  "return [{ json: {",
  "  digest_text: header + digestText,",
  "  digest_channel: context.digest_channel,",
  "  digest_email: context.digest_email",
  "} }];"
].join('\n');

wf.nodes.push({
  id: 'format-digest',
  name: 'Format Digest',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1500, 1600],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: formatDigestCode }
});

wf.nodes.push({
  id: 'send-digest',
  name: 'Send Daily Digest',
  type: 'n8n-nodes-base.slack',
  typeVersion: 2,
  position: [1800, 1600],
  parameters: {
    resource: 'message', operation: 'post',
    channel: '={{ $json.digest_channel }}',
    text: '={{ $json.digest_text }}'
  }
});

// === Connections for Layer 5 ===

// Follow-up checker chain
wf.connections['Follow-Up Schedule'] = { main: [[{ node: 'Read Config (Follow-Up)', type: 'main', index: 0 }]] };
wf.connections['Read Config (Follow-Up)'] = { main: [[{ node: 'Read Conversation Log (Follow-Up)', type: 'main', index: 0 }]] };
wf.connections['Read Conversation Log (Follow-Up)'] = { main: [[{ node: 'Find Stale Conversations', type: 'main', index: 0 }]] };
wf.connections['Find Stale Conversations'] = { main: [[{ node: 'Has Stale Items?', type: 'main', index: 0 }]] };
wf.connections['Has Stale Items?'] = { main: [
  [{ node: 'Send Stale Alert', type: 'main', index: 0 }],
  []  // false path: do nothing
] };

// Daily digest chain
wf.connections['Daily Digest Schedule'] = { main: [[{ node: 'Read Config (Digest)', type: 'main', index: 0 }]] };
wf.connections['Read Config (Digest)'] = { main: [[{ node: 'Read Conversation Log (Digest)', type: 'main', index: 0 }]] };
wf.connections['Read Conversation Log (Digest)'] = { main: [[{ node: 'Prepare Digest Data', type: 'main', index: 0 }]] };
wf.connections['Prepare Digest Data'] = { main: [[{ node: 'Claude Generate Digest', type: 'main', index: 0 }]] };
wf.connections['Claude Generate Digest'] = { main: [[{ node: 'Format Digest', type: 'main', index: 0 }]] };
wf.connections['Format Digest'] = { main: [[{ node: 'Send Daily Digest', type: 'main', index: 0 }]] };

fs.writeFileSync('workflows/ai-support-agent-layer5.json', JSON.stringify(wf, null, 2));
console.log('Written. Nodes:', wf.nodes.length, 'Connections:', Object.keys(wf.connections).length);
