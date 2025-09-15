import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

import {
  AdminAreaChart,
  AdminBarChart,
  AdminLayout,
  AdminLineChart,
  AdminPieChart,
  AdminStats,
  SEO,
  TabComponent,
} from '@/components';
import { useAdminData } from '@/hooks/useAdmin';

const AdminAnalytics = () => {
  const {
    data: revenueData,
    loading: revenueLoading,
    fetchData: fetchRevenue,
  } = useAdminData();
  const {
    data: engagementData,
    loading: engagementLoading,
    fetchData: fetchEngagement,
  } = useAdminData();
  const {
    data: contentData,
    loading: contentLoading,
    fetchData: fetchContent,
  } = useAdminData();
  const {
    data: gamificationData,
    loading: gamificationLoading,
    fetchData: fetchGamification,
  } = useAdminData();
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const params = { period: dateRange };
    fetchRevenue('/api/v1/admin/analytics', { type: 'revenue', ...params });
    fetchEngagement('/api/v1/admin/analytics', {
      type: 'user-engagement',
      ...params,
    });
    fetchContent('/api/v1/admin/analytics', {
      type: 'content-performance',
      ...params,
    });
    fetchGamification('/api/v1/admin/analytics', {
      type: 'gamification',
      ...params,
    });
  }, [
    fetchRevenue,
    fetchEngagement,
    fetchContent,
    fetchGamification,
    dateRange,
  ]);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${((revenueData?.totalRevenue || 0) / 100).toLocaleString()}`,
      icon: <ArrowTrendingUpIcon className='h-6 w-6' />,
      color: 'green' as const,
      change: { value: 15, type: 'increase' as const },
    },
    {
      title: 'Conversion Rate',
      value: `${revenueData?.conversionRate || 0}%`,
      icon: <ChartBarIcon className='h-6 w-6' />,
      color: 'blue' as const,
      change: { value: 3, type: 'increase' as const },
    },
    {
      title: 'Avg Transaction',
      value: `₹${(
        (revenueData?.averageTransactionValue || 0) / 100
      ).toLocaleString()}`,
      icon: <ArrowTrendingUpIcon className='h-6 w-6' />,
      color: 'purple' as const,
      change: { value: 8, type: 'increase' as const },
    },
    {
      title: 'Active Learners',
      value: engagementData?.totalActiveUsers || 0,
      icon: <UsersIcon className='h-6 w-6' />,
      color: 'yellow' as const,
      change: { value: 12, type: 'increase' as const },
    },
  ];

  const formatRevenueTimeSeries = (data: any) => {
    if (!data?.revenueTimeSeries) return [];
    return data.revenueTimeSeries.map((item: any) => ({
      date: `${item._id.day}/${item._id.month}`,
      revenue: item.totalRevenue / 100,
      transactions: item.transactionCount,
    }));
  };

  const formatProductRevenue = (data: any) => {
    if (!data?.productRevenue) return [];
    return data.productRevenue.map((item: any) => ({
      product: item._id,
      revenue: item.totalRevenue / 100,
      count: item.transactionCount,
    }));
  };

  const formatEngagementByRole = (data: any) => {
    if (!data?.engagementByRole) return [];
    return data.engagementByRole.map((item: any) => ({
      role: item._id || 'Unknown',
      total: item.totalUsers,
      onboarded: item.onboardedUsers,
    }));
  };

  const formatCourseCompletion = (data: any) => {
    if (!data?.courseCompletionRates) return [];
    return data.courseCompletionRates.slice(0, 10).map((item: any) => ({
      course: item.courseName,
      completionRate: item.completionRate,
      enrollments: item.totalEnrollments,
    }));
  };

  const formatPointsDistribution = (data: any) => {
    if (!data?.pointsDistribution) return [];
    return data.pointsDistribution.map((item: any) => ({
      level: item._id,
      users: item.userCount,
      avgPoints: Math.round(item.averagePoints),
    }));
  };

  const formatActionPerformance = (data: any) => {
    if (!data?.actionPerformance) return [];
    return data.actionPerformance.map((item: any) => ({
      action: item._id,
      count: item.totalActions,
      points: item.totalPoints,
    }));
  };

  const revenueCharts = (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <AdminLineChart
        data={formatRevenueTimeSeries(revenueData)}
        title='Revenue Trend'
        dataKey='revenue'
        xAxisKey='date'
        color='#10B981'
      />
      <AdminPieChart
        data={formatProductRevenue(revenueData)}
        title='Revenue by Product'
        dataKey='revenue'
        nameKey='product'
      />
    </div>
  );

  const engagementCharts = (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <AdminBarChart
        data={formatEngagementByRole(engagementData)}
        title='Users by Role'
        dataKey='total'
        xAxisKey='role'
        color='#3B82F6'
      />
      <AdminBarChart
        data={formatEngagementByRole(engagementData)}
        title='Onboarding Status by Role'
        dataKey='onboarded'
        xAxisKey='role'
        color='#10B981'
      />
    </div>
  );

  const contentCharts = (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <AdminBarChart
        data={formatCourseCompletion(engagementData)}
        title='Top Course Completion Rates'
        dataKey='completionRate'
        xAxisKey='course'
        color='#8B5CF6'
      />
      <AdminAreaChart
        data={formatCourseCompletion(engagementData)}
        title='Course Enrollments'
        dataKey='enrollments'
        xAxisKey='course'
        color='#F59E0B'
      />
    </div>
  );

  const gamificationCharts = (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <AdminPieChart
        data={formatPointsDistribution(gamificationData)}
        title='Points Distribution'
        dataKey='users'
        nameKey='level'
      />
      <AdminBarChart
        data={formatActionPerformance(gamificationData)}
        title='Action Performance'
        dataKey='count'
        xAxisKey='action'
        color='#EC4899'
      />
    </div>
  );

  const tabPanels = [
    revenueCharts,
    engagementCharts,
    contentCharts,
    gamificationCharts,
  ];
  const tabLabels = [
    'Revenue',
    'User Engagement',
    'Content Performance',
    'Gamification',
  ];

  return (
    <>
      <SEO
        seoMeta={{
          title: 'Analytics Dashboard - Admin',
          description: 'Comprehensive analytics and insights for TBE platform',
          url: 'https://theboringeducation.com/admin/analytics',
          siteName: 'The Boring Education',
          type: 'website',
          image: 'https://theboringeducation.com/images/logo.png',
          robots: 'noindex, nofollow',
        }}
      />
      <AdminLayout title='Analytics Dashboard'>
        <div className='space-y-6'>
          {/* Date Range Selector */}
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Analytics Overview
            </h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='7d'>Last 7 days</option>
              <option value='30d'>Last 30 days</option>
              <option value='90d'>Last 90 days</option>
              <option value='1y'>Last year</option>
            </select>
          </div>

          {/* Stats Cards */}
          <AdminStats
            stats={stats}
            loading={revenueLoading || engagementLoading}
          />

          {/* Analytics Tabs */}
          <div className='bg-white rounded-lg shadow p-6'>
            <TabComponent tabLabels={tabLabels} tabPanels={tabPanels} />
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalytics;
