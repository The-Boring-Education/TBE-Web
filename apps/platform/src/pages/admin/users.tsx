import { EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { AdminLayout, AdminStats, AdminTable, SEO } from '@tbe/components';
import { useAdminData } from '@tbe/hooks';
import { routes } from '@tbe/constants';

const AdminUsers = () => {
  const {
    data: usersData,
    loading: usersLoading,
    fetchData: fetchUsers,
  } = useAdminData();
  const {
    data: segmentsData,
    loading: segmentsLoading,
    fetchData: fetchSegments,
  } = useAdminData();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSegment, setSelectedSegment] = useState('all');

  useEffect(() => {
    fetchUsers(`${routes.api.base}/admin/dashboard`, {
      type: 'users',
      page: currentPage,
      limit: 20,
    });
    fetchSegments(`${routes.api.base}/admin/users`, { action: 'segments' });
  }, [fetchUsers, fetchSegments, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string, newOrder: 'asc' | 'desc') => {
    setSortBy(key);
    setOrder(newOrder);
    setCurrentPage(1);

    fetchUsers(`${routes.api.base}/admin/dashboard`, {
      type: 'users',
      page: 1,
      limit: 20,
      sortBy: key,
      order: newOrder,
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    // In a real implementation, you'd implement search on the backend
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className='flex items-center'>
          <UserIcon className='h-5 w-5 text-gray-400 mr-2' />
          <div>
            <div className='font-medium text-gray-900'>{value}</div>
            <div className='text-sm text-gray-500'>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'Username',
      sortable: true,
    },
    {
      key: 'contactNo',
      label: 'Contact',
      render: (value: string) => value || 'Not provided',
    },
    {
      key: 'occupation',
      label: 'Occupation',
      render: (value: string) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === 'STUDENT'
              ? 'bg-blue-100 text-blue-800'
              : value === 'WORKING_PROFESSIONAL'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value?.replace('_', ' ') || 'Not specified'}
        </span>
      ),
    },
    {
      key: 'isOnboarded',
      label: 'Status',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value ? 'Onboarded' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'lastUpdated',
      label: 'Last Activity',
      sortable: true,
      render: (value: string) => (
        <div className='text-sm text-gray-600'>{value}</div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <button className='text-blue-600 hover:text-blue-800'>
          <EyeIcon className='h-4 w-4' />
        </button>
      ),
    },
  ];

  const stats = segmentsData
    ? [
        {
          title: 'Total Users',
          value: usersData?.total || 0,
          icon: <UserIcon className='h-6 w-6' />,
          color: 'blue' as const,
        },
        {
          title: 'Active Users',
          value: segmentsData.activeUsers || 0,
          icon: <UserIcon className='h-6 w-6' />,
          color: 'green' as const,
        },
        {
          title: 'New This Month',
          value: segmentsData.newThisMonth || 0,
          icon: <UserIcon className='h-6 w-6' />,
          color: 'purple' as const,
        },
        {
          title: 'Onboarded',
          value: segmentsData.onboardedUsers || 0,
          icon: <UserIcon className='h-6 w-6' />,
          color: 'yellow' as const,
        },
      ]
    : [];

  return (
    <>
      <SEO
        seoMeta={{
          title: 'Users Management - Admin Dashboard',
          description: 'Manage and view all users in the TBE platform',
          url: 'https://theboringeducation.com/admin/users',
          siteName: 'The Boring Education',
          type: 'website',
          image: 'https://theboringeducation.com/images/logo.png',
          robots: 'noindex, nofollow',
        }}
      />
      <AdminLayout title='Users Management'>
        <div className='space-y-6'>
          {/* Stats Cards */}
          <AdminStats stats={stats} loading={segmentsLoading} />

          {/* Users Table */}
          <AdminTable
            columns={columns}
            data={usersData?.items || []}
            loading={usersLoading}
            pagination={{
              currentPage,
              totalPages: usersData?.totalPages || 1,
              total: usersData?.total || 0,
              onPageChange: handlePageChange,
            }}
            sorting={{
              sortBy,
              order,
              onSort: handleSort,
            }}
            filters={{
              searchTerm,
              onSearchChange: handleSearch,
              additionalFilters: (
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='all'>All Users</option>
                  <option value='students'>Students</option>
                  <option value='professionals'>Professionals</option>
                  <option value='onboarded'>Onboarded</option>
                  <option value='pending'>Pending Onboarding</option>
                </select>
              ),
            }}
            actions={{
              onRefresh: () =>
                fetchUsers(`${routes.api.base}/admin/dashboard`, {
                  type: 'users',
                  page: currentPage,
                  limit: 20,
                }),
              onExport: () => {
                // Implement export functionality
                console.log('Exporting users data...');
              },
            }}
          />
        </div>
      </AdminLayout>
    </>
  );
};

export default dynamic(() => Promise.resolve(AdminUsers), {
  ssr: false,
});
