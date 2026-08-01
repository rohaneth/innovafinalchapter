"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface GoalData {
  id: string;
  title: string;
  progress: number;
  status: string;
}

interface UpdateGoalProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalData | null;
  onSuccess: () => void;
  isManager?: boolean;
}

export function UpdateGoalProgressModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
  isManager = false,
}: UpdateGoalProgressModalProps) {
  const [progress, setProgress] = useState(goal ? goal.progress : 0);
  const [status, setStatus] = useState(goal ? goal.status : "Not Started");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (goal) {
      setProgress(goal.progress);
      setStatus(goal.status);
    }
  }, [goal]);

  if (!isOpen || !goal) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress: Number(progress),
          status: Number(progress) === 100 ? "Completed" : status,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update goal progress");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete goal");
      }

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
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        className="panel-card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "24px",
          background: "var(--bg-surface)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>Update Goal Progress</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px",
              background: "rgba(244, 63, 94, 0.15)",
              color: "var(--state-error)",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "14px" }}>
          {goal.title}
        </div>

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Completion Progress (%)</label>
              <span style={{ fontWeight: "bold", fontSize: "13px" }}>{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgress(val);
                if (val === 100) setStatus("Completed");
                else if (val > 0) setStatus("In Progress");
              }}
              style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
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
                padding: "10px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "14px",
              }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
            {isManager ? (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  background: "transparent",
                  color: "var(--state-error)",
                  border: "none",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Delete Goal
              </button>
            ) : <div />}

            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Progress"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
