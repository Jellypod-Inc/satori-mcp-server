import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const startupSchema = z.object({
  title: z.string().describe("Main title text for the social card"),
  subtitle: z.string().optional().describe("Optional subtitle text"),
  description: z.string().optional().describe("Optional description text"),
  colors: z.array(z.string()).describe("The primary accent color").optional().default(["#1475b2"]),
  light: z.boolean().optional().default(false)
});

export type StartupParams = z.infer<typeof startupSchema>;

export const startupTemplate: Template<typeof startupSchema> = {
  name: "startup",
  description: "Startup background",
  size: { width: 1200, height: 630 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 600, style: "normal" },
    { name: "Inter", weight: 500, style: "normal" }
  ],
  schema: startupSchema,
  generate: (params: StartupParams) => {
    return (
      <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: params.light
          ? `radial-gradient(circle at bottom right, ${params.colors[0]}40, #f5f5f4 60%)`
          : `radial-gradient(circle at bottom right, ${params.colors[0]}, #1c1917 60%)`,
        padding: "64px",
        boxSizing: "border-box",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-end",
        color: params.light ? "#1c1917" : "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left side - Logo and text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          maxWidth: "66.67%",
        }}
      >
        <p
          style={{
            fontSize: "22px",
            fontWeight: 600,
            textTransform: "uppercase",
            opacity: 0.8,
            marginLeft: "0",
            color: params.colors[0],
            margin: 0,
          }}
        >
          {params.subtitle}
        </p>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {params.title}
        </h1>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            letterSpacing: "3px",
            opacity: 0.6,
            marginTop: "6px",
            marginLeft: "0",
            lineHeight: 1.3,
          }}
        >
          {params.description}
        </p>
      </div>
    </div>
    );
  },
};