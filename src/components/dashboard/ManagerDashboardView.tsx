"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { GoalModal } from "@/components/modals/GoalModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { UpdateGoalProgressModal } from "@/components/modals/UpdateGoalProgressModal";
import { AuditLogsModal } from "@/components/modals/AuditLogsModal";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
  priority?: string;
  deadline?: string | null;
  successCriteria?: string | null;
  project?: Project | null;
}

interface Employee {
  id: string;
  email: string;
  assignedGoals: Goal[];
}

interface ManagerDashboardViewProps {
  employees: Employee[];
}

export function ManagerDashboardView({ employees }: ManagerDashboardViewProps) {
  const router = useRouter();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [selectedFeedbackEmployee, setSelectedFeedbackEmployee] = useState<Employee | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [defaultAssigneeEmail, setDefaultAssigneeEmail] = useState("");

  const refreshData = () => {
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge status="approved">🟢 Completed</Badge>;
      case "In Progress":
        return <Badge status="processing">🔵 In Progress</Badge>;
      case "On Hold":
        return <Badge status="warning">🟡 On Hold</Badge>;
      default:
        return <Badge status="draft">⚪ Not Started</Badge>;
    }
  };

  const getPriorityBadgeStyle = (priority?: string) => {
    switch (priority) {
      case "Urgent":
        return { background: "rgba(244, 63, 94, 0.15)", color: "#f43f5e", border: "1px solid #f43f5e" };
      case "High":
        return { background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid #f59e0b" };
      case "Low":
        return { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid #10b981" };
      default:
        return { background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "1px solid #3b82f6" };
    }
  };

  const totalEmployees = employees.length;
  const tableData = employees.map((emp) => {
    const totalGoals = emp.assignedGoals.length;
    const avgProgress =
      totalGoals > 0
        ? emp.assignedGoals.reduce((acc, curr) => acc + curr.progress, 0) / totalGoals
        : 0;

    return [
      <div key={emp.id} style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: "bold" }}>{emp.email}</span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Employee</span>
      </div>,

      <div key={`goals-${emp.id}`} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", minWidth: "260px" }}>
        {emp.assignedGoals.length === 0 ? (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No goals assigned</span>
        ) : (
          emp.assignedGoals.map((g) => {
            const priorityStyle = getPriorityBadgeStyle(g.priority);
            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g)}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  transition: "border-color 0.2s ease",
                }}
              >
                {/* Project Tag & Priority */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--accent-primary)",
                      background: "rgba(224, 53, 162, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    📁 {g.project?.name || "General Project"}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      ...priorityStyle,
                    }}
                  >
                    {g.priority || "Medium"}
                  </span>
                </div>

                {/* Goal Title */}
                <span style={{ fontWeight: "600" }}>{g.title}</span>

                {/* Progress Bar & Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${g.progress}%`,
                        height: "100%",
                        background: g.progress === 100 ? "var(--state-success)" : "var(--accent-primary)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "bold", minWidth: "32px", textAlign: "right" }}>
                    {g.progress}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>,

      <Badge key={`badge-${emp.id}`} status="processing">
        In Progress
      </Badge>,

      `${Math.round(avgProgress)}%`,

      <div key={`actions-${emp.id}`} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={() => {
            setDefaultAssigneeEmail(emp.email);
            setIsGoalModalOpen(true);
          }}
          style={{
            background: "none",
            border: "1px solid var(--border-default)",
            borderRadius: "4px",
            color: "var(--text-primary)",
            padding: "4px 8px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          + Goal
        </button>

        <button
          onClick={() => setSelectedFeedbackEmployee(emp)}
          style={{
            background: "none",
            border: "1px solid var(--accent-primary)",
            borderRadius: "4px",
            color: "var(--accent-primary)",
            padding: "4px 8px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          + Feedback
        </button>
      </div>,
    ];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Company Manager Overview</h2>
          <p style={{ color: "var(--text-muted)" }}>Assign goals to projects, track employee completion, submit feedback, and view audit logs.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" onClick={() => setIsAuditLogsModalOpen(true)}>
            📜 System Audit Logs
          </Button>
          <Button
            onClick={() => {
              setDefaultAssigneeEmail("");
              setIsGoalModalOpen(true);
            }}
          >
            + Create & Assign Goal
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Total Employees
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totalEmployees}</div>
        </Card>
        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Reviews Pending
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totalEmployees}</div>
        </Card>
        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Avg Goal Completion
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {Math.round(
              employees.reduce((acc, emp) => {
                const goals = emp.assignedGoals.length;
                return acc + (goals > 0 ? emp.assignedGoals.reduce((a, c) => a + c.progress, 0) / goals : 0);
              }, 0) / (employees.length || 1)
            )}
            %
          </div>
        </Card>
        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Audit Trail Events
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--state-success)" }}>
            Active
          </div>
        </Card>
      </div>

      {/* Employee Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
            Employee Roster & Goal Management
          </h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Manager actions logged in append-only audit trail
          </span>
        </div>

        <Table
          headers={["Employee", "Assigned Goals", "Review Status", "Avg Progress", "Manager Actions"]}
          data={tableData}
        />
      </Card>

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        defaultAssigneeEmail={defaultAssigneeEmail}
        availableEmployees={employees.map((e) => ({ id: e.id, email: e.email }))}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={refreshData}
      />

      {selectedFeedbackEmployee && (
        <FeedbackModal
          isOpen={!!selectedFeedbackEmployee}
          targetUserId={selectedFeedbackEmployee.id}
          targetUserEmail={selectedFeedbackEmployee.email}
          onClose={() => setSelectedFeedbackEmployee(null)}
          onSuccess={refreshData}
        />
      )}

      <UpdateGoalProgressModal
        isOpen={!!selectedGoal}
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onSuccess={refreshData}
        isManager={true}
      />

      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
      />
    </div>
  );
}

