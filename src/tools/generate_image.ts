import { z } from "zod";
import type { ToolMetadata, InferSchema } from "xmcp";
import satori, { FontWeight } from "satori";
import { loadFonts } from "../helpers/fonts";
import { parseJsxString } from "../helpers/jsx-parser";
import { svgToImage } from "../helpers/svg-to-image";
import { saveBlob } from "../helpers/save-blob";

export const schema = {
  jsx: z.string().describe("JSX content as a string (e.g., '<div>Hello</div>')"),
  width: z.number().default(600).describe("Width of the output image in pixels"),
  height: z.number().default(400).describe("Height of the output image in pixels"),
  fonts: z
    .array(
      z.object({
        name: z.string().default("Inter").describe("Name of the Google Font to load"),
        weight: z.number().min(100).max(900).default(400).describe("Weight of the font (100-900)"),
        style: z.enum(["normal", "italic"]).default("normal"),
      })
    )
    .optional()
    .default([{ name: "Inter", weight: 400, style: "normal" }])
    .describe("Array of Fonts to load from Google Fonts"),
};

export const metadata: ToolMetadata = {
  name: "generate_image",
  description: "Generate an image from JSX using Satori",
  annotations: {
    title: "Generate Image from JSX",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};


export default async function generateImage(params: InferSchema<typeof schema>) {
  const { jsx, width, height, fonts } = params;

  const fontData = await loadFonts(fonts.map(f => ({
    name: f.name,
    weight: f.weight as FontWeight,
    style: f.style,
  })));

  const jsxElement = parseJsxString(jsx);

  const svg = await satori(jsxElement, {
    width,
    height,
    fonts: fontData,
  });

  const blob = await svgToImage(svg, width);

  const url = await saveBlob(blob, "image.webp");

  return {
    content: [
      {
        type: "text",
        text: `Image saved to: ${url}`,
      },
    ],
  };
}