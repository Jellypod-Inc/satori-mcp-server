import fs from "fs/promises";
import path from "path";

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface FontData {
  name: string;
  data: Buffer;
  weight: FontWeight;
  style: "normal" | "italic";
}

export interface FontConfig {
  name: string;
  path: string;
  weight?: number;
  style?: "normal" | "italic";
}

export interface GoogleFontConfig {
  name: string;
  weight?: number;
  style?: "normal" | "italic";
}

/**
 * Load the default Inter font from the fonts directory
 */
export async function loadDefaultFont(): Promise<FontData[]> {
  try {
    const fontPath = path.join(process.cwd(), "fonts", "Inter-Regular.ttf");
    const fontData = await fs.readFile(fontPath);
    return [
      {
        name: "Inter",
        data: fontData,
        weight: 400 as FontWeight,
        style: "normal" as const,
      },
    ];
  } catch (error) {
    console.error("Warning: Could not load default font:", (error as Error).message);
    return [];
  }
}

/**
 * Fetch a single Google Font
 */
export async function fetchGoogleFont(
  fontName: string,
  weight: FontWeight = 400,
  style: "normal" | "italic" = "normal"
): Promise<FontData> {
  try {
    const fontFamily = fontName.replace(/\s+/g, "+");
    const italicParam = style === "italic" ? "1" : "0";

    const cssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily}:ital,wght@${italicParam},${weight}&display=swap`;

    // Fetch the CSS from Google Fonts
    const cssResponse = await fetch(cssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch Google Font CSS: ${cssResponse.statusText}`);
    }

    const cssData = await cssResponse.text();
    const fontUrlMatch = cssData.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);

    if (!fontUrlMatch) {
      throw new Error(`Could not find font URL for ${fontName} in Google Fonts CSS`);
    }

    // Fetch the actual font file
    const fontUrl = fontUrlMatch[1];
    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font file: ${fontResponse.statusText}`);
    }

    const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());

    return {
      name: fontName,
      data: fontBuffer,
      weight,
      style,
    };
  } catch (error) {
    throw new Error(`Error fetching Google Font ${fontName}: ${(error as Error).message}`);
  }
}

/**
 * Load multiple Google Fonts
 */
export async function loadGoogleFonts(
  googleFonts: GoogleFontConfig[]
): Promise<FontData[]> {
  const fontPromises = googleFonts.map((font) =>
    fetchGoogleFont(
      font.name,
      (font.weight || 400) as FontWeight,
      font.style || "normal"
    )
  );

  try {
    return await Promise.all(fontPromises);
  } catch (error) {
    console.error("Error loading Google Fonts:", (error as Error).message);
    return await loadDefaultFont();
  }
}

/**
 * Load fonts from local files
 */
export async function loadLocalFonts(fonts: FontConfig[]): Promise<FontData[]> {
  const fontConfigs: FontData[] = [];
  
  for (const font of fonts) {
    try {
      const fontData = await fs.readFile(font.path);
      fontConfigs.push({
        name: font.name,
        data: fontData,
        weight: (font.weight || 400) as FontWeight,
        style: font.style || "normal",
      });
    } catch (error) {
      console.error(`Error loading font ${font.name}:`, (error as Error).message);
    }
  }
  
  return fontConfigs;
}

/**
 * Main font loading function that handles both local and Google fonts
 */
export async function loadFonts(
  fonts?: FontConfig[],
  googleFonts?: GoogleFontConfig[]
): Promise<FontData[]> {
  // Prefer Google Fonts if specified
  if (googleFonts && googleFonts.length > 0) {
    return await loadGoogleFonts(googleFonts);
  }

  // Use local fonts if specified
  if (fonts && fonts.length > 0) {
    const fontConfigs = await loadLocalFonts(fonts);
    return fontConfigs.length > 0 ? fontConfigs : await loadDefaultFont();
  }

  // Fall back to default font
  return await loadDefaultFont();
}