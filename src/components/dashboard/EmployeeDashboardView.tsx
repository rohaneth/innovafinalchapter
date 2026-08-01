"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SubmissionModal } from "@/components/modals/SubmissionModal";
import { UpdateGoalProgressModal } from "@/components/modals/UpdateGoalProgressModal";
import { useRouter } from "next/navigation";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
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
          <p style={{ color: "var(--text-muted)" }}>Here is your performance overview.</p>
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
          <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Your Assigned Goals</h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Click goal to update progress</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {initialGoals.length === 0 && (
            <div style={{ color: "var(--text-muted)" }}>No goals assigned yet.</div>
          )}
          {initialGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => setSelectedGoal(goal)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{goal.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>{goal.description}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "bold" }}>{goal.progress}%</div>
                <Badge status={goal.status === "Completed" ? "approved" : "processing"}>
                  {goal.status}
                </Badge>
              </div>
            </div>
          ))}
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
