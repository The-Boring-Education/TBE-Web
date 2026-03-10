import React, { useEffect, useState } from "react";

interface RevenueTransaction {
  id: string;
  amount: number;
  date: Date;
  type: string;
  userInitials: string;
}

interface RevenueStats {
  totalPrepYatraRevenue: number;
  totalTBERevenue: number;
  totalPrepYatraSubscriptions: number;
  totalTBEPurchases: number;
}

interface RevenueData {
  showData: boolean;
  totalRevenue?: number;
  totalTransactions?: number;
  recentTransactions?: RevenueTransaction[];
  stats?: RevenueStats;
  message?: string;
}

const RevenueTransparency: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await fetch("/api/v1/revenue/transparency");
        const result = await response.json();

        if (result.status) {
          setRevenueData(result.data);
        } else {
          setError(result.message || "Failed to fetch revenue data");
        }
      } catch (err) {
        setError("Network error while fetching revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6 mb-8">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !revenueData?.showData) {
    return null; // Don't show anything if there's an error or criteria not met
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
          💎 Revenue Transparency
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Open Source
          </span>
        </h3>
        <p className="text-sm text-gray-600">
          As an open-source platform, we believe in complete transparency about
          our revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(revenueData.totalRevenue || 0)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-blue-600">
            {revenueData.totalTransactions || 0}
          </div>
          <div className="text-sm text-gray-600">Total Transactions</div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(revenueData.stats?.totalPrepYatraRevenue || 0)}
          </div>
          <div className="text-sm text-gray-600">PrepYatra Revenue</div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(revenueData.stats?.totalTBERevenue || 0)}
          </div>
          <div className="text-sm text-gray-600">TBE Courses Revenue</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        <h4 className="font-semibold text-gray-800 mb-3">
          Recent Transactions
        </h4>
        <div className="space-y-2">
          {revenueData.recentTransactions?.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {transaction.userInitials}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {transaction.type.replace("_", " ")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 This data is updated in real-time and shows actual revenue to
        maintain transparency.
        <br />
        User privacy is protected by showing only initials.
      </div>
    </div>
  );
};

export default RevenueTransparency;
