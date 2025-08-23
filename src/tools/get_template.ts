import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getTemplate as getTemplateFromRegistry, templates } from "../templates";

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

function zodSchemaToJSON(schema: z.ZodType): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(shape)) {
      const zodField = value as z.ZodType;
      result[key] = extractFieldInfo(zodField);
    }

    return result;
  }

  return {};
}

function extractFieldInfo(field: z.ZodType): any {
  let baseField = field;
  let required = true;
  let defaultValue = undefined;

  // Unwrap optional/default modifiers
  if (field instanceof z.ZodOptional) {
    required = false;
    baseField = field._def.innerType;
  } else if (field instanceof z.ZodDefault) {
    defaultValue = field._def.defaultValue();
    baseField = field._def.innerType;
  }

  // Get the base type
  let type = "unknown";
  if (baseField instanceof z.ZodString) {
    type = "string";
  } else if (baseField instanceof z.ZodNumber) {
    type = "number";
  } else if (baseField instanceof z.ZodBoolean) {
    type = "boolean";
  }

  // Get description if available
  const description = (field as any)._def?.description || "";

  const result: any = {
    type,
    required,
    description,
  };

  if (defaultValue !== undefined) {
    result.default = defaultValue;
  }

  return result;
}

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
          text: JSON.stringify({
            error: `Template "${templateName}" not found`,
            availableTemplates,
          }, null, 2),
        },
      ],
    };
  }

  const parameters = zodSchemaToJSON(template.schema);

  const templateDetails = {
    name: template.name,
    description: template.description,
    size: template.size,
    fonts: template.fonts,
    parameters,
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