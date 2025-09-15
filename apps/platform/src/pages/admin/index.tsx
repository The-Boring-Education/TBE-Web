import {
  AcademicCapIcon,
  BanknotesIcon,
  BriefcaseIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';

import {
  AdminAreaChart,
  AdminBarChart,
  AdminLayout,
  AdminLineChart,
  AdminPieChart,
  AdminStats,
  SEO,
} from '@/components';
import { useAdminData } from '@/hooks/useAdmin';

const AdminDashboard = () => {
  const {
    data: overviewData,
    loading: overviewLoading,
    fetchData: fetchOverview,
  } = useAdminData();
  const {
    data: analyticsData,
    loading: analyticsLoading,
    fetchData: fetchAnalytics,
  } = useAdminData();
  const {
    data: revenueData,
    loading: revenueLoading,
    fetchData: fetchRevenue,
  } = useAdminData();
  const {
    data: userGrowthData,
    loading: userGrowthLoading,
    fetchData: fetchUserGrowth,
  } = useAdminData();

  useEffect(() => {
    fetchOverview('/api/v1/admin/dashboard', { type: 'overview' });
    fetchAnalytics('/api/v1/admin/analytics', { type: 'user-engagement' });
    fetchRevenue('/api/v1/admin/analytics', { type: 'revenue' });
    fetchUserGrowth('/api/v1/admin/users', { action: 'growth' });
  }, [fetchOverview, fetchAnalytics, fetchRevenue, fetchUserGrowth]);

  const stats = overviewData
    ? [
        {
          title: 'Total Users',
          value: overviewData.totalUsers || 0,
          icon: <UserGroupIcon className='h-6 w-6' />,
          color: 'blue' as const,
          change: { value: 12, type: 'increase' as const },
        },
        {
          title: 'Total Courses',
          value: overviewData.totalCourses || 0,
          icon: <AcademicCapIcon className='h-6 w-6' />,
          color: 'green' as const,
          change: { value: 8, type: 'increase' as const },
        },
        {
          title: 'Total Projects',
          value: overviewData.totalProjects || 0,
          icon: <BriefcaseIcon className='h-6 w-6' />,
          color: 'purple' as const,
          change: { value: 15, type: 'increase' as const },
        },
        {
          title: 'Total Revenue',
          value: `₹${(
            (revenueData?.totalRevenue || 0) / 100
          ).toLocaleString()}`,
          icon: <BanknotesIcon className='h-6 w-6' />,
          color: 'yellow' as const,
          change: { value: 23, type: 'increase' as const },
        },
      ]
    : [];

  const formatRevenueData = (data: any) => {
    if (!data || !data.revenueTimeSeries) return [];

    return data.revenueTimeSeries.map((item: any) => ({
      date: `${item._id.day}/${item._id.month}`,
      revenue: item.totalRevenue / 100,
      transactions: item.transactionCount,
    }));
  };

  const formatUserGrowthData = (data: any) => {
    if (!data || !data.dailyGrowth) return [];

    return data.dailyGrowth.map((item: any) => ({
      date: item._id.date,
      users: item.newUsers,
    }));
  };

  const formatEngagementData = (data: any) => {
    if (!data || !data.engagementByRole) return [];

    return data.engagementByRole.map((item: any) => ({
      role: item._id || 'Unknown',
      total: item.totalUsers,
      onboarded: item.onboardedUsers,
    }));
  };

  const formatProductRevenueData = (data: any) => {
    if (!data || !data.productRevenue) return [];

    return data.productRevenue.map((item: any) => ({
      product: item._id,
      revenue: item.totalRevenue / 100,
      transactions: item.transactionCount,
    }));
  };

  return (
    <>
      <SEO
        seoMeta={{
          title: 'Admin Dashboard - TBE',
          description: 'Admin dashboard for TBE platform management',
          url: 'https://theboringeducation.com/admin',
          siteName: 'The Boring Education',
          type: 'website',
          image: 'https://theboringeducation.com/images/logo.png',
          robots: 'noindex, nofollow',
        }}
      />
      <AdminLayout title='Dashboard Overview'>
        <div className='space-y-6'>
          {/* Stats Cards */}
          <AdminStats stats={stats} loading={overviewLoading} />

          {/* Charts Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Chart */}
            <AdminLineChart
              data={formatRevenueData(revenueData)}
              title='Revenue Trend'
              dataKey='revenue'
              xAxisKey='date'
              color='#10B981'
            />

            {/* User Growth Chart */}
            <AdminAreaChart
              data={formatUserGrowthData(userGrowthData)}
              title='User Growth'
              dataKey='users'
              xAxisKey='date'
              color='#3B82F6'
            />

            {/* User Engagement by Role */}
            <AdminBarChart
              data={formatEngagementData(analyticsData)}
              title='User Engagement by Role'
              dataKey='total'
              xAxisKey='role'
              color='#8B5CF6'
            />

            {/* Product Revenue Distribution */}
            <AdminPieChart
              data={formatProductRevenueData(revenueData)}
              title='Revenue by Product'
              dataKey='revenue'
              nameKey='product'
            />
          </div>

          {/* Additional Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <TrophyIcon className='h-8 w-8 text-yellow-500 mr-3' />
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {overviewData?.coursesEnrolled || 0}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Course Enrollments
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <BriefcaseIcon className='h-8 w-8 text-purple-500 mr-3' />
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {overviewData?.projectsEnrolled || 0}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Project Enrollments
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <AcademicCapIcon className='h-8 w-8 text-green-500 mr-3' />
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {overviewData?.sheetsEnrolled || 0}
                  </div>
                  <div className='text-sm text-gray-600'>Sheet Enrollments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
