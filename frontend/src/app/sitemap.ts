import { MetadataRoute } from "next";
import { getPublishedCakes, getCategories } from "../lib/serverData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lushlayers.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cakes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const [cakes, categories] = await Promise.all([
      getPublishedCakes(),
      getCategories(),
    ]);

    const cakeRoutes: MetadataRoute.Sitemap = (cakes || []).map((cake) => ({
      url: `${baseUrl}/cakes/${cake.slug}`,
      lastModified: new Date(cake.updated_at || cake.created_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...cakeRoutes];
  } catch (e) {
    console.error("Failed to generate dynamic sitemap entries:", e);
    return staticRoutes;
  }
}
