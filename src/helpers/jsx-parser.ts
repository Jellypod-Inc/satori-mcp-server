/**
 * Parse HTML string to JSX object for Satori
 * 
 * Accepts:
 * - JSON string representing a JSX object with type and props
 * - JSON string with style and children/text properties
 * - Plain text string (will be wrapped in a div)
 */
export function parseHtmlToJsx(
  htmlString: string,
  rootStyle: Record<string, any> = {}
): any {
  try {
    const parsed = JSON.parse(htmlString);

    if (typeof parsed === "object" && parsed !== null) {
      // Already a proper JSX object with type and props
      if (parsed.type && parsed.props) {
        return parsed;
      }

      // Object with style/children/text properties
      return {
        type: "div",
        props: {
          style: { ...rootStyle, ...parsed.style },
          children: parsed.children || parsed.text || "",
        },
      };
    }

    // Parsed to a primitive value, wrap it
    return {
      type: "div",
      props: {
        style: rootStyle,
        children: htmlString,
      },
    };
  } catch {
    // Not valid JSON, treat as plain text
    return {
      type: "div",
      props: {
        style: rootStyle,
        children: htmlString,
      },
    };
  }
}