/**
 * Swaps all 21 Google Sheets nodes for Notion database nodes.
 * Outputs: workflows/ai-support-agent-notion.json
 */
const fs = require('fs');
const path = require('path');

const wf = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'workflows', 'ai-support-agent-final.json'), 'utf8'
));

// ── Database ID placeholders ──
const DB_IDS = {
  'Knowledge Base':    'PLACEHOLDER_KB_DB_ID',
  'Agent Config':      'PLACEHOLDER_CONFIG_DB_ID',
  'Team Directory':    'PLACEHOLDER_TEAM_DB_ID',
  'Conversation Log':  'PLACEHOLDER_LOG_DB_ID',
  'Pending Approvals': 'PLACEHOLDER_PENDING_DB_ID',
};

// ── Title property per database (every Notion DB needs exactly one) ──
const TITLE_PROP = {
  'Knowledge Base':    'Question Pattern',
  'Agent Config':      'Setting',
  'Team Directory':    'Name',
  'Conversation Log':  'Customer Identifier',
  'Pending Approvals': 'ID',
};

// ── Column definitions: [name, notionType] ──
const COLUMNS = {
  'Knowledge Base': [
    ['Question Pattern', 'title'],
    ['Category', 'rich_text'],
    ['Approved Answer', 'rich_text'],
    ['Source', 'rich_text'],
    ['Times Used', 'number'],
    ['Last Used', 'rich_text'],
    ['Confidence Threshold Override', 'rich_text'],
  ],
  'Agent Config': [
    ['Setting', 'title'],
    ['Value', 'rich_text'],
  ],
  'Team Directory': [
    ['Name', 'title'],
    ['Email', 'rich_text'],
    ['Slack ID', 'rich_text'],
    ['Owns Categories', 'rich_text'],
    ['Is Default', 'rich_text'],
    ['Status', 'rich_text'],
  ],
  'Conversation Log': [
    ['Customer Identifier', 'title'],
    ['Timestamp', 'rich_text'],
    ['Source Channel', 'rich_text'],
    ['Original Message', 'rich_text'],
    ['AI Classification', 'rich_text'],
    ['Confidence Score', 'number'],
    ['Action Taken', 'rich_text'],
    ['Response Sent', 'rich_text'],
    ['Response Source', 'rich_text'],
    ['Thread ID', 'rich_text'],
    ['Resolution Status', 'rich_text'],
    ['Time to Response', 'number'],
  ],
  'Pending Approvals': [
    ['ID', 'title'],
    ['Timestamp', 'rich_text'],
    ['Customer Identifier', 'rich_text'],
    ['Original Message', 'rich_text'],
    ['AI Draft Response', 'rich_text'],
    ['Matched KB Entry', 'rich_text'],
    ['Confidence Score', 'number'],
    ['Status', 'rich_text'],
    ['Approved By', 'rich_text'],
    ['Final Response', 'rich_text'],
    ['Add to KB?', 'rich_text'],
    ['New KB Category', 'rich_text'],
  ],
};

// ── Update-specific columns (subset for update operations) ──
const UPDATE_COLUMNS = {
  'Update KB Usage Stats': [
    ['Times Used', 'number'],
    ['Last Used', 'rich_text'],
  ],
  'Update Pending Status': [
    ['ID', 'title'],
    ['Status', 'rich_text'],
    ['Approved By', 'rich_text'],
    ['Final Response', 'rich_text'],
    ['Add to KB?', 'rich_text'],
    ['New KB Category', 'rich_text'],
  ],
};

// ── Operation mapping ──
const OP_MAP = { read: 'getAll', append: 'create', update: 'update' };

// ── Helper: build propertiesUi.propertyValues array ──
function buildPropertyValues(columns) {
  return columns.map(([name, type]) => {
    const entry = { key: `${name}|${type}` };
    if (type === 'title') {
      entry.title = `={{ $json["${name}"] }}`;
    } else if (type === 'number') {
      entry.numberValue = `={{ $json["${name}"] }}`;
    } else {
      // rich_text
      entry.textContent = `={{ $json["${name}"] }}`;
    }
    return entry;
  });
}

// ── Swap nodes ──
let count = 0;
for (const node of wf.nodes) {
  if (node.type !== 'n8n-nodes-base.googleSheets') continue;

  const sheetName = node.parameters.sheetName;
  const sheetsOp = node.parameters.operation;
  const notionOp = OP_MAP[sheetsOp];
  const dbId = DB_IDS[sheetName];

  if (!dbId) {
    console.warn(`WARNING: Unknown sheet "${sheetName}" on node "${node.name}" — skipping`);
    continue;
  }

  // Swap type and version
  node.type = 'n8n-nodes-base.notion';
  node.typeVersion = 2.2;

  // Build new parameters
  if (notionOp === 'getAll') {
    node.parameters = {
      resource: 'databasePage',
      operation: 'getAll',
      databaseId: dbId,
      returnAll: true,
      simple: true,
    };
  } else if (notionOp === 'create') {
    const cols = COLUMNS[sheetName];
    node.parameters = {
      resource: 'databasePage',
      operation: 'create',
      databaseId: dbId,
      simple: true,
      propertiesUi: {
        propertyValues: buildPropertyValues(cols),
      },
    };
  } else if (notionOp === 'update') {
    const cols = UPDATE_COLUMNS[node.name] || COLUMNS[sheetName];
    node.parameters = {
      resource: 'databasePage',
      operation: 'update',
      pageId: '={{ $json.id }}',
      simple: true,
      propertiesUi: {
        propertyValues: buildPropertyValues(cols),
      },
    };
  }

  count++;
  console.log(`  ✓ ${node.name}: ${sheetsOp} → ${notionOp} (${sheetName})`);
}

// ── Validation ──
const remainingSheets = wf.nodes.filter(n => n.type === 'n8n-nodes-base.googleSheets');
const notionNodes = wf.nodes.filter(n => n.type === 'n8n-nodes-base.notion');
const missingDbId = notionNodes.filter(n => !n.parameters.databaseId && n.parameters.operation !== 'update');
const missingPageId = notionNodes.filter(n => n.parameters.operation === 'update' && !n.parameters.pageId);
const missingProps = notionNodes.filter(n =>
  (n.parameters.operation === 'create' || n.parameters.operation === 'update') &&
  (!n.parameters.propertiesUi || !n.parameters.propertiesUi.propertyValues.length)
);

console.log('\n=== Validation ===');
console.log(`Swapped: ${count} nodes`);
console.log(`Remaining Google Sheets nodes: ${remainingSheets.length}`);
console.log(`Notion nodes: ${notionNodes.length}`);
console.log(`Missing databaseId: ${missingDbId.length}`);
console.log(`Missing pageId (update): ${missingPageId.length}`);
console.log(`Missing properties (create/update): ${missingProps.length}`);
console.log(`Total nodes: ${wf.nodes.length}`);

if (remainingSheets.length > 0) {
  console.error('ERROR: Some Google Sheets nodes were not converted!');
  remainingSheets.forEach(n => console.error(`  - ${n.name} (sheet: ${n.parameters.sheetName})`));
  process.exit(1);
}

// ── Write output ──
const outPath = path.join(__dirname, '..', 'workflows', 'ai-support-agent-notion.json');
fs.writeFileSync(outPath, JSON.stringify(wf, null, 2));
console.log(`\nWritten to ${outPath}`);
