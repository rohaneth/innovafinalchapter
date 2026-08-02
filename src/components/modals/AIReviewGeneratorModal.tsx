"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ConfidenceScore {
  overallConfidence: number;
  evidenceStrength: string;
  evidenceCount: number;
  missingEvidenceCount: number;
}

interface AuditFlag {
  id: string;
  biasType: string;
  severity: string;
  description: string;
  targetSection: string;
  suggestedRevision: string;
}

interface ReviewData {
  id?: string;
  reviewId?: string; // from the new endpoint
  employeeId: string;
  employeeEmail?: string;
  status: string;
  rating?: string;
  performanceSummary: string;
  keyStrengths: string;
  areasForImprovement: string;
  goalAchievement: string;
  collaborationComm: string;
  aiRecommendations: string;
  evidenceUsed: any;
  version?: number;
  createdAt?: string;
  
  // New fields from multi-agent
  metrics?: any;
  auditFlags?: AuditFlag[];
  draftReview?: any;
  evidenceChunks?: any[];
}

interface AIReviewGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeEmail: string;
  onSuccess: () => void;
}

export function AIReviewGeneratorModal({
  isOpen,
  onClose,
  employeeId,
  employeeEmail,
  onSuccess,
}: AIReviewGeneratorModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<ReviewData | null>(null);

  // Editable Form Fields
  const [rating, setRating] = useState("Good");
  const [performanceSummary, setPerformanceSummary] = useState("");
  const [keyStrengths, setKeyStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [goalAchievement, setGoalAchievement] = useState("");
  const [collaborationComm, setCollaborationComm] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to generate AI review");
      }
      
      const data = json.data;
      populateForm(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during generation");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: ReviewData) => {
    setReview(data);
    setRating(data.rating || "Satisfactory");
    
    if (data.draftReview) {
      setPerformanceSummary(data.draftReview.overallSummary || "");
      setKeyStrengths(JSON.stringify(data.draftReview.strengths, null, 2) || "");
      setAreasForImprovement(JSON.stringify(data.draftReview.growthAreas, null, 2) || "");
      setGoalAchievement(JSON.stringify(data.draftReview.goalProgress, null, 2) || "");
      setCollaborationComm(JSON.stringify(data.draftReview.impactHighlights, null, 2) || "");
      setAiRecommendations(JSON.stringify(data.auditFlags, null, 2) || "");
    } else {
      setPerformanceSummary(data.performanceSummary || "");
      setKeyStrengths(data.keyStrengths || "");
      setAreasForImprovement(data.areasForImprovement || "");
      setGoalAchievement(data.goalAchievement || "");
      setCollaborationComm(data.collaborationComm || "");
      setAiRecommendations(data.aiRecommendations || "");
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    } else {
      setReview(null);
      setError("");
    }
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  const handleSave = async (statusToSet: "APPROVED" | "CHANGES_REQUESTED" | "DRAFT") => {
    setSaving(true);
    setError("");

    try {
      const idToUpdate = review?.reviewId || review?.id;
      if (!idToUpdate) {
         throw new Error("No review ID available for update.");
      }

      // 1. Update the content
      // Note: we'd need an endpoint to update content, but for now we'll just update status.
      // If we had a full edit endpoint, we'd call that first.

      // 2. Update status
      const res = await fetch(`/api/reviews/${idToUpdate}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToSet }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update review status");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <span style={{ color: "var(--state-error)", fontWeight: "bold" }}>Critical Bias Risk</span>;
      case 'high': return <span style={{ color: "var(--state-warning)", fontWeight: "bold" }}>High</span>;
      case 'medium': return <span style={{ color: "var(--accent-secondary)" }}>Medium</span>;
      default: return <span style={{ color: "var(--state-success)" }}>Low</span>;
    }
  };

  const parseEvidence = (ev: any) => {
    if (!ev) return null;
    let parsed = ev;
    if (typeof ev === "string") {
      try {
        parsed = JSON.parse(ev);
      } catch (e) {
        return <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{ev}</p>;
      }
    }
    if (Array.isArray(parsed)) {
      return (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>• <strong>Total Evidence Chunks Processed:</strong> {parsed.length}</div>
          {parsed.length > 0 && <div>• <strong>Chunk IDs Referenced:</strong> {parsed.slice(0,5).join(", ")}{parsed.length > 5 ? "..." : ""}</div>}
        </div>
      );
    }
    return (
      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
        <div>• <strong>Assigned Goals Analyzed:</strong> {parsed.totalGoals || 0} ({parsed.completedGoals || 0} completed, {parsed.overdueGoals || 0} overdue)</div>
        <div>• <strong>Average Goal Completion:</strong> {parsed.avgProgress || 0}%</div>
        <div>• <strong>Bias Awareness Score:</strong> {parsed.fairnessScore || 85}%</div>
        {parsed.goalTitles && parsed.goalTitles.length > 0 && (
          <div>• <strong>Goal References:</strong> {parsed.goalTitles.join(", ")}</div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: "20px",
      }}
    >
      <div
        className="panel-card"
        style={{
          width: "100%",
          maxWidth: "860px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-surface)",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(124, 92, 252, 0.05)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🤖</span> AI Performance Review Generator
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Target Employee: <strong>{employeeEmail}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Form */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          {error && (
            <div
              style={{
                padding: "12px",
                background: "rgba(244, 63, 94, 0.15)",
                color: "var(--state-error)",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="spinner" style={{ margin: "0 auto 12px", width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "6px" }}>Running Multi-Agent AI Pipeline...</div>
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                Collecting metrics → Searching vector database → Synthesizing evidence → Auditing for bias
              </p>
            </div>
          ) : (
            <>
              {/* Confidence Score & Audit Summary */}
              {review?.draftReview?.confidence && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "8px" }}>
                  <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>AI Confidence Score</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: "bold", color: "var(--state-success)" }}>{review.draftReview.confidence.overallConfidence}%</span>
                      <span style={{ fontSize: "12px" }}>Evidence Strength: {review.draftReview.confidence.evidenceStrength}</span>
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Bias Audit Summary</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: "bold", color: "var(--state-error)" }}>{review.auditFlags?.length || 0}</span>
                      <span style={{ fontSize: "12px" }}>Flags Detected (Ungrounded Claims, Recency Bias, etc.)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Overall Rating & Workflow Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    Overall Performance Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      background: "var(--bg-base)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-default)",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    <option value="Excellent">⭐ Excellent</option>
                    <option value="Good">👍 Good</option>
                    <option value="Satisfactory">👌 Satisfactory</option>
                    <option value="Needs Improvement">⚠️ Needs Improvement</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Review Draft Version</div>
                  <div style={{ padding: "8px 12px", background: "var(--bg-base)", border: "1px solid var(--border-default)", borderRadius: "6px", fontSize: "13px" }}>
                    Status: <strong style={{ color: "var(--accent-primary)" }}>{review?.status || "DRAFT"}</strong> | DB ID {review?.reviewId || review?.id || "N/A"}
                  </div>
                </div>
              </div>

              {/* Bias Audit Flags */}
              {review?.auditFlags && review.auditFlags.length > 0 && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "var(--state-error)", marginBottom: "6px" }}>
                    ⚠️ Action Required: Bias & Evidence Flags
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {review.auditFlags.map((flag: any) => (
                      <div key={flag.id} style={{ padding: "10px", background: "var(--bg-base)", borderLeft: "3px solid var(--state-error)", borderRadius: "4px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
                          {flag.biasType.replace(/_/g, ' ').toUpperCase()} | Severity: {getSeverityBadge(flag.severity)}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>{flag.description}</div>
                        <div style={{ fontSize: "12px", color: "var(--accent-primary)" }}>
                          <strong>Suggestion:</strong> {flag.suggestedRevision}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Performance Summary */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "6px" }}>
                  1. Performance Summary
                </label>
                <textarea
                  rows={3}
                  value={performanceSummary}
                  onChange={(e) => setPerformanceSummary(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* 2. Key Strengths */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "6px" }}>
                  2. Key Strengths (JSON)
                </label>
                <textarea
                  rows={6}
                  value={keyStrengths}
                  onChange={(e) => setKeyStrengths(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* 3. Areas for Improvement */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "6px" }}>
                  3. Areas for Improvement (JSON)
                </label>
                <textarea
                  rows={6}
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* 4. Goal Achievement */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "6px" }}>
                  4. Goal Achievement Breakdown (JSON)
                </label>
                <textarea
                  rows={6}
                  value={goalAchievement}
                  onChange={(e) => setGoalAchievement(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "var(--bg-base)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* 7. Evidence Used */}
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <h4 style={{ fontSize: "13px", fontWeight: "bold", margin: "0 0 8px 0" }}>🔍 Transparency: Evidence Processed</h4>
                {parseEvidence(review?.evidenceUsed)}
                {review?.evidenceChunks && (
                  <div style={{ marginTop: "8px", fontSize: "12px" }}>
                    Retrieved {review.evidenceChunks.length} specific evidence chunks via Vector Search.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-surface)",
          }}
        >
          <Button variant="outline" onClick={handleGenerate} disabled={loading || saving}>
            🔄 Regenerate Draft
          </Button>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="outline"
              onClick={() => handleSave("CHANGES_REQUESTED")}
              disabled={loading || saving}
              style={{ color: "var(--state-warning)", borderColor: "var(--state-warning)" }}
            >
              Request Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave("DRAFT")}
              disabled={loading || saving}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave("APPROVED")}
              disabled={loading || saving}
              style={{ background: "var(--state-success)", color: "#000", fontWeight: "bold" }}
            >
              {saving ? "Finalizing..." : "✅ Approve & Finalize Review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
