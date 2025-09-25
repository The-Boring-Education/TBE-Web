import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Text from '../common/Typography/Text';

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartWrapper = ({
  title,
  children,
  className = '',
}: ChartWrapperProps) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    <Text className='text-lg font-semibold text-gray-900 mb-4' level='h3'>
      {title}
    </Text>
    {children}
  </div>
);

interface LineChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
}

const AdminLineChart = ({
  data,
  title,
  dataKey,
  xAxisKey,
  color = '#3B82F6',
}: LineChartProps) => (
  <ChartWrapper title={title}>
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Line
          type='monotone'
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

interface AreaChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
}

const AdminAreaChart = ({
  data,
  title,
  dataKey,
  xAxisKey,
  color = '#10B981',
}: AreaChartProps) => (
  <ChartWrapper title={title}>
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Area
          type='monotone'
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

interface BarChartProps {
  data: any[];
  title: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
}

const AdminBarChart = ({
  data,
  title,
  dataKey,
  xAxisKey,
  color = '#8B5CF6',
}: BarChartProps) => (
  <ChartWrapper title={title}>
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

interface PieChartProps {
  data: any[];
  title: string;
  dataKey: string;
  nameKey: string;
  colors?: string[];
}

const AdminPieChart = ({
  data,
  title,
  dataKey,
  nameKey: _nameKey,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
}: PieChartProps) => (
  <ChartWrapper title={title}>
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={({ name, percent }:any) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill='#8884d8'
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

interface MultiBarChartProps {
  data: any[];
  title: string;
  bars: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
}

const AdminMultiBarChart = ({
  data,
  title,
  bars,
  xAxisKey,
}: MultiBarChartProps) => (
  <ChartWrapper title={title}>
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            name={bar.name}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </ChartWrapper>
);

export {
  AdminAreaChart,
  AdminBarChart,
  AdminLineChart,
  AdminMultiBarChart,
  AdminPieChart,
  ChartWrapper,
};
