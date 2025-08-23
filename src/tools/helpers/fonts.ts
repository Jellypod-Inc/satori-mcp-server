import { fontImports } from "../../fonts/font-data";

export interface FontConfig {
  name: string;
  data: ArrayBuffer;
  weight: number;
  style: "normal" | "italic";
}

export async function loadGoogleFont(name: string, weight: number = 400, style: string = "normal"): Promise<ArrayBuffer> {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:ital,wght@${style === "italic" ? 1 : 0},${weight}&display=swap`;

  const cssResponse = await fetch(fontUrl);
  const css = await cssResponse.text();

  const fontUrlMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!fontUrlMatch) {
    throw new Error(`Could not find font URL for ${name}`);
  }

  const fontResponse = await fetch(fontUrlMatch[1]);
  return fontResponse.arrayBuffer();
}

export async function loadLocalFonts(): Promise<FontConfig[]> {
  const fonts: FontConfig[] = [];
  
  // Process all imported fonts
  for (const fontImport of fontImports) {
    // Convert base64 to ArrayBuffer
    const buffer = Buffer.from(fontImport.data, "base64");
    const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
    // Determine style from font metadata
    const style: "normal" | "italic" = fontImport.hasItalic ? "italic" : "normal";
    
    if (fontImport.isVariable) {
      // Variable font - register for all weights in range
      const weightRange = fontImport.weights as { min: number; max: number; default: number };
      
      // Generate standard weight values within the font's range
      const standardWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
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
      // Static font - single weight
      const weight = fontImport.weights as number;
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