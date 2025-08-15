#!/usr/bin/env node
import express, { Request, Response } from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";

// Import helpers
import { loadFonts, type FontConfig, type GoogleFontConfig } from "./helpers/fonts.js";
import { parseHtmlToJsx } from "./helpers/jsx-parser.js";
import { listTemplates, getTemplate } from "../templates/index.js";

// Schema definitions
const GenerateImageArgsSchema = z.object({
  html: z.string().describe("HTML/JSX content as a string or JSON object"),
  width: z.number().default(600).describe("Width of the output image in pixels"),
  height: z.number().default(400).describe("Height of the output image in pixels"),
  outputPath: z.string().describe("Path where the image should be saved"),
  fonts: z
    .array(
      z.object({
        name: z.string(),
        path: z.string(),
        weight: z.number().default(400),
        style: z.enum(["normal", "italic"]).default("normal"),
      })
    )
    .optional()
    .describe("Array of font configurations (local files)"),
  googleFonts: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number().default(400),
        style: z.enum(["normal", "italic"]).default("normal"),
      })
    )
    .optional()
    .describe("Array of Google Fonts to load"),
  style: z.record(z.string(), z.any()).optional().describe("Root container style object"),
});

const GenerateFromTemplateArgsSchema = z.object({
  template: z.string().describe("Name of the template to use"),
  params: z.record(z.string(), z.any()).describe("Parameters for the template"),
  outputPath: z.string().describe("Path where the image should be saved"),
  width: z.number().optional().describe("Width override (uses template default if not specified)"),
  height: z.number().optional().describe("Height override (uses template default if not specified)"),
  googleFonts: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number().default(400),
        style: z.enum(["normal", "italic"]).default("normal"),
      })
    )
    .optional()
    .describe("Array of Google Fonts to load"),
});


// Create a function to get a new server instance for each request
function getServer(): Server {
  const server = new Server(
    {
      name: "satori-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "generate_image",
        description: "Generate an image from HTML/JSX using Satori",
        inputSchema: {
          type: "object",
          properties: {
            html: { type: "string", description: "HTML/JSX content as a string or JSON object" },
            width: { type: "number", description: "Width of the output image in pixels", default: 600 },
            height: { type: "number", description: "Height of the output image in pixels", default: 400 },
            outputPath: { type: "string", description: "Path where the image should be saved" },
            fonts: {
              type: "array",
              description: "Array of font configurations (local files)",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  path: { type: "string" },
                  weight: { type: "number", default: 400 },
                  style: { type: "string", enum: ["normal", "italic"], default: "normal" },
                },
                required: ["name", "path"],
              },
            },
            googleFonts: {
              type: "array",
              description: "Array of Google Fonts to load",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  weight: { type: "number", default: 400 },
                  style: { type: "string", enum: ["normal", "italic"], default: "normal" },
                },
                required: ["name"],
              },
            },
            style: { type: "object", description: "Root container style object" },
          },
          required: ["html", "outputPath"],
        },
      },
      {
        name: "list_templates",
        description: "List all available image generation templates",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "generate_image_from_template",
        description: "Generate an image using a predefined template",
        inputSchema: {
          type: "object",
          properties: {
            template: { type: "string", description: "Name of the template to use" },
            params: { type: "object", description: "Parameters for the template" },
            outputPath: { type: "string", description: "Path where the image should be saved" },
            width: { type: "number", description: "Width override (uses template default if not specified)" },
            height: { type: "number", description: "Height override (uses template default if not specified)" },
            googleFonts: {
              type: "array",
              description: "Array of Google Fonts to load",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  weight: { type: "number", default: 400 },
                  style: { type: "string", enum: ["normal", "italic"], default: "normal" },
                },
                required: ["name"],
              },
            },
          },
          required: ["template", "params", "outputPath"],
        },
      },
    ],
  }));

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "list_templates": {
        try {
          const templates = listTemplates();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ templates }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error listing templates: ${(error as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "generate_image_from_template": {
        try {
          const validated = GenerateFromTemplateArgsSchema.parse(args);
          const { template: templateName, params, outputPath, width, height, googleFonts } = validated;
          
          // Get the template
          const template = getTemplate(templateName);
          if (!template) {
            return {
              content: [
                {
                  type: "text",
                  text: `Template "${templateName}" not found. Use list_templates to see available templates.`,
                },
              ],
              isError: true,
            };
          }
          
          // Generate JSX from template
          const jsxElement = template.generate(params);
          
          // Use template defaults or overrides for dimensions
          const imageWidth = width || template.defaultSize.width;
          const imageHeight = height || template.defaultSize.height;
          
          // Load fonts - use template fonts if not overridden
          const fontsToLoad = googleFonts || template.googleFonts;
          const fonts = await loadFonts(undefined, fontsToLoad as GoogleFontConfig[]);
          
          // Generate SVG with Satori
          const svg = await satori(jsxElement, {
            width: imageWidth,
            height: imageHeight,
            fonts,
          });
          
          // Convert to PNG
          const resvg = new Resvg(svg, {
            fitTo: {
              mode: "width",
              value: imageWidth,
            },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();
          
          // Save the image
          await fs.writeFile(outputPath, pngBuffer);
          
          return {
            content: [
              {
                type: "text",
                text: `Image generated from template "${templateName}" and saved to: ${outputPath}`,
              },
            ],
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            return {
              content: [
                {
                  type: "text",
                  text: `Invalid arguments: ${error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: "text",
                text: `Error generating image from template: ${(error as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "generate_image": {
        try {
          const validated = GenerateImageArgsSchema.parse(args);
          const { html, width, height, outputPath, fonts, googleFonts, style } = validated;

          // Load fonts using helper
          const fontConfigs = await loadFonts(
            fonts as FontConfig[],
            googleFonts as GoogleFontConfig[]
          );

          // Parse HTML/JSX using helper
          const jsxElement = parseHtmlToJsx(html, style);

          // Generate SVG with Satori
          const svg = await satori(jsxElement, {
            width,
            height,
            fonts: fontConfigs,
          });

          // Convert SVG to PNG using resvg-js
          const resvg = new Resvg(svg, {
            fitTo: {
              mode: "width",
              value: width,
            },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();

          // Save the image
          await fs.writeFile(outputPath, pngBuffer);

          return {
            content: [
              {
                type: "text",
                text: `Image generated successfully and saved to: ${outputPath}`,
              },
            ],
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            return {
              content: [
                {
                  type: "text",
                  text: `Invalid arguments: ${error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: "text",
                text: `Error generating image: ${(error as Error).message}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  });

  return server;
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Main MCP endpoint - stateless handler
app.post('/mcp', async (req: Request, res: Response) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.
  
  try {
    const server = getServer(); 
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    
    res.on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// SSE notifications not supported in stateless mode
app.get('/mcp', async (_req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed - SSE not supported in stateless mode"
    },
    id: null
  }));
});

// Session termination not needed in stateless mode
app.delete('/mcp', async (_req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed - sessions not used in stateless mode"
    },
    id: null
  }));
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "satori-mcp-server", version: "1.0.0" });
});

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(PORT, (error?: any) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`Satori MCP Stateless HTTP Server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: POST http://localhost:${PORT}/mcp`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down server...");
  process.exit(0);
});