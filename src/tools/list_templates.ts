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

export default function listTemplatesCommand() {
  const templates = listTemplates();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ templates }, null, 2),
      },
    ],
  };
}