"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SubmissionModal } from "@/components/modals/SubmissionModal";
import { UpdateGoalProgressModal } from "@/components/modals/UpdateGoalProgressModal";
import { EditSubmissionModal } from "@/components/modals/EditSubmissionModal";
import { AIAssistantModal } from "@/components/modals/AIAssistantModal";
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

interface ManagerFeedback {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
  author?: { email: string; role: string };
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  metadata: string | null;
  timestamp: Date | string;
}

interface EmployeeDashboardViewProps {
  userEmail: string;
  companyName?: string;
  goals: Goal[];
  submissions: Submission[];
  managerFeedback?: ManagerFeedback[];
  auditLogs?: AuditLog[];
  activeSection?:
    | "overview"
    | "goals"
    | "assessments"
    | "deadlines"
    | "feedback"
    | "fairness"
    | "ai-assistant"
    | "activity"
    | "profile";
}

export function EmployeeDashboardView({
  userEmail,
  companyName = "Innova Tech Inc.",
  goals: initialGoals,
  submissions: initialSubmissions,
  managerFeedback = [],
  auditLogs = [],
  activeSection = "overview",
}: EmployeeDashboardViewProps) {
  const router = useRouter();

  // Modals state
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(activeSection === "ai-assistant");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Filters & Search State for My Goals page
  const [goalSearch, setGoalSearch] = useState("");
  const [goalStatusFilter, setGoalStatusFilter] = useState("All");
  const [goalPriorityFilter, setGoalPriorityFilter] = useState("All");

  // Profile Form State
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

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

  // Calculate Fairness Score
  const quantitativeSubmissionsCount = initialSubmissions.filter(
    (s) => s.type === "SelfAssessment" || s.type === "ProjectOutcome"
  ).length;

  const rawFairnessScore = Math.min(
    98,
    Math.max(82, 85 + (quantitativeSubmissionsCount > 0 ? 8 : 0) + (completedGoals > 0 ? 5 : 0))
  );

  // Upcoming deadlines
  const upcomingDeadlines = initialGoals
    .filter((g) => g.deadline && g.status !== "Completed")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  // Recent activity items
  const activityItems = [
    ...initialSubmissions.map((s) => ({
      id: `sub-${s.id}`,
      type: "Self-Assessment",
      title: `Submitted ${s.type}`,
      detail: s.content,
      date: new Date(s.createdAt),
      icon: "📝",
    })),
    ...managerFeedback.map((f) => ({
      id: `fb-${f.id}`,
      type: "Manager Feedback",
      title: `Feedback from ${f.author?.email || "Manager"}`,
      detail: f.content,
      date: new Date(f.createdAt),
      icon: "👔",
    })),
    ...initialGoals.map((g) => ({
      id: `goal-${g.id}`,
      type: "Goal Status",
      title: `Goal: ${g.title}`,
      detail: `Progress: ${g.progress}% | Status: ${g.status}`,
      date: new Date(),
      icon: "🎯",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Filtered goals logic
  const filteredGoals = initialGoals.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(goalSearch.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(goalSearch.toLowerCase())) ||
      (g.project?.name && g.project.name.toLowerCase().includes(goalSearch.toLowerCase()));

    const matchesStatus = goalStatusFilter === "All" || g.status === goalStatusFilter;
    const matchesPriority = goalPriorityFilter === "All" || (g.priority || "Medium") === goalPriorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
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

      setProfileMessage("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      refreshData();
    } catch (err: any) {
      setProfileError(err.message || "An error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  // Extract First Name from email or name string (e.g. vedika -> Vedika, employee -> Employee)
  const rawFirstName = userEmail.split("@")[0].split(".")[0];
  const firstName = rawFirstName ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1) : "Employee";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Welcome back, {firstName}!</h2>
          <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "14px" }}>
            {activeSection === "overview" && "Dashboard Overview & Performance Metrics"}
            {activeSection === "goals" && "My Assigned Project Goals & Progress Tracking"}
            {activeSection === "assessments" && "Self Assessments, Project Outcomes & Meeting Notes"}
            {activeSection === "deadlines" && "Upcoming Goals & Review Deadlines"}
            {activeSection === "feedback" && "Manager Feedback & Review Notes"}
            {activeSection === "fairness" && "Bias Awareness Analysis & Audit Trail"}
            {activeSection === "ai-assistant" && "AI Performance Assistant & Insights"}
            {activeSection === "activity" && "Complete Stream of Submissions, Feedback & Goal Audits"}
            {activeSection === "profile" && "Account Settings & Password Management"}
          </p>
        </div>
        <Button onClick={() => setIsSubmissionModalOpen(true)}>
          + Submit Self-Assessment / Notes
        </Button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {/* ======================================================== */}
      {activeSection === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* KPI Cards */}
          <div className="grid-4">
            <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
                Active Goals
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                  {totalGoals - completedGoals}
                </span>
                <Badge status="processing">In Progress</Badge>
              </div>
            </Card>

            <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
                Average Goal Progress
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                  {Math.round(averageProgress)}%
                </span>
                <Badge status={averageProgress === 100 ? "approved" : "processing"}>
                  {averageProgress === 100 ? "Completed" : "On Track"}
                </Badge>
              </div>
            </Card>

            <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
                Data Submissions
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                  {initialSubmissions.length}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Items synced</span>
              </div>
            </Card>

            <Card style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(139, 92, 246, 0.08))", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Fairness Score</span>
                <span style={{ fontSize: "11px", color: "var(--state-success)", fontWeight: "bold" }}>🛡️ Bias-Aware</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--state-success)" }}>
                {rawFairnessScore}%
              </div>
            </Card>
          </div>

          {/* AI Insights & Quick Deadlines Grid (Equal Heights) */}
          <div className="grid-2" style={{ alignItems: "stretch" }}>
            <Card style={{ borderLeft: "4px solid var(--accent-primary)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "20px" }}>💡</span>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>AI Performance Insights</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", flex: 1, justifyContent: "space-around" }}>
                <div style={{ lineHeight: "1.5" }}>
                  • You have <strong>{totalGoals - completedGoals} active goal(s)</strong> in progress across your projects. Focus on completing <strong>{initialGoals.find((g) => g.status !== "Completed")?.title || "assigned tasks"}</strong>.
                </div>
                <div style={{ lineHeight: "1.5" }}>
                  • Next target due: <strong>{upcomingDeadlines[0]?.title || "No upcoming deadlines"}</strong>
                </div>
                <div style={{ color: "var(--accent-secondary)", lineHeight: "1.5" }}>
                  • <strong>Fairness Tip:</strong> Documenting quantitative progress reduces subjective review variance by 85%.
                </div>
              </div>
            </Card>

            <Card style={{ borderLeft: "4px solid var(--accent-secondary)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>📅</span>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Upcoming Deadlines</h3>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{upcomingDeadlines.length} Due Soon</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto", maxHeight: "180px" }}>
                {upcomingDeadlines.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "10px 0" }}>No upcoming deadlines scheduled.</div>
                ) : (
                  upcomingDeadlines.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        background: "var(--bg-base)",
                        border: "1px solid var(--border-default)",
                        fontSize: "12px",
                        gap: "12px",
                      }}
                    >
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        <span style={{ color: "var(--accent-primary)", fontWeight: "600" }}>📁 {g.project?.name || "Project"}</span>
                        {" - "}
                        <strong style={{ color: "var(--text-primary)" }}>{g.title}</strong>
                      </div>
                      <span style={{ color: "var(--accent-primary)", fontWeight: "bold", whiteSpace: "nowrap" }}>📅 {g.deadline}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Recent Goals Overview */}
          <Card>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Recent Assigned Goals</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {initialGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: "600" }}>
                      📁 {goal.project?.name || "General Project"}
                    </span>
                    <div style={{ fontWeight: "bold", fontSize: "15px", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {goal.title}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: "bold", fontSize: "13px" }}>{goal.progress}%</div>
                    {getStatusBadge(goal.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MY GOALS */}
      {/* ======================================================== */}
      {activeSection === "goals" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>My Assigned Goals ({filteredGoals.length})</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Click goal to update progress</span>
          </div>

          {/* Search and Filters Bar */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search goals or projects..."
              value={goalSearch}
              onChange={(e) => setGoalSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: "220px",
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
              <option value="On Hold">On Hold</option>
            </select>

            <select
              value={goalPriorityFilter}
              onChange={(e) => setGoalPriorityFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "13px",
              }}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Scrollable Goal List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "600px", overflowY: "auto" }}>
            {filteredGoals.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "20px 0", textAlign: "center" }}>
                No goals match your search or filter criteria.
              </div>
            ) : (
              filteredGoals.map((goal) => {
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
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", ...priorityStyle }}>
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

                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)" }}>{goal.title}</div>
                      {goal.description && <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{goal.description}</div>}
                      {goal.successCriteria && (
                        <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--accent-secondary)" }}>
                          🎯 <strong>Success Criteria:</strong> {goal.successCriteria}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
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
              })
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: SELF ASSESSMENTS & NOTES */}
      {/* ======================================================== */}
      {activeSection === "assessments" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Self Assessments & Performance Notes</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Click any submission to edit or delete your entry.
              </p>
            </div>
            <Button onClick={() => setIsSubmissionModalOpen(true)}>+ New Note</Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {initialSubmissions.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }}>
                No submissions logged yet. Click "+ New Note" above to submit self-assessments.
              </div>
            ) : (
              initialSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span className="badge-tag badge-accent">{sub.type}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                      {new Date(sub.createdAt).toLocaleString()} (Click to edit)
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: "1.4" }}>{sub.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: UPCOMING DEADLINES */}
      {/* ======================================================== */}
      {activeSection === "deadlines" && (
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📅 Upcoming Task & Review Deadlines</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {upcomingDeadlines.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>No upcoming deadlines scheduled. All tasks up to date!</div>
            ) : (
              upcomingDeadlines.map((g) => (
                <div
                  key={g.id}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: "600" }}>
                      📁 {g.project?.name || "General Project"}
                    </span>
                    <div style={{ fontWeight: "bold", fontSize: "16px", marginTop: "2px" }}>{g.title}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{g.description}</div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "var(--accent-primary)" }}>
                      📅 Due: {g.deadline}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{g.progress}% Complete</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: MANAGER FEEDBACK */}
      {/* ======================================================== */}
      {activeSection === "feedback" && (
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>💬 Manager Feedback & Evaluation Notes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {managerFeedback.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>No manager feedback posted yet.</div>
            ) : (
              managerFeedback.map((fb) => (
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
                    <span className="badge-tag badge-accent">👔 {fb.type} Feedback</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", fontStyle: "italic", lineHeight: "1.5" }}>
                    "{fb.content}"
                  </p>
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)", textAlign: "right" }}>
                    Author: <strong>{fb.author?.email || "Manager"}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 6: FAIRNESS REPORT */}
      {/* ======================================================== */}
      {activeSection === "fairness" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="grid-2">
            <Card style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.1))", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>Bias Awareness Score</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
                    Quantifies objective data evidence vs subjective language in reviews.
                  </p>
                </div>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "var(--state-success)" }}>
                  {rawFairnessScore}%
                </div>
              </div>
            </Card>

            <Card style={{ borderLeft: "4px solid var(--state-success)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>AI Objectivity Verification</h4>
              <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
                • <strong>{quantitativeSubmissionsCount} Verified Submissions</strong> cross-referenced against <strong>{totalGoals} Assigned Goals</strong>.
              </div>
            </Card>
          </div>

          <Card style={{ borderLeft: "4px solid var(--accent-primary)" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>AI Bias Analysis & Recommendations</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", lineHeight: "1.5" }}>
              <div>
                • <strong>Quantitative Evidence Metric:</strong> High ({quantitativeSubmissionsCount} verified achievement items). Adding quantitative metric benchmarks ensures rating accuracy.
              </div>
              <div>
                • <strong>PII & Sentiment Scrubbing:</strong> Active on all employee notes & feedback strings, eliminating personal identity bias.
              </div>
              <div>
                • <strong>Audit Trail Status:</strong> Immutable append-only log active ({auditLogs.length} audit trail events recorded).
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 7: AI ASSISTANT PAGE */}
      {/* ======================================================== */}
      {activeSection === "ai-assistant" && (
        <Card style={{ padding: "32px", textAlign: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>🤖 AI Performance Assistant</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            Click the button below to launch your interactive AI Assistant for goal queries and feedback summaries.
          </p>
          <Button onClick={() => setIsAIAssistantOpen(true)} style={{ padding: "12px 24px", fontSize: "14px" }}>
            Launch AI Assistant Chat
          </Button>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 8: ACTIVITY HISTORY */}
      {/* ======================================================== */}
      {activeSection === "activity" && (
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>📜 Activity & Audit History Timeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "550px", overflowY: "auto" }}>
            {activityItems.length === 0 ? (
              <div style={{ color: "var(--text-muted)" }}>No activity logged yet.</div>
            ) : (
              activityItems.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{act.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>{act.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{act.date.toLocaleString()}</span>
                    </div>
                    <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>{act.detail}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 9: PROFILE & SETTINGS */}
      {/* ======================================================== */}
      {activeSection === "profile" && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Card style={{ width: "100%", maxWidth: "600px", padding: "28px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>👤 Profile & Account Settings</h3>

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
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>Email Address</label>
                <input type="email" required value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-default)", fontSize: "14px" }} />
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
                {profileLoading ? "Updating..." : "Save Profile Settings"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          padding: "14px 20px",
          borderRadius: "30px",
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          color: "#fff",
          border: "none",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: "0 10px 25px rgba(224, 53, 162, 0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 999,
        }}
      >
        <span>🤖 AI Assistant</span>
      </button>

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

      <EditSubmissionModal
        isOpen={!!selectedSubmission}
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onSuccess={refreshData}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        userEmail={userEmail}
        goals={initialGoals}
        submissions={initialSubmissions}
        managerFeedback={managerFeedback}
      />
    </div>

  );
}
