import React from "react";
import { z } from "zod";
import { Font } from "../helpers/fonts";

export interface Template<T extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  size: { width: number; height: number };
  fonts: [Font, ...Font[]];
  schema: T;
  generate: (params: z.infer<T>) => React.ReactElement;
}

import { socialCardTemplate } from "./social-card";
import { blogHeaderTemplate } from "./blog-header";
import { quoteTemplate } from "./quote";

export const templates: Record<string, Template<any>> = {
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