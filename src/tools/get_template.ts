import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getTemplate as getTemplateFromRegistry, templates } from "../templates";
import { zodToJsonSchema } from "zod-to-json-schema";

export const schema = {
  template: z.string().describe("Name of the template to get details for"),
};

export const metadata: ToolMetadata = {
  name: "get_template",
  description: "Get the schema and required parameters for a specific template",
  annotations: {
    title: "Get Template Details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};


/**
 * Get the schema and required parameters for a specific template
 */
export default async function getTemplate(params: InferSchema<typeof schema>) {
  const { template: templateName } = params;

  const template = getTemplateFromRegistry(templateName);

  if (!template) {
    const availableTemplates = Object.keys(templates);
    return {
      content: [
        {
          type: "text",
          text: `Template "${templateName}" not found. Available templates: ${availableTemplates.join(", ")}`,
        },
      ],
    };
  }

  const jsonSchema = zodToJsonSchema(template.schema);

  const templateDetails = {
    name: template.name,
    description: template.description,
    size: template.size,
    fonts: template.fonts,
    parameters: jsonSchema,
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(templateDetails, null, 2),
      },
    ],
  };
}