import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  role: 'employee' | 'manager';
  activePath?: string;
}

export function Sidebar({ role, activePath = '/dashboard' }: SidebarProps) {
  const employeeLinks = [
    { name: 'Dashboard', path: '/dashboard/employee' },
    { name: 'Self Assessment', path: '/dashboard/employee/assessment' },
    { name: 'Goals', path: '/dashboard/employee/goals' },
    { name: 'Projects', path: '/dashboard/employee/projects' },
    { name: 'Meeting Notes', path: '/dashboard/employee/notes' },
    { name: 'My Reviews', path: '/dashboard/employee/reviews' },
    { name: 'Profile', path: '/dashboard/employee/profile' },
    { name: 'Settings', path: '/dashboard/employee/settings' },
  ];

  const managerLinks = [
    { name: 'Dashboard', path: '/dashboard/manager' },
    { name: 'Employees', path: '/dashboard/manager/employees' },
    { name: 'Reviews', path: '/dashboard/manager/reviews' },
    { name: 'Feedback', path: '/dashboard/manager/feedback' },
    { name: 'Bias Alerts', path: '/dashboard/manager/bias-alerts' },
    { name: 'Audit Logs', path: '/dashboard/manager/audit-logs' },
    { name: 'Settings', path: '/dashboard/manager/settings' },
  ];

  const links = role === 'manager' ? managerLinks : employeeLinks;

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      height: '100vh',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div style={{ marginBottom: '32px', paddingLeft: '12px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 'bold' }}>
          Bias-Aware 360&deg;
        </h2>
        <span style={{ color: 'var(--accent-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {role === 'manager' ? 'Manager Portal' : 'Employee Portal'}
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {links.map((link) => {
          const isActive = activePath.startsWith(link.path);
          return (
            <Link key={link.name} href={link.path} style={{
              padding: '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
              border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '500' : 'normal',
            }}>
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-default)', marginTop: 'auto' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
          Logged in as <b>{role === 'manager' ? 'Manager' : 'Employee'}</b>
        </div>
        <Link href="/login" style={{ color: 'var(--state-error)', textDecoration: 'none', fontSize: '14px' }}>
          Log Out
        </Link>
      </div>
    </div>
  );
}
