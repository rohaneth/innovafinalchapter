import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from 'next/navigation';

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== "Manager") {
    redirect('/login');
  }

  // Fetch employees in the manager's company
  const employees = await prisma.user.findMany({
    where: { 
      companyId: session.user.companyId,
      role: 'Employee'
    },
    include: {
      assignedGoals: true
    }
  });

  const tableData = employees.map(emp => {
    const totalGoals = emp.assignedGoals.length;
    const avgProgress = totalGoals > 0 
      ? emp.assignedGoals.reduce((acc, curr) => acc + curr.progress, 0) / totalGoals 
      : 0;

    return [
      <div key={emp.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold' }}>{emp.email}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Employee</span>
      </div>,
      'Engineering', // Mock department for now
      <Badge key={`badge-${emp.id}`} status="processing">In Progress</Badge>,
      `${Math.round(avgProgress)}%`,
      <span key={`score-${emp.id}`} style={{ color: 'var(--state-success)' }}>Low (0)</span>,
      <Link key={`link-${emp.id}`} href={`/workspace/${emp.id}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Open Workspace &rarr;</Link>
    ];
  });

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
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{employees.length}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Reviews Pending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{employees.length}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Avg Completion</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {Math.round(employees.reduce((acc, emp) => {
               const goals = emp.assignedGoals.length;
               return acc + (goals > 0 ? emp.assignedGoals.reduce((a, c) => a + c.progress, 0) / goals : 0);
            }, 0) / (employees.length || 1))}%
          </div>
        </Card>
        <Card>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Bias Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--state-success)' }}>0</div>
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
          headers={['Employee Email', 'Department', 'Review Status', 'Avg Goal Progress', 'Bias Score', 'Action']} 
          data={tableData} 
        />
      </Card>
      
    </div>
  );
}
