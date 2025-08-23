import React from "react";

export function parseJsxString(jsxString: string): React.ReactElement {
  try {
    const jsxJson = JSON.parse(jsxString);
    return createElementFromJson(jsxJson);
  } catch {
    const cleaned = jsxString.trim();
    const tagMatch = cleaned.match(/^<(\w+)([^>]*)>(.*)<\/\1>$/s);
    
    if (tagMatch) {
      const [, tagName, attributes, content] = tagMatch;
      const props: any = {};
      
      const attrRegex = /(\w+)=["']([^"']+)["']/g;
      let match;
      while ((match = attrRegex.exec(attributes)) !== null) {
        props[match[1]] = match[2];
      }
      
      if (attributes.includes('style=')) {
        const styleMatch = attributes.match(/style=["']([^"']+)["']/);
        if (styleMatch) {
          const styleObj: any = {};
          styleMatch[1].split(';').forEach(rule => {
            const [key, value] = rule.split(':').map(s => s.trim());
            if (key && value) {
              const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
              styleObj[camelKey] = value;
            }
          });
          props.style = styleObj;
        }
      }
      
      return React.createElement(tagName, props, content);
    }
    
    return React.createElement('div', {}, jsxString);
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