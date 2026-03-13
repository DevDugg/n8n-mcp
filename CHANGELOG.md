# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-03-13

### Added
- Self-healing workflow tools: `execute_workflow`, `diagnose_execution`, `self_heal_workflow`
- 9-category error classification for automated workflow debugging
- Integration tests with mock n8n API server
- E2E self-healing test suite
- Unit tests for self-healing features (61 total tests)

### Fixed
- Missing template connection in workflow templates

### Improved
- `create_workflow` docs now include `typeVersion` hint

## [1.2.0] - 2026-03-13

### Fixed
- Workflow creation using wrong node `typeVersion` (always defaulted to 1)
- Template parameters updated to match current node type versions

### Added
- `bun-types` dev dependency for TypeScript compilation

## [1.1.0] - 2026-03-13

### Added
- Comprehensive node catalog schemas for 303+ n8n nodes (core, integration, utility)
- New nodes: LDAP, TOTP, Execution Data, Debug Helper, Item Lists, n8n API, Activation Trigger, Chat Trigger, Kafka, MQTT, RabbitMQ, Splunk, AWS services (Textract, Transcribe, Rekognition, Comprehend), Google services (BigQuery, Cloud Natural Language), Cloudflare, Odoo, Mautic, Metabase, Bitwarden
- Modular structure for node catalog organization
- Helper functions for node management
- `dotenv` dependency for environment variable management
- Custom dotenv file path support in server configuration
- Enhanced Slack node descriptions and new operations

### Improved
- Existing node descriptions updated for clarity
- `.gitignore` updated to include `dist` and `.vercel` directories
- Rate limit import refactored to named import syntax

## [1.0.0] - 2026-03-13

### Added
- Initial project structure with MCP server setup
- n8n client integration for workflow management
- Node catalog with base node definitions
- Workflow CRUD tools: `create_workflow`, `update_workflow`, `delete_workflow`, `get_workflow`, `list_workflows`
- Workflow input schemas with settings, nodes, connections
- Express server with rate limiting and CORS
- Stdio transport support
- Zod-based input validation
- Pino structured logging
