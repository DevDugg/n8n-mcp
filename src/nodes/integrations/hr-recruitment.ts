/**
 * HR & Recruitment Integration Nodes
 *
 * BambooHR, Workable, Lever, Greenhouse, Personio, etc.
 */

import type { NodeSchema } from "../types.js";

export const HR_RECRUITMENT_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.bambooHr": {
    type: "n8n-nodes-base.bambooHr",
    displayName: "BambooHR",
    description: "Manage employees and time off in BambooHR",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "bambooHrApi", required: true, description: "BambooHR API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "employee",
        description: "Resource to operate on",
        options: [
          { name: "Company Report", value: "companyReport", description: "Get company reports" },
          { name: "Employee", value: "employee", description: "Manage employees" },
          { name: "Employee Document", value: "employeeDocument", description: "Manage documents" },
          { name: "File", value: "file", description: "Manage files" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an employee" },
          { name: "Get", value: "get", description: "Get an employee" },
          { name: "Get All", value: "getAll", description: "Get all employees" },
          { name: "Update", value: "update", description: "Update an employee" },
        ],
        displayOptions: { show: { resource: ["employee"] } },
      },
      {
        name: "employeeId",
        type: "string",
        required: true,
        default: "",
        description: "Employee ID",
        displayOptions: { show: { resource: ["employee"], operation: ["get", "update"] } },
      },
      {
        name: "additionalFields",
        type: "collection",
        required: false,
        default: {},
        description: "Additional fields",
      },
    ],
    examples: [
      {
        name: "Get Employees",
        description: "Get all employees",
        parameters: {
          resource: "employee",
          operation: "getAll",
        },
      },
      {
        name: "Create Employee",
        description: "Create a new employee",
        parameters: {
          resource: "employee",
          operation: "create",
          additionalFields: { firstName: "John", lastName: "Doe" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.bamboohr/",
  },

  "n8n-nodes-base.workable": {
    type: "n8n-nodes-base.workable",
    displayName: "Workable",
    description: "Manage candidates and jobs in Workable",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "workableApi", required: true, description: "Workable API token" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "candidate",
        description: "Resource to operate on",
        options: [
          { name: "Candidate", value: "candidate", description: "Manage candidates" },
          { name: "Job", value: "job", description: "Manage jobs" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a candidate" },
          { name: "Get", value: "get", description: "Get a candidate" },
          { name: "Get All", value: "getAll", description: "Get all candidates" },
        ],
        displayOptions: { show: { resource: ["candidate"] } },
      },
      {
        name: "shortcode",
        type: "string",
        required: true,
        default: "",
        description: "Job shortcode",
        displayOptions: { show: { resource: ["candidate"], operation: ["create", "getAll"] } },
      },
      {
        name: "name",
        type: "string",
        required: true,
        default: "",
        description: "Candidate name",
        displayOptions: { show: { resource: ["candidate"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Get Candidates",
        description: "Get all candidates for a job",
        parameters: {
          resource: "candidate",
          operation: "getAll",
          shortcode: "job-shortcode",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.workable/",
  },

  "n8n-nodes-base.lever": {
    type: "n8n-nodes-base.lever",
    displayName: "Lever",
    description: "Manage candidates and opportunities in Lever",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "leverApi", required: true, description: "Lever API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "opportunity",
        description: "Resource to operate on",
        options: [
          { name: "Opportunity", value: "opportunity", description: "Manage opportunities" },
          { name: "Posting", value: "posting", description: "Manage job postings" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an opportunity" },
          { name: "Get", value: "get", description: "Get an opportunity" },
          { name: "Get All", value: "getAll", description: "Get all opportunities" },
        ],
        displayOptions: { show: { resource: ["opportunity"] } },
      },
      {
        name: "opportunityId",
        type: "string",
        required: true,
        default: "",
        description: "Opportunity ID",
        displayOptions: { show: { resource: ["opportunity"], operation: ["get"] } },
      },
    ],
    examples: [
      {
        name: "Get Opportunities",
        description: "Get all opportunities",
        parameters: {
          resource: "opportunity",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.lever/",
  },

  "n8n-nodes-base.greenhouse": {
    type: "n8n-nodes-base.greenhouse",
    displayName: "Greenhouse",
    description: "Manage candidates and jobs in Greenhouse",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "greenhouseApi", required: true, description: "Greenhouse API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "candidate",
        description: "Resource to operate on",
        options: [
          { name: "Application", value: "application", description: "Manage applications" },
          { name: "Candidate", value: "candidate", description: "Manage candidates" },
          { name: "Close Reason", value: "closeReason", description: "Get close reasons" },
          { name: "Job", value: "job", description: "Manage jobs" },
          { name: "Miscellanea", value: "miscellanea", description: "Other resources" },
          { name: "Scheduled Interview", value: "scheduledInterview", description: "Manage interviews" },
          { name: "Scorecard", value: "scorecard", description: "Manage scorecards" },
          { name: "User", value: "user", description: "Manage users" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a candidate" },
          { name: "Get", value: "get", description: "Get a candidate" },
          { name: "Get All", value: "getAll", description: "Get all candidates" },
        ],
        displayOptions: { show: { resource: ["candidate"] } },
      },
      {
        name: "candidateId",
        type: "string",
        required: true,
        default: "",
        description: "Candidate ID",
        displayOptions: { show: { resource: ["candidate"], operation: ["get"] } },
      },
    ],
    examples: [
      {
        name: "Get Candidates",
        description: "Get all candidates",
        parameters: {
          resource: "candidate",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.greenhouse/",
  },

  "n8n-nodes-base.personio": {
    type: "n8n-nodes-base.personio",
    displayName: "Personio",
    description: "Manage employees and absences in Personio",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "personioApi", required: true, description: "Personio API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "employee",
        description: "Resource to operate on",
        options: [
          { name: "Absence", value: "absence", description: "Manage absences" },
          { name: "Attendance", value: "attendance", description: "Manage attendance" },
          { name: "Company", value: "company", description: "Get company info" },
          { name: "Employee", value: "employee", description: "Manage employees" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an employee" },
          { name: "Get", value: "get", description: "Get an employee" },
          { name: "Get All", value: "getAll", description: "Get all employees" },
          { name: "Update", value: "update", description: "Update an employee" },
        ],
        displayOptions: { show: { resource: ["employee"] } },
      },
      {
        name: "employeeId",
        type: "string",
        required: true,
        default: "",
        description: "Employee ID",
        displayOptions: { show: { resource: ["employee"], operation: ["get", "update"] } },
      },
    ],
    examples: [
      {
        name: "Get Employees",
        description: "Get all employees",
        parameters: {
          resource: "employee",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.personio/",
  },

  "n8n-nodes-base.recruitee": {
    type: "n8n-nodes-base.recruitee",
    displayName: "Recruitee",
    description: "Manage candidates in Recruitee",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "recruiteeApi", required: true, description: "Recruitee API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "candidate",
        description: "Resource to operate on",
        options: [
          { name: "Candidate", value: "candidate", description: "Manage candidates" },
          { name: "Offer", value: "offer", description: "Manage job offers" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a candidate" },
          { name: "Get", value: "get", description: "Get a candidate" },
          { name: "Get All", value: "getAll", description: "Get all candidates" },
        ],
        displayOptions: { show: { resource: ["candidate"] } },
      },
      {
        name: "companyId",
        type: "string",
        required: true,
        default: "",
        description: "Company ID",
      },
    ],
    examples: [
      {
        name: "Get Candidates",
        description: "Get all candidates",
        parameters: {
          resource: "candidate",
          operation: "getAll",
          companyId: "company-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.recruitee/",
  },

  "n8n-nodes-base.humantic": {
    type: "n8n-nodes-base.humantic",
    displayName: "Humantic AI",
    description: "Get personality insights from Humantic AI",
    category: "hr",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "humanticAiApi", required: true, description: "Humantic AI API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "profile",
        description: "Resource to operate on",
        options: [
          { name: "Profile", value: "profile", description: "Analyze profiles" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create analysis" },
          { name: "Get", value: "get", description: "Get analysis" },
          { name: "Update", value: "update", description: "Update analysis" },
        ],
        displayOptions: { show: { resource: ["profile"] } },
      },
      {
        name: "userId",
        type: "string",
        required: true,
        default: "",
        description: "User ID for the profile",
      },
    ],
    examples: [
      {
        name: "Create Profile Analysis",
        description: "Analyze a LinkedIn profile",
        parameters: {
          resource: "profile",
          operation: "create",
          userId: "linkedin-url",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.humanticai/",
  },
};
