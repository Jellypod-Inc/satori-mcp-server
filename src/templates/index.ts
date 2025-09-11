import * as React from "react";
import { z } from "zod";
import { Font } from "../helpers/fonts";
import { socialCardTemplate } from "./social-card";
import { blogHeaderTemplate } from "./blog-header";
import { quoteTemplate } from "./quote";
import { geometricTemplate } from "./geometric";
import { subtleGradientTemplate } from "./subtle-gradient";
import { startupTemplate } from "./startup";
import { portraitTemplate } from "./portrait";
import { podcastCardTemplate } from "./podcast-card";
import { sidePanelTemplate } from "./side-panel";

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
  "quote": quoteTemplate,
  "geometric": geometricTemplate,
  "subtle-gradient": subtleGradientTemplate,
  "startup": startupTemplate,
  "portrait": portraitTemplate,
  "podcast-card": podcastCardTemplate,
  "side-panel": sidePanelTemplate,
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