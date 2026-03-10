/**
 * SEO Reports API
 *
 * GET /api/seo/reports - List all Lighthouse reports
 * GET /api/seo/reports?app=platform - Get reports for specific app
 */

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface LighthouseReport {
  url: string;
  fetchTime: string;
  scores: {
    seo: number;
    accessibility: number;
    bestPractices: number;
    performance: number;
  };
  audits?: Record<string, unknown>;
}

interface ReportsResponse {
  success: boolean;
  data?: {
    reports: LighthouseReport[];
    lastUpdated: string;
    totalReports: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReportsResponse>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  const { app } = req.query;
  const lhciDir = path.join(process.cwd(), ".lhci");

  try {
    // Check if LHCI directory exists
    if (!fs.existsSync(lhciDir)) {
      return res.status(200).json({
        success: true,
        data: {
          reports: [],
          lastUpdated: new Date().toISOString(),
          totalReports: 0,
        },
      });
    }

    // Read manifest.json if it exists
    const manifestPath = path.join(lhciDir, "manifest.json");
    let reports: LighthouseReport[] = [];

    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      reports = manifest.map((entry: any) => ({
        url: entry.url || "",
        fetchTime: entry.fetchTime || new Date().toISOString(),
        scores: {
          seo: Math.round((entry.summary?.seo || 0) * 100),
          accessibility: Math.round((entry.summary?.accessibility || 0) * 100),
          bestPractices: Math.round(
            (entry.summary?.["best-practices"] || 0) * 100,
          ),
          performance: Math.round((entry.summary?.performance || 0) * 100),
        },
      }));

      // Filter by app if specified
      if (app && typeof app === "string") {
        const appDomains: Record<string, string> = {
          platform: "theboringeducation.com",
          prepYatra: "prepyatra.theboringeducation.com",
          quizes: "quizes.theboringeducation.com",
          resumeYatra: "resumeyatra.theboringeducation.com",
          dsayatra: "dsayatra.theboringeducation.com",
          techyatra: "techyatra.theboringeducation.com",
          oncampus: "oncampus.theboringeducation.com",
        };

        const domain = appDomains[app];
        if (domain) {
          reports = reports.filter((r) => r.url.includes(domain));
        }
      }
    }

    // Get last modified time of manifest
    const stats = fs.existsSync(manifestPath)
      ? fs.statSync(manifestPath)
      : { mtime: new Date() };

    return res.status(200).json({
      success: true,
      data: {
        reports,
        lastUpdated: stats.mtime.toISOString(),
        totalReports: reports.length,
      },
    });
  } catch (error) {
    console.error("Error reading Lighthouse reports:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to read Lighthouse reports",
    });
  }
}
