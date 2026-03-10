/**
 * SEO Inspector Dashboard
 *
 * Main dashboard showing SEO overview for all TBE apps
 */

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";

interface AppRoutes {
  appId: string;
  domain: string;
  routeCount: number;
  routes: Array<{
    path: string;
    priority: number;
    changefreq: string;
    isDynamic: boolean;
    description?: string;
  }>;
}

interface LighthouseReport {
  url: string;
  fetchTime: string;
  scores: {
    seo: number;
    accessibility: number;
    bestPractices: number;
    performance: number;
  };
}

interface ReportsData {
  reports: LighthouseReport[];
  lastUpdated: string;
  totalReports: number;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="text-center">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getScoreColor(score)}`}
      >
        {score}
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function AppCard({
  app,
  reports,
}: {
  app: AppRoutes;
  reports: LighthouseReport[];
}) {
  const appReports = reports.filter((r) => r.url.includes(app.domain));
  const avgScores = {
    seo: appReports.length
      ? Math.round(
          appReports.reduce((sum, r) => sum + r.scores.seo, 0) /
            appReports.length,
        )
      : 0,
    accessibility: appReports.length
      ? Math.round(
          appReports.reduce((sum, r) => sum + r.scores.accessibility, 0) /
            appReports.length,
        )
      : 0,
    bestPractices: appReports.length
      ? Math.round(
          appReports.reduce((sum, r) => sum + r.scores.bestPractices, 0) /
            appReports.length,
        )
      : 0,
    performance: appReports.length
      ? Math.round(
          appReports.reduce((sum, r) => sum + r.scores.performance, 0) /
            appReports.length,
        )
      : 0,
  };

  return (
    <Link
      href={`/seo/${app.appId}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-primary-500 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {app.appId.replace("-", " ")}
          </h3>
          <p className="text-sm text-gray-500">{app.domain}</p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {app.routeCount} routes
        </span>
      </div>

      {appReports.length > 0 ? (
        <div className="flex justify-between">
          <ScoreBadge score={avgScores.seo} label="SEO" />
          <ScoreBadge score={avgScores.accessibility} label="A11y" />
          <ScoreBadge score={avgScores.bestPractices} label="Best Prac" />
          <ScoreBadge score={avgScores.performance} label="Perf" />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm">
          No Lighthouse reports yet.
          <br />
          Run{" "}
          <code className="bg-gray-100 px-1 rounded">pnpm seo:audit:prod</code>
        </div>
      )}
    </Link>
  );
}

export default function SEODashboard() {
  const [apps, setApps] = useState<AppRoutes[]>([]);
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [routesRes, reportsRes] = await Promise.all([
          axios.get("/api/seo/routes"),
          axios.get("/api/seo/reports"),
        ]);

        if (routesRes.data.success) {
          setApps(routesRes.data.data.apps);
        }

        if (reportsRes.data.success) {
          setReportsData(reportsRes.data.data);
        }
      } catch (err) {
        setError("Failed to load SEO data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate overall stats
  const totalRoutes = apps.reduce((sum, app) => sum + app.routeCount, 0);
  const reports = reportsData?.reports || [];
  const overallAvg = reports.length
    ? {
        seo: Math.round(
          reports.reduce((sum, r) => sum + r.scores.seo, 0) / reports.length,
        ),
        accessibility: Math.round(
          reports.reduce((sum, r) => sum + r.scores.accessibility, 0) /
            reports.length,
        ),
      }
    : { seo: 0, accessibility: 0 };

  return (
    <>
      <Head>
        <title>SEO Inspector | TBE Testing</title>
        <meta
          name="description"
          content="SEO audit dashboard for TBE Platform"
        />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  SEO Inspector
                </h1>
                <p className="text-sm text-gray-500">
                  Monitor SEO health across all TBE apps
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Total Apps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {apps.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRoutes}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Avg SEO Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallAvg.seo || "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Avg A11y Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {overallAvg.accessibility || "N/A"}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              {reportsData?.lastUpdated && (
                <p className="text-sm text-gray-500 mb-4">
                  Last audit:{" "}
                  {new Date(reportsData.lastUpdated).toLocaleString()}
                </p>
              )}

              {/* App Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app) => (
                  <AppCard key={app.appId} app={app} reports={reports} />
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 p-6 bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/seo/validate"
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Validate URL
                  </Link>
                  <button
                    onClick={() => {
                      alert(
                        "Run `pnpm seo:audit:prod` in terminal to generate new reports",
                      );
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Run Lighthouse Audit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
