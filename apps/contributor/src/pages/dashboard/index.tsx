import { useAuth } from "@tbe/auth";
import Head from "next/head";
import Link from "next/link";

import Header from "@/components/Header";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Contributor Dashboard | The Boring Education</title>
      </Head>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full">
          <div className="w-16 h-16 bg-red-50 text-[#EA4544] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            {(user?.name || user?.email || "C")[0]?.toUpperCase() || "C"}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {user?.email || "Contributor Account"}
          </p>
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Contributor Status
            </span>
            <p className="text-sm font-medium text-gray-800 mt-1">
              Authentication active. Your contributor workspace is ready.
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
