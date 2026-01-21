/**
 * Social Media Integration Nodes
 *
 * Twitter/X, Facebook, LinkedIn, Instagram, Reddit, YouTube, etc.
 */

import type { NodeSchema } from "../types.js";

export const SOCIAL_MEDIA_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.twitter": {
    type: "n8n-nodes-base.twitter",
    displayName: "X (Twitter)",
    description: "Post tweets, search, and manage Twitter/X account",
    category: "social",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "twitterOAuth2Api", required: true, description: "Twitter OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "tweet",
        description: "Resource to operate on",
        options: [
          { name: "Direct Message", value: "directMessage", description: "Send direct messages" },
          { name: "List", value: "list", description: "Manage lists" },
          { name: "Tweet", value: "tweet", description: "Manage tweets" },
          { name: "User", value: "user", description: "Get user information" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Post a tweet" },
          { name: "Delete", value: "delete", description: "Delete a tweet" },
          { name: "Like", value: "like", description: "Like a tweet" },
          { name: "Retweet", value: "retweet", description: "Retweet" },
          { name: "Search", value: "search", description: "Search tweets" },
        ],
        displayOptions: { show: { resource: ["tweet"] } },
      },
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Tweet text (max 280 characters)",
        displayOptions: { show: { resource: ["tweet"], operation: ["create"] } },
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
        name: "Post Tweet",
        description: "Post a new tweet",
        parameters: {
          resource: "tweet",
          operation: "create",
          text: "Hello from n8n! 🚀",
        },
      },
      {
        name: "Search Tweets",
        description: "Search for tweets",
        parameters: {
          resource: "tweet",
          operation: "search",
          searchText: "n8n automation",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twitter/",
  },

  "n8n-nodes-base.facebookGraphApi": {
    type: "n8n-nodes-base.facebookGraphApi",
    displayName: "Facebook Graph API",
    description: "Interact with Facebook Graph API",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "facebookGraphApi", required: true, description: "Facebook Graph API credentials" },
    ],
    parameters: [
      {
        name: "httpRequestMethod",
        type: "options",
        required: true,
        default: "GET",
        description: "HTTP method",
        options: [
          { name: "GET", value: "GET" },
          { name: "POST", value: "POST" },
          { name: "DELETE", value: "DELETE" },
        ],
      },
      {
        name: "graphApiVersion",
        type: "options",
        required: true,
        default: "v19.0",
        description: "Graph API version",
        options: [
          { name: "v19.0", value: "v19.0" },
          { name: "v18.0", value: "v18.0" },
          { name: "v17.0", value: "v17.0" },
        ],
      },
      {
        name: "node",
        type: "string",
        required: true,
        default: "me",
        description: "Node to query (e.g., me, page-id, user-id)",
      },
      {
        name: "edge",
        type: "string",
        required: false,
        default: "",
        description: "Edge to query (e.g., posts, feed, photos)",
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
        name: "Get Profile",
        description: "Get current user profile",
        parameters: {
          httpRequestMethod: "GET",
          graphApiVersion: "v19.0",
          node: "me",
        },
      },
      {
        name: "Post to Page",
        description: "Post to a Facebook page",
        parameters: {
          httpRequestMethod: "POST",
          graphApiVersion: "v19.0",
          node: "page-id",
          edge: "feed",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.facebookgraphapi/",
  },

  "n8n-nodes-base.linkedIn": {
    type: "n8n-nodes-base.linkedIn",
    displayName: "LinkedIn",
    description: "Post updates and manage LinkedIn presence",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "linkedInOAuth2Api", required: true, description: "LinkedIn OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "post",
        description: "Resource to operate on",
        options: [
          { name: "Post", value: "post", description: "Create posts" },
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
        ],
        displayOptions: { show: { resource: ["post"] } },
      },
      {
        name: "postAs",
        type: "options",
        required: true,
        default: "person",
        description: "Post as person or organization",
        options: [
          { name: "Person", value: "person" },
          { name: "Organization", value: "organization" },
        ],
      },
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Post text content",
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
        description: "Create a LinkedIn post",
        parameters: {
          resource: "post",
          operation: "create",
          postAs: "person",
          text: "Excited to share this update! #automation",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.linkedin/",
  },

  "n8n-nodes-base.reddit": {
    type: "n8n-nodes-base.reddit",
    displayName: "Reddit",
    description: "Post, comment, and interact with Reddit",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "redditOAuth2Api", required: true, description: "Reddit OAuth2 credentials" },
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
          { name: "Post Comment", value: "postComment", description: "Manage comments" },
          { name: "Profile", value: "profile", description: "Get profile info" },
          { name: "Subreddit", value: "subreddit", description: "Get subreddit info" },
          { name: "User", value: "user", description: "Get user info" },
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
          { name: "Search", value: "search", description: "Search posts" },
        ],
        displayOptions: { show: { resource: ["post"] } },
      },
      {
        name: "subreddit",
        type: "string",
        required: true,
        default: "",
        description: "Subreddit name (without r/)",
        displayOptions: { show: { resource: ["post"], operation: ["create", "getAll"] } },
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
        name: "kind",
        type: "options",
        required: true,
        default: "self",
        description: "Post type",
        options: [
          { name: "Self (Text)", value: "self" },
          { name: "Link", value: "link" },
          { name: "Image", value: "image" },
        ],
        displayOptions: { show: { resource: ["post"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Text Post",
        description: "Create a text post on Reddit",
        parameters: {
          resource: "post",
          operation: "create",
          subreddit: "test",
          title: "Test Post from n8n",
          kind: "self",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.reddit/",
  },

  "n8n-nodes-base.youTube": {
    type: "n8n-nodes-base.youTube",
    displayName: "YouTube",
    description: "Upload videos and manage YouTube channel",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "youTubeOAuth2Api", required: true, description: "YouTube OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "video",
        description: "Resource to operate on",
        options: [
          { name: "Channel", value: "channel", description: "Get channel info" },
          { name: "Playlist", value: "playlist", description: "Manage playlists" },
          { name: "Playlist Item", value: "playlistItem", description: "Manage playlist items" },
          { name: "Video", value: "video", description: "Manage videos" },
          { name: "Video Category", value: "videoCategory", description: "Get categories" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Delete", value: "delete", description: "Delete a video" },
          { name: "Get", value: "get", description: "Get a video" },
          { name: "Get All", value: "getAll", description: "Get all videos" },
          { name: "Rate", value: "rate", description: "Rate a video" },
          { name: "Update", value: "update", description: "Update a video" },
          { name: "Upload", value: "upload", description: "Upload a video" },
        ],
        displayOptions: { show: { resource: ["video"] } },
      },
      {
        name: "videoId",
        type: "string",
        required: true,
        default: "",
        description: "Video ID",
        displayOptions: { show: { resource: ["video"], operation: ["get", "delete", "update", "rate"] } },
      },
      {
        name: "title",
        type: "string",
        required: true,
        default: "",
        description: "Video title",
        displayOptions: { show: { resource: ["video"], operation: ["upload"] } },
      },
      {
        name: "categoryId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Video category",
        displayOptions: { show: { resource: ["video"], operation: ["upload"] } },
      },
    ],
    examples: [
      {
        name: "Get Video",
        description: "Get video details",
        parameters: {
          resource: "video",
          operation: "get",
          videoId: "dQw4w9WgXcQ",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.youtube/",
  },

  "n8n-nodes-base.instagram": {
    type: "n8n-nodes-base.instagram",
    displayName: "Instagram",
    description: "Manage Instagram Business account",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "instagramBasicDisplayApi", required: false, description: "Instagram Basic Display API" },
      { name: "instagramGraphApi", required: false, description: "Instagram Graph API" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "media",
        description: "Resource to operate on",
        options: [
          { name: "Media", value: "media", description: "Get media" },
          { name: "User", value: "user", description: "Get user info" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get media" },
          { name: "Get All", value: "getAll", description: "Get all media" },
        ],
        displayOptions: { show: { resource: ["media"] } },
      },
    ],
    examples: [
      {
        name: "Get User Media",
        description: "Get user's media posts",
        parameters: {
          resource: "media",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.instagram/",
  },

  "n8n-nodes-base.pinterest": {
    type: "n8n-nodes-base.pinterest",
    displayName: "Pinterest",
    description: "Create pins and manage boards on Pinterest",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "pinterestOAuth2Api", required: true, description: "Pinterest OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "pin",
        description: "Resource to operate on",
        options: [
          { name: "Board", value: "board", description: "Manage boards" },
          { name: "Pin", value: "pin", description: "Manage pins" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a pin" },
          { name: "Delete", value: "delete", description: "Delete a pin" },
          { name: "Get", value: "get", description: "Get a pin" },
          { name: "Get All", value: "getAll", description: "Get all pins" },
        ],
        displayOptions: { show: { resource: ["pin"] } },
      },
      {
        name: "boardId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Board ID",
        displayOptions: { show: { resource: ["pin"], operation: ["create"] } },
      },
      {
        name: "title",
        type: "string",
        required: false,
        default: "",
        description: "Pin title",
        displayOptions: { show: { resource: ["pin"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Pin",
        description: "Create a new pin",
        parameters: {
          resource: "pin",
          operation: "create",
          boardId: "board-id",
          title: "New Pin",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pinterest/",
  },

  "n8n-nodes-base.medium": {
    type: "n8n-nodes-base.medium",
    displayName: "Medium",
    description: "Publish articles on Medium",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mediumApi", required: false, description: "Medium Integration Token" },
      { name: "mediumOAuth2Api", required: false, description: "Medium OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "post",
        description: "Resource to operate on",
        options: [
          { name: "Post", value: "post", description: "Create posts" },
          { name: "Publication", value: "publication", description: "Get publications" },
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
        name: "contentFormat",
        type: "options",
        required: true,
        default: "html",
        description: "Content format",
        options: [
          { name: "HTML", value: "html" },
          { name: "Markdown", value: "markdown" },
        ],
        displayOptions: { show: { resource: ["post"], operation: ["create"] } },
      },
      {
        name: "content",
        type: "string",
        required: true,
        default: "",
        description: "Post content",
        displayOptions: { show: { resource: ["post"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Post",
        description: "Publish a post on Medium",
        parameters: {
          resource: "post",
          operation: "create",
          title: "My Post Title",
          contentFormat: "markdown",
          content: "# Hello World\n\nThis is my post content.",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.medium/",
  },

  "n8n-nodes-base.mastodon": {
    type: "n8n-nodes-base.mastodon",
    displayName: "Mastodon",
    description: "Post toots and interact with Mastodon",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mastodonOAuth2Api", required: true, description: "Mastodon OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "status",
        description: "Resource to operate on",
        options: [
          { name: "Account", value: "account", description: "Get account info" },
          { name: "Status", value: "status", description: "Manage statuses (toots)" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a toot" },
          { name: "Delete", value: "delete", description: "Delete a toot" },
          { name: "Favourite", value: "favourite", description: "Favourite a toot" },
          { name: "Reblog", value: "reblog", description: "Reblog a toot" },
        ],
        displayOptions: { show: { resource: ["status"] } },
      },
      {
        name: "status",
        type: "string",
        required: true,
        default: "",
        description: "Toot content",
        displayOptions: { show: { resource: ["status"], operation: ["create"] } },
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
        name: "Create Toot",
        description: "Post a new toot",
        parameters: {
          resource: "status",
          operation: "create",
          status: "Hello from n8n! 🤖",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mastodon/",
  },

  "n8n-nodes-base.buffer": {
    type: "n8n-nodes-base.buffer",
    displayName: "Buffer",
    description: "Schedule social media posts via Buffer",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "bufferOAuth2Api", required: true, description: "Buffer OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "update",
        description: "Resource to operate on",
        options: [
          { name: "Profile", value: "profile", description: "Get profiles" },
          { name: "Update", value: "update", description: "Manage updates" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an update" },
          { name: "Get", value: "get", description: "Get an update" },
          { name: "Get Pending", value: "getPending", description: "Get pending updates" },
        ],
        displayOptions: { show: { resource: ["update"] } },
      },
      {
        name: "profileIds",
        type: "string",
        required: true,
        default: "",
        description: "Profile IDs (comma-separated)",
        displayOptions: { show: { resource: ["update"], operation: ["create"] } },
      },
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Post text",
        displayOptions: { show: { resource: ["update"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Schedule Post",
        description: "Schedule a social media post",
        parameters: {
          resource: "update",
          operation: "create",
          profileIds: "profile-id-1,profile-id-2",
          text: "Scheduled post from n8n!",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.buffer/",
  },

  "n8n-nodes-base.hackernews": {
    type: "n8n-nodes-base.hackernews",
    displayName: "Hacker News",
    description: "Get articles from Hacker News",
    category: "social",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "article",
        description: "Resource to operate on",
        options: [
          { name: "All", value: "all", description: "Get all articles" },
          { name: "Article", value: "article", description: "Get specific article" },
          { name: "User", value: "user", description: "Get user info" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Get", value: "get", description: "Get an article" },
          { name: "Get All", value: "getAll", description: "Get multiple articles" },
        ],
        displayOptions: { show: { resource: ["article"] } },
      },
      {
        name: "articleId",
        type: "string",
        required: true,
        default: "",
        description: "Article ID",
        displayOptions: { show: { resource: ["article"], operation: ["get"] } },
      },
    ],
    examples: [
      {
        name: "Get Top Stories",
        description: "Get top Hacker News stories",
        parameters: {
          resource: "all",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hackernews/",
  },
};
