import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bias-Aware 360&deg;</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sign in to your account</p>
      </div>

      <Card style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Email</label>
          <input 
            type="email" 
            placeholder="you@company.com"
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
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
            Log In
          </Link>
        </Button>
      </Card>

      <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
        Don't have an account? <Link href="/signup" style={{ color: 'var(--accent-primary)' }}>Sign up</Link>
      </p>
    </div>
  );
}
