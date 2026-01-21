/**
 * E-commerce Integration Nodes
 *
 * Shopify, Stripe, WooCommerce, PayPal, Square, Magento, etc.
 */

import type { NodeSchema } from "../types.js";

export const ECOMMERCE_NODES: Record<string, NodeSchema> = {
  "n8n-nodes-base.shopify": {
    type: "n8n-nodes-base.shopify",
    displayName: "Shopify",
    description: "Manage products, orders, and customers in Shopify",
    category: "ecommerce",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "shopifyApi", required: false, description: "Shopify API credentials" },
      { name: "shopifyAccessToken", required: false, description: "Shopify Access Token" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "product",
        description: "Resource to operate on",
        options: [
          { name: "Order", value: "order", description: "Manage orders" },
          { name: "Product", value: "product", description: "Manage products" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a product" },
          { name: "Delete", value: "delete", description: "Delete a product" },
          { name: "Get", value: "get", description: "Get a product" },
          { name: "Get All", value: "getAll", description: "Get all products" },
          { name: "Update", value: "update", description: "Update a product" },
        ],
        displayOptions: { show: { resource: ["product"] } },
      },
      {
        name: "title",
        type: "string",
        required: true,
        default: "",
        description: "Product title",
        displayOptions: { show: { resource: ["product"], operation: ["create"] } },
      },
      {
        name: "productId",
        type: "string",
        required: true,
        default: "",
        description: "Product ID",
        displayOptions: { show: { resource: ["product"], operation: ["get", "update", "delete"] } },
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
        name: "Create Product",
        description: "Create a new product in Shopify",
        parameters: {
          resource: "product",
          operation: "create",
          title: "New Product",
          additionalFields: { body_html: "<p>Product description</p>", vendor: "My Store" },
        },
      },
      {
        name: "Get Orders",
        description: "Get all orders",
        parameters: {
          resource: "order",
          operation: "getAll",
          returnAll: true,
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.shopify/",
  },

  "n8n-nodes-base.stripe": {
    type: "n8n-nodes-base.stripe",
    displayName: "Stripe",
    description: "Manage payments, customers, and subscriptions in Stripe",
    category: "ecommerce",
    subcategory: "payments",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "stripeApi", required: true, description: "Stripe API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "charge",
        description: "Resource to operate on",
        options: [
          { name: "Balance", value: "balance", description: "Get balance" },
          { name: "Charge", value: "charge", description: "Manage charges" },
          { name: "Coupon", value: "coupon", description: "Manage coupons" },
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Customer Card", value: "customerCard", description: "Manage cards" },
          { name: "Source", value: "source", description: "Manage sources" },
          { name: "Token", value: "token", description: "Create tokens" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a charge" },
          { name: "Get", value: "get", description: "Get a charge" },
          { name: "Get All", value: "getAll", description: "Get all charges" },
          { name: "Update", value: "update", description: "Update a charge" },
        ],
        displayOptions: { show: { resource: ["charge"] } },
      },
      {
        name: "amount",
        type: "number",
        required: true,
        default: 0,
        description: "Amount in cents",
        displayOptions: { show: { resource: ["charge"], operation: ["create"] } },
      },
      {
        name: "currency",
        type: "string",
        required: true,
        default: "usd",
        description: "Currency code",
        displayOptions: { show: { resource: ["charge"], operation: ["create"] } },
      },
      {
        name: "source",
        type: "string",
        required: true,
        default: "",
        description: "Payment source (token or source ID)",
        displayOptions: { show: { resource: ["charge"], operation: ["create"] } },
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
        name: "Create Charge",
        description: "Create a payment charge",
        parameters: {
          resource: "charge",
          operation: "create",
          amount: 2000,
          currency: "usd",
          source: "tok_visa",
          additionalFields: { description: "Order #123" },
        },
      },
      {
        name: "Create Customer",
        description: "Create a new customer",
        parameters: {
          resource: "customer",
          operation: "create",
          additionalFields: { email: "customer@example.com", name: "John Doe" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.stripe/",
  },

  "n8n-nodes-base.wooCommerce": {
    type: "n8n-nodes-base.wooCommerce",
    displayName: "WooCommerce",
    description: "Manage products, orders, and customers in WooCommerce",
    category: "ecommerce",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "wooCommerceApi", required: true, description: "WooCommerce API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "product",
        description: "Resource to operate on",
        options: [
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Order", value: "order", description: "Manage orders" },
          { name: "Product", value: "product", description: "Manage products" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a product" },
          { name: "Delete", value: "delete", description: "Delete a product" },
          { name: "Get", value: "get", description: "Get a product" },
          { name: "Get All", value: "getAll", description: "Get all products" },
          { name: "Update", value: "update", description: "Update a product" },
        ],
        displayOptions: { show: { resource: ["product"] } },
      },
      {
        name: "name",
        type: "string",
        required: true,
        default: "",
        description: "Product name",
        displayOptions: { show: { resource: ["product"], operation: ["create"] } },
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
        name: "Create Product",
        description: "Create a new WooCommerce product",
        parameters: {
          resource: "product",
          operation: "create",
          name: "New Product",
          additionalFields: { regular_price: "29.99", description: "Product description" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.woocommerce/",
  },

  "n8n-nodes-base.payPal": {
    type: "n8n-nodes-base.payPal",
    displayName: "PayPal",
    description: "Manage payments and payouts via PayPal",
    category: "ecommerce",
    subcategory: "payments",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "payPalApi", required: true, description: "PayPal API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "payout",
        description: "Resource to operate on",
        options: [
          { name: "Payout", value: "payout", description: "Manage payouts" },
          { name: "Payout Item", value: "payoutItem", description: "Manage payout items" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a payout" },
          { name: "Get", value: "get", description: "Get a payout" },
        ],
        displayOptions: { show: { resource: ["payout"] } },
      },
      {
        name: "senderBatchId",
        type: "string",
        required: true,
        default: "",
        description: "Unique sender batch ID",
        displayOptions: { show: { resource: ["payout"], operation: ["create"] } },
      },
      {
        name: "items",
        type: "fixedCollection",
        required: true,
        default: {},
        description: "Payout items",
        displayOptions: { show: { resource: ["payout"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Payout",
        description: "Create a batch payout",
        parameters: {
          resource: "payout",
          operation: "create",
          senderBatchId: "batch-123",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.paypal/",
  },

  "n8n-nodes-base.square": {
    type: "n8n-nodes-base.square",
    displayName: "Square",
    description: "Manage payments, customers, and inventory in Square",
    category: "ecommerce",
    subcategory: "payments",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "squareApi", required: true, description: "Square API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "customer",
        description: "Resource to operate on",
        options: [
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
          { name: "Location", value: "location", description: "Get locations" },
          { name: "Payment", value: "payment", description: "Manage payments" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a customer" },
          { name: "Delete", value: "delete", description: "Delete a customer" },
          { name: "Get", value: "get", description: "Get a customer" },
          { name: "Get All", value: "getAll", description: "Get all customers" },
          { name: "Update", value: "update", description: "Update a customer" },
        ],
        displayOptions: { show: { resource: ["customer"] } },
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
        name: "Create Customer",
        description: "Create a new customer in Square",
        parameters: {
          resource: "customer",
          operation: "create",
          additionalFields: { given_name: "John", family_name: "Doe", email_address: "john@example.com" },
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.square/",
  },

  "n8n-nodes-base.magento": {
    type: "n8n-nodes-base.magento",
    displayName: "Magento 2",
    description: "Manage products, orders, and customers in Magento",
    category: "ecommerce",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "magento2Api", required: true, description: "Magento 2 API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "product",
        description: "Resource to operate on",
        options: [
          { name: "Customer", value: "customer", description: "Manage customers" },
          { name: "Invoice", value: "invoice", description: "Manage invoices" },
          { name: "Order", value: "order", description: "Manage orders" },
          { name: "Product", value: "product", description: "Manage products" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a product" },
          { name: "Delete", value: "delete", description: "Delete a product" },
          { name: "Get", value: "get", description: "Get a product" },
          { name: "Get All", value: "getAll", description: "Get all products" },
          { name: "Update", value: "update", description: "Update a product" },
        ],
        displayOptions: { show: { resource: ["product"] } },
      },
      {
        name: "sku",
        type: "string",
        required: true,
        default: "",
        description: "Product SKU",
        displayOptions: { show: { resource: ["product"], operation: ["create", "get", "update", "delete"] } },
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
        name: "Get Product",
        description: "Get a product by SKU",
        parameters: {
          resource: "product",
          operation: "get",
          sku: "PROD-001",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.magento2/",
  },

  "n8n-nodes-base.gumroad": {
    type: "n8n-nodes-base.gumroad",
    displayName: "Gumroad",
    description: "Manage products and sales in Gumroad",
    category: "ecommerce",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "gumroadApi", required: true, description: "Gumroad API token" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "product",
        description: "Resource to operate on",
        options: [
          { name: "Product", value: "product", description: "Manage products" },
          { name: "Sale", value: "sale", description: "Get sales" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a product" },
          { name: "Delete", value: "delete", description: "Delete a product" },
          { name: "Get", value: "get", description: "Get a product" },
          { name: "Get All", value: "getAll", description: "Get all products" },
          { name: "Update", value: "update", description: "Update a product" },
        ],
        displayOptions: { show: { resource: ["product"] } },
      },
      {
        name: "name",
        type: "string",
        required: true,
        default: "",
        description: "Product name",
        displayOptions: { show: { resource: ["product"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Get Products",
        description: "Get all products",
        parameters: {
          resource: "product",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gumroad/",
  },

  "n8n-nodes-base.lemlist": {
    type: "n8n-nodes-base.lemlist",
    displayName: "Lemlist",
    description: "Manage campaigns and leads in Lemlist",
    category: "ecommerce",
    subcategory: "marketing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "lemlistApi", required: true, description: "Lemlist API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "lead",
        description: "Resource to operate on",
        options: [
          { name: "Activity", value: "activity" },
          { name: "Campaign", value: "campaign" },
          { name: "Lead", value: "lead" },
          { name: "Team", value: "team" },
          { name: "Unsubscribe", value: "unsubscribe" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a lead" },
          { name: "Delete", value: "delete", description: "Delete a lead" },
          { name: "Get", value: "get", description: "Get a lead" },
          { name: "Unsubscribe", value: "unsubscribe", description: "Unsubscribe a lead" },
        ],
        displayOptions: { show: { resource: ["lead"] } },
      },
      {
        name: "campaignId",
        type: "resourceLocator",
        required: true,
        default: "",
        description: "Campaign ID",
        displayOptions: { show: { resource: ["lead"] } },
      },
      {
        name: "email",
        type: "string",
        required: true,
        default: "",
        description: "Lead email",
        displayOptions: { show: { resource: ["lead"], operation: ["create"] } },
      },
    ],
    examples: [
      {
        name: "Create Lead",
        description: "Add a lead to a campaign",
        parameters: {
          resource: "lead",
          operation: "create",
          campaignId: "campaign-id",
          email: "lead@example.com",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.lemlist/",
  },

  "n8n-nodes-base.saleor": {
    type: "n8n-nodes-base.saleor",
    displayName: "Saleor",
    description: "Manage products and orders in Saleor",
    category: "ecommerce",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "saleorApi", required: true, description: "Saleor API credentials" },
    ],
    parameters: [
      {
        name: "operation",
        type: "options",
        required: true,
        default: "getProducts",
        description: "Operation to perform",
        options: [
          { name: "Get Products", value: "getProducts", description: "Get products" },
          { name: "Get Orders", value: "getOrders", description: "Get orders" },
          { name: "Get Customers", value: "getCustomers", description: "Get customers" },
        ],
      },
    ],
    examples: [
      {
        name: "Get Products",
        description: "Retrieve all products",
        parameters: {
          operation: "getProducts",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.saleor/",
  },

  "n8n-nodes-base.bigCommerce": {
    type: "n8n-nodes-base.bigCommerce",
    displayName: "BigCommerce",
    description: "Manage products, orders, and customers in BigCommerce",
    category: "ecommerce",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "bigCommerceApi", required: true, description: "BigCommerce API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "product",
        description: "Resource to operate on",
        options: [
          { name: "Customer", value: "customer" },
          { name: "Order", value: "order" },
          { name: "Product", value: "product" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "get",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a product" },
          { name: "Delete", value: "delete", description: "Delete a product" },
          { name: "Get", value: "get", description: "Get a product" },
          { name: "Get All", value: "getAll", description: "Get all products" },
          { name: "Update", value: "update", description: "Update a product" },
        ],
        displayOptions: { show: { resource: ["product"] } },
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
        name: "Get Products",
        description: "Get all products",
        parameters: {
          resource: "product",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.bigcommerce/",
  },

  "n8n-nodes-base.chargebee": {
    type: "n8n-nodes-base.chargebee",
    displayName: "Chargebee",
    description: "Manage subscriptions and customers in Chargebee",
    category: "ecommerce",
    subcategory: "subscriptions",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "chargebeeApi", required: true, description: "Chargebee API key" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "customer",
        description: "Resource to operate on",
        options: [
          { name: "Customer", value: "customer" },
          { name: "Invoice", value: "invoice" },
          { name: "Subscription", value: "subscription" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a customer" },
        ],
        displayOptions: { show: { resource: ["customer"] } },
      },
    ],
    examples: [
      {
        name: "Create Customer",
        description: "Create a new customer",
        parameters: {
          resource: "customer",
          operation: "create",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.chargebee/",
  },

  "n8n-nodes-base.paddle": {
    type: "n8n-nodes-base.paddle",
    displayName: "Paddle",
    description: "Manage payments and subscriptions in Paddle",
    category: "ecommerce",
    subcategory: "subscriptions",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "paddleApi", required: true, description: "Paddle API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "coupon",
        description: "Resource to operate on",
        options: [
          { name: "Coupon", value: "coupon" },
          { name: "Payment", value: "payment" },
          { name: "Plan", value: "plan" },
          { name: "Product", value: "product" },
          { name: "User", value: "user" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create a coupon" },
          { name: "Get All", value: "getAll", description: "Get all coupons" },
          { name: "Update", value: "update", description: "Update a coupon" },
        ],
        displayOptions: { show: { resource: ["coupon"] } },
      },
    ],
    examples: [
      {
        name: "Get Products",
        description: "Get all products",
        parameters: {
          resource: "product",
          operation: "getAll",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.paddle/",
  },

  "n8n-nodes-base.invoiceNinja": {
    type: "n8n-nodes-base.invoiceNinja",
    displayName: "Invoice Ninja",
    description: "Manage invoices, clients, and payments",
    category: "ecommerce",
    subcategory: "invoicing",
    typeVersion: 1,
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      { name: "invoiceNinjaApi", required: true, description: "Invoice Ninja API credentials" },
    ],
    parameters: [
      {
        name: "resource",
        type: "options",
        required: true,
        default: "invoice",
        description: "Resource to operate on",
        options: [
          { name: "Client", value: "client" },
          { name: "Expense", value: "expense" },
          { name: "Invoice", value: "invoice" },
          { name: "Payment", value: "payment" },
          { name: "Quote", value: "quote" },
          { name: "Task", value: "task" },
        ],
      },
      {
        name: "operation",
        type: "options",
        required: true,
        default: "create",
        description: "Operation to perform",
        options: [
          { name: "Create", value: "create", description: "Create an invoice" },
          { name: "Delete", value: "delete", description: "Delete an invoice" },
          { name: "Email", value: "email", description: "Email an invoice" },
          { name: "Get", value: "get", description: "Get an invoice" },
          { name: "Get All", value: "getAll", description: "Get all invoices" },
        ],
        displayOptions: { show: { resource: ["invoice"] } },
      },
    ],
    examples: [
      {
        name: "Create Invoice",
        description: "Create a new invoice",
        parameters: {
          resource: "invoice",
          operation: "create",
        },
      },
    ],
    documentationUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.invoiceninja/",
  },
};
