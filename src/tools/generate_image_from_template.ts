import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import satori from "satori";
import { getTemplate, listTemplates } from "../templates";
import { svgToImage } from "../helpers/svg-to-image";
import { saveBlob } from "../helpers/save-blob";
import { loadGoogleFont, FontData, loadFonts } from "../helpers/fonts";

export const schema = {
  template: z.string().describe("Name of the template to use"),
  params: z.record(z.string(), z.any()).describe("Parameters for the template"),
};

export const metadata: ToolMetadata = {
  name: "generate_image_from_template",
  description: "Generate an image using a predefined template",
  annotations: {
    title: "Generate Image from Template",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

/**
 * Generate an image using a predefined template.
 *
 * You must provide the name of the template to use and an object with the
 * key/value pairs for the template parameters.
 */
export default async function generateImageFromTemplate(params: InferSchema<typeof schema>) {
  const { template: templateName, params: templateParams } = params;

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

  // Validate params with the template's Zod schema
  const validationResult = template.schema.safeParse(templateParams);
  if (!validationResult.success) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid parameters for template "${templateName}": ${validationResult.error.format()._errors.join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  const jsxElement = template.generate(validationResult.data);

  const fontData = await loadFonts(template.fonts);

  // Generate SVG image
  const imageWidth = template.size.width;
  const imageHeight = template.size.height;
  const svg = await satori(jsxElement, {
    width: imageWidth,
    height: imageHeight,
    fonts: fontData,
  });

  // Convert SVG to WebP
  const blob = await svgToImage(svg, imageWidth);

  // Save image to Vercel Blob Storage
  const fileName = `${templateName}.webp`;
  const url = await saveBlob(blob, fileName);

  return {
    content: [
      {
        type: "text",
        text: `Image generated from template "${templateName}" and saved to: ${url}`,
      },
    ],
  };
}