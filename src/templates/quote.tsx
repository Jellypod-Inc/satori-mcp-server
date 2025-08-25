import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const quoteSchema = z.object({
  quote: z.string().describe("The quote text"),
  author: z.string().optional().describe("Quote author"),
  background: z.string().optional().describe("CSS gradient background"),
});

type QuoteParams = z.infer<typeof quoteSchema>;

export const quoteTemplate: Template<typeof quoteSchema> = {
  name: "quote",
  description: "Inspirational quote image",
  size: { width: 1080, height: 1080 },
  fonts: [
    { name: "Playfair Display", weight: 700, style: "italic" },
    { name: "Open Sans", weight: 400, style: "normal" }
  ],
  schema: quoteSchema,
  generate: (params: QuoteParams) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: params.background || "#f7f3f0",
          color: "#2d2d2d",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: "120px",
            fontFamily: "Georgia",
            lineHeight: 0.5,
            marginBottom: "20px",
            opacity: 0.2,
          }}
        >
          "
        </div>
        <p
          style={{
            fontSize: "48px",
            fontFamily: "Playfair Display",
            fontStyle: "italic",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "40px",
          }}
        >
          {params.quote}
        </p>
        {params.author && (
          <p
            style={{
              fontSize: "24px",
              fontFamily: "Open Sans",
              fontWeight: 400,
              opacity: 0.7,
            }}
          >
            — {params.author}
          </p>
        )}
      </div>
    );
  },
};