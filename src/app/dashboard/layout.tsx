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
    if (pathname.includes('/employee/goals')) return 'My Goals';
    if (pathname.includes('/employee/assessments')) return 'Self Assessments & Notes';
    if (pathname.includes('/employee/deadlines')) return 'Upcoming Deadlines';
    if (pathname.includes('/employee/feedback')) return 'Manager Feedback';
    if (pathname.includes('/employee/fairness')) return 'Fairness Report';
    if (pathname.includes('/employee/ai-assistant')) return 'AI Assistant';
    if (pathname.includes('/employee/activity')) return 'Activity History';
    if (pathname.includes('/employee/profile')) return 'Profile & Settings';
    if (pathname.includes('/employee')) return 'Dashboard Overview';

    if (pathname.includes('/manager/directory')) return 'Employee Directory';
    if (pathname.includes('/manager/goals')) return 'Goal Management';
    if (pathname.includes('/manager/workspace')) return 'Review Workspace';
    if (pathname.includes('/manager/analytics')) return 'Performance Analytics';
    if (pathname.includes('/manager/github-analytics')) return 'GitHub Analytics';
    if (pathname.includes('/manager/fairness')) return 'Fairness Analytics';
    if (pathname.includes('/manager/schedule')) return 'Review Schedule';
    if (pathname.includes('/manager/audit-logs')) return 'Audit Logs';
    if (pathname.includes('/manager/ai-assistant')) return 'AI Assistant';
    if (pathname.includes('/manager/profile')) return 'Profile & Settings';
    if (pathname.includes('/manager')) return 'Dashboard Overview';

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
