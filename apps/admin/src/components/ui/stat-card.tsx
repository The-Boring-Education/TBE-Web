import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  color = "purple",
  trend,
  isLoading = false,
}: StatCardProps) {
  const colorMap = {
    purple:
      "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border-purple-200",
    blue: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-blue-200",
    green:
      "bg-gradient-to-r from-green-50 to-green-100 text-green-600 border-green-200",
    orange:
      "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 border-orange-200",
    red: "bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-red-200",
  };

  const iconColorMap = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card className={`border ${colorMap[color]}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}

            {trend && (
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs. last period
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div className={`p-2 rounded-md ${iconColorMap[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
