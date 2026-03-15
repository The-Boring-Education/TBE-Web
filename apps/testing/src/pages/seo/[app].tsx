/**
 * SEO Inspector - App Detail Page
 *
 * Shows detailed SEO information for a specific app
 */

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

interface Route {
  path: string;
  priority: number;
  changefreq: string;
  isDynamic: boolean;
  description?: string;
}

interface AppData {
  appId: string;
  domain: string;
  routeCount: number;
  routes: Route[];
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

function ScoreCell({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-6 rounded text-sm font-medium ${getScoreColor(score)}`}
    >
      {score}
    </span>
  );
}

export default function AppDetailPage() {
  const router = useRouter();
  const { app: appId } = router.query;

  const [appData, setAppData] = useState<AppData | null>(null);
  const [reports, setReports] = useState<LighthouseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"routes" | "reports">(
    "routes",
  );

  useEffect(() => {
    if (!appId) return;

    async function fetchData() {
      try {
        const [routesRes, reportsRes] = await Promise.all([
          axios.get(`/api/seo/routes?app=${appId}`),
          axios.get(`/api/seo/reports?app=${appId}`),
        ]);

        if (routesRes.data.success && routesRes.data.data.apps[0]) {
          setAppData(routesRes.data.data.apps[0]);
        }

        if (reportsRes.data.success) {
          setReports(reportsRes.data.data.reports);
        }
      } catch (err) {
        setError("Failed to load app data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [appId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "App not found"}</p>
          <Link href="/seo" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate averages
  const avgScores = reports.length
    ? {
        seo: Math.round(
          reports.reduce((sum, r) => sum + r.scores.seo, 0) / reports.length,
        ),
        accessibility: Math.round(
          reports.reduce((sum, r) => sum + r.scores.accessibility, 0) /
            reports.length,
        ),
        bestPractices: Math.round(
          reports.reduce((sum, r) => sum + r.scores.bestPractices, 0) /
            reports.length,
        ),
        performance: Math.round(
          reports.reduce((sum, r) => sum + r.scores.performance, 0) /
            reports.length,
        ),
      }
    : null;

  return (
    <>
      <Head>
        <title>{appData.appId.replace("-", " ")} SEO | TBE Testing</title>
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/seo" className="text-gray-400 hover:text-gray-600">
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
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {appData.appId.replace("-", " ")}
                </h1>
                <p className="text-sm text-gray-500">{appData.domain}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Score Summary */}
          {avgScores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">SEO Score</p>
                <p className="text-3xl font-bold text-green-600">
                  {avgScores.seo}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Accessibility</p>
                <p className="text-3xl font-bold text-blue-600">
                  {avgScores.accessibility}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Best Practices</p>
                <p className="text-3xl font-bold text-purple-600">
                  {avgScores.bestPractices}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Performance</p>
                <p className="text-3xl font-bold text-orange-600">
                  {avgScores.performance}
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setSelectedTab("routes")}
              className={`px-4 py-2 font-medium ${
                selectedTab === "routes"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Routes ({appData.routeCount})
            </button>
            <button
              onClick={() => setSelectedTab("reports")}
              className={`px-4 py-2 font-medium ${
                selectedTab === "reports"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lighthouse Reports ({reports.length})
            </button>
          </div>

          {/* Routes Table */}
          {selectedTab === "routes" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Path
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Change Freq
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appData.routes.map((route, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">
                        {route.path}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            route.priority >= 0.9
                              ? "text-green-600 font-medium"
                              : route.priority >= 0.7
                                ? "text-blue-600"
                                : "text-gray-500"
                          }`}
                        >
                          {route.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {route.changefreq}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            route.isDynamic
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {route.isDynamic ? "Dynamic" : "Static"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {route.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reports Table */}
          {selectedTab === "reports" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-2">No Lighthouse reports available.</p>
                  <p className="text-sm">
                    Run{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      pnpm seo:audit:prod
                    </code>{" "}
                    to generate reports.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        URL
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        SEO
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        A11y
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Best Prac
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Perf
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Audit Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map((report, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm truncate max-w-xs">
                          {report.url}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreCell score={report.scores.seo} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreCell score={report.scores.accessibility} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreCell score={report.scores.bestPractices} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreCell score={report.scores.performance} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(report.fetchTime).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
