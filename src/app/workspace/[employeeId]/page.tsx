'use client';

import React from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/layout/TopNav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function WorkspacePage({ params }: { params: { employeeId: string } }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <TopNav title="Review Workspace" />
      
      <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/dashboard/manager" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontWeight: 'bold' }}>Employee {params.employeeId}</span>
          <Badge status="processing">Draft In Progress</Badge>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline">Save Draft</Button>
          <Button variant="success">Approve Review</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ borderRight: '1px solid var(--border-default)', padding: '24px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Profile Context</h3>
          
          <Card style={{ marginBottom: '16px', padding: '16px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Alex Johnson</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Software Engineer</div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Goals</div>
              <ul style={{ fontSize: '14px', color: 'var(--text-primary)', paddingLeft: '20px' }}>
                <li>Deliver API v2</li>
                <li>Mentor junior devs</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Recent Feedback</div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: '6px' }}>
                "Great collaboration on the billing migration."
              </p>
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={{ padding: '32px 48px', overflowY: 'auto', backgroundColor: '#0F0C1B' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Q3 Performance Review</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <section>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent-primary)' }}>Strengths</h3>
                <p style={{ lineHeight: '1.6', fontSize: '15px' }}>
                  Alex has shown excellent collaboration <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>[1]</span> across multiple teams this quarter. 
                  They demonstrated strong technical ownership <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>[2]</span> by leading the billing migration 
                  and delivered the project successfully ahead of schedule <span style={{ backgroundColor: 'rgba(255, 91, 91, 0.2)', cursor: 'pointer' }}>[3]</span>.
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent-primary)' }}>Growth Areas</h3>
                <p style={{ lineHeight: '1.6', fontSize: '15px' }}>
                  While technically strong, there are opportunities to improve documentation practices <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>[4]</span>.
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ borderLeft: '1px solid var(--border-default)', padding: '24px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Bias Inspector</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card style={{ padding: '16px', borderLeft: '4px solid var(--state-error)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Unsupported Claim</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>[3]</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                The claim "delivered project successfully ahead of schedule" lacks concrete evidence in the provided notes.
              </p>
            </Card>

            <Card style={{ padding: '16px', borderLeft: '4px solid var(--state-warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Recency Bias</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                90% of the feedback cited is from the last 3 weeks of the quarter.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
