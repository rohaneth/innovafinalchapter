"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SubmissionModal } from "@/components/modals/SubmissionModal";
import { UpdateGoalProgressModal } from "@/components/modals/UpdateGoalProgressModal";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority?: string;
  deadline?: string | null;
  successCriteria?: string | null;
  progress: number;
  project?: Project | null;
}

interface Submission {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
}

interface EmployeeDashboardViewProps {
  userEmail: string;
  goals: Goal[];
  submissions: Submission[];
}

export function EmployeeDashboardView({
  userEmail,
  goals: initialGoals,
  submissions: initialSubmissions,
}: EmployeeDashboardViewProps) {
  const router = useRouter();
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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

  const totalGoals = initialGoals.length;
  const completedGoals = initialGoals.filter((g) => g.status === "Completed").length;
  const averageProgress =
    totalGoals > 0
      ? initialGoals.reduce((acc, curr) => acc + curr.progress, 0) / totalGoals
      : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Welcome back, {userEmail}!</h2>
          <p style={{ color: "var(--text-muted)" }}>Here is your performance overview and assigned project goals.</p>
        </div>
        <Button onClick={() => setIsSubmissionModalOpen(true)}>
          + Submit Self-Assessment / Notes
        </Button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Active Goals
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>
              {totalGoals - completedGoals}
            </span>
            <Badge status="processing">In Progress</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Average Goal Progress
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>
              {Math.round(averageProgress)}%
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "8px" }}>
            Data Submissions
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>
              {initialSubmissions.length}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Items synced</span>
          </div>
        </Card>
      </div>

      {/* Goals List Card */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Your Project Goals</h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Click goal to update progress</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {initialGoals.length === 0 && (
            <div style={{ color: "var(--text-muted)" }}>No goals assigned yet.</div>
          )}
          {initialGoals.map((goal) => {
            const priorityStyle = getPriorityBadgeStyle(goal.priority);
            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, transform 0.1s ease",
                }}
              >
                {/* Header: Project & Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--accent-primary)",
                        background: "rgba(224, 53, 162, 0.1)",
                        padding: "3px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      📁 {goal.project?.name || "General Project"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        ...priorityStyle,
                      }}
                    >
                      {goal.priority || "Medium"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {goal.deadline && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        📅 Due: {goal.deadline}
                      </span>
                    )}
                    {getStatusBadge(goal.status)}
                  </div>
                </div>

                {/* Body: Title & Description */}
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <div style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.4" }}>
                      {goal.description}
                    </div>
                  )}
                  {goal.successCriteria && (
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--accent-secondary)" }}>
                      🎯 <strong>Success Criteria:</strong> {goal.successCriteria}
                    </div>
                  )}
                </div>

                {/* Footer: Progress Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${goal.progress}%`,
                        height: "100%",
                        background: goal.progress === 100 ? "var(--state-success)" : "var(--accent-primary)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontWeight: "bold", fontSize: "13px", minWidth: "40px", textAlign: "right" }}>
                    {goal.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Data Submissions History */}
      <Card>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
          Your Recent Submissions & Notes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {initialSubmissions.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No submissions yet. Submit self-assessments or meeting notes above.</div>
          ) : (
            initialSubmissions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span className="badge-tag badge-accent">{sub.type}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: "var(--text-primary)" }}>{sub.content}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSuccess={refreshData}
      />

      <UpdateGoalProgressModal
        isOpen={!!selectedGoal}
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onSuccess={refreshData}
        isManager={false}
      />
    </div>
  );
}

