import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

export async function svgToImage(
  svg: string,
  width: number
): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });

  const rendered = resvg.render();
  const pngBuffer = rendered.asPng();
  return sharp(pngBuffer)
    .webp({ quality: 80 })
    .toBuffer();
}