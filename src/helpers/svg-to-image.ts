import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

export async function svgToImage(
  svg: string,
  width: number,
): Promise<Blob> {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });

  const rendered = resvg.render();
  const pngBuffer = rendered.asPng();
  const webpBuffer = await sharp(pngBuffer)
    .webp({ quality: 80 })
    .toBuffer();

  return new Blob([webpBuffer as unknown as ArrayBuffer], { type: "image/webp" });
}