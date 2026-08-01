"use client";

import React from "react";
import { RawFeedbackInput } from "../types/agents";

interface LeftSidebarProps {
  employeeId?: string;
  rawInputs?: RawFeedbackInput[];
  selectedSourceId?: string | null;
  onSelectSource?: (sourceId: string | null) => void;
}

export function LeftSidebar({
  employeeId = "emp-001",
  rawInputs = [],
  selectedSourceId = null,
  onSelectSource,
}: LeftSidebarProps) {
  return (
    <aside
      style={{
        width: "280px",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "calc(100vh - 64px)",
        overflowY: "auto",
      }}
    >
      {/* Profile Card */}
      <div
        className="panel-card"
        style={{ padding: "16px", background: "var(--bg-base)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e035a2, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
              color: "#fff",
            }}
          >
            AV
          </div>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>
              Alex Vance
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
              Senior Systems Engineer
            </p>
          </div>
        </div>

        <hr
          style={{
            borderColor: "var(--border-default)",
            margin: "12px 0",
            borderTop: 0,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "11px",
          }}
        >
          <div>
            <span style={{ color: "var(--text-muted)" }}>ID:</span>{" "}
            <span style={{ fontWeight: "500" }}>{employeeId}</span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Dept:</span>{" "}
            <span style={{ fontWeight: "500" }}>Platform</span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Tenure:</span>{" "}
            <span style={{ fontWeight: "500" }}>2.4 Yrs</span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Cycle:</span>{" "}
            <span style={{ fontWeight: "500" }}>2026-H1</span>
          </div>
        </div>
      </div>

      {/* Data Ingestion Status */}
      <div>
        <h4
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "var(--text-muted)",
            marginBottom: "10px",
          }}
        >
          Ingested Data Sources ({rawInputs.length})
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            onClick={() => onSelectSource?.(null)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              background:
                selectedSourceId === null
                  ? "var(--bg-surface-hover)"
                  : "transparent",
              border: `1px solid ${
                selectedSourceId === null
                  ? "var(--accent-primary)"
                  : "var(--border-default)"
              }`,
              color:
                selectedSourceId === null
                  ? "var(--accent-primary)"
                  : "var(--text-primary)",
              fontWeight: selectedSourceId === null ? "600" : "normal",
            }}
          >
            📋 All Evidence Chunks
          </div>

          {rawInputs.map((item) => {
            const isSelected = selectedSourceId === item.id;
            let icon = "📄";
            if (item.type === "self") icon = "👤";
            if (item.type === "manager") icon = "👔";
            if (item.type === "peer") icon = "👥";
            if (item.type === "meeting_transcript") icon = "🎙️";
            if (item.type === "project_goal") icon = "🎯";

            return (
              <div
                key={item.id}
                onClick={() => onSelectSource?.(item.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  background: isSelected
                    ? "var(--bg-surface-hover)"
                    : "var(--bg-base)",
                  border: `1px solid ${
                    isSelected ? "var(--accent-primary)" : "var(--border-default)"
                  }`,
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>
                    {icon} {item.type.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="badge-tag badge-accent">
                    {item.authorRole}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
