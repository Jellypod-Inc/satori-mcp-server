import * as React from "react";
import { z } from "zod";
import { Font } from "../helpers/fonts";
import { socialCardTemplate } from "./social-card";
import { blogHeaderTemplate } from "./blog-header";
import { socialCardGridTemplate } from "./social-card-grid";
import { quoteTemplate } from "./quote";
import { geometricTemplate } from "./geometric";

export interface Template<T extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  size: { width: number; height: number };
  fonts: [Font, ...Font[]];
  schema: T;
  generate: (params: z.infer<T>) => React.ReactElement;
}

export const templates: Record<string, Template<any>> = {
  "social-card": socialCardTemplate,
  "blog-header": blogHeaderTemplate,
  "social-card-grid": socialCardGridTemplate,
  "quote": quoteTemplate,
  "geometric": geometricTemplate,
};

export function getTemplate(name: string): Template | undefined {
  return templates[name.trim()];
}

export function listTemplates(): Array<{ name: string; description: string; size: { width: number; height: number } }> {
  return Object.entries(templates).map(([name, template]) => ({
    name,
    description: template.description,
    size: template.size,
  }));
}