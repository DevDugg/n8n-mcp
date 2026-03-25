const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('workflows/ai-support-agent-layer5.json', 'utf8'));

// === LAYER 6a: Rate Limiter (before auto-response) ===
// Insert between Confidence Router output 0 and Format Auto-Response

wf.nodes.push({
  id: 'rate-limiter-read',
  name: 'Read Log for Rate Limit',
  type: 'n8n-nodes-base.googleSheets',
  typeVersion: 4,
  position: [2250, 0],
  parameters: {
    resource: 'sheet', operation: 'read',
    documentId: 'PLACEHOLDER_SPREADSHEET_ID', sheetName: 'Conversation Log'
  }
});

const rateLimiterCode = [
  "const logEntries = $('Read Log for Rate Limit').all().map(i => i.json);",
  "const config = $('Parse Claude Response').first().json.config || {};",
  "const maxPerHour = parseInt(config.max_auto_responses_per_hour || '50');",
  "const autoRespond = (config.auto_respond_enabled || 'TRUE').toUpperCase() === 'TRUE';",
  "",
  "// Count auto-responses in the last hour",
  "const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);",
  "const recentAutoCount = logEntries.filter(e => {",
  "  return (e['Action Taken'] || '').includes('Auto-responded') &&",
  "    new Date(e.Timestamp) > oneHourAgo;",
  "}).length;",
  "",
  "const data = $input.first().json;",
  "",
  "if (!autoRespond || recentAutoCount >= maxPerHour) {",
  "  // Redirect to approval path",
  "  return [{ json: { ...data, _rate_limited: true, _rate_reason: !autoRespond ? 'auto-respond disabled' : 'rate limit reached (' + recentAutoCount + '/' + maxPerHour + ')' } }];",
  "}",
  "",
  "return [{ json: { ...data, _rate_limited: false } }];"
].join('\n');

wf.nodes.push({
  id: 'rate-limiter',
  name: 'Rate Limiter',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [2400, 0],
  parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: rateLimiterCode }
});

wf.nodes.push({
  id: 'rate-limit-check',
  name: 'Under Rate Limit?',
  type: 'n8n-nodes-base.if',
  typeVersion: 2,
  position: [2550, 0],
  parameters: {
    conditions: {
      options: { caseSensitive: false },
      combinator: 'and',
      conditions: [{
        leftValue: '={{ $json._rate_limited }}',
        rightValue: 'false',
        operator: { type: 'string', operation: 'equals' }
      }]
    }
  }
});

// Update connections: Router output 0 → Rate Limiter chain → Format Auto-Response
// Old: Router[0] → Format Auto-Response
// New: Router[0] → Read Log for Rate Limit → Rate Limiter → Under Rate Limit? → (true) Format Auto-Response, (false) Prepare Pending Data
wf.connections['Confidence Router'].main[0] = [{ node: 'Read Log for Rate Limit', type: 'main', index: 0 }];
wf.connections['Read Log for Rate Limit'] = { main: [[{ node: 'Rate Limiter', type: 'main', index: 0 }]] };
wf.connections['Rate Limiter'] = { main: [[{ node: 'Under Rate Limit?', type: 'main', index: 0 }]] };
wf.connections['Under Rate Limit?'] = { main: [
  [{ node: 'Format Auto-Response', type: 'main', index: 0 }],   // true: proceed with auto-respond
  [{ node: 'Prepare Pending Data', type: 'main', index: 0 }]     // false: redirect to approval
] };

// === LAYER 6b: Error handling on Claude API ===
// Add continueOnFail to the Claude Classification node
const claudeNode = wf.nodes.find(n => n.id === 'claude-classify');
if (claudeNode) {
  claudeNode.onError = 'continueRegularOutput';
}

// The Parse Claude Response node already has a try/catch that handles malformed responses,
// defaulting to needs_approval. This covers both API errors and parse failures.

// Also add error handling to the digest Claude call
const digestClaudeNode = wf.nodes.find(n => n.id === 'claude-digest');
if (digestClaudeNode) {
  digestClaudeNode.onError = 'continueRegularOutput';
}

fs.writeFileSync('workflows/ai-support-agent-final.json', JSON.stringify(wf, null, 2));
console.log('Written. Nodes:', wf.nodes.length, 'Connections:', Object.keys(wf.connections).length);
