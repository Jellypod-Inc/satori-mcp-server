import * as React from "react";
import { z } from "zod";
import { Template } from "./index";
import { isLightBackground } from "../helpers/color";

const sidePanelSchema = z.object({
  header: z.string().optional().describe("Optional header text for top-left"),
  title: z.string().describe("Main title text"),
  subtitle: z.string().optional().describe("Subtitle text"),
  imageUrl: z.string().describe("Image URL for the right side"),
  backgroundColor: z.string().optional().describe("Solid color for the left side (default: white)").default("#f5f5f5")
});

export type SidePanelTemplateParams = z.infer<typeof sidePanelSchema>;

export const sidePanelTemplate: Template<typeof sidePanelSchema> = {
  name: "side-panel",
  description: "Split layout with solid color on left and image on right",
  size: { width: 1600, height: 900 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 400, style: "normal" }
  ],
  schema: sidePanelSchema,
  generate: (params: SidePanelTemplateParams) => {
    const bgColor = params.backgroundColor;
    const isLight = isLightBackground(bgColor);
    const textColor = isLight ? "#1a1a1a" : "#ffffff";
    const subtitleColor = isLight ? "#666666" : "#cccccc";
    const headerColor = isLight ? "#999999" : "#888888";

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
            backgroundColor: bgColor,
            display: "flex",
            flexDirection: "column",
            justifyContent: params.header ? "space-between" : "center",
            padding: "60px",
            boxSizing: "border-box",
          }}
        >
          {params.header && (
            <div
              style={{
                display: "flex",
                fontSize: "20px",
                fontWeight: 400,
                fontFamily: "Inter",
                color: headerColor,
                letterSpacing: "0.5px",
              }}
            >
              {params.header}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "100%",
              alignItems: "flex-start",
            }}
          >
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 700,
                fontFamily: "Inter",
                margin: 0,
                marginBottom: "12px",
                color: textColor,
                lineHeight: 1.2,
                textAlign: "left",
              }}
            >
              {params.title}
            </h1>
            {params.subtitle && (
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 400,
                  fontFamily: "Inter",
                  margin: 0,
                  color: subtitleColor,
                  lineHeight: 1.4,
                  textAlign: "left",
                }}
              >
                {params.subtitle}
              </p>
            )}
          </div>
          {params.header && <div style={{ display: "flex" }}></div>}
        </div>
        <div
          style={{
            position: "absolute",
            left: "40%",
            width: "10%",
            height: "110%",
            top: "-5%",
            backgroundColor: bgColor,
            filter: "blur(20px)",
          }}
        />
      </div>
    );
  },
};