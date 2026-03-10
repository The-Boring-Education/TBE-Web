import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CreditCardIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  AdminAreaChart,
  AdminBarChart,
  AdminLayout,
  AdminLineChart,
  AdminPieChart,
  AdminStats,
  SEO,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import { useAdminData } from '@tbe/hooks';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const AdminRevenue = () => {
  const {
    data: revenueData,
    loading: revenueLoading,
    fetchData: fetchRevenue,
  } = useAdminData();
  const {
    data: subscriptionData,
    loading: subscriptionLoading,
    fetchData: fetchSubscriptions,
  } = useAdminData();
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const params = { period: dateRange };
    fetchRevenue(`${routes.api.base}/admin/analytics`, {
      type: 'revenue',
      ...params,
    });
    fetchSubscriptions(`${routes.api.base}/admin/analytics`, {
      type: 'operational',
      ...params,
    });
  }, [fetchRevenue, fetchSubscriptions, dateRange]);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${((revenueData?.totalRevenue || 0) / 100).toLocaleString()}`,
      icon: <BanknotesIcon className='h-6 w-6' />,
      color: 'green' as const,
      change: { value: 18, type: 'increase' as const },
    },
    {
      title: 'Total Transactions',
      value: revenueData?.totalTransactions || 0,
      icon: <CreditCardIcon className='h-6 w-6' />,
      color: 'blue' as const,
      change: { value: 12, type: 'increase' as const },
    },
    {
      title: 'Average Order Value',
      value: `₹${(
        (revenueData?.averageTransactionValue || 0) / 100
      ).toLocaleString()}`,
      icon: <ArrowTrendingUpIcon className='h-6 w-6' />,
      color: 'purple' as const,
      change: { value: 5, type: 'increase' as const },
    },
    {
      title: 'Conversion Rate',
      value: `${revenueData?.conversionRate || 0}%`,
      icon: <UserGroupIcon className='h-6 w-6' />,
      color: 'yellow' as const,
      change: { value: 3, type: 'increase' as const },
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
      product:
        item._id === 'COURSE'
          ? 'Courses'
          : item._id === 'PROJECT'
            ? 'Projects'
            : item._id === 'INTERVIEW_SHEET'
              ? 'Interview Sheets'
              : item._id,
      revenue: item.totalRevenue / 100,
      transactions: item.transactionCount,
    }));
  };

  const formatSubscriptionMetrics = (data: any) => {
    if (!data?.subscriptionMetrics) return [];
    return data.subscriptionMetrics.map((item: any) => ({
      type: item._id,
      revenue: item.totalRevenue / 100,
      subscriptions: item.totalSubscriptions,
      active: item.activeSubscriptions,
    }));
  };

  const formatMonthlyGrowth = (data: any) => {
    if (!data?.revenueTimeSeries) return [];

    // Group by month and calculate growth
    const monthlyData: {
      [key: string]: { revenue: number; transactions: number };
    } = {};

    data.revenueTimeSeries.forEach((item: any) => {
      const monthKey = `${item._id.month}/${item._id.year}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, transactions: 0 };
      }
      monthlyData[monthKey].revenue += item.totalRevenue / 100;
      monthlyData[monthKey].transactions += item.transactionCount;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        transactions: data.transactions,
      }))
      .slice(-6); // Last 6 months
  };

  return (
    <>
      <SEO
        seoMeta={{
          title: 'Revenue Analytics - Admin Dashboard',
          description: 'Detailed revenue analytics and financial insights',
          url: 'https://theboringeducation.com/admin/revenue',
          siteName: 'The Boring Education',
          type: 'website',
          image: 'https://theboringeducation.com/images/logo.png',
          robots: 'noindex, nofollow',
        }}
      />
      <AdminLayout title='Revenue Analytics'>
        <div className='space-y-6'>
          {/* Date Range Selector */}
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Revenue Overview
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
          <AdminStats stats={stats} loading={revenueLoading} />

          {/* Revenue Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Trend */}
            <AdminLineChart
              data={formatRevenueTimeSeries(revenueData)}
              title='Daily Revenue Trend'
              dataKey='revenue'
              xAxisKey='date'
              color='#10B981'
            />

            {/* Transaction Volume */}
            <AdminAreaChart
              data={formatRevenueTimeSeries(revenueData)}
              title='Transaction Volume'
              dataKey='transactions'
              xAxisKey='date'
              color='#3B82F6'
            />

            {/* Revenue by Product */}
            <AdminPieChart
              data={formatProductRevenue(revenueData)}
              title='Revenue by Product Type'
              dataKey='revenue'
              nameKey='product'
            />

            {/* Monthly Growth */}
            <AdminBarChart
              data={formatMonthlyGrowth(revenueData)}
              title='Monthly Revenue Growth'
              dataKey='revenue'
              xAxisKey='month'
              color='#8B5CF6'
            />
          </div>

          {/* Additional Insights */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Product Performance Table */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Product Performance
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-left'>Product</th>
                      <th className='px-4 py-2 text-right'>Revenue</th>
                      <th className='px-4 py-2 text-right'>Orders</th>
                      <th className='px-4 py-2 text-right'>Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatProductRevenue(revenueData).map(
                      (product: any, index: number) => (
                        <tr key={index} className='border-t'>
                          <td className='px-4 py-2 font-medium'>
                            {product.product}
                          </td>
                          <td className='px-4 py-2 text-right'>
                            ₹{product.revenue.toLocaleString()}
                          </td>
                          <td className='px-4 py-2 text-right'>
                            {product.transactions}
                          </td>
                          <td className='px-4 py-2 text-right'>
                            ₹
                            {Math.round(
                              product.revenue / product.transactions || 0,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Metrics */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Key Financial Metrics
              </h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>
                    Monthly Recurring Revenue
                  </span>
                  <span className='font-semibold text-green-600'>
                    ₹{((revenueData?.totalRevenue || 0) / 100).toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>
                    Customer Acquisition Cost
                  </span>
                  <span className='font-semibold'>₹2,450</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Customer Lifetime Value</span>
                  <span className='font-semibold'>₹12,300</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Churn Rate</span>
                  <span className='font-semibold text-orange-600'>3.2%</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Revenue Growth Rate</span>
                  <span className='font-semibold text-green-600'>+18.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default dynamic(() => Promise.resolve(AdminRevenue), {
  ssr: false,
});
