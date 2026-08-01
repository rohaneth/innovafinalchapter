import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function OnboardingPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Company Association</h1>
        <p style={{ color: 'var(--text-muted)' }}>Join or create your company workspace</p>
      </div>

      <Card style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Company Name or Invite Code</label>
          <input 
            type="text" 
            placeholder="e.g. Acme Corp"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-base)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <Button style={{ marginTop: '8px' }}>
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none', display: 'block', width: '100%' }}>
            Complete Setup
          </Link>
        </Button>
      </Card>
    </div>
  );
}
