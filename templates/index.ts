import { blogPostTemplate } from './blog-post.js';
import { socialCardTemplate } from './social-card.js';
import { productShowcaseTemplate } from './product-showcase.js';
import { quoteTemplate } from './quote.js';
import { announcementTemplate } from './announcement.js';

export interface Template {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description: string;
    default?: any;
    enum?: string[];
  }>;
  defaultSize: {
    width: number;
    height: number;
  };
  googleFonts?: Array<{
    name: string;
    weight: number;
    style: 'normal' | 'italic';
  }>;
  generate: (params: any) => any;
}

// Export all templates as a map
export const templates: Record<string, Template> = {
  'blog-post': blogPostTemplate,
  'social-card': socialCardTemplate,
  'product-showcase': productShowcaseTemplate,
  'quote': quoteTemplate,
  'announcement': announcementTemplate,
};

// Export individual templates for direct import
export {
  blogPostTemplate,
  socialCardTemplate,
  productShowcaseTemplate,
  quoteTemplate,
  announcementTemplate,
};

// Helper function to get template by name
export function getTemplate(name: string): Template | undefined {
  return templates[name];
}

// Helper function to list all available templates
export function listTemplates(): Array<{ name: string; description: string; parameters: any }> {
  return Object.entries(templates).map(([name, template]) => ({
    name,
    description: template.description,
    parameters: template.parameters,
  }));
}