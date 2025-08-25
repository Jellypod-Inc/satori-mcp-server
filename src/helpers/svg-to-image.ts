import { Resvg } from "@resvg/resvg-js";

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

  return new Blob([pngBuffer as unknown as ArrayBuffer], { type: "image/png" });
}