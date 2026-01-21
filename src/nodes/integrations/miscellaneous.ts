/**
 * Miscellaneous Integration Nodes
 *
 * Various other integrations: weather, media, IoT, utilities, etc.
 */

import type { NodeSchema } from "../types.js";

export const MISCELLANEOUS_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.openWeatherMap": {
    type: "n8n-nodes-base.openWeatherMap",
    displayName: "OpenWeatherMap",
    description: "Get weather data from OpenWeatherMap",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "openWeatherMapApi", required: true, description: "OpenWeatherMap API key" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "currentWeather",
        description: "Operation to perform",
        options: [
          { name: "Current Weather", value: "currentWeather", description: "Get current weather" },
          { name: "5 Day Forecast", value: "fiveDayForecast", description: "Get 5-day forecast" },
        ],
      },
      {
        name: "locationSelection",
        type: "options",
        required: true,
        default: "cityName",
        description: "Location selection method",
        options: [
          { name: "City Name", value: "cityName" },
          { name: "City ID", value: "cityId" },
          { name: "Coordinates", value: "coordinates" },
          { name: "ZIP Code", value: "zipCode" },
        ],
      },
      {
        name: "city",
        type: "string",
        required: true,
        default: "",
        description: "City name",
        displayOptions: { show: { locationSelection: ["cityName"] } },
      },
      {
        name: "latitude",
        type: "number",
        required: true,
        default: 0,
        description: "Latitude",
        displayOptions: { show: { locationSelection: ["coordinates"] } },
      },
      {
        name: "longitude",
        type: "number",
        required: true,
        default: 0,
        description: "Longitude",
        displayOptions: { show: { locationSelection: ["coordinates"] } },
      },
    ],
    examples: [
      {
        name: "Get Weather",
        description: "Get current weather for a city",
        parameters: {
          operation: "currentWeather",
          locationSelection: "cityName",
          city: "London",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openweathermap/",
  },

  "n8n-nodes-base.nasa": {
    type: "n8n-nodes-base.nasa",
    displayName: "NASA",
    description: "Get data from NASA APIs",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "nasaApi", required: true, description: "NASA API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "astronomyPictureOfTheDay",
        description: "Resource to access",
        options: [
          { name: "Astronomy Picture of the Day", value: "astronomyPictureOfTheDay" },
          { name: "Asteroid Neo Browse", value: "asteroidNeoBrowse" },
          { name: "Asteroid Neo Feed", value: "asteroidNeoFeed" },
          { name: "Asteroid Neo Lookup", value: "asteroidNeoLookup" },
          { name: "DONKI", value: "donki" },
          { name: "Earth", value: "earth" },
        ],
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
        name: "Get APOD",
        description: "Get Astronomy Picture of the Day",
        parameters: {
          resource: "astronomyPictureOfTheDay",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.nasa/",
  },

  "n8n-nodes-base.spotify": {
    type: "n8n-nodes-base.spotify",
    displayName: "Spotify",
    description: "Interact with Spotify API",
    category: "utility",
    subcategory: "media",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "spotifyOAuth2Api", required: true, description: "Spotify OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "player",
        description: "Resource to access",
        options: [
          { name: "Album", value: "album", description: "Get albums" },
          { name: "Artist", value: "artist", description: "Get artists" },
          { name: "Library", value: "library", description: "Manage library" },
          { name: "My Data", value: "myData", description: "Get user data" },
          { name: "Player", value: "player", description: "Control playback" },
          { name: "Playlist", value: "playlist", description: "Manage playlists" },
          { name: "Track", value: "track", description: "Get tracks" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "currentlyPlaying",
        description: "Operation to perform",
        options: [
          { name: "Currently Playing", value: "currentlyPlaying", description: "Get now playing" },
          { name: "Next Song", value: "nextSong", description: "Skip to next" },
          { name: "Pause", value: "pause", description: "Pause playback" },
          { name: "Previous Song", value: "previousSong", description: "Go to previous" },
          { name: "Resume", value: "resume", description: "Resume playback" },
          { name: "Volume", value: "volume", description: "Set volume" },
        ],
        displayOptions: { show: { resource: ["player"] } },
      },
    ],
    examples: [
      {
        name: "Get Now Playing",
        description: "Get currently playing track",
        parameters: {
          resource: "player",
          operation: "currentlyPlaying",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.spotify/",
  },

  "n8n-nodes-base.homeAssistant": {
    type: "n8n-nodes-base.homeAssistant",
    displayName: "Home Assistant",
    description: "Interact with Home Assistant",
    category: "utility",
    subcategory: "iot",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "homeAssistantApi", required: true, description: "Home Assistant API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "service",
        description: "Resource to operate on",
        options: [
          { name: "Camera Proxy", value: "cameraProxy" },
          { name: "Config", value: "config" },
          { name: "Event", value: "event" },
          { name: "History", value: "history" },
          { name: "Log", value: "log" },
          { name: "Service", value: "service" },
          { name: "State", value: "state" },
          { name: "Template", value: "template" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "call",
        description: "Operation to perform",
        options: [
          { name: "Call", value: "call", description: "Call a service" },
          { name: "Get All", value: "getAll", description: "Get all services" },
        ],
        displayOptions: { show: { resource: ["service"] } },
      },
      {
        name: "domain",
        type: "string",
        required: true,
        default: "",
        description: "Service domain (e.g., light, switch)",
        displayOptions: { show: { resource: ["service"], operation: ["call"] } },
      },
      {
        name: "service",
        type: "string",
        required: true,
        default: "",
        description: "Service to call (e.g., turn_on, turn_off)",
        displayOptions: { show: { resource: ["service"], operation: ["call"] } },
      },
    ],
    examples: [
      {
        name: "Turn On Light",
        description: "Turn on a light",
        parameters: {
          resource: "service",
          operation: "call",
          domain: "light",
          service: "turn_on",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.homeassistant/",
  },

  "n8n-nodes-base.wordpress": {
    type: "n8n-nodes-base.wordpress",
    displayName: "WordPress",
    description: "Manage posts, pages, and users in WordPress",
    category: "utility",
    subcategory: "cms",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "wordpressApi", required: true, description: "WordPress API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "post",
        description: "Resource to operate on",
        options: [
          { name: "Post", value: "post", description: "Manage posts" },
          { name: "User", value: "user", description: "Manage users" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a post" },
          { name: "Delete", value: "delete", description: "Delete a post" },
          { name: "Get", value: "get", description: "Get a post" },
          { name: "Get All", value: "getAll", description: "Get all posts" },
          { name: "Update", value: "update", description: "Update a post" },
        ],
        displayOptions: { show: { resource: ["post"] } },
      },
      {
        name: "title",
        type: "string",
        required: true,
        default: "",
        description: "Post title",
        displayOptions: { show: { resource: ["post"], operation: ["create"] } },
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
        name: "Create Post",
        description: "Create a WordPress post",
        parameters: {
          resource: "post",
          operation: "create",
          title: "New Post from n8n",
          additionalFields: { content: "Post content here" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wordpress/",
  },

  "n8n-nodes-base.contentful": {
    type: "n8n-nodes-base.contentful",
    displayName: "Contentful",
    description: "Manage content in Contentful",
    category: "utility",
    subcategory: "cms",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "contentfulApi", required: true, description: "Contentful API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "entry",
        description: "Resource to operate on",
        options: [
          { name: "Asset", value: "asset", description: "Get assets" },
          { name: "Content Type", value: "contentType", description: "Get content types" },
          { name: "Entry", value: "entry", description: "Get entries" },
          { name: "Locale", value: "locale", description: "Get locales" },
          { name: "Space", value: "space", description: "Get space info" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get an entry" },
          { name: "Get All", value: "getAll", description: "Get all entries" },
        ],
        displayOptions: { show: { resource: ["entry"] } },
      },
      {
        name: "spaceId",
        type: "string",
        required: true,
        default: "",
        description: "Space ID",
      },
      {
        name: "environmentId",
        type: "string",
        required: true,
        default: "master",
        description: "Environment ID",
      },
    ],
    examples: [
      {
        name: "Get Entries",
        description: "Get all entries from Contentful",
        parameters: {
          resource: "entry",
          operation: "getAll",
          spaceId: "space-id",
          environmentId: "master",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.contentful/",
  },

  "n8n-nodes-base.strapi": {
    type: "n8n-nodes-base.strapi",
    displayName: "Strapi",
    description: "Manage entries in Strapi",
    category: "utility",
    subcategory: "cms",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "strapiApi", required: true, description: "Strapi API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "entry",
        description: "Resource to operate on",
        options: [
          { name: "Entry", value: "entry", description: "Manage entries" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an entry" },
          { name: "Delete", value: "delete", description: "Delete an entry" },
          { name: "Get", value: "get", description: "Get an entry" },
          { name: "Get All", value: "getAll", description: "Get all entries" },
          { name: "Update", value: "update", description: "Update an entry" },
        ],
        displayOptions: { show: { resource: ["entry"] } },
      },
      {
        name: "contentType",
        type: "string",
        required: true,
        default: "",
        description: "Content type name",
      },
    ],
    examples: [
      {
        name: "Get Entries",
        description: "Get all entries of a content type",
        parameters: {
          resource: "entry",
          operation: "getAll",
          contentType: "articles",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.strapi/",
  },

  "n8n-nodes-base.ghost": {
    type: "n8n-nodes-base.ghost",
    displayName: "Ghost",
    description: "Manage posts and members in Ghost",
    category: "utility",
    subcategory: "cms",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "ghostAdminApi", required: false, description: "Ghost Admin API" },
      { name: "ghostContentApi", required: false, description: "Ghost Content API" },
    ],
    parameters: [
      {
        name: "source",
        type: "options",
        required: true,
        default: "adminApi",
        description: "API to use",
        options: [
          { name: "Admin API", value: "adminApi" },
          { name: "Content API", value: "contentApi" },
        ],
      },
      {
        name: "resource",
        type: "options",
        required: true,
        default: "post",
        description: "Resource to operate on",
        options: [
          { name: "Member", value: "member", description: "Manage members" },
          { name: "Post", value: "post", description: "Manage posts" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a post" },
          { name: "Delete", value: "delete", description: "Delete a post" },
          { name: "Get", value: "get", description: "Get a post" },
          { name: "Get All", value: "getAll", description: "Get all posts" },
          { name: "Update", value: "update", description: "Update a post" },
        ],
        displayOptions: { show: { resource: ["post"] } },
      },
    ],
    examples: [
      {
        name: "Get Posts",
        description: "Get all Ghost posts",
        parameters: {
          source: "contentApi",
          resource: "post",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.ghost/",
  },

  "n8n-nodes-base.webflow": {
    type: "n8n-nodes-base.webflow",
    displayName: "Webflow",
    description: "Manage CMS items in Webflow",
    category: "utility",
    subcategory: "cms",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "webflowApi", required: false, description: "Webflow API token" },
      { name: "webflowOAuth2Api", required: false, description: "Webflow OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "item",
        description: "Resource to operate on",
        options: [
          { name: "Item", value: "item", description: "Manage CMS items" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an item" },
          { name: "Delete", value: "delete", description: "Delete an item" },
          { name: "Get", value: "get", description: "Get an item" },
          { name: "Get All", value: "getAll", description: "Get all items" },
          { name: "Update", value: "update", description: "Update an item" },
        ],
        displayOptions: { show: { resource: ["item"] } },
      },
      {
        name: "siteId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Site ID",
      },
      {
        name: "collectionId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Collection ID",
      },
    ],
    examples: [
      {
        name: "Get Items",
        description: "Get all CMS items",
        parameters: {
          resource: "item",
          operation: "getAll",
          siteId: "site-id",
          collectionId: "collection-id",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.webflow/",
  },

  "n8n-nodes-base.qrCode": {
    type: "n8n-nodes-base.qrCode",
    displayName: "QR Code",
    description: "Generate and read QR codes",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "generate",
        description: "Operation to perform",
        options: [
          { name: "Generate", value: "generate", description: "Generate a QR code" },
          { name: "Read", value: "read", description: "Read a QR code" },
        ],
      },
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Text to encode",
        displayOptions: { show: { operation: ["generate"] } },
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "QR code options",
        displayOptions: { show: { operation: ["generate"] } },
      },
    ],
    examples: [
      {
        name: "Generate QR Code",
        description: "Generate a QR code for a URL",
        parameters: {
          operation: "generate",
          text: "https://example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.qrcode/",
  },

  "n8n-nodes-base.rss": {
    type: "n8n-nodes-base.rss",
    displayName: "RSS Feed Read",
    description: "Read items from RSS feeds",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        default: "",
        description: "RSS feed URL",
        placeholder: "https://example.com/feed.xml",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Read Feed",
        description: "Read items from an RSS feed",
        parameters: {
          url: "https://news.ycombinator.com/rss",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeedread/",
  },

  "n8n-nodes-base.icalendar": {
    type: "n8n-nodes-base.icalendar",
    displayName: "iCalendar",
    description: "Create iCalendar events",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "createEvent",
        description: "Operation to perform",
        options: [
          { name: "Create Event", value: "createEvent", description: "Create a calendar event" },
        ],
      },
      {
        name: "eventTitle",
        type: "string",
        required: true,
        default: "",
        description: "Event title",
      },
      {
        name: "start",
        type: "string",
        required: true,
        default: "",
        description: "Start date/time",
      },
      {
        name: "end",
        type: "string",
        required: true,
        default: "",
        description: "End date/time",
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
        name: "Create Event",
        description: "Create an iCalendar event",
        parameters: {
          operation: "createEvent",
          eventTitle: "Meeting",
          start: "2024-01-15T10:00:00",
          end: "2024-01-15T11:00:00",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.icalendar/",
  },

  "n8n-nodes-base.urlShortener": {
    type: "n8n-nodes-base.urlShortener",
    displayName: "URL Shortener",
    description: "Shorten URLs using various services",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "bitlyApi", required: false, description: "Bitly API credentials" },
    ],
    parameters: [
      {
        name: "url",
        type: "string",
        required: true,
        default: "",
        description: "URL to shorten",
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options",
      },
    ],
    examples: [
      {
        name: "Shorten URL",
        description: "Shorten a long URL",
        parameters: {
          url: "https://example.com/very/long/path/to/resource",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.urlshortener/",
  },

  "n8n-nodes-base.odoo": {
    type: "n8n-nodes-base.odoo",
    displayName: "Odoo",
    description: "Manage contacts, opportunities, and notes in Odoo ERP",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "odooApi", required: true, description: "Odoo API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "contact",
        description: "Resource to operate on",
        options: [
          { name: "Contact", value: "contact", description: "Manage contacts" },
          { name: "Custom Resource", value: "custom", description: "Custom resource" },
          { name: "Note", value: "note", description: "Manage notes" },
          { name: "Opportunity", value: "opportunity", description: "Manage opportunities" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a contact" },
          { name: "Delete", value: "delete", description: "Delete a contact" },
          { name: "Get", value: "get", description: "Get a contact" },
          { name: "Get All", value: "getAll", description: "Get all contacts" },
          { name: "Update", value: "update", description: "Update a contact" },
        ],
        displayOptions: { show: { resource: ["contact"] } },
      },
    ],
    examples: [
      {
        name: "Get Contacts",
        description: "Get all Odoo contacts",
        parameters: {
          resource: "contact",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.odoo/",
  },

  "n8n-nodes-base.mautic": {
    type: "n8n-nodes-base.mautic",
    displayName: "Mautic",
    description: "Manage contacts, companies, and segments in Mautic",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mauticApi", required: true, description: "Mautic API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "contact",
        description: "Resource to operate on",
        options: [
          { name: "Campaign Contact", value: "campaignContact", description: "Manage campaign contacts" },
          { name: "Company", value: "company", description: "Manage companies" },
          { name: "Company Contact", value: "companyContact", description: "Manage company contacts" },
          { name: "Contact", value: "contact", description: "Manage contacts" },
          { name: "Segment Email", value: "segmentEmail", description: "Manage segment emails" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a contact" },
          { name: "Delete", value: "delete", description: "Delete a contact" },
          { name: "Do Not Contact", value: "doNotContact", description: "Add to DNC list" },
          { name: "Get", value: "get", description: "Get a contact" },
          { name: "Get All", value: "getAll", description: "Get all contacts" },
          { name: "Update", value: "update", description: "Update a contact" },
        ],
        displayOptions: { show: { resource: ["contact"] } },
      },
    ],
    examples: [
      {
        name: "Get Contacts",
        description: "Get all Mautic contacts",
        parameters: {
          resource: "contact",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mautic/",
  },

  "n8n-nodes-base.metabase": {
    type: "n8n-nodes-base.metabase",
    displayName: "Metabase",
    description: "Query dashboards and questions in Metabase",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "metabaseApi", required: true, description: "Metabase API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "question",
        description: "Resource to operate on",
        options: [
          { name: "Database", value: "database", description: "Manage databases" },
          { name: "Question", value: "question", description: "Query questions" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get a question" },
          { name: "Get All", value: "getAll", description: "Get all questions" },
          { name: "Result Data", value: "resultData", description: "Get question results" },
        ],
        displayOptions: { show: { resource: ["question"] } },
      },
      {
        name: "questionId",
        type: "number",
        required: true,
        default: 0,
        description: "Question ID",
        displayOptions: { show: { resource: ["question"], operation: ["get", "resultData"] } },
      },
    ],
    examples: [
      {
        name: "Get Question Results",
        description: "Get results from a Metabase question",
        parameters: {
          resource: "question",
          operation: "resultData",
          questionId: 123,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.metabase/",
  },

  "n8n-nodes-base.bitwarden": {
    type: "n8n-nodes-base.bitwarden",
    displayName: "Bitwarden",
    description: "Manage collections, events, groups, and members in Bitwarden",
    category: "utility",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "bitwardenApi", required: true, description: "Bitwarden API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "member",
        description: "Resource to operate on",
        options: [
          { name: "Collection", value: "collection", description: "Manage collections" },
          { name: "Event", value: "event", description: "Get events" },
          { name: "Group", value: "group", description: "Manage groups" },
          { name: "Member", value: "member", description: "Manage members" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getAll",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a member" },
          { name: "Delete", value: "delete", description: "Delete a member" },
          { name: "Get", value: "get", description: "Get a member" },
          { name: "Get All", value: "getAll", description: "Get all members" },
          { name: "Get Groups", value: "getGroups", description: "Get member groups" },
          { name: "Update", value: "update", description: "Update a member" },
          { name: "Update Groups", value: "updateGroups", description: "Update member groups" },
        ],
        displayOptions: { show: { resource: ["member"] } },
      },
    ],
    examples: [
      {
        name: "Get Members",
        description: "Get all Bitwarden members",
        parameters: {
          resource: "member",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.bitwarden/",
  },
};
