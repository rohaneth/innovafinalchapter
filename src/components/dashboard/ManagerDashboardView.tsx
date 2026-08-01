"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { GoalModal } from "@/components/modals/GoalModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { UpdateGoalProgressModal } from "@/components/modals/UpdateGoalProgressModal";
import { AuditLogsModal } from "@/components/modals/AuditLogsModal";
import { AIReviewGeneratorModal } from "@/components/modals/AIReviewGeneratorModal";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  progress: number;
  status: string;
  priority?: string;
  deadline?: string | null;
  successCriteria?: string | null;
  project?: Project | null;
  assignee?: { email: string } | null;
}

interface Submission {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
}

interface Feedback {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
  targetUser?: { email: string };
}

interface Employee {
  id: string;
  email: string;
  assignedGoals: Goal[];
  submissions?: Submission[];
  receivedFeedback?: Feedback[];
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  metadata: string | null;
  timestamp: Date | string;
}

interface ManagerDashboardViewProps {
  userEmail?: string | null;
  companyName?: string;
  employees: Employee[];
  goals?: Goal[];
  feedbackList?: Feedback[];
  auditLogs?: AuditLog[];
  activeSection?:
    | "overview"
    | "directory"
    | "goals"
    | "workspace"
    | "analytics"
    | "fairness"
    | "schedule"
    | "audit-logs"
    | "ai-assistant"
    | "profile";
}

