/**
 * Analytics Integration Nodes
 *
 * Google Analytics, Mixpanel, Segment, PostHog, Plausible, etc.
 */

import type { NodeSchema } from "../types.js";

export const ANALYTICS_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.googleAnalytics": {
    type: "n8n-nodes-base.googleAnalytics",
    displayName: "Google Analytics",
    description: "Retrieve data from Google Analytics",
    category: "analytics",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "googleAnalyticsOAuth2", required: true, description: "Google OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "report",
        description: "Resource to operate on",
        options: [
          { name: "Report", value: "report", description: "Get reports" },
          { name: "User Activity", value: "userActivity", description: "Get user activity" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get a report" },
        ],
        displayOptions: { show: { resource: ["report"] } },
      },
      {
        name: "viewId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Google Analytics View ID",
      },
      {
        name: "dateRange",
        type: "fixedCollection",
        required: true,
        default: {},
        description: "Date range for the report",
      },
      {
        name: "metricsUi",
        type: "fixedCollection",
        required: true,
        default: {},
        description: "Metrics to retrieve",
      },
      {
        name: "dimensionsUi",
        type: "fixedCollection",
        required: false,
        default: {},
        description: "Dimensions to group by",
      },
    ],
    examples: [
      {
        name: "Get Page Views",
        description: "Get page view data",
        parameters: {
          resource: "report",
          operation: "get",
          viewId: "123456789",
          dateRange: { startDate: "30daysAgo", endDate: "today" },
          metricsUi: { metricValues: [{ metric: "ga:pageviews" }] },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googleanalytics/",
  },

  "n8n-nodes-base.mixpanel": {
    type: "n8n-nodes-base.mixpanel",
    displayName: "Mixpanel",
    description: "Track events and manage user profiles in Mixpanel",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mixpanelApi", required: true, description: "Mixpanel API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "event",
        description: "Resource to operate on",
        options: [
          { name: "Event", value: "event", description: "Track events" },
          { name: "Profile", value: "profile", description: "Manage profiles" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "track",
        description: "Operation to perform",
        options: [
          { name: "Track", value: "track", description: "Track an event" },
        ],
        displayOptions: { show: { resource: ["event"] } },
      },
      {
        name: "distinctId",
        type: "string",
        required: true,
        default: "",
        description: "Unique user identifier",
      },
      {
        name: "eventName",
        type: "string",
        required: true,
        default: "",
        description: "Event name",
        displayOptions: { show: { resource: ["event"] } },
      },
      {
        name: "properties",
        type: "fixedCollection",
        required: false,
        default: {},
        description: "Event properties",
      },
    ],
    examples: [
      {
        name: "Track Event",
        description: "Track a custom event",
        parameters: {
          resource: "event",
          operation: "track",
          distinctId: "user-123",
          eventName: "Button Clicked",
          properties: { propertyValues: [{ key: "button_name", value: "signup" }] },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mixpanel/",
  },

  "n8n-nodes-base.segment": {
    type: "n8n-nodes-base.segment",
    displayName: "Segment",
    description: "Send events and identify users in Segment",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "segmentApi", required: true, description: "Segment Write Key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "track",
        description: "Resource to operate on",
        options: [
          { name: "Group", value: "group", description: "Associate user with group" },
          { name: "Identify", value: "identify", description: "Identify a user" },
          { name: "Page", value: "page", description: "Track page view" },
          { name: "Track", value: "track", description: "Track an event" },
        ],
      },
      {
        name: "userId",
        type: "string",
        required: true,
        default: "",
        description: "User ID",
      },
      {
        name: "event",
        type: "string",
        required: true,
        default: "",
        description: "Event name",
        displayOptions: { show: { resource: ["track"] } },
      },
      {
        name: "traits",
        type: "fixedCollection",
        required: false,
        default: {},
        description: "User traits",
        displayOptions: { show: { resource: ["identify"] } },
      },
      {
        name: "properties",
        type: "fixedCollection",
        required: false,
        default: {},
        description: "Event properties",
        displayOptions: { show: { resource: ["track", "page"] } },
      },
    ],
    examples: [
      {
        name: "Track Event",
        description: "Track a custom event",
        parameters: {
          resource: "track",
          userId: "user-123",
          event: "Purchase Completed",
          properties: { propertyValues: [{ key: "amount", value: 99.99 }] },
        },
      },
      {
        name: "Identify User",
        description: "Identify a user with traits",
        parameters: {
          resource: "identify",
          userId: "user-123",
          traits: { traitValues: [{ key: "email", value: "user@example.com" }] },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.segment/",
  },

  "n8n-nodes-base.posthog": {
    type: "n8n-nodes-base.posthog",
    displayName: "PostHog",
    description: "Capture events and identify users in PostHog",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "postHogApi", required: true, description: "PostHog API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "event",
        description: "Resource to operate on",
        options: [
          { name: "Alias", value: "alias", description: "Create alias" },
          { name: "Event", value: "event", description: "Capture events" },
          { name: "Identity", value: "identity", description: "Identify users" },
          { name: "Track", value: "track", description: "Track page/screen" },
        ],
      },
      {
        name: "distinctId",
        type: "string",
        required: true,
        default: "",
        description: "Distinct ID (user identifier)",
      },
      {
        name: "event",
        type: "string",
        required: true,
        default: "",
        description: "Event name",
        displayOptions: { show: { resource: ["event"] } },
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
        name: "Capture Event",
        description: "Capture a custom event",
        parameters: {
          resource: "event",
          distinctId: "user-123",
          event: "button_clicked",
          additionalFields: { properties: { button: "signup" } },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.posthog/",
  },

  "n8n-nodes-base.plausible": {
    type: "n8n-nodes-base.plausible",
    displayName: "Plausible",
    description: "Track events in Plausible Analytics",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "plausibleApi", required: true, description: "Plausible API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "event",
        description: "Resource to operate on",
        options: [
          { name: "Event", value: "event", description: "Track events" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "track",
        description: "Operation to perform",
        options: [
          { name: "Track", value: "track", description: "Track an event" },
        ],
        displayOptions: { show: { resource: ["event"] } },
      },
      {
        name: "domain",
        type: "string",
        required: true,
        default: "",
        description: "Domain to track",
      },
      {
        name: "name",
        type: "string",
        required: true,
        default: "pageview",
        description: "Event name",
      },
      {
        name: "url",
        type: "string",
        required: true,
        default: "",
        description: "Page URL",
      },
    ],
    examples: [
      {
        name: "Track Event",
        description: "Track a page view or event",
        parameters: {
          resource: "event",
          operation: "track",
          domain: "example.com",
          name: "signup",
          url: "https://example.com/signup",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.plausible/",
  },

  "n8n-nodes-base.amplitude": {
    type: "n8n-nodes-base.amplitude",
    displayName: "Amplitude",
    description: "Track events and identify users in Amplitude",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "amplitudeApi", required: true, description: "Amplitude API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "event",
        description: "Resource to operate on",
        options: [
          { name: "Event", value: "event", description: "Track events" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "track",
        description: "Operation to perform",
        options: [
          { name: "Track", value: "track", description: "Track an event" },
        ],
        displayOptions: { show: { resource: ["event"] } },
      },
      {
        name: "eventType",
        type: "string",
        required: true,
        default: "",
        description: "Event type/name",
      },
      {
        name: "userId",
        type: "string",
        required: false,
        default: "",
        description: "User ID",
      },
      {
        name: "deviceId",
        type: "string",
        required: false,
        default: "",
        description: "Device ID",
      },
      {
        name: "eventProperties",
        type: "fixedCollection",
        required: false,
        default: {},
        description: "Event properties",
      },
    ],
    examples: [
      {
        name: "Track Event",
        description: "Track an event in Amplitude",
        parameters: {
          resource: "event",
          operation: "track",
          eventType: "button_clicked",
          userId: "user-123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.amplitude/",
  },

  "n8n-nodes-base.matomo": {
    type: "n8n-nodes-base.matomo",
    displayName: "Matomo",
    description: "Track events in Matomo Analytics",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "matomoApi", required: true, description: "Matomo API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "event",
        description: "Resource to operate on",
        options: [
          { name: "Event", value: "event", description: "Track events" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "track",
        description: "Operation to perform",
        options: [
          { name: "Track", value: "track", description: "Track an event" },
        ],
        displayOptions: { show: { resource: ["event"] } },
      },
      {
        name: "siteId",
        type: "string",
        required: true,
        default: "",
        description: "Matomo site ID",
      },
    ],
    examples: [
      {
        name: "Track Event",
        description: "Track an event in Matomo",
        parameters: {
          resource: "event",
          operation: "track",
          siteId: "1",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.matomo/",
  },

  "n8n-nodes-base.fathomAnalytics": {
    type: "n8n-nodes-base.fathomAnalytics",
    displayName: "Fathom Analytics",
    description: "Get analytics data from Fathom",
    category: "analytics",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "fathomApi", required: true, description: "Fathom API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "aggregation",
        description: "Resource to operate on",
        options: [
          { name: "Account", value: "account", description: "Get account info" },
          { name: "Aggregation", value: "aggregation", description: "Get aggregated data" },
          { name: "Event", value: "event", description: "Manage events" },
          { name: "Site", value: "site", description: "Manage sites" },
        ],
      },
      {
        name: "siteId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Site ID",
        displayOptions: { show: { resource: ["aggregation", "event"] } },
      },
    ],
    examples: [
      {
        name: "Get Analytics",
        description: "Get aggregated analytics data",
        parameters: {
          resource: "aggregation",
          siteId: "SITE_ID",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.fathomanalytics/",
  },
};
