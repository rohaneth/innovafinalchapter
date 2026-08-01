"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetUserId: string;
  targetUserEmail: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  onSuccess,
  targetUserId,
  targetUserEmail,
}: FeedbackModalProps) {
  const [type, setType] = useState<string>("Manager");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, type, content }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to submit feedback");
      }

      setContent("");
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
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Submit Feedback</h3>
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

        <div style={{ marginBottom: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
          Feedback Target: <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{targetUserEmail}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              Feedback Category
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
              <option value="Manager">👔 Manager Review Feedback</option>
              <option value="Peer">👥 Peer Feedback</option>
              <option value="Additional">📝 Additional Notes</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              Feedback Content (PII scrubbed automatically)
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide constructive feedback, performance highlights, or peer input..."
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Post Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
