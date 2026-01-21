/**
 * Expression Reference - Help with n8n expressions
 */

export const EXPRESSION_REFERENCE = {
  basics: {
    description: "n8n uses expressions in the format {{ expression }}",
    examples: [
      { expression: "{{ $json.fieldName }}", description: "Access field from current item" },
      { expression: "{{ $json.nested.field }}", description: "Access nested field" },
      { expression: "{{ $json['field-name'] }}", description: "Access field with special characters" },
    ],
  },
  variables: {
    $json: "Current item's JSON data",
    $input: "Input data accessor ($input.all(), $input.first(), $input.item)",
    $node: "Access other nodes' data ($node['NodeName'].json)",
    $now: "Current datetime ($now.toISO(), $now.toISODate())",
    $today: "Today's date",
    $runIndex: "Current execution's run index",
    $itemIndex: "Current item's index in the array",
    $workflow: "Workflow metadata ($workflow.name, $workflow.id)",
    $execution: "Execution metadata ($execution.id, $execution.mode)",
    $env: "Environment variables ($env.MY_VAR)",
    $vars: "n8n Variables ($vars.myVariable)",
  },
  methods: {
    string: ["toLowerCase()", "toUpperCase()", "trim()", "split()", "replace()", "slice()"],
    array: ["filter()", "map()", "find()", "length", "join()", "includes()"],
    date: ["toISO()", "toISODate()", "toISOTime()", "plus({days: 1})", "minus({hours: 2})"],
    object: ["Object.keys()", "Object.values()", "JSON.stringify()", "JSON.parse()"],
  },
  examples: [
    {
      scenario: "Format date",
      expression: "{{ $now.toFormat('yyyy-MM-dd') }}",
    },
    {
      scenario: "Conditional value",
      expression: "{{ $json.status === 'active' ? 'Yes' : 'No' }}",
    },
    {
      scenario: "Array length",
      expression: "{{ $json.items.length }}",
    },
    {
      scenario: "Join array",
      expression: "{{ $json.tags.join(', ') }}",
    },
    {
      scenario: "Reference previous node",
      expression: "{{ $node['HTTP Request'].json.data }}",
    },
    {
      scenario: "Environment variable",
      expression: "{{ $env.API_KEY }}",
    },
  ],
};
