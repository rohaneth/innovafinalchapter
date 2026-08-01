import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== "Employee") {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      assignedGoals: true,
      submissions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) return <div>User not found</div>;

  const totalGoals = user.assignedGoals.length;
  const completedGoals = user.assignedGoals.filter(g => g.status === 'Completed').length;
  const averageProgress = totalGoals > 0 
    ? user.assignedGoals.reduce((acc, curr) => acc + curr.progress, 0) / totalGoals 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome back, {user.email}!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Here is your performance overview.</p>
        </div>
        <Button>Submit Assessment</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Active Goals</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalGoals - completedGoals}</span>
            <Badge status="processing">In Progress</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Average Goal Progress</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round(averageProgress)}%</span>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Submissions</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.submissions.length}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Items synced</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Your Goals</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {user.assignedGoals.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>No goals assigned yet.</div>
          )}
          {user.assignedGoals.map(goal => (
            <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{goal.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{goal.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>{goal.progress}%</div>
                <Badge status={goal.status === 'Completed' ? 'approved' : 'processing'}>{goal.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
    </div>
  );
}
