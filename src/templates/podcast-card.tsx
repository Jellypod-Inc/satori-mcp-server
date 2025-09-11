import * as React from "react";
import { z } from "zod";
import { Template } from "./index";

const podcastCardSchema = z.object({
  title: z.string().describe("Podcast episode title"),
  description: z.string().describe("Episode description"),
  imageUrl: z.string().describe("Square image URL for the podcast"),
  backgroundImage: z.string().describe("Background image URL"),
});

export type PodcastCardTemplateParams = z.infer<typeof podcastCardSchema>;

export const podcastCardTemplate: Template<typeof podcastCardSchema> = {
  name: "podcast-card",
  description: "Podcast episode card with image and text",
  size: { width: 1600, height: 900 },
  fonts: [
    { name: "Inter", weight: 700, style: "normal" },
    { name: "Inter", weight: 400, style: "normal" }
  ],
  schema: podcastCardSchema,
  generate: (params: PodcastCardTemplateParams) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          position: "relative",
          fontFamily: "Inter",
        }}
      >
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
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "33%",
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "40px",
            padding: "80px",
            position: "relative",
          }}
        >
          <img
            src={params.imageUrl}
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "12px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            <h2
              style={{
                fontSize: "64px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.2,
                marginBottom: "16px",
                margin: 0,
              }}
            >
              {params.title}
            </h2>
            <p
              style={{
                fontSize: "36px",
                fontWeight: 400,
                color: "#ffffff",
                opacity: 0.9,
                lineHeight: 1.3,
                margin: 0,
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