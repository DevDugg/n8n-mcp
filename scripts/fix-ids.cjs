const fs = require('fs');
const crypto = require('crypto');
const wf = JSON.parse(fs.readFileSync('workflows/ai-support-agent-final.json', 'utf8'));

// Generate UUID v4
function uuid() {
  return crypto.randomUUID();
}

// Build ID mapping: old -> new UUID
const idMap = {};
for (const node of wf.nodes) {
  const oldId = node.id;
  const newId = uuid();
  idMap[oldId] = newId;
  node.id = newId;
}

console.log('Converted', Object.keys(idMap).length, 'node IDs to UUID format');
console.log('Sample:', Object.entries(idMap).slice(0, 3).map(([k, v]) => k + ' -> ' + v).join('\n'));

fs.writeFileSync('workflows/ai-support-agent-final.json', JSON.stringify(wf, null, 2));
console.log('\nWritten. Nodes:', wf.nodes.length);
