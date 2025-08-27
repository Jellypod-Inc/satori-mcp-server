import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const portraitSchema = z.object({
  title: z.string().describe("Main title text for the social card"),
  backgroundImage: z.string().describe("Background image URL"),
  description: z.string().optional().describe("Optional description text"),
});

export type PortraitParams = z.infer<typeof portraitSchema>;

export const portraitTemplate: Template<typeof portraitSchema> = {
  name: "portrait",
  description: "Portrait template with background image",
  size: { width: 1600, height: 900 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 600, style: "normal" },
    { name: "Inter", weight: 500, style: "normal" }
  ],
  schema: portraitSchema,
  generate: (params: PortraitParams) => {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          boxSizing: "border-box",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Background image */}
        <img
          src={params.backgroundImage}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "50%",
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))",
          }}
        />

        {/* Bottom left - Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "66.67%",
            color: "#ffffff",
          }}
        >
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
              opacity: 0.9,
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