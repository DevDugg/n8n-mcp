const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('workflows/ai-support-agent-final.json', 'utf8'));

let fixes = 0;

// Fix 1: Remove onError from top-level node properties
// n8n doesn't support onError as a top-level node key in the workflow JSON
for (const node of wf.nodes) {
  if (node.onError) {
    delete node.onError;
    fixes++;
    console.log('Removed onError from:', node.name);
  }
}

// Fix 2: Update IF nodes to typeVersion 2.2 and fix conditions format
for (const node of wf.nodes) {
  if (node.type === 'n8n-nodes-base.if') {
    // Update version
    node.typeVersion = 2.2;

    // Remove the options wrapper that isn't in the schema examples
    if (node.parameters.conditions && node.parameters.conditions.options) {
      delete node.parameters.conditions.options;
    }

    fixes++;
    console.log('Fixed IF node:', node.name);
  }
}

// Fix 3: Remove empty connection arrays for IF/Switch false outputs
// Replace [] with undefined by removing them
for (const [src, conn] of Object.entries(wf.connections)) {
  if (conn.main) {
    conn.main = conn.main.filter((outputs, i) => {
      if (outputs.length === 0) {
        // Keep the array but don't filter — n8n needs positional arrays
        // Actually we need to keep them for position indexing but they should be fine as []
        return true;
      }
      return true;
    });
  }
}

// Fix 4: Update Schedule Trigger typeVersion to match catalog
for (const node of wf.nodes) {
  if (node.type === 'n8n-nodes-base.scheduleTrigger') {
    // Ensure proper format
    if (node.typeVersion < 1.2) {
      node.typeVersion = 1.2;
      fixes++;
      console.log('Updated schedule version:', node.name);
    }
  }
}

// Fix 5: Ensure Switch nodes use correct typeVersion
for (const node of wf.nodes) {
  if (node.type === 'n8n-nodes-base.switch') {
    if (!node.typeVersion || node.typeVersion < 3.2) {
      node.typeVersion = 3.2;
      fixes++;
      console.log('Updated switch version:', node.name);
    }
  }
}

// Fix 6: Verify all Google Sheets nodes have proper structure
for (const node of wf.nodes) {
  if (node.type === 'n8n-nodes-base.googleSheets') {
    if (!node.typeVersion) {
      node.typeVersion = 4;
      fixes++;
      console.log('Set sheets version:', node.name);
    }
  }
}

console.log('\nTotal fixes applied:', fixes);
console.log('Nodes:', wf.nodes.length);

fs.writeFileSync('workflows/ai-support-agent-final.json', JSON.stringify(wf, null, 2));
console.log('Written to ai-support-agent-final.json');

// Final validation: check all Code nodes parse
const codeNodes = wf.nodes.filter(n => n.type === 'n8n-nodes-base.code');
let codeErrors = 0;
for (const n of codeNodes) {
  try { new Function(n.parameters.jsCode); }
  catch (e) { codeErrors++; console.log('JS ERROR:', n.name, '-', e.message); }
}
console.log('Code nodes:', codeNodes.length, '| Errors:', codeErrors);