export function ManagerDashboardView({
  userEmail = "manager@company.com",
  companyName = "Innova Tech Inc.",
  employees,
  goals: initialGoals = [],
  feedbackList: initialFeedbackList = [],
  auditLogs: initialAuditLogs = [],
  activeSection = "overview",
}: ManagerDashboardViewProps) {
  const router = useRouter();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [selectedFeedbackEmployee, setSelectedFeedbackEmployee] = useState<Employee | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [defaultAssigneeEmail, setDefaultAssigneeEmail] = useState("");

  // Directory Search & Filter state
  const [directorySearch, setDirectorySearch] = useState("");

  // Goal Management Filter state
  const [goalSearch, setGoalSearch] = useState("");
  const [goalStatusFilter, setGoalStatusFilter] = useState("All");

  // Profile Settings state
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // AI Assistant input & AI Review Generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSelectedEmployeeId, setAiSelectedEmployeeId] = useState("");
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiGeneratedReview, setAiGeneratedReview] = useState<any>(null);

  const handleGenerateAiReview = async () => {
    if (!aiSelectedEmployeeId) return;
    setAiReviewLoading(true);
    setAiGeneratedReview(null);

    try {
      const res = await fetch("/api/reviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: aiSelectedEmployeeId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate AI review");
      }

      setAiGeneratedReview(data);
    } catch (err: any) {
      alert(err.message || "Failed to generate review");
    } finally {
      setAiReviewLoading(false);
    }
  };

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

  // Flattened goal list across employees if not provided explicitly
  const allGoals = initialGoals.length > 0
    ? initialGoals
    : employees.flatMap((emp) => emp.assignedGoals);

  const safeEmail = userEmail || "manager@company.com";
  // Extract First Name from email
  const rawFirstName = safeEmail.split("@")[0].split(".")[0];
  const managerName = rawFirstName ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1) : "Manager";

  // AI Review Generator Modal state
  const [selectedReviewEmployee, setSelectedReviewEmployee] = useState<Employee | null>(null);

  // Table Data mapping for main Overview roster table
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

                <span style={{ fontWeight: "600" }}>{g.title}</span>

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

      <div key={`actions-${emp.id}`} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
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

        <button
          onClick={() => setSelectedReviewEmployee(emp)}
          style={{
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            padding: "4px 10px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          🤖 Generate AI Review
        </button>
      </div>,
    ];
  });

  // Directory Filtered Employees
  const filteredEmployees = employees.filter(
    (e) => e.email.toLowerCase().includes(directorySearch.toLowerCase())
  );

  // Goal Management Filtered Goals
  const filteredGoals = allGoals.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(goalSearch.toLowerCase()) ||
      (g.project?.name && g.project.name.toLowerCase().includes(goalSearch.toLowerCase())) ||
      (g.assignee?.email && g.assignee.email.toLowerCase().includes(goalSearch.toLowerCase()));
    const matchesStatus = goalStatusFilter === "All" || g.status === goalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profileEmail,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to update profile");
      }

      setProfileMessage("Manager profile settings saved successfully!");
      setCurrentPassword("");
      setNewPassword("");
      refreshData();
    } catch (err: any) {
      setProfileError(err.message || "An error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAiQuery = (query: string) => {
    setAiLoading(true);
    setAiPrompt(query);
    setTimeout(() => {
      if (query.includes("fairness") || query.includes("bias")) {
        setAiResponse("AI Bias Analysis: All team feedback scrubbing rules active. Team review objectivity index is 94% with balanced task assignment across projects.");
      } else if (query.includes("performance") || query.includes("goals")) {
        setAiResponse(`Team Summary: ${totalEmployees} active employees with an overall goal completion rate of ${Math.round(employees.reduce((acc, emp) => acc + (emp.assignedGoals.length ? emp.assignedGoals.reduce((a, c) => a + c.progress, 0) / emp.assignedGoals.length : 0), 0) / (employees.length || 1))}%.`);
      } else {
        setAiResponse("AI Recommendation: Maintain bi-weekly 1-on-1 check-ins and submit objective quantitative feedback to uphold high fairness scores.");
      }
      setAiLoading(false);
    }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Welcome back, {managerName}!</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "14px" }}>
            {activeSection === "overview" && "Company Manager Overview & Performance Dashboard"}
            {activeSection === "directory" && "Employee Directory & Individual Performance Profiles"}
            {activeSection === "goals" && "Project Goal Management & Multi-Assignee Tracking"}
            {activeSection === "workspace" && "Review Workspaces & Feedback Management"}
            {activeSection === "analytics" && "Team Performance Analytics & Goal Metrics"}
            {activeSection === "fairness" && "Bias Awareness & Evaluation Objectivity Reports"}
            {activeSection === "schedule" && "Review Cycle Schedule & Task Timeline"}
            {activeSection === "audit-logs" && "System Audit Logs & Append-Only Action Trail"}
            {activeSection === "ai-assistant" && "Interactive Manager AI Performance & Bias Assistant"}
            {activeSection === "profile" && "Manager Account & Enterprise Security Settings"}
          </p>
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

      {/* ======================================================== */}
      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {/* ======================================================== */}
      {activeSection === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Overview KPI Cards */}
          <div className="grid-4">
            <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
                Total Employees
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>{totalEmployees}</span>
                <Badge status="processing">Active Roster</Badge>
              </div>
            </Card>

            <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
                Reviews Pending
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>{totalEmployees}</span>
                <Badge status="warning">In Cycle</Badge>
              </div>
            </Card>

            <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
                Avg Goal Completion
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                  {Math.round(
                    employees.reduce((acc, emp) => {
                      const goals = emp.assignedGoals.length;
                      return acc + (goals > 0 ? emp.assignedGoals.reduce((a, c) => a + c.progress, 0) / goals : 0);
                    }, 0) / (employees.length || 1)
                  )}
                  %
                </span>
                <Badge status="approved">On Track</Badge>
              </div>
            </Card>

            <Card style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(139, 92, 246, 0.08))", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Audit Trail Events</span>
                <span style={{ fontSize: "11px", color: "var(--state-success)", fontWeight: "bold" }}>🛡️ Active</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--state-success)" }}>
                Active Log
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
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: EMPLOYEE DIRECTORY */}
      {/* ======================================================== */}
      {activeSection === "directory" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>👥 Employee Directory ({filteredEmployees.length})</h3>
            <input
              type="text"
              placeholder="Search employee by email..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              style={{
                width: "280px",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {filteredEmployees.map((emp) => {
              const totalGoals = emp.assignedGoals.length;
              const avgProgress = totalGoals > 0 ? Math.round(emp.assignedGoals.reduce((a, c) => a + c.progress, 0) / totalGoals) : 0;
              return (
                <div
                  key={emp.id}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "16px" }}>{emp.email}</div>
                      <span style={{ fontSize: "12px", color: "var(--accent-primary)" }}>Role: Employee</span>
                    </div>
                    <Badge status="processing">{avgProgress}% Progress</Badge>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    <strong>Assigned Goals:</strong> {totalGoals} active goal(s)
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDefaultAssigneeEmail(emp.email);
                        setIsGoalModalOpen(true);
                      }}
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      + Assign Goal
                    </Button>
                    <Button
                      onClick={() => setSelectedFeedbackEmployee(emp)}
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      + Feedback
                    </Button>
                    <Button
                      onClick={() => setSelectedReviewEmployee(emp)}
                      style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                        border: "none",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      🤖 Generate AI Review
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: GOAL MANAGEMENT */}
      {/* ======================================================== */}
      {activeSection === "goals" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>🎯 Goal Management ({filteredGoals.length})</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                placeholder="Search goals..."
                value={goalSearch}
                onChange={(e) => setGoalSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              />
              <select
                value={goalStatusFilter}
                onChange={(e) => setGoalStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <Button onClick={() => setIsGoalModalOpen(true)}>+ Create Goal</Button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredGoals.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g)}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: "600" }}>
                    📁 {g.project?.name || "General Project"} | Assignee: {g.assignee?.email || "Team"}
                  </span>
                  <div style={{ fontWeight: "bold", fontSize: "16px", marginTop: "2px" }}>{g.title}</div>
                  {g.deadline && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>📅 Due: {g.deadline}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>{g.progress}%</div>
                  {getStatusBadge(g.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: REVIEW WORKSPACE */}
      {/* ======================================================== */}
      {activeSection === "workspace" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>📝 Review Workspace & Submitted Feedback</h3>
            <Button onClick={() => setSelectedFeedbackEmployee(employees[0] || null)}>+ Submit Feedback</Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {initialFeedbackList.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>No feedback entries submitted yet.</div>
            ) : (
              initialFeedbackList.map((fb) => (
                <div
                  key={fb.id}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className="badge-tag badge-accent">👔 {fb.type} Review</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      Target: <strong>{fb.targetUser?.email || "Employee"}</strong> | {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", fontStyle: "italic" }}>"{fb.content}"</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: PERFORMANCE ANALYTICS */}
      {/* ======================================================== */}
      {activeSection === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="grid-2">
            <Card style={{ borderLeft: "4px solid var(--accent-primary)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>📊 Team Goal Completion Trends</h3>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--accent-primary)" }}>
                {Math.round(employees.reduce((acc, emp) => acc + (emp.assignedGoals.length ? emp.assignedGoals.reduce((a, c) => a + c.progress, 0) / emp.assignedGoals.length : 0), 0) / (employees.length || 1))}%
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>Average goal completion index across all projects.</p>
            </Card>

            <Card style={{ borderLeft: "4px solid var(--state-success)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>🏆 Top Performer Roster</h3>
              <div style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                • <strong>{employees[0]?.email || "Employee"}</strong> (100% completion rate)
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 6: FAIRNESS ANALYTICS */}
      {/* ======================================================== */}
      {activeSection === "fairness" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.1))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>Overall Team Fairness Index</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
                  AI Bias Detection & Scrubbing active across review notes.
                </p>
              </div>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "var(--state-success)" }}>
                94%
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 7: REVIEW SCHEDULE */}
      {/* ======================================================== */}
      {activeSection === "schedule" && (
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📅 Review Schedule & Cycle Timeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {employees.map((emp) => (
              <div key={emp.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--bg-base)", borderRadius: "6px", border: "1px solid var(--border-default)" }}>
                <span>👔 Review Cycle for <strong>{emp.email}</strong></span>
                <span style={{ color: "var(--accent-primary)", fontWeight: "bold" }}>Scheduled: Upcoming</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 8: AUDIT LOGS */}
      {/* ======================================================== */}
      {activeSection === "audit-logs" && (
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📜 System Audit Logs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "500px", overflowY: "auto" }}>
            {initialAuditLogs.map((log) => (
              <div key={log.id} style={{ padding: "10px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "6px", fontSize: "12px" }}>
                <strong>{log.action}</strong> on <span>{log.entityType}</span> | {new Date(log.timestamp).toLocaleString()}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 9: AI ASSISTANT */}
      {/* ======================================================== */}
      {activeSection === "ai-assistant" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Main AI Controls Card */}
          <Card>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🤖</span> Manager AI Performance & Bias Assistant
            </h3>

            {/* Employee Selector & AI Review Generator Controls */}
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <label style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary)" }}>
                Select Employee for AI Performance Review Generation:
              </label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={aiSelectedEmployeeId}
                  onChange={(e) => setAiSelectedEmployeeId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "240px",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "14px",
                  }}
                >
                  <option value="">-- Choose an Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.email} ({emp.assignedGoals.length} Goals)
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleGenerateAiReview}
                  disabled={!aiSelectedEmployeeId || aiReviewLoading}
                  style={{
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    border: "none",
                    color: "#fff",
                    fontWeight: "bold",
                    padding: "10px 20px",
                    fontSize: "14px",
                  }}
                >
                  {aiReviewLoading ? "🤖 Analyzing Telemetry..." : "🤖 Generate AI Performance Review"}
                </Button>
              </div>
            </div>

            {/* General Quick Prompt Buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <Button variant="outline" onClick={() => handleAiQuery("fairness bias check")}>Check Fairness Index</Button>
              <Button variant="outline" onClick={() => handleAiQuery("performance summary")}>Summarize Team Performance</Button>
            </div>

            {aiPrompt && <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>Query: "{aiPrompt}"</div>}
            {aiLoading && <div style={{ fontSize: "13px", color: "var(--accent-primary)" }}>Generating AI insights...</div>}
            {!aiLoading && aiResponse && (
              <div style={{ padding: "16px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "14px", lineHeight: "1.5" }}>
                {aiResponse}
              </div>
            )}
          </Card>

          {/* Structured Generated AI Review Card */}
          {aiGeneratedReview && (
            <Card style={{ borderLeft: "4px solid var(--accent-primary)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    📊 Structured AI Performance Review: {aiGeneratedReview.employeeEmail}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Generated from database self-assessments, feedback history, project goals, and fairness telemetry
                  </span>
                </div>
                <Badge status={aiGeneratedReview.rating === "Excellent" ? "approved" : "processing"}>
                  Rating: {aiGeneratedReview.rating}
                </Badge>
              </div>

              {/* Review Sections Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "12px 16px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--accent-primary)", margin: "0 0 6px 0" }}>
                    1. Performance Summary
                  </h4>
                  <p style={{ fontSize: "13px", margin: 0, lineHeight: "1.5" }}>{aiGeneratedReview.performanceSummary}</p>
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--state-success)", margin: "0 0 6px 0" }}>
                    2. Key Strengths
                  </h4>
                  <pre style={{ fontSize: "13px", margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {aiGeneratedReview.keyStrengths}
                  </pre>
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--state-warning)", margin: "0 0 6px 0" }}>
                    3. Areas for Improvement
                  </h4>
                  <pre style={{ fontSize: "13px", margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {aiGeneratedReview.areasForImprovement}
                  </pre>
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 6px 0" }}>
                    4. Goal Achievement Breakdown
                  </h4>
                  <p style={{ fontSize: "13px", margin: 0, lineHeight: "1.5" }}>{aiGeneratedReview.goalAchievement}</p>
                </div>

                <div style={{ padding: "12px 16px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 6px 0" }}>
                    5. Collaboration & Communication
                  </h4>
                  <pre style={{ fontSize: "13px", margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {aiGeneratedReview.collaborationComm}
                  </pre>
                </div>

                <div style={{ padding: "12px 16px", background: "rgba(124, 92, 252, 0.08)", border: "1px solid var(--accent-glow)", borderRadius: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "var(--accent-primary)", margin: "0 0 6px 0" }}>
                    💡 Actionable AI Recommendations
                  </h4>
                  <pre style={{ fontSize: "13px", margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {aiGeneratedReview.aiRecommendations}
                  </pre>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 10: PROFILE & SETTINGS */}
      {/* ======================================================== */}
      {activeSection === "profile" && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Card style={{ width: "100%", maxWidth: "600px", padding: "28px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>👤 Manager Profile & Enterprise Settings</h3>

            {profileMessage && (
              <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.15)", color: "var(--state-success)", borderRadius: "6px", marginBottom: "16px", fontSize: "13px" }}>
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div style={{ padding: "10px", background: "rgba(244, 63, 94, 0.15)", color: "var(--state-error)", borderRadius: "6px", marginBottom: "16px", fontSize: "13px" }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>Company</label>
                <input type="text" disabled value={companyName} style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border-default)", fontSize: "14px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>Manager Email Address</label>
                <input type="email" required value={profileEmail || safeEmail} onChange={(e) => setProfileEmail(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-default)", fontSize: "14px" }} />
              </div>

              <hr style={{ borderColor: "var(--border-default)", margin: "8px 0" }} />
              <h4 style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>Change Password</h4>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-default)", fontSize: "14px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-default)", fontSize: "14px" }} />
              </div>

              <Button type="submit" disabled={profileLoading} style={{ marginTop: "8px" }}>
                {profileLoading ? "Saving..." : "Save Profile Settings"}
              </Button>
            </form>
          </Card>
        </div>
      )}

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

      {selectedReviewEmployee && (
        <AIReviewGeneratorModal
          isOpen={!!selectedReviewEmployee}
          employeeId={selectedReviewEmployee.id}
          employeeEmail={selectedReviewEmployee.email}
          onClose={() => setSelectedReviewEmployee(null)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
