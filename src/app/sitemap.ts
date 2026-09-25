import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://lavrenicus.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/experience",
    "/games",
    "/assets",
    "/tech",
    "/about",
    "/links",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
