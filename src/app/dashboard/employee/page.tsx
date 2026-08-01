import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function EmployeeDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome back, Alex!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Here is your performance overview for Q3.</p>
        </div>
        <Button>Submit Assessment</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Current Review Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Q3 Cycle</span>
            <Badge status="processing">AI Processing</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Goal Progress</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>75%</span>
            <span style={{ color: 'var(--state-success)', fontSize: '14px' }}>+12% this month</span>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Project Contributions</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>14</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Artifacts synced</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Today</div>
            <div>Manager feedback submitted by Sarah Jenkins.</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Yesterday</div>
            <div>AI generated draft review for Q3.</div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Aug 12</div>
            <div>You completed your self-assessment.</div>
          </div>
        </div>
      </Card>
      
    </div>
  );
}
