import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export function parseJsxString(jsxString: string): React.ReactElement {
  try {
    // First try JSON format for backward compatibility
    const jsxJson = JSON.parse(jsxString);
    return createElementFromJson(jsxJson);
  } catch {
    // Parse JSX-like syntax using htm
    try {
      // htm uses template literal syntax, so we evaluate it
      const func = new Function('html', `return html\`${jsxString}\`;`);
      return func(html);
    } catch (error) {
      // Fallback: treat as plain text
      console.warn('Failed to parse JSX:', error);
      return React.createElement('div', {}, jsxString);
    }
  }
}

function createElementFromJson(json: any): React.ReactElement {
  if (typeof json === 'string') {
    return json as any;
  }
  
  const { type, props, children } = json;
  const processedChildren = children ? 
    (Array.isArray(children) ? children : [children]).map((child: any) => 
      typeof child === 'object' ? createElementFromJson(child) : child
    ) : undefined;
  
  return React.createElement(type, props, processedChildren);
}