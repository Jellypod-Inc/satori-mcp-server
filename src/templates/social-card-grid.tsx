import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const socialCardGridSchema = z.object({
  title: z.string().describe("Main title text for the social card"),
  description: z.string().optional().describe("Optional description text"),
  background: z.string().optional().describe("CSS gradient background"),
});

export type SocialCardGridParams = z.infer<typeof socialCardGridSchema>;

export const socialCardGridTemplate: Template<typeof socialCardGridSchema> = {
  name: "social-card-grid",
  description: "Social media card with grid background",
  size: { width: 1200, height: 630 },
  fonts: [
    { name: "Playfair Display", weight: 700, style: "normal" },
    { name: "Playfair Display", weight: 400, style: "normal" }
  ],
  schema: socialCardGridSchema,
  generate: (params: SocialCardGridParams) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: params.background || "#1a1a1a",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          color: "#ffffff",
          fontFamily: "Playfair Display",
          padding: "80px",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "92px",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "0px",
          }}
        >
          {params.title}
        </h1>
        {params.description && (
          <p
            style={{
              fontSize: "32px",
              fontWeight: 400,
              textAlign: "center",
              opacity: 0.8,
              lineHeight: 1.2,
            }}
          >
            {params.description}
          </p>
        )}
      </div>
    );
  },
};