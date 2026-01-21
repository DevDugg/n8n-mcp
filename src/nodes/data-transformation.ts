/**
 * Data Transformation Nodes - Manipulate and transform data
 */

import type { NodeSchema } from "./types.js";

export const DATA_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.set": {
    type: "n8n-nodes-base.set",
    displayName: "Edit Fields",
    description: "Set, rename, or remove fields on items. Formerly called 'Set' node.",
    category: "data",
    typeVersion: 3.4,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "manual",
        description: "How to set the fields",
        options: [
          { name: "Manual Mapping", value: "manual", description: "Manually define field values" },
          { name: "JSON", value: "raw", description: "Set using JSON" },
        ],
      },
      {
        name: "fields",
        type: "fixedCollection",
        required: false,
        description: "Fields to set/modify",
      },
      {
        name: "include",
        type: "options",
        required: false,
        default: "all",
        description: "Which fields to include in output",
        options: [
          { name: "All", value: "all", description: "Keep all existing fields" },
          { name: "None", value: "none", description: "Only output new fields" },
          { name: "Selected", value: "selected", description: "Keep only selected fields" },
        ],
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: dotNotation, ignoreConversionErrors",
      },
    ],
    examples: [
      {
        name: "Add Fields",
        description: "Add new fields to items",
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "processed", stringValue: "true" },
              { name: "timestamp", stringValue: "={{ $now.toISO() }}" },
            ],
          },
          include: "all",
        },
      },
      {
        name: "Rename Field",
        description: "Rename a field",
        parameters: {
          mode: "manual",
          fields: {
            values: [
              { name: "fullName", stringValue: "={{ $json.name }}" },
            ],
          },
          include: "none",
        },
      },
      {
        name: "Transform Structure",
        description: "Restructure data using JSON",
        parameters: {
          mode: "raw",
          jsonOutput: `={
  "user": {
    "id": {{ $json.id }},
    "name": "{{ $json.firstName }} {{ $json.lastName }}",
    "email": "{{ $json.email }}"
  },
  "metadata": {
    "processedAt": "{{ $now.toISO() }}"
  }
}`,
          include: "none",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/",
  },

  "n8n-nodes-base.filter": {
    type: "n8n-nodes-base.filter",
    displayName: "Filter",
    description: "Filter items based on conditions",
    category: "data",
    typeVersion: 2.2,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "conditions",
        type: "fixedCollection",
        required: true,
        description: "Filter conditions",
      },
      {
        name: "combineOperation",
        type: "options",
        required: false,
        default: "all",
        description: "How to combine conditions",
        options: [
          { name: "All", value: "all", description: "All conditions must match" },
          { name: "Any", value: "any", description: "Any condition must match" },
        ],
      },
    ],
    examples: [
      {
        name: "Filter by Status",
        description: "Keep only active items",
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.status }}",
                rightValue: "active",
                operator: { type: "string", operation: "equals" },
              },
            ],
          },
        },
      },
      {
        name: "Filter by Value",
        description: "Keep items with amount > 100",
        parameters: {
          conditions: {
            conditions: [
              {
                leftValue: "={{ $json.amount }}",
                rightValue: 100,
                operator: { type: "number", operation: "gt" },
              },
            ],
          },
        },
      },
      {
        name: "Multiple Conditions",
        description: "Filter with multiple criteria",
        parameters: {
          conditions: {
            conditions: [
              { leftValue: "={{ $json.status }}", rightValue: "active", operator: { type: "string", operation: "equals" } },
              { leftValue: "={{ $json.amount }}", rightValue: 0, operator: { type: "number", operation: "gt" } },
            ],
            combinator: "and",
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.filter/",
  },

  "n8n-nodes-base.sort": {
    type: "n8n-nodes-base.sort",
    displayName: "Sort",
    description: "Sort items by field values",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "sortFieldsUi",
        type: "fixedCollection",
        required: true,
        description: "Fields to sort by",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: disableDotNotation",
      },
    ],
    examples: [
      {
        name: "Sort by Date",
        description: "Sort by date descending",
        parameters: {
          sortFieldsUi: {
            sortField: [
              { fieldName: "createdAt", order: "descending" },
            ],
          },
        },
      },
      {
        name: "Multi-field Sort",
        description: "Sort by multiple fields",
        parameters: {
          sortFieldsUi: {
            sortField: [
              { fieldName: "category", order: "ascending" },
              { fieldName: "priority", order: "descending" },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sort/",
  },

  "n8n-nodes-base.limit": {
    type: "n8n-nodes-base.limit",
    displayName: "Limit",
    description: "Limit the number of items",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "maxItems",
        type: "number",
        required: true,
        default: 10,
        description: "Maximum number of items to output",
      },
      {
        name: "keep",
        type: "options",
        required: false,
        default: "firstItems",
        description: "Which items to keep",
        options: [
          { name: "First Items", value: "firstItems" },
          { name: "Last Items", value: "lastItems" },
        ],
      },
    ],
    examples: [
      {
        name: "First 10 Items",
        description: "Keep only first 10 items",
        parameters: {
          maxItems: 10,
          keep: "firstItems",
        },
      },
      {
        name: "Last 5 Items",
        description: "Keep only last 5 items",
        parameters: {
          maxItems: 5,
          keep: "lastItems",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.limit/",
  },

  "n8n-nodes-base.removeDuplicates": {
    type: "n8n-nodes-base.removeDuplicates",
    displayName: "Remove Duplicates",
    description: "Remove duplicate items based on field values",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "compare",
        type: "options",
        required: true,
        default: "allFields",
        description: "How to compare items",
        options: [
          { name: "All Fields", value: "allFields", description: "Compare all fields" },
          { name: "All Fields Except", value: "allFieldsExcept", description: "Compare all except specified" },
          { name: "Selected Fields", value: "selectedFields", description: "Compare only specified fields" },
        ],
      },
      {
        name: "fieldsToCompare",
        type: "fixedCollection",
        required: false,
        description: "Fields to use for comparison",
      },
    ],
    examples: [
      {
        name: "Unique by All",
        description: "Remove items with all fields matching",
        parameters: {
          compare: "allFields",
        },
      },
      {
        name: "Unique by ID",
        description: "Remove duplicates by ID field",
        parameters: {
          compare: "selectedFields",
          fieldsToCompare: {
            fields: [{ fieldName: "id" }],
          },
        },
      },
      {
        name: "Unique by Email",
        description: "Remove duplicates by email",
        parameters: {
          compare: "selectedFields",
          fieldsToCompare: {
            fields: [{ fieldName: "email" }],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/",
  },

  "n8n-nodes-base.splitOut": {
    type: "n8n-nodes-base.splitOut",
    displayName: "Split Out",
    description: "Split array field into separate items",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "fieldToSplitOut",
        type: "string",
        required: true,
        description: "Name of the array field to split",
      },
      {
        name: "include",
        type: "options",
        required: false,
        default: "noOtherFields",
        description: "Which other fields to include",
        options: [
          { name: "No Other Fields", value: "noOtherFields" },
          { name: "All Other Fields", value: "allOtherFields" },
          { name: "Selected Other Fields", value: "selectedOtherFields" },
        ],
      },
    ],
    examples: [
      {
        name: "Split Items Array",
        description: "Split items array into individual items",
        parameters: {
          fieldToSplitOut: "items",
          include: "allOtherFields",
        },
      },
      {
        name: "Split Tags",
        description: "Split tags array, keep parent fields",
        parameters: {
          fieldToSplitOut: "tags",
          include: "allOtherFields",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitout/",
  },

  "n8n-nodes-base.aggregate": {
    type: "n8n-nodes-base.aggregate",
    displayName: "Aggregate",
    description: "Aggregate items into a single item with array fields or perform calculations",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "aggregate",
        type: "options",
        required: true,
        default: "aggregateIndividualFields",
        description: "How to aggregate",
        options: [
          { name: "Individual Fields", value: "aggregateIndividualFields", description: "Aggregate specific fields" },
          { name: "All Item Data", value: "aggregateAllItemData", description: "Combine all items into array" },
        ],
      },
      {
        name: "fieldsToAggregate",
        type: "fixedCollection",
        required: false,
        description: "Fields to aggregate",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: keepMissing, disableDotNotation",
      },
    ],
    examples: [
      {
        name: "Collect IDs",
        description: "Aggregate all IDs into array",
        parameters: {
          aggregate: "aggregateIndividualFields",
          fieldsToAggregate: {
            fieldToAggregate: [
              { fieldToAggregate: "id", renameField: true, outputFieldName: "ids" },
            ],
          },
        },
      },
      {
        name: "Sum Amounts",
        description: "Calculate sum of amounts",
        parameters: {
          aggregate: "aggregateIndividualFields",
          fieldsToAggregate: {
            fieldToAggregate: [
              { fieldToAggregate: "amount", aggregation: "sum", renameField: true, outputFieldName: "totalAmount" },
            ],
          },
        },
      },
      {
        name: "Combine All",
        description: "Combine all items into single array",
        parameters: {
          aggregate: "aggregateAllItemData",
          destinationFieldName: "allItems",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.aggregate/",
  },

  "n8n-nodes-base.summarize": {
    type: "n8n-nodes-base.summarize",
    displayName: "Summarize",
    description: "Summarize data with aggregations (sum, count, average, etc.)",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "fieldsToSummarize",
        type: "fixedCollection",
        required: true,
        description: "Fields to summarize and aggregation type",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Options: groupBy fields",
      },
    ],
    examples: [
      {
        name: "Count Items",
        description: "Count total items",
        parameters: {
          fieldsToSummarize: {
            values: [
              { field: "id", aggregation: "count" },
            ],
          },
        },
      },
      {
        name: "Sum by Category",
        description: "Sum amounts grouped by category",
        parameters: {
          fieldsToSummarize: {
            values: [
              { field: "amount", aggregation: "sum" },
            ],
          },
          options: {
            outputFormat: "separateItems",
            groupBy: ["category"],
          },
        },
      },
      {
        name: "Multiple Aggregations",
        description: "Multiple statistics",
        parameters: {
          fieldsToSummarize: {
            values: [
              { field: "amount", aggregation: "sum" },
              { field: "amount", aggregation: "average" },
              { field: "id", aggregation: "count" },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.summarize/",
  },

  "n8n-nodes-base.itemLists": {
    type: "n8n-nodes-base.itemLists",
    displayName: "Item Lists",
    description: "Manipulate items in a list (concatenate, split, sort, limit)",
    category: "data",
    typeVersion: 3.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "splitOutItems",
        description: "Operation to perform",
        options: [
          { name: "Concatenate Items", value: "concatenateItems" },
          { name: "Limit", value: "limit" },
          { name: "Remove Duplicates", value: "removeDuplicates" },
          { name: "Sort", value: "sort" },
          { name: "Split Out Items", value: "splitOutItems" },
          { name: "Summarize", value: "summarize" },
        ],
      },
    ],
    examples: [
      {
        name: "Split Array",
        description: "Split array field into items",
        parameters: {
          operation: "splitOutItems",
          fieldToSplitOut: "items",
          include: "allOtherFields",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.itemlists/",
  },

  "n8n-nodes-base.renameKeys": {
    type: "n8n-nodes-base.renameKeys",
    displayName: "Rename Keys",
    description: "Rename field names in items",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "keys",
        type: "fixedCollection",
        required: true,
        description: "Keys to rename",
      },
    ],
    examples: [
      {
        name: "Rename Fields",
        description: "Rename multiple fields",
        parameters: {
          keys: {
            key: [
              { currentKey: "first_name", newKey: "firstName" },
              { currentKey: "last_name", newKey: "lastName" },
            ],
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.renamekeys/",
  },

  "n8n-nodes-base.convertToFile": {
    type: "n8n-nodes-base.convertToFile",
    displayName: "Convert to File",
    description: "Convert JSON data to file format (CSV, JSON, spreadsheet)",
    category: "data",
    typeVersion: 1.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "csv",
        description: "Output file format",
        options: [
          { name: "Convert to CSV", value: "csv" },
          { name: "Convert to HTML", value: "html" },
          { name: "Convert to iCal", value: "iCal" },
          { name: "Convert to JSON", value: "json" },
          { name: "Convert to ODS", value: "ods" },
          { name: "Convert to RTF", value: "rtf" },
          { name: "Convert to Text File", value: "text" },
          { name: "Convert to XLS", value: "xls" },
          { name: "Convert to XLSX", value: "xlsx" },
          { name: "Move Base64 to File", value: "binaryToBinary" },
        ],
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: fileName, encoding, headers",
      },
    ],
    examples: [
      {
        name: "Export to CSV",
        description: "Convert items to CSV file",
        parameters: {
          operation: "csv",
          options: {
            fileName: "export.csv",
          },
        },
      },
      {
        name: "Export to Excel",
        description: "Convert items to XLSX file",
        parameters: {
          operation: "xlsx",
          options: {
            fileName: "export.xlsx",
            sheetName: "Data",
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.converttofile/",
  },

  "n8n-nodes-base.extractFromFile": {
    type: "n8n-nodes-base.extractFromFile",
    displayName: "Extract from File",
    description: "Extract data from files (CSV, JSON, spreadsheet, etc.)",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "csv",
        description: "Input file format",
        options: [
          { name: "Extract from CSV", value: "csv" },
          { name: "Extract from HTML", value: "html" },
          { name: "Extract from iCal", value: "iCal" },
          { name: "Extract from JSON", value: "json" },
          { name: "Extract from ODS", value: "ods" },
          { name: "Extract from RTF", value: "rtf" },
          { name: "Extract from Text File", value: "text" },
          { name: "Extract from XLS", value: "xls" },
          { name: "Extract from XLSX", value: "xlsx" },
          { name: "Move File to Base64", value: "binaryToBinary" },
        ],
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Binary property containing the file",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: delimiter, headerRow, sheetName",
      },
    ],
    examples: [
      {
        name: "Parse CSV",
        description: "Parse CSV file to items",
        parameters: {
          operation: "csv",
          binaryPropertyName: "data",
          options: {
            headerRow: true,
          },
        },
      },
      {
        name: "Parse Excel",
        description: "Parse XLSX file to items",
        parameters: {
          operation: "xlsx",
          binaryPropertyName: "data",
          options: {
            sheetName: "Sheet1",
            headerRow: true,
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.extractfromfile/",
  },

  "n8n-nodes-base.splitBinaryData": {
    type: "n8n-nodes-base.splitBinaryData",
    displayName: "Split Binary Data",
    description: "Split binary data from a single item into multiple items",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Binary property to split",
      },
    ],
    examples: [
      {
        name: "Split Files",
        description: "Split multiple files into separate items",
        parameters: {
          binaryPropertyName: "data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitbinarydata/",
  },

  "n8n-nodes-base.moveBinaryData": {
    type: "n8n-nodes-base.moveBinaryData",
    displayName: "Move Binary Data",
    description: "Move binary data to/from JSON",
    category: "data",
    typeVersion: 1.1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "mode",
        type: "options",
        required: true,
        default: "binaryToJson",
        description: "Direction to move data",
        options: [
          { name: "Binary to JSON", value: "binaryToJson" },
          { name: "JSON to Binary", value: "jsonToBinary" },
        ],
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Binary property name",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        description: "Additional options: encoding, fileName, mimeType",
      },
    ],
    examples: [
      {
        name: "Binary to Base64",
        description: "Convert binary to base64 string in JSON",
        parameters: {
          mode: "binaryToJson",
          binaryPropertyName: "data",
        },
      },
      {
        name: "JSON to Binary",
        description: "Convert base64 string to binary",
        parameters: {
          mode: "jsonToBinary",
          sourceKey: "base64Data",
          options: {
            fileName: "file.pdf",
            mimeType: "application/pdf",
          },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.movebinarydata/",
  },

  "n8n-nodes-base.editImage": {
    type: "n8n-nodes-base.editImage",
    displayName: "Edit Image",
    description: "Edit images (crop, resize, rotate, add text, etc.)",
    category: "data",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "resize",
        description: "Image operation",
        options: [
          { name: "Blur", value: "blur" },
          { name: "Border", value: "border" },
          { name: "Composite", value: "composite" },
          { name: "Create", value: "create" },
          { name: "Crop", value: "crop" },
          { name: "Draw", value: "draw" },
          { name: "Get Information", value: "information" },
          { name: "Multi Step", value: "multiStep" },
          { name: "Resize", value: "resize" },
          { name: "Rotate", value: "rotate" },
          { name: "Shear", value: "shear" },
          { name: "Text", value: "text" },
          { name: "Transparent", value: "transparent" },
        ],
      },
      {
        name: "binaryPropertyName",
        type: "string",
        required: false,
        default: "data",
        description: "Binary property containing image",
      },
    ],
    examples: [
      {
        name: "Resize Image",
        description: "Resize to 800x600",
        parameters: {
          operation: "resize",
          width: 800,
          height: 600,
          binaryPropertyName: "data",
        },
      },
      {
        name: "Add Watermark",
        description: "Add text watermark",
        parameters: {
          operation: "text",
          text: "Copyright 2024",
          fontSize: 20,
          fontColor: "#ffffff",
          positionX: 10,
          positionY: 10,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.editimage/",
  },
};
