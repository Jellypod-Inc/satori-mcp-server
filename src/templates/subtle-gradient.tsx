import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const subtleGradientSchema = z.object({
  title: z.string().describe("Main title text for the social card"),
  subtitle: z.string().optional().describe("Optional subtitle text"),
  colors: z.array(z.string()).describe("Array of colors for the gradient").optional().default(["#1475b2", "#14b2b2", "#14b24b"])
});

export type SubtleGradientParams = z.infer<typeof subtleGradientSchema>;

export const subtleGradientTemplate: Template<typeof subtleGradientSchema> = {
  name: "subtle-gradient",
  description: "Clean white design with subtle gradient accent at bottom",
  size: { width: 1200, height: 630 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 400, style: "normal" }
  ],
  schema: subtleGradientSchema,
  generate: (params: SubtleGradientParams) => {
    const colors = params.colors;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Bottom gradient overlay - base layer */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "20%",
            background: `linear-gradient(to right, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
            opacity: 0.3,
            display: "flex",
          }}
        />

        {/* Feathering overlay on top */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "20%",
            background: "linear-gradient(to bottom, #ffffff 0%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 0) 100%)",
            display: "flex",
          }}
        />

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "60px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              letterSpacing: "-2px",
              lineHeight: 1.1,
            }}
          >
            {params.title}
          </h1>

          {params.subtitle && (
            <p
              style={{
                fontSize: "24px",
                fontWeight: 400,
                color: "#6b7280",
                margin: 0,
                marginTop: "16px",
                marginBottom: "16px",
                letterSpacing: "-0.5px",
              }}
            >
              {params.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  },
};