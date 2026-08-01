"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Submission {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
}

interface EditSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onSuccess: () => void;
}

export function EditSubmissionModal({
  isOpen,
  onClose,
  submission,
  onSuccess,
}: EditSubmissionModalProps) {
  const [type, setType] = useState(submission ? submission.type : "SelfAssessment");
  const [content, setContent] = useState(submission ? submission.content : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (submission) {
      setType(submission.type);
      setContent(submission.content);
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update submission");
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
    if (!confirm("Are you sure you want to delete this submission?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission");
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
          maxWidth: "480px",
          padding: "24px",
          background: "var(--bg-surface)",
          borderRadius: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Edit / Delete Submission</h3>
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

        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              Submission Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
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
              <option value="SelfAssessment">Self-Assessment</option>
              <option value="ProjectOutcome">Project Outcome</option>
              <option value="MeetingNote">Meeting Note</option>
              <option value="Achievement">Key Achievement</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              Content
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: "transparent",
                color: "var(--state-error)",
                border: "none",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Delete
            </button>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Update Note"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
