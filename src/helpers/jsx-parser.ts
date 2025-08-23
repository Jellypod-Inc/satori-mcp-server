import React from "react";
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from "html-react-parser";

// Helper to convert CSS string to React style object
function cssToStyleObject(css: string): React.CSSProperties {
  const style: any = {};
  if (!css) return style;
  
  css.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      // Handle numeric values for properties that expect numbers
      const numericProperties = ['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'order', 'flex', 'flexGrow', 'flexShrink'];
      if (numericProperties.includes(camelProperty) && !isNaN(Number(value))) {
        style[camelProperty] = Number(value);
      } else {
        style[camelProperty] = value;
      }
    }
  });
  
  return style;
}

export function parseJsxString(jsxString: string): React.ReactElement {
  try {
    // First try JSON format for backward compatibility
    const jsxJson = JSON.parse(jsxString);
    return createElementFromJson(jsxJson);
  } catch {
    // Parse HTML/JSX syntax using html-react-parser
    try {
      const options: HTMLReactParserOptions = {
        replace: (domNode) => {
          if (domNode.type === 'tag' && 'attribs' in domNode) {
            const element = domNode as Element;
            const props: any = {};
            
            // Convert attributes to React props
            Object.entries(element.attribs).forEach(([key, value]) => {
              if (key === 'style') {
                props.style = cssToStyleObject(value);
              } else if (key === 'class') {
                props.className = value;
              } else {
                props[key] = value;
              }
            });
            
            // Create React element with converted props
            return React.createElement(
              element.name,
              props,
              element.children && element.children.length > 0
                ? domToReact(element.children as DOMNode[], options)
                : undefined
            );
          }
        }
      };
      
      const result = parse(jsxString, options);
      
      // Ensure we always return a React element
      if (React.isValidElement(result)) {
        return result;
      } else {
        // Wrap non-element content in a div
        return React.createElement('div', {}, result);
      }
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