import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

import Text from "../common/Typography/Text";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "indigo";
}

const StatCard = ({
  title,
  value,
  change,
  icon,
  color = "blue",
}: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text className="text-sm font-medium text-gray-600" level="p">
            {title}
          </Text>
          <Text className="text-2xl font-bold text-gray-900 mt-1" level="p">
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          {change && (
            <div
              className={`flex items-center mt-2 text-sm ${
                change.type === "increase" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change.type === "increase" ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change.value)}% from last month
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface AdminStatsProps {
  stats: StatCardProps[];
  loading?: boolean;
}

const AdminStats = ({ stats, loading = false }: AdminStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default AdminStats;
export { StatCard };
