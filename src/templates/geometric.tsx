import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const geometricSchema = z.object({
  title: z.string().describe("Main title text for the social card"),
  description: z.string().optional().describe("Optional description text"),
  background: z.string().optional().describe("CSS gradient background"),
});

export type GeometricParams = z.infer<typeof geometricSchema>;

export const geometricTemplate: Template<typeof geometricSchema> = {
  name: "geometric",
  description: "Geometric background",
  size: { width: 1200, height: 630 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 400, style: "normal" }
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
        padding: "12px",
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
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
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
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "20px" }}>
          {/* Logo icon */}
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            style={{ marginBottom: "10px" }}
          >
            <path
              d="M25 5L40 15V35L25 45L10 35V15L25 5Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="25" cy="25" r="8" fill="white" />
          </svg>

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
            fontSize: "14px",
            fontWeight: 400,
            textTransform: "uppercase",
            letterSpacing: "3px",
            opacity: 0.6,
            marginTop: "10px",
            marginLeft: "70px",
          }}
        >
          {params.description}
        </p>
      </div>

      {/* Right side - Geometric shapes */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          right: "60px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "400px",
          height: "300px",
        }}
      >
        {/* Simple geometric shapes */}
        <svg
          width="400"
          height="300"
          viewBox="0 0 400 300"
          fill="none"
          style={{ opacity: 0.2 }}
        >
          {/* Large circle */}
          <circle
            cx="200"
            cy="150"
            r="80"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            fill="none"
          />

          {/* Triangle */}
          <path
            d="M 320 100 L 370 180 L 270 180 Z"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            fill="none"
          />

          {/* Square */}
          <rect
            x="50"
            y="200"
            width="60"
            height="60"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            fill="none"
          />

          {/* Hexagon */}
          <path
            d="M 150 50 L 190 30 L 230 50 L 230 90 L 190 110 L 150 90 Z"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            fill="none"
          />

          {/* Diamond */}
          <path
            d="M 100 120 L 130 150 L 100 180 L 70 150 Z"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            fill="none"
          />

          {/* Small circles */}
          <circle cx="340" cy="240" r="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
          <circle cx="280" cy="60" r="15" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
        </svg>
      </div>
      </div>
    </div>
    );
  },
};