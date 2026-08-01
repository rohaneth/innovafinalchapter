"use client";

import React from "react";

interface HeaderProps {
  employeeName?: string;
  reviewPeriod?: string;
  isApproved?: boolean;
  onTriggerAgent?: () => void;
  isGenerating?: boolean;
}

export function Header({
  employeeName = "Alex Vance",
  reviewPeriod = "2026-H1",
  isApproved = false,
  onTriggerAgent,
  isGenerating = false,
}: HeaderProps) {
  return (
    <header
      style={{
        height: "64px",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#fff",
          }}
        >
          360
        </div>
        <div>
          <h1 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "var(--text-primary)" }}>
            Bias-Aware 360° Review Workspace
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
            Employee: <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{employeeName}</span> ({reviewPeriod})
          </p>
        </div>
      </div>

      {/* Role & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Role:</span>
          <span className="badge-tag badge-accent">HR Reviewer (HITL)</span>
        </div>

        {isApproved ? (
          <span className="badge-tag badge-success">
            ✓ Finalized & Released
          </span>
        ) : (
          <span className="badge-tag badge-warning">
            ⚡ Draft Pending HITL Approval
          </span>
        )}

        {onTriggerAgent && (
          <button
            onClick={onTriggerAgent}
            disabled={isGenerating}
            className="btn-primary"
            style={{ fontSize: "13px" }}
          >
            {isGenerating ? "Synthesizing AI Review..." : "Re-run AI Synthesis"}
          </button>
        )}
      </div>
    </header>
  );
}
