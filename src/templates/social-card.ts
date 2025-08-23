import React from "react";
import { Template } from "./index";

export const socialCardTemplate: Template = {
  name: "social-card",
  description: "Social media card with title and description",
  defaultSize: { width: 1200, height: 630 },
  googleFonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 400, style: "normal" }
  ],
  generate: (params: { title: string; description?: string; backgroundColor?: string }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: params.backgroundColor || "#1a1a1a",
          color: "#ffffff",
          fontFamily: "Inter",
          padding: "60px",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            marginBottom: "30px",
            textAlign: "center",
            lineHeight: 1.2,
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
              lineHeight: 1.4,
            }}
          >
            {params.description}
          </p>
        )}
      </div>
    );
  },
};