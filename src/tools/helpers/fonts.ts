import { fontImports } from "../../fonts/font-data";

// Match Satori's Weight type
type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface FontConfig {
  name: string;
  data: Buffer;  // Satori accepts Buffer in Node.js
  weight: Weight;
  style: "normal" | "italic";
}

export async function loadGoogleFont(name: string, weight: number = 400, style: string = "normal"): Promise<Buffer> {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:ital,wght@${style === "italic" ? 1 : 0},${weight}&display=swap`;

  const cssResponse = await fetch(fontUrl);
  const css = await cssResponse.text();

  const fontUrlMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!fontUrlMatch) {
    throw new Error(`Could not find font URL for ${name}`);
  }

  const fontResponse = await fetch(fontUrlMatch[1]);
  const arrayBuffer = await fontResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function loadLocalFonts(): Promise<FontConfig[]> {
  const fonts: FontConfig[] = [];
  
  // Process all imported fonts
  for (const fontImport of fontImports) {
    // Convert base64 string or data URL to Buffer
    // Webpack gives us data URLs, but our script extracts just the base64 part
    const buffer = Buffer.from(fontImport.data, "base64");
    
    // Satori can work directly with Buffer in Node.js, no need to convert to ArrayBuffer
    const data = buffer;
    
    // Determine style from font metadata
    const style: "normal" | "italic" = fontImport.hasItalic ? "italic" : "normal";
    
    if (fontImport.isVariable) {
      // Variable font - register for all weights in range
      const weightRange = fontImport.weights as { min: number; max: number; default: number };
      
      // Generate standard weight values within the font's range
      const standardWeights: Weight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      const availableWeights = standardWeights.filter(w => w >= weightRange.min && w <= weightRange.max);
      
      for (const weight of availableWeights) {
        fonts.push({
          name: fontImport.family,
          data,
          weight,
          style,
        });
      }
    } else {
      // Static font - single weight, ensure it's a valid Weight value
      const rawWeight = fontImport.weights as number;
      // Round to nearest standard weight
      const standardWeights: Weight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      const weight = standardWeights.reduce((prev, curr) => 
        Math.abs(curr - rawWeight) < Math.abs(prev - rawWeight) ? curr : prev
      );
      
      fonts.push({
        name: fontImport.family,
        data,
        weight,
        style,
      });
    }
  }
  
  return fonts;
}