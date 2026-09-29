import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/workorders/", "/settings"],
    },
    sitemap: `${getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)}/sitemap.xml`,
  };
}
