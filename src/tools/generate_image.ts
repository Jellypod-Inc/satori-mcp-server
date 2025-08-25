import { z } from "zod";
import type { ToolMetadata, InferSchema } from "xmcp";
import satori, { FontWeight } from "satori";
import parse from "html-react-parser";
import { loadFonts } from "../helpers/fonts";
import { svgToImage } from "../helpers/svg-to-image";
import { saveBlob } from "../helpers/save-blob";

export const schema = {
  html: z.string().describe("HTML string with inline styles (e.g., '<div style=\"color: red\">Hello</div>')"),
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
  description: "Generate an image from HTML using Satori",
  annotations: {
    title: "Generate Image from HTML",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};


export default async function generateImage(params: InferSchema<typeof schema>) {
  const { html, width, height, fonts } = params;
  console.log('Generating image from HTML');

  const fontData = await loadFonts(fonts.map(f => ({
    name: f.name,
    weight: f.weight as FontWeight,
    style: f.style,
  })));

  const template = parse(html);
  const svg = await satori(template, {
    width,
    height,
    fonts: fontData,
  });

  const blob = await svgToImage(svg, width);

  const url = await saveBlob(blob, "image.png");

  return {
    content: [
      {
        type: "text",
        text: `Image saved to: ${url}`,
      },
    ],
  };
}