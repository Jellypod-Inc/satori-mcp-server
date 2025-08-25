import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const geometricSchema = z.object({
  title: z.string().describe("Main title text for the social card"),
  description: z.string().optional().describe("Optional description text"),
  background: z.string().optional().describe("Optional background color"),
});

export type GeometricParams = z.infer<typeof geometricSchema>;

export const geometricTemplate: Template<typeof geometricSchema> = {
  name: "geometric",
  description: "Geometric background",
  size: { width: 1200, height: 630 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 500, style: "normal" }
  ],
  schema: geometricSchema,
  generate: (params: GeometricParams) => {
    return (
      <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: params.background || "#1a1a1a",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          padding: "48px",
          position: "relative",
          border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: "24px",
          boxSizing: "border-box",
        }}
      >
      {/* Left side - Logo and text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "20px" }}>
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-2px",
            }}
          >
            {params.title}
          </h1>
        </div>

        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "3px",
            opacity: 0.6,
            marginTop: "6px",
            marginLeft: "0",
          }}
        >
          {params.description}
        </p>
      </div>
      </div>
    </div>
    );
  },
};