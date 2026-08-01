import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

export default function ManagerDashboard() {
  const tableData = [
    [
      <div key="1" style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold' }}>Alex Johnson</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Software Engineer</span>
      </div>,
      'Engineering',
      <Badge key="1" status="processing">AI Processing</Badge>,
      '75%',
      <span key="1" style={{ color: 'var(--state-warning)' }}>Medium (3)</span>,
      <Link key="1" href="/workspace/1" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Open Workspace &rarr;</Link>
    ],
    [
      <div key="2" style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold' }}>Samantha Lee</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Product Designer</span>
      </div>,
      'Design',
      <Badge key="2" status="draft">Draft</Badge>,
      '40%',
      <span key="2" style={{ color: 'var(--state-success)' }}>Low (0)</span>,
      <Link key="2" href="/workspace/2" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Open Workspace &rarr;</Link>
    ],
    [
      <div key="3" style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold' }}>Marcus Reed</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sales Executive</span>
      </div>,
      'Sales',
      <Badge key="3" status="approved">Approved</Badge>,
      '100%',
      <span key="3" style={{ color: 'var(--state-success)' }}>Low (0)</span>,
      <Link key="3" href="/workspace/3" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Open Workspace &rarr;</Link>
    ]
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Company Overview</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your team's performance reviews.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline">Invite Employee</Button>
          <Button>Generate Reviews</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Employees</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>24</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Reviews Pending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>8</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Avg Completion</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>65%</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Bias Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--state-warning)' }}>12</div>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Employee Table</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
            <Button variant="outline">Filter</Button>
          </div>
        </div>
        
        <Table 
          headers={['Employee Name', 'Department', 'Review Status', 'Completion %', 'Bias Score', 'Action']} 
          data={tableData} 
        />
      </Card>
      
    </div>
  );
}
