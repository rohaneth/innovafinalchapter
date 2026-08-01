"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface AuditLogRecord {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: string;
  timestamp: string;
  user: {
    email: string;
    role: string;
  };
}

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogsModal({ isOpen, onClose }: AuditLogsModalProps) {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/audit-logs");
      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          maxWidth: "680px",
          maxHeight: "80vh",
          padding: "24px",
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>System Audit Logs</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
              Append-only audit trail logging goal updates, feedback submissions, and system actions.
            </p>
          </div>
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

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Loading audit trail records...</p>
          ) : logs.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No audit log events recorded yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "12px",
                  background: "var(--bg-base)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default)",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "bold", color: "var(--accent-primary)" }}>
                    {log.action} {log.entityType ? `• ${log.entityType}` : ""}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
                  User: <span style={{ color: "var(--text-primary)" }}>{log.user.email}</span> ({log.user.role})
                </div>
                {log.metadata && (
                  <pre
                    style={{
                      margin: 0,
                      padding: "6px",
                      background: "var(--bg-surface)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: "var(--accent-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {log.metadata}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <Button variant="outline" onClick={onClose}>
            Close Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
}
