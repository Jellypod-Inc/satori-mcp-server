import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";
import { loadGoogleFont, loadLocalFonts, type FontConfig } from "./helpers/fonts";
import { parseJsxString } from "./helpers/jsx-parser";

export const schema = {
  jsx: z.string().describe("JSX content as a string (e.g., '<div>Hello</div>')"),
  width: z.number().default(600).describe("Width of the output image in pixels"),
  height: z.number().default(400).describe("Height of the output image in pixels"),
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
    .describe("Array of additional Google Fonts to load"),
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
  const { jsx, width, height, outputPath, googleFonts } = params;

  // Always load all local fonts from the fonts directory
  const localFonts = await loadLocalFonts();

  // Optionally add Google Fonts
  if (googleFonts) {
    for (const font of googleFonts) {
      const data = await loadGoogleFont(font.name, font.weight, font.style);
      
      // Ensure weight is a valid Weight type (100-900 in increments of 100)
      type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
      const standardWeights: Weight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      const weight = standardWeights.reduce((prev, curr) => 
        Math.abs(curr - font.weight) < Math.abs(prev - font.weight) ? curr : prev
      ) as Weight;
      
      localFonts.push({
        name: font.name,
        data,
        weight,
        style: font.style,
      });
    }
  }

  const jsxElement = parseJsxString(jsx);

  const svg = await satori(jsxElement, {
    width,
    height,
    fonts: localFonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  await fs.writeFile(outputPath, pngBuffer);

  return {
    content: [
      {
        type: "text",
        text: `Image generated successfully and saved to: ${outputPath}`,
      },
    ],
  };
}