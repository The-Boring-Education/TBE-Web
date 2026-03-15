/**
 * SEO Validation API
 *
 * POST /api/seo/validate - Validate meta tags for a URL
 *
 * Request body:
 * {
 *   url: string
 * }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface MetaTag {
  name: string;
  content: string;
  status: "present" | "missing" | "warning";
  recommendation?: string;
}

interface ValidationResult {
  url: string;
  title: string;
  description: string;
  metaTags: MetaTag[];
  issues: string[];
  score: number;
  isSSR: boolean;
}

interface ValidateResponse {
  success: boolean;
  data?: ValidationResult;
  error?: string;
}

// Required SEO meta tags
const REQUIRED_META_TAGS = [
  { name: "description", minLength: 50, maxLength: 160 },
  { name: "og:title", minLength: 10, maxLength: 70 },
  { name: "og:description", minLength: 50, maxLength: 200 },
  { name: "og:image", isUrl: true },
  { name: "og:type", required: true },
  { name: "twitter:card", required: true },
  { name: "twitter:title", minLength: 10, maxLength: 70 },
  { name: "twitter:description", minLength: 50, maxLength: 200 },
  { name: "twitter:image", isUrl: true },
  { name: "robots", required: true },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidateResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({
      success: false,
      error: "URL is required",
    });
  }

  try {
    // Fetch the page HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TBE-SEO-Validator/1.0)",
      },
    });

    const html = response.data;
    const issues: string[] = [];
    const metaTags: MetaTag[] = [];

    // Check if SSR (content is in initial HTML)
    const isSSR =
      html.includes("<main") ||
      html.includes("data-") ||
      !html.includes("__NEXT_DATA__") ||
      html.length > 5000;

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    if (!title) {
      issues.push("Missing <title> tag");
    } else if (title.length < 30) {
      issues.push("Title is too short (should be 30-60 characters)");
    } else if (title.length > 70) {
      issues.push("Title is too long (should be 30-60 characters)");
    }

    // Extract meta description
    const descMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    );
    const description = descMatch ? descMatch[1].trim() : "";

    if (!description) {
      issues.push("Missing meta description");
    } else if (description.length < 50) {
      issues.push(
        "Meta description is too short (should be 50-160 characters)",
      );
    } else if (description.length > 160) {
      issues.push("Meta description is too long (should be 50-160 characters)");
    }

    // Check for required meta tags
    for (const tag of REQUIRED_META_TAGS) {
      const patterns = [
        new RegExp(
          `<meta[^>]+(?:name|property)=["']${tag.name}["'][^>]+content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${tag.name}["']`,
          "i",
        ),
      ];

      let content = "";
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          content = match[1];
          break;
        }
      }

      if (!content) {
        metaTags.push({
          name: tag.name,
          content: "",
          status: "missing",
          recommendation: `Add ${tag.name} meta tag`,
        });
        issues.push(`Missing ${tag.name} meta tag`);
      } else {
        let status: "present" | "warning" = "present";
        let recommendation: string | undefined;

        if (tag.minLength && content.length < tag.minLength) {
          status = "warning";
          recommendation = `${tag.name} is too short (min: ${tag.minLength} chars)`;
          issues.push(recommendation);
        }

        if (tag.maxLength && content.length > tag.maxLength) {
          status = "warning";
          recommendation = `${tag.name} is too long (max: ${tag.maxLength} chars)`;
          issues.push(recommendation);
        }

        metaTags.push({
          name: tag.name,
          content,
          status,
          recommendation,
        });
      }
    }

    // Check for canonical URL
    const canonicalMatch = html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    );
    if (!canonicalMatch) {
      issues.push("Missing canonical URL");
    }

    // Check for robots meta
    const robotsMatch = html.match(
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i,
    );
    if (robotsMatch && robotsMatch[1].includes("noindex")) {
      issues.push("Page is set to noindex");
    }

    // Calculate score
    const maxScore = 100;
    const issueWeight = 5;
    const score = Math.max(0, maxScore - issues.length * issueWeight);

    return res.status(200).json({
      success: true,
      data: {
        url,
        title,
        description,
        metaTags,
        issues,
        score,
        isSSR,
      },
    });
  } catch (error) {
    console.error("Error validating URL:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate URL",
    });
  }
}
