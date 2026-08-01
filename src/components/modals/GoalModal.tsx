"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Employee {
  id: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultAssigneeEmail?: string;
  availableEmployees?: Employee[];
}

export function GoalModal({
  isOpen,
  onClose,
  onSuccess,
  defaultAssigneeEmail = "",
  availableEmployees = [],
}: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Not Started");
  const [deadline, setDeadline] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      if (defaultAssigneeEmail) {
        setSelectedEmails([defaultAssigneeEmail]);
      } else if (availableEmployees.length > 0) {
        setSelectedEmails([availableEmployees[0].email]);
      }
    }
  }, [isOpen, defaultAssigneeEmail, availableEmployees]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !projectId) {
          setProjectId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [...prev, created]);
        setProjectId(created.id);
        setNewProjectName("");
        setShowNewProjectInput(false);
      }
    } catch (err) {
      console.error("Error creating project", err);
    }
  };

  const toggleEmployeeSelection = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailsToAssign = [...selectedEmails];
    if (customEmail.trim() && !emailsToAssign.includes(customEmail.trim().toLowerCase())) {
      emailsToAssign.push(customEmail.trim().toLowerCase());
    }

    if (emailsToAssign.length === 0) {
      setError("Please select or enter at least one assignee email.");
      setLoading(false);
      return;
    }

    if (!projectId) {
      setError("Please select a project for this goal.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          projectId,
          assigneeEmails: emailsToAssign,
          priority,
          status,
          deadline: deadline || null,
          successCriteria,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to create goal");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSuccessCriteria("");
      setDeadline("");
      setCustomEmail("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        className="panel-card"
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          background: "var(--bg-surface)",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>Create & Assign Goal</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Link goal to a project, select assignees, and set evaluation metrics.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid var(--state-error)",
              color: "var(--state-error)",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Project Selection */}
          <div style={{ background: "var(--bg-base)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-default)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                Linked Project <span style={{ color: "var(--state-error)" }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewProjectInput(!showNewProjectInput)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-primary)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {showNewProjectInput ? "Cancel" : "+ Add New Project"}
              </button>
            </div>

            {showNewProjectInput ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="New project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                  }}
                />
                <Button type="button" onClick={handleCreateProject}>
                  Save
                </Button>
              </div>
            ) : (
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "14px",
                }}
              >
                <option value="" disabled>
                  Select a Project...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Goal Title */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-primary)" }}>
              Goal Title <span style={{ color: "var(--state-error)" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Optimize vector search query latency under 100ms"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Assignees (Multi-select) */}
          <div style={{ background: "var(--bg-base)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-default)" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
              Assign to Employee(s) <span style={{ color: "var(--state-error)" }}>*</span>
            </label>

            {availableEmployees.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                {availableEmployees.map((emp) => (
                  <label
                    key={emp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      background: selectedEmails.includes(emp.email) ? "rgba(224, 53, 162, 0.08)" : "transparent",
                      border: selectedEmails.includes(emp.email) ? "1px solid var(--accent-primary)" : "1px solid transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(emp.email)}
                      onChange={() => toggleEmployeeSelection(emp.email)}
                      style={{ accentColor: "var(--accent-primary)" }}
                    />
                    <span>👤 {emp.email}</span>
                  </label>
                ))}
              </div>
            )}

            <div style={{ marginTop: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Or enter specific employee email:
              </span>
              <input
                type="email"
                placeholder="employee@company.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Grid Layout: Priority, Status, Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🔵 Medium</option>
                <option value="High">🟠 High</option>
                <option value="Urgent">🔴 Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              >
                <option value="Not Started">⚪ Not Started</option>
                <option value="In Progress">🔵 In Progress</option>
                <option value="Completed">🟢 Completed</option>
                <option value="On Hold">🟡 On Hold</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              Description & Requirements
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline deliverables and project context..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Success Criteria */}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              Success Criteria / Key Performance Indicators
            </label>
            <textarea
              rows={2}
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              placeholder="Define measurable outcomes (e.g. 95%+ test coverage, <100ms latency)..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating Goal..." : "Assign Goal to Selected"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

