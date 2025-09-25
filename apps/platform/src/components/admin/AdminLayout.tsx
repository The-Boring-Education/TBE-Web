import {
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon as BarChart3Icon,
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  TrophyIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { type ReactNode } from 'react';

import { Button, LoadingSpinner, Text } from '@/components';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Courses', href: '/admin/courses', icon: AcademicCapIcon },
  { name: 'Projects', href: '/admin/projects', icon: BriefcaseIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Revenue', href: '/admin/revenue', icon: BarChart3Icon },
  { name: 'Gamification', href: '/admin/gamification', icon: TrophyIcon },
  { name: 'Content', href: '/admin/content', icon: UserGroupIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

const AdminLayout = ({
  children,
  title = 'Admin Dashboard',
}: AdminLayoutProps) => {
  const { isAdmin, isLoading, user } = useAdmin();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Text className='text-2xl font-bold text-red-600 mb-4' level='h1'>
            Access Denied
          </Text>
          <Text className='text-gray-600 mb-4' level='p'>
            You don't have permission to access this area.
          </Text>
          <Button
            variant='PRIMARY'
            text='Return to Home'
            onClick={() => router.push('/')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='w-64 bg-white shadow-lg'>
        <div className='p-6'>
          <Text className='text-xl font-bold text-gray-900' level='h2'>
            TBE Admin
          </Text>
          <Text className='text-sm text-gray-600 mt-1' level='p'>
            Welcome, {user?.name}
          </Text>
        </div>

        <nav className='mt-6'>
          {navigationItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className='mr-3 h-5 w-5' />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b'>
          <div className='px-6 py-4'>
            <Text className='text-2xl font-bold text-gray-900' level='h1'>
              {title}
            </Text>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto p-6'>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
