/**
 * AI/ML Integration Nodes
 *
 * OpenAI, Anthropic, Google AI, Mistral, Cohere, Hugging Face, etc.
 */

import type { NodeSchema } from "../types.js";

export const AI_ML_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.openAi": {
    type: "n8n-nodes-base.openAi",
    displayName: "OpenAI",
    description: "Use OpenAI models for text, chat, images, and embeddings",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "openAiApi", required: true, description: "OpenAI API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "chat",
        description: "Resource to operate on",
        options: [
          { name: "Assistant", value: "assistant", description: "Use assistants" },
          { name: "Audio", value: "audio", description: "Transcribe/translate audio" },
          { name: "Chat", value: "chat", description: "Chat completions" },
          { name: "File", value: "file", description: "Manage files" },
          { name: "Image", value: "image", description: "Generate images" },
          { name: "Text", value: "text", description: "Text completions" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "message",
        description: "Operation to perform",
        options: [
          { name: "Message", value: "message", description: "Send a message" },
        ],
        displayOptions: { show: { resource: ["chat"] } },
      },
      {
        name: "model",
        type: "options",
        required: true,
        default: "gpt-4o",
        description: "Model to use",
        options: [
          { name: "GPT-4o", value: "gpt-4o" },
          { name: "GPT-4o Mini", value: "gpt-4o-mini" },
          { name: "GPT-4 Turbo", value: "gpt-4-turbo" },
          { name: "GPT-4", value: "gpt-4" },
          { name: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
        ],
        displayOptions: { show: { resource: ["chat"] } },
      },
      {
        name: "messages",
        type: "fixedCollection",
        required: true,
        default: {},
        description: "Messages to send",
        displayOptions: { show: { resource: ["chat"] } },
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        default: "",
        description: "The prompt for image generation",
        displayOptions: { show: { resource: ["image"], operation: ["generate"] } },
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options (temperature, max_tokens, etc.)",
      },
    ],
    examples: [
      {
        name: "Chat Completion",
        description: "Generate a chat response",
        parameters: {
          resource: "chat",
          operation: "message",
          model: "gpt-4o",
          messages: {
            values: [{ role: "user", content: "Hello, how are you?" }],
          },
        },
      },
      {
        name: "Generate Image",
        description: "Generate an image with DALL-E",
        parameters: {
          resource: "image",
          operation: "generate",
          prompt: "A serene mountain landscape at sunset",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/",
  },

  "@n8n/n8n-nodes-langchain.lmChatAnthropic": {
    type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
    displayName: "Anthropic Chat Model",
    description: "Use Anthropic Claude models for chat completions",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "anthropicApi", required: true, description: "Anthropic API key" },
    ],
    parameters: [
      {
        name: "model",
        type: "options",
        required: true,
        default: "claude-3-5-sonnet-20241022",
        description: "Model to use",
        options: [
          { name: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022" },
          { name: "Claude 3.5 Haiku", value: "claude-3-5-haiku-20241022" },
          { name: "Claude 3 Opus", value: "claude-3-opus-20240229" },
          { name: "Claude 3 Sonnet", value: "claude-3-sonnet-20240229" },
          { name: "Claude 3 Haiku", value: "claude-3-haiku-20240307" },
        ],
      },
      {
        name: "options",
        type: "collection",
        required: false,
        default: {},
        description: "Additional options",
        options: [
          { name: "maxTokens", value: "maxTokens", description: "Maximum tokens" },
          { name: "temperature", value: "temperature", description: "Temperature" },
        ],
      },
    ],
    examples: [
      {
        name: "Chat with Claude",
        description: "Use Claude for chat",
        parameters: {
          model: "claude-3-5-sonnet-20241022",
          options: { maxTokens: 1024, temperature: 0.7 },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic/",
  },

  "@n8n/n8n-nodes-langchain.lmChatGoogleGemini": {
    type: "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
    displayName: "Google Gemini Chat Model",
    description: "Use Google Gemini models for chat completions",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "googlePalmApi", required: true, description: "Google AI API key" },
    ],
    parameters: [
      {
        name: "model",
        type: "options",
        required: true,
        default: "gemini-1.5-pro",
        description: "Model to use",
        options: [
          { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
          { name: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
          { name: "Gemini 1.0 Pro", value: "gemini-1.0-pro" },
        ],
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
        name: "Chat with Gemini",
        description: "Use Gemini for chat",
        parameters: {
          model: "gemini-1.5-pro",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgooglegemini/",
  },

  "@n8n/n8n-nodes-langchain.lmChatMistralCloud": {
    type: "@n8n/n8n-nodes-langchain.lmChatMistralCloud",
    displayName: "Mistral Cloud Chat Model",
    description: "Use Mistral AI models for chat completions",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "mistralCloudApi", required: true, description: "Mistral API key" },
    ],
    parameters: [
      {
        name: "model",
        type: "options",
        required: true,
        default: "mistral-large-latest",
        description: "Model to use",
        options: [
          { name: "Mistral Large", value: "mistral-large-latest" },
          { name: "Mistral Medium", value: "mistral-medium-latest" },
          { name: "Mistral Small", value: "mistral-small-latest" },
          { name: "Mixtral 8x7B", value: "open-mixtral-8x7b" },
          { name: "Mistral 7B", value: "open-mistral-7b" },
        ],
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
        name: "Chat with Mistral",
        description: "Use Mistral for chat",
        parameters: {
          model: "mistral-large-latest",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatmistralcloud/",
  },

  "@n8n/n8n-nodes-langchain.lmChatOllama": {
    type: "@n8n/n8n-nodes-langchain.lmChatOllama",
    displayName: "Ollama Chat Model",
    description: "Use local Ollama models for chat completions",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "ollamaApi", required: true, description: "Ollama API URL" },
    ],
    parameters: [
      {
        name: "model",
        type: "string",
        required: true,
        default: "llama2",
        description: "Model name",
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
        name: "Chat with Ollama",
        description: "Use local Ollama model",
        parameters: {
          model: "llama2",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatollama/",
  },

  "@n8n/n8n-nodes-langchain.embeddingsOpenAi": {
    type: "@n8n/n8n-nodes-langchain.embeddingsOpenAi",
    displayName: "OpenAI Embeddings",
    description: "Generate embeddings using OpenAI models",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "openAiApi", required: true, description: "OpenAI API key" },
    ],
    parameters: [
      {
        name: "model",
        type: "options",
        required: true,
        default: "text-embedding-3-small",
        description: "Embedding model",
        options: [
          { name: "text-embedding-3-small", value: "text-embedding-3-small" },
          { name: "text-embedding-3-large", value: "text-embedding-3-large" },
          { name: "text-embedding-ada-002", value: "text-embedding-ada-002" },
        ],
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
        name: "Generate Embeddings",
        description: "Create text embeddings",
        parameters: {
          model: "text-embedding-3-small",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.embeddingsopenai/",
  },

  "n8n-nodes-base.huggingFaceInference": {
    type: "n8n-nodes-base.huggingFaceInference",
    displayName: "Hugging Face Inference",
    description: "Use Hugging Face models for various AI tasks",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "huggingFaceApi", required: true, description: "Hugging Face API key" },
    ],
    parameters: [
      {
        name: "task",
        type: "options",
        required: true,
        default: "textGeneration",
        description: "Task to perform",
        options: [
          { name: "Audio Classification", value: "audioClassification" },
          { name: "Automatic Speech Recognition", value: "automaticSpeechRecognition" },
          { name: "Feature Extraction", value: "featureExtraction" },
          { name: "Fill Mask", value: "fillMask" },
          { name: "Image Classification", value: "imageClassification" },
          { name: "Image Segmentation", value: "imageSegmentation" },
          { name: "Image to Text", value: "imageToText" },
          { name: "Object Detection", value: "objectDetection" },
          { name: "Question Answering", value: "questionAnswering" },
          { name: "Sentence Similarity", value: "sentenceSimilarity" },
          { name: "Summarization", value: "summarization" },
          { name: "Table Question Answering", value: "tableQuestionAnswering" },
          { name: "Text Classification", value: "textClassification" },
          { name: "Text Generation", value: "textGeneration" },
          { name: "Text to Image", value: "textToImage" },
          { name: "Token Classification", value: "tokenClassification" },
          { name: "Translation", value: "translation" },
          { name: "Zero Shot Classification", value: "zeroShotClassification" },
        ],
      },
      {
        name: "model",
        type: "string",
        required: true,
        default: "",
        description: "Model ID (e.g., gpt2, facebook/bart-large-cnn)",
      },
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Input text",
        displayOptions: { show: { task: ["textGeneration", "summarization", "textClassification", "fillMask", "translation"] } },
      },
    ],
    examples: [
      {
        name: "Text Generation",
        description: "Generate text with a model",
        parameters: {
          task: "textGeneration",
          model: "gpt2",
          text: "Once upon a time",
        },
      },
      {
        name: "Summarization",
        description: "Summarize text",
        parameters: {
          task: "summarization",
          model: "facebook/bart-large-cnn",
          text: "Long article text to summarize...",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.huggingface/",
  },

  "n8n-nodes-base.cohere": {
    type: "n8n-nodes-base.cohere",
    displayName: "Cohere",
    description: "Use Cohere models for text generation and analysis",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "cohereApi", required: true, description: "Cohere API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "text",
        description: "Resource to use",
        options: [
          { name: "Text", value: "text", description: "Text generation" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "generate",
        description: "Operation to perform",
        options: [
          { name: "Generate", value: "generate", description: "Generate text" },
        ],
        displayOptions: { show: { resource: ["text"] } },
      },
      {
        name: "model",
        type: "options",
        required: true,
        default: "command",
        description: "Model to use",
        options: [
          { name: "Command", value: "command" },
          { name: "Command Light", value: "command-light" },
          { name: "Command R", value: "command-r" },
          { name: "Command R+", value: "command-r-plus" },
        ],
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        default: "",
        description: "Prompt text",
      },
    ],
    examples: [
      {
        name: "Generate Text",
        description: "Generate text with Cohere",
        parameters: {
          resource: "text",
          operation: "generate",
          model: "command",
          prompt: "Write a short story about a robot.",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.cohere/",
  },

  "n8n-nodes-base.deepL": {
    type: "n8n-nodes-base.deepL",
    displayName: "DeepL",
    description: "Translate text using DeepL",
    category: "ai",
    subcategory: "translation",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "deepLApi", required: true, description: "DeepL API key" },
    ],
    parameters: [
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Text to translate",
      },
      {
        name: "targetLanguage",
        type: "options",
        required: true,
        default: "EN",
        description: "Target language",
        options: [
          { name: "English", value: "EN" },
          { name: "German", value: "DE" },
          { name: "French", value: "FR" },
          { name: "Spanish", value: "ES" },
          { name: "Italian", value: "IT" },
          { name: "Japanese", value: "JA" },
          { name: "Chinese", value: "ZH" },
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
        name: "Translate Text",
        description: "Translate text to English",
        parameters: {
          text: "Bonjour le monde",
          targetLanguage: "EN",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.deepl/",
  },

  "n8n-nodes-base.googleTranslate": {
    type: "n8n-nodes-base.googleTranslate",
    displayName: "Google Translate",
    description: "Translate text using Google Cloud Translation",
    category: "ai",
    subcategory: "translation",
    typeVersion: 2,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "googleTranslateOAuth2Api", required: true, description: "Google OAuth2 credentials" },
    ],
    parameters: [
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Text to translate",
      },
      {
        name: "translateTo",
        type: "options",
        required: true,
        default: "en",
        description: "Target language code",
        options: [
          { name: "English", value: "en" },
          { name: "Spanish", value: "es" },
          { name: "French", value: "fr" },
          { name: "German", value: "de" },
          { name: "Chinese", value: "zh" },
          { name: "Japanese", value: "ja" },
        ],
      },
    ],
    examples: [
      {
        name: "Translate Text",
        description: "Translate to English",
        parameters: {
          text: "Hola mundo",
          translateTo: "en",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googletranslate/",
  },

  "n8n-nodes-base.stabilityAi": {
    type: "n8n-nodes-base.stabilityAi",
    displayName: "Stability AI",
    description: "Generate images using Stable Diffusion",
    category: "ai",
    subcategory: "image",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "stabilityAiApi", required: true, description: "Stability AI API key" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "textToImage",
        description: "Operation to perform",
        options: [
          { name: "Text to Image", value: "textToImage", description: "Generate image from text" },
          { name: "Image to Image", value: "imageToImage", description: "Transform an image" },
          { name: "Upscale", value: "upscale", description: "Upscale an image" },
        ],
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        default: "",
        description: "Text prompt for generation",
        displayOptions: { show: { operation: ["textToImage", "imageToImage"] } },
      },
      {
        name: "model",
        type: "options",
        required: true,
        default: "stable-diffusion-xl-1024-v1-0",
        description: "Model to use",
        options: [
          { name: "Stable Diffusion XL", value: "stable-diffusion-xl-1024-v1-0" },
          { name: "Stable Diffusion 1.6", value: "stable-diffusion-v1-6" },
        ],
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
        name: "Generate Image",
        description: "Generate an image from text",
        parameters: {
          operation: "textToImage",
          prompt: "A beautiful sunset over mountains",
          model: "stable-diffusion-xl-1024-v1-0",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.stabilityai/",
  },

  "n8n-nodes-base.perplexity": {
    type: "n8n-nodes-base.perplexity",
    displayName: "Perplexity",
    description: "Use Perplexity AI for search and chat",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "perplexityApi", required: true, description: "Perplexity API key" },
    ],
    parameters: [
      {
        name: "model",
        type: "options",
        required: true,
        default: "llama-3.1-sonar-small-128k-online",
        description: "Model to use",
        options: [
          { name: "Sonar Small Online", value: "llama-3.1-sonar-small-128k-online" },
          { name: "Sonar Large Online", value: "llama-3.1-sonar-large-128k-online" },
          { name: "Sonar Huge Online", value: "llama-3.1-sonar-huge-128k-online" },
        ],
      },
      {
        name: "prompt",
        type: "string",
        required: true,
        default: "",
        description: "User prompt",
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
        name: "Search Query",
        description: "Ask Perplexity a question",
        parameters: {
          model: "llama-3.1-sonar-small-128k-online",
          prompt: "What are the latest developments in AI?",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.perplexity/",
  },

  "@n8n/n8n-nodes-langchain.agent": {
    type: "@n8n/n8n-nodes-langchain.agent",
    displayName: "AI Agent",
    description: "Create AI agents with tools and memory",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "agentType",
        type: "options",
        required: true,
        default: "conversationalAgent",
        description: "Type of agent",
        options: [
          { name: "Conversational Agent", value: "conversationalAgent" },
          { name: "OpenAI Functions Agent", value: "openAiFunctionsAgent" },
          { name: "Plan and Execute Agent", value: "planAndExecuteAgent" },
          { name: "ReAct Agent", value: "reActAgent" },
          { name: "SQL Agent", value: "sqlAgent" },
        ],
      },
      {
        name: "text",
        type: "string",
        required: true,
        default: "",
        description: "Input text for the agent",
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
        name: "Create Agent",
        description: "Create a conversational agent",
        parameters: {
          agentType: "conversationalAgent",
          text: "Help me analyze this data",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/",
  },

  "@n8n/n8n-nodes-langchain.chainLlm": {
    type: "@n8n/n8n-nodes-langchain.chainLlm",
    displayName: "Basic LLM Chain",
    description: "Create a basic LLM chain for text generation",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "prompt",
        type: "string",
        required: true,
        default: "",
        description: "Prompt template",
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
        name: "Basic Chain",
        description: "Create a simple LLM chain",
        parameters: {
          prompt: "Translate the following text to French: {text}",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainllm/",
  },

  "@n8n/n8n-nodes-langchain.chainSummarization": {
    type: "@n8n/n8n-nodes-langchain.chainSummarization",
    displayName: "Summarization Chain",
    description: "Summarize long documents using LLMs",
    category: "ai",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    parameters: [
      {
        name: "type",
        type: "options",
        required: true,
        default: "stuff",
        description: "Summarization type",
        options: [
          { name: "Stuff", value: "stuff", description: "Process all at once" },
          { name: "Map Reduce", value: "mapReduce", description: "Summarize in chunks" },
          { name: "Refine", value: "refine", description: "Iteratively refine" },
        ],
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
        name: "Summarize Document",
        description: "Summarize a long document",
        parameters: {
          type: "mapReduce",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainsummarization/",
  },
};
