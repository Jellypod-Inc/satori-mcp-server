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