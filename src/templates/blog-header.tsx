import React from "react";
import { z } from "zod";
import { Template } from "./index";

const blogHeaderSchema = z.object({
  title: z.string().describe("Blog post title"),
  author: z.string().optional().describe("Author name"),
  date: z.string().optional().describe("Publication date"),
  background: z.string().optional().describe("CSS gradient background"),
});

export type BlogHeaderTemplateParams = z.infer<typeof blogHeaderSchema>;

export const blogHeaderTemplate: Template<typeof blogHeaderSchema> = {
  name: "blog-header",
  description: "Blog post header image",
  defaultSize: { width: 1920, height: 1080 },
  googleFonts: [
    { name: "Roboto", weight: 900, style: "normal" },
    { name: "Roboto", weight: 400, style: "normal" }
  ],
  schema: blogHeaderSchema,
  generate: (params: BlogHeaderTemplateParams) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: params.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#ffffff",
          fontFamily: "Roboto",
          padding: "80px",
        }}
      >
        <h1
          style={{
            fontSize: "96px",
            fontWeight: 900,
            marginBottom: "40px",
            textAlign: "center",
            lineHeight: 1.1,
            textShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {params.title}
        </h1>
        {(params.author || params.date) && (
          <div
            style={{
              display: "flex",
              gap: "20px",
              fontSize: "28px",
              fontWeight: 400,
              opacity: 0.9,
            }}
          >
            {params.author && <span>{params.author}</span>}
            {params.author && params.date && <span>•</span>}
            {params.date && <span>{params.date}</span>}
          </div>
        )}
      </div>
    );
  },
};