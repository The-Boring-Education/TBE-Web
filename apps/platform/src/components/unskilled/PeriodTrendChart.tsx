import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PeriodTrendChartProps {
  periods: {
    "1D": number;
    "7D": number;
    "14D": number;
    "30D": number;
  };
}

const PeriodTrendChart: React.FC<PeriodTrendChartProps> = ({ periods }) => {
  const data = [
    { period: '1D', value: periods["1D"] },
    { period: '7D', value: periods["7D"] },
    { period: '14D', value: periods["14D"] },
    { period: '30D', value: periods["30D"] },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium text-gray-900">{`${payload[0].value} jobs`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis 
            dataKey="period" 
            type="category" 
            width={40}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PeriodTrendChart;
