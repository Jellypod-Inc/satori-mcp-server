import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const sidePanelSchema = z.object({
  imageUrl: z.string().describe("Image URL for the right side"),
  backgroundColor: z.string().optional().describe("Solid color for the left side (default: white)"),
});

export type SidePanelTemplateParams = z.infer<typeof sidePanelSchema>;

export const sidePanelTemplate: Template<typeof sidePanelSchema> = {
  name: "side-panel",
  description: "Split layout with solid color on left and image on right",
  size: { width: 1600, height: 900 },
  fonts: [
    { name: "Inter", weight: 400, style: "normal" }
  ],
  schema: sidePanelSchema,
  generate: (params: SidePanelTemplateParams) => {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <img
          src={params.imageUrl}
          style={{
            position: "absolute",
            right: 0,
            width: "60%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            width: "45%",
            height: "100%",
            backgroundColor: params.backgroundColor || "#ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "38%",
            width: "10%",
            height: "110%",
            top: "-5%",
            backgroundColor: params.backgroundColor || "#ffffff",
            filter: "blur(20px)",
          }}
        />
      </div>
    );
  },
};