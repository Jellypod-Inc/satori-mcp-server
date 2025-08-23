import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import satori from "satori";
import fs from "fs/promises";
import { getTemplate, listTemplates } from "../templates";
import { svgToImage } from "../helpers/svg-to-image";

export const schema = {
  template: z.string().describe("Name of the template to use"),
  params: z.record(z.string(), z.any()).describe("Parameters for the template"),
  outputPath: z.string().describe("Path where the image should be saved"),
  width: z.number().optional().describe("Width override (uses template default if not specified)"),
  height: z.number().optional().describe("Height override (uses template default if not specified)"),
  format: z.enum(["png", "webp"]).default("webp").describe("Output image format"),
  quality: z.number().min(1).max(100).default(80).describe("WebP quality (1-100)"),
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
};

export const metadata: ToolMetadata = {
  name: "generate_from_template",
  description: "Generate an image using a predefined template",
  annotations: {
    title: "Generate Image from Template",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

async function loadGoogleFont(name: string, weight: number = 400, style: string = "normal"): Promise<ArrayBuffer> {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:ital,wght@${style === "italic" ? 1 : 0},${weight}&display=swap`;

  const cssResponse = await fetch(fontUrl);
  const css = await cssResponse.text();

  const fontUrlMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!fontUrlMatch) {
    throw new Error(`Could not find font URL for ${name}`);
  }

  const fontResponse = await fetch(fontUrlMatch[1]);
  return fontResponse.arrayBuffer();
}

export default async function generateFromTemplate(params: InferSchema<typeof schema>) {
  const { template: templateName, params: templateParams, outputPath, width, height, format, quality, googleFonts } = params;

  const template = getTemplate(templateName);
  if (!template) {
    const availableTemplates = listTemplates().map(t => t.name).join(", ");
    return {
      content: [
        {
          type: "text",
          text: `Template "${templateName}" not found. Available templates: ${availableTemplates}`,
        },
      ],
      isError: true,
    };
  }

  const jsxElement = template.generate(templateParams);

  const imageWidth = width || template.defaultSize.width;
  const imageHeight = height || template.defaultSize.height;

  const fontsToLoad = googleFonts || template.googleFonts || [];
  const fontConfigs: any[] = [];

  for (const font of fontsToLoad) {
    const data = await loadGoogleFont(font.name, font.weight, font.style);
    fontConfigs.push({
      name: font.name,
      data,
      weight: font.weight,
      style: font.style,
    });
  }

  if (fontConfigs.length === 0) {
    const defaultFontData = await loadGoogleFont("Inter", 400, "normal");
    fontConfigs.push({
      name: "Inter",
      data: defaultFontData,
      weight: 400,
      style: "normal",
    });
  }

  const svg = await satori(jsxElement, {
    width: imageWidth,
    height: imageHeight,
    fonts: fontConfigs,
  });

  const imageBuffer = await svgToImage(svg, imageWidth);

  await fs.writeFile(outputPath, imageBuffer);

  return {
    content: [
      {
        type: "text",
        text: `Image generated from template "${templateName}" and saved to: ${outputPath}`,
      },
    ],
  };
}