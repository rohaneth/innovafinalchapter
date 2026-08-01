'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Dummy role detection based on URL
  const role = pathname.includes('/dashboard/manager') ? 'manager' : 'employee';
  
  const getPageTitle = () => {
    if (pathname.includes('/employee/assessment')) return 'Self Assessment';
    if (pathname.includes('/employee/goals')) return 'My Goals';
    if (pathname.includes('/employee/projects')) return 'My Projects';
    if (pathname.includes('/manager/employees')) return 'Team Overview';
    if (pathname.includes('/manager/reviews')) return 'Review Cycle';
    return 'Dashboard';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Sidebar role={role} activePath={pathname} />
      
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <TopNav title={getPageTitle()} />
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
