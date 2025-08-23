# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Satori MCP (Model Context Protocol) server that generates images from React components. Built with the xmcp TypeScript framework for creating AI tools with Model Context Protocol support.

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production HTTP server
pnpm start
# or
node dist/http.js
```

## Architecture

### Framework Structure
- **xmcp**: TypeScript-first framework for building MCP applications
- **Auto-discovery**: Tools automatically discovered from `src/tools/` directory
- **Transport**: HTTP transport configured via `xmcp.config.ts`
- **Build Output**: Compiled to `dist/` directory

### Tool Structure
Each tool in `src/tools/` must export:
1. `schema`: Zod schema defining input parameters
2. `metadata`: Tool configuration with name, description, and behavior hints
3. `default` function: Async or sync implementation returning tool response

### Tool Response Format
Tools should return either:
- Plain string/object (automatically wrapped)
- MCP-compliant response: `{ content: [{ type: "text", text: "..." }] }`

## Adding New Tools

Create a new `.ts` file in `src/tools/`:

```typescript
import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";

export const schema = {
  paramName: z.string().describe("Parameter description"),
};

export const metadata: ToolMetadata = {
  name: "tool_name",
  description: "Tool description",
  annotations: {
    title: "Tool Title",
    readOnlyHint: true,      // Tool doesn't modify state
    destructiveHint: false,   // Tool is safe to run
    idempotentHint: true,     // Multiple calls yield same result
  },
};

export default async function toolName(params: InferSchema<typeof schema>) {
  // Implementation
  return {
    content: [{ type: "text", text: "result" }],
  };
}
```

## Deployment

### Vercel Deployment (Zero Configuration)
```bash
# Deploy to Vercel
vc deploy

# The framework supports Vercel deployment out of the box
```

### Configuration Options
The `xmcp.config.ts` file supports:
- `http`: Enable HTTP transport
- `toolsDirectory`: Custom tools location (default: `src/tools`)
- `middleware`: Custom HTTP middleware path
- Authentication options (API key, JWT, OAuth)

## TypeScript Configuration

- **Strict Mode**: Enabled for type safety
- **Target**: ES2016
- **Module**: CommonJS
- **Root**: `./src` directory
- **Include**: `xmcp-env.d.ts` and all TypeScript files in `src/`