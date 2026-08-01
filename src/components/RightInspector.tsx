"use client";

import React, { useState, useEffect } from "react";
import { AuditFlag, EvidenceChunk } from "../types/agents";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

interface RightInspectorProps {
  auditFlags: AuditFlag[];
  evidenceChunks: EvidenceChunk[];
  selectedCitationId: string | null;
  onCloseCitation: () => void;
  auditLogs: AuditLogItem[];
  onDismissFlag: (flagId: string) => void;
  onApplySuggestedRevision: (flag: AuditFlag) => void;
  onApproveRelease: () => void;
  isApproved: boolean;
}

export function RightInspector({
  auditFlags = [],
  evidenceChunks = [],
  selectedCitationId = null,
  onCloseCitation,
  auditLogs = [],
  onDismissFlag,
  onApplySuggestedRevision,
  onApproveRelease,
  isApproved = false,
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState<"auditor" | "citation" | "audit_trail">("auditor");

  useEffect(() => {
    if (selectedCitationId) {
      setActiveTab("citation");
    }
  }, [selectedCitationId]);

  const selectedChunk = evidenceChunks.find((c) => c.id === selectedCitationId);


  return (
    <aside
      style={{
        width: "340px",
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
      {/* Tab Selectors */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--bg-base)",
        }}
      >
        <button
          onClick={() => setActiveTab("auditor")}
          style={{
            flex: 1,
            padding: "12px 8px",
            background: activeTab === "auditor" ? "var(--bg-surface)" : "transparent",
            color: activeTab === "auditor" ? "var(--accent-primary)" : "var(--text-muted)",
            border: "none",
            borderBottom: activeTab === "auditor" ? "2px solid var(--accent-primary)" : "none",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚨 Bias Auditor ({auditFlags.length})
        </button>

        <button
          onClick={() => setActiveTab("citation")}
          style={{
            flex: 1,
            padding: "12px 8px",
            background: activeTab === "citation" ? "var(--bg-surface)" : "transparent",
            color: activeTab === "citation" ? "var(--accent-secondary)" : "var(--text-muted)",
            border: "none",
            borderBottom: activeTab === "citation" ? "2px solid var(--accent-secondary)" : "none",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📎 Evidence
        </button>

        <button
          onClick={() => setActiveTab("audit_trail")}
          style={{
            flex: 1,
            padding: "12px 8px",
            background: activeTab === "audit_trail" ? "var(--bg-surface)" : "transparent",
            color: activeTab === "audit_trail" ? "var(--state-success)" : "var(--text-muted)",
            border: "none",
            borderBottom: activeTab === "audit_trail" ? "2px solid var(--state-success)" : "none",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📜 Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content Panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Auditor Tab */}
        {activeTab === "auditor" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h4
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Auditor Bias & Fairness Inspection
            </h4>

            {auditFlags.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  background: "var(--bg-base)",
                  borderRadius: "8px",
                  border: "1px dashed var(--state-success)",
                }}
              >
                <p style={{ color: "var(--state-success)", fontSize: "13px", margin: 0 }}>
                  ✓ Zero active bias or ungrounded claim warnings detected!
                </p>
              </div>
            ) : (
              auditFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="panel-card"
                  style={{
                    padding: "14px",
                    background: "var(--bg-base)",
                    borderLeft: `4px solid ${
                      flag.severity === "high" || flag.severity === "critical"
                        ? "var(--state-error)"
                        : "var(--state-warning)"
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span className={`badge-tag ${flag.severity === "high" ? "badge-error" : "badge-warning"}`}>
                      {flag.biasType.replace(/_/g, " ")}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      {flag.severity}
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                    {flag.description}
                  </p>

                  {flag.suggestedRevision && (
                    <div
                      style={{
                        padding: "8px",
                        background: "var(--bg-surface)",
                        borderRadius: "4px",
                        fontSize: "11px",
                        marginBottom: "10px",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      <span style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Suggestion:</span>{" "}
                      {flag.suggestedRevision}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => onApplySuggestedRevision(flag)}
                      className="btn-primary"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Apply Revision
                    </button>
                    <button
                      onClick={() => onDismissFlag(flag.id)}
                      className="btn-outline"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      Dismiss Flag
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Citation Detail Tab */}
        {activeTab === "citation" && (
          <div>
            <h4
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-muted)",
                marginBottom: "12px",
              }}
            >
              Source Evidence Citation Inspector
            </h4>

            {selectedChunk ? (
              <div className="panel-card" style={{ padding: "14px", background: "var(--bg-base)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span className="badge-tag badge-accent">{selectedChunk.sourceType}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Score: {(selectedChunk.relevanceScore * 100).toFixed(0)}% match
                  </span>
                </div>

                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 8px 0" }}>
                  Chunk ID: <code style={{ color: "var(--accent-secondary)" }}>{selectedChunk.id}</code>
                </p>

                <div
                  style={{
                    padding: "10px",
                    background: "var(--bg-surface)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    lineHeight: "1.5",
                    fontFamily: "monospace",
                    marginBottom: "10px",
                  }}
                >
                  "{selectedChunk.content}"
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "8px" }}>
                  <span>Author: {selectedChunk.authorRole}</span>
                  <span>Date: {new Date(selectedChunk.timestamp).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={onCloseCitation}
                  className="btn-outline"
                  style={{ fontSize: "11px", marginTop: "12px", width: "100%" }}
                >
                  Close Citation View
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
                Click any 📎 citation tag in the performance report to inspect its raw source text.
              </p>
            )}
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === "audit_trail" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h4
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Append-Only Governance Log
            </h4>

            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "10px",
                  background: "var(--bg-base)",
                  borderRadius: "6px",
                  border: "1px solid var(--border-default)",
                  fontSize: "11px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", color: "var(--accent-primary)" }}>{log.action}</span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: "var(--text-primary)" }}>{log.details}</p>
                <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>By: {log.actor}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HITL Release Gate Footer */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border-default)",
          background: "var(--bg-base)",
        }}
      >
        <button
          onClick={onApproveRelease}
          disabled={isApproved}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            background: isApproved ? "var(--state-success)" : "var(--accent-primary)",
          }}
        >
          {isApproved ? "✓ Review Approved & Published" : "🚀 Finalize & Release Review"}
        </button>
      </div>
    </aside>
  );
}
