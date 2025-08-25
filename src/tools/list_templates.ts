import { type ToolMetadata } from "xmcp";
import { listTemplates } from "../templates";

export const schema = {};

export const metadata: ToolMetadata = {
  name: "list_templates",
  description: "List all available image generation templates",
  annotations: {
    title: "List Templates",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

/**
 * List all available image generation templates
 *
 * This tool intentionally does not include the template parameters to avoid
 * sending large payloads to the client. The parameters can be retrieved with the
 * `get_template` tool.
 */
export default function listTemplatesCommand() {
  const templates = listTemplates();

  console.log('Listing templates', templates);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ templates }, null, 2),
      },
    ],
  };
}