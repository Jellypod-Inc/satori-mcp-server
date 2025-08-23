import React from "react";

export interface Template {
  name: string;
  description: string;
  defaultSize: { width: number; height: number };
  googleFonts?: Array<{ name: string; weight: number; style: string }>;
  generate: (params: any) => React.ReactElement;
}

import { socialCardTemplate } from "./social-card";
import { blogHeaderTemplate } from "./blog-header";
import { quoteTemplate } from "./quote";

export const templates: Record<string, Template> = {
  "social-card": socialCardTemplate,
  "blog-header": blogHeaderTemplate,
  "quote": quoteTemplate,
};

export function getTemplate(name: string): Template | undefined {
  return templates[name];
}

export function listTemplates(): Array<{ name: string; description: string }> {
  return Object.entries(templates).map(([name, template]) => ({
    name,
    description: template.description,
  }));
}