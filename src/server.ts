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
import path from "path";

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

const GenerateOgImageArgsSchema = z.object({
  title: z.string().describe("Main title text"),
  subtitle: z.string().optional().describe("Subtitle or description text"),
  backgroundColor: z.string().default("white").describe("Background color (CSS color)"),
  titleColor: z.string().default("black").describe("Title text color"),
  subtitleColor: z.string().default("#666").describe("Subtitle text color"),
  outputPath: z.string().describe("Path where the image should be saved"),
  googleFonts: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number().default(400),
        style: z.enum(["normal", "italic"]).default("normal"),
      })
    )
    .optional()
    .describe("Array of Google Fonts to use"),
});

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

interface FontData {
  name: string;
  data: Buffer;
  weight: FontWeight;
  style: "normal" | "italic";
}

// Helper functions
async function loadDefaultFont(): Promise<FontData[]> {
  try {
    const fontPath = path.join(process.cwd(), "fonts", "Inter-Regular.ttf");
    const fontData = await fs.readFile(fontPath);
    return [
      {
        name: "Inter",
        data: fontData,
        weight: 400 as FontWeight,
        style: "normal" as const,
      },
    ];
  } catch (error) {
    console.error("Warning: Could not load default font:", (error as Error).message);
    return [];
  }
}

async function fetchGoogleFont(
  fontName: string,
  weight: FontWeight = 400,
  style: "normal" | "italic" = "normal"
): Promise<FontData> {
  try {
    const fontFamily = fontName.replace(/\s+/g, "+");
    const italicParam = style === "italic" ? "1" : "0";

    const cssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily}:ital,wght@${italicParam},${weight}&display=swap`;

    // Fetch the CSS from Google Fonts
    const cssResponse = await fetch(cssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch Google Font CSS: ${cssResponse.statusText}`);
    }

    const cssData = await cssResponse.text();
    const fontUrlMatch = cssData.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);

    if (!fontUrlMatch) {
      throw new Error(`Could not find font URL for ${fontName} in Google Fonts CSS`);
    }

    // Fetch the actual font file
    const fontUrl = fontUrlMatch[1];
    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font file: ${fontResponse.statusText}`);
    }

    const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());

    return {
      name: fontName,
      data: fontBuffer,
      weight,
      style,
    };
  } catch (error) {
    throw new Error(`Error fetching Google Font ${fontName}: ${(error as Error).message}`);
  }
}

async function loadGoogleFonts(
  googleFonts: Array<{ name: string; weight?: number; style?: "normal" | "italic" }>
): Promise<FontData[]> {
  const fontPromises = googleFonts.map((font) =>
    fetchGoogleFont(font.name, (font.weight || 400) as FontWeight, font.style || "normal")
  );

  try {
    return await Promise.all(fontPromises);
  } catch (error) {
    console.error("Error loading Google Fonts:", (error as Error).message);
    return await loadDefaultFont();
  }
}

async function loadFonts(
  fonts?: Array<{ name: string; path: string; weight?: number; style?: "normal" | "italic" }>,
  googleFonts?: Array<{ name: string; weight?: number; style?: "normal" | "italic" }>
): Promise<FontData[]> {
  if (googleFonts && googleFonts.length > 0) {
    return await loadGoogleFonts(googleFonts);
  }

  if (fonts && fonts.length > 0) {
    const fontConfigs: FontData[] = [];
    for (const font of fonts) {
      try {
        const fontData = await fs.readFile(font.path);
        fontConfigs.push({
          name: font.name,
          data: fontData,
          weight: (font.weight || 400) as FontWeight,
          style: font.style || "normal",
        });
      } catch (error) {
        console.error(`Error loading font ${font.name}:`, (error as Error).message);
      }
    }
    return fontConfigs.length > 0 ? fontConfigs : await loadDefaultFont();
  }

  return await loadDefaultFont();
}

function parseHtmlToJsx(htmlString: string, rootStyle: Record<string, any> = {}): any {
  try {
    const parsed = JSON.parse(htmlString);

    if (typeof parsed === "object" && parsed !== null) {
      if (parsed.type && parsed.props) {
        return parsed;
      }

      return {
        type: "div",
        props: {
          style: { ...rootStyle, ...parsed.style },
          children: parsed.children || parsed.text || "",
        },
      };
    }

    return {
      type: "div",
      props: {
        style: rootStyle,
        children: htmlString,
      },
    };
  } catch {
    return {
      type: "div",
      props: {
        style: rootStyle,
        children: htmlString,
      },
    };
  }
}

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
        name: "generate_og_image",
        description: "Generate an Open Graph image with a predefined template",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Main title text" },
            subtitle: { type: "string", description: "Subtitle or description text" },
            backgroundColor: { type: "string", description: "Background color (CSS color)", default: "white" },
            titleColor: { type: "string", description: "Title text color", default: "black" },
            subtitleColor: { type: "string", description: "Subtitle text color", default: "#666" },
            outputPath: { type: "string", description: "Path where the image should be saved" },
            googleFonts: {
              type: "array",
              description: "Array of Google Fonts to use",
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
          required: ["title", "outputPath"],
        },
      },
    ],
  }));

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "generate_image": {
        try {
          const validated = GenerateImageArgsSchema.parse(args);
          const { html, width, height, outputPath, fonts, googleFonts, style } = validated;

          // Load fonts
          const fontConfigs = await loadFonts(fonts, googleFonts);

          // Parse HTML/JSX
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

      case "generate_og_image": {
        try {
          const validated = GenerateOgImageArgsSchema.parse(args);
          const { title, subtitle, backgroundColor, titleColor, subtitleColor, outputPath, googleFonts } = validated;

          // Load fonts
          const fonts = await loadFonts(undefined, googleFonts);

          // Create JSX template for OG image
          const jsxElement = {
            type: "div",
            props: {
              style: {
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor,
                padding: "60px",
              },
              children: [
                {
                  type: "h1",
                  props: {
                    style: {
                      fontSize: "60px",
                      fontWeight: "bold",
                      color: titleColor,
                      margin: 0,
                      textAlign: "center",
                    },
                    children: title,
                  },
                },
                subtitle
                  ? {
                      type: "p",
                      props: {
                        style: {
                          fontSize: "30px",
                          color: subtitleColor,
                          marginTop: "20px",
                          textAlign: "center",
                        },
                        children: subtitle,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          };

          // Generate SVG with standard OG image dimensions
          const svg = await satori(jsxElement, {
            width: 1200,
            height: 630,
            fonts,
          });

          // Convert to PNG using resvg-js
          const resvg = new Resvg(svg, {
            fitTo: {
              mode: "width",
              value: 1200,
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
                text: `Open Graph image generated successfully and saved to: ${outputPath}`,
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
                text: `Error generating OG image: ${(error as Error).message}`,
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
app.get('/mcp', async (req: Request, res: Response) => {
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
app.delete('/mcp', async (req: Request, res: Response) => {
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
app.get("/health", (req: Request, res: Response) => {
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