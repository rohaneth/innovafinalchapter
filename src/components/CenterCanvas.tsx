"use client";

import React, { useState } from "react";
import { SynthesizedReview } from "../types/agents";

interface CenterCanvasProps {
  draftReview: SynthesizedReview | null;
  onSelectCitation?: (citationId: string) => void;
  onUpdateDraft?: (updatedReview: SynthesizedReview) => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
}

export function CenterCanvas({
  draftReview,
  onSelectCitation,
  onUpdateDraft,
  isEditMode = false,
  onToggleEditMode,
}: CenterCanvasProps) {
  const [editedReview, setEditedReview] = useState<SynthesizedReview | null>(
    draftReview
  );

  if (!draftReview) {
    return (
      <main
        style={{
          flex: 1,
          padding: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        <p>No review draft available. Trigger AI Synthesis to generate report.</p>
      </main>
    );
  }

  const review = editedReview || draftReview;

  const handleSummaryChange = (newSummary: string) => {
    const updated = { ...review, overallSummary: newSummary };
    setEditedReview(updated);
    onUpdateDraft?.(updated);
  };

  const handleStrengthChange = (index: number, newText: string) => {
    const updatedStrengths = [...review.strengths];
    updatedStrengths[index] = { ...updatedStrengths[index], summary: newText };
    const updated = { ...review, strengths: updatedStrengths };
    setEditedReview(updated);
    onUpdateDraft?.(updated);
  };

  const handleGrowthChange = (index: number, newText: string) => {
    const updatedGrowth = [...review.growthAreas];
    updatedGrowth[index] = { ...updatedGrowth[index], summary: newText };
    const updated = { ...review, growthAreas: updatedGrowth };
    setEditedReview(updated);
    onUpdateDraft?.(updated);
  };

  return (
    <main
      style={{
        flex: 1,
        padding: "24px",
        overflowY: "auto",
        height: "calc(100vh - 64px)",
        background: "var(--bg-base)",
      }}
    >
      {/* Top Banner & Control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
            Synthesized Performance Report
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
            Review, edit claims, inspect evidence grounding, and approve release.
          </p>
        </div>

        <button
          onClick={onToggleEditMode}
          className={isEditMode ? "btn-primary" : "btn-outline"}
          style={{ fontSize: "13px" }}
        >
          {isEditMode ? "💾 Lock & Save Edits" : "✏️ Enable HITL Manual Editing"}
        </button>
      </div>

      {/* Overall Summary Card */}
      <div className="panel-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent-primary)" }}>
            Overall Performance Executive Summary
          </h3>
          {isEditMode && <span className="badge-tag badge-warning">Editing Enabled</span>}
        </div>

        {isEditMode ? (
          <textarea
            value={review.overallSummary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            style={{
              width: "100%",
              minHeight: "80px",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-active)",
              borderRadius: "6px",
              padding: "12px",
              fontSize: "13px",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <p style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
            {review.overallSummary}
          </p>
        )}
      </div>

      {/* Strengths Section */}
      <div className="panel-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--state-success)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>💪</span> Core Strengths & Key Achievements
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {review.strengths.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "12px",
                background: "var(--bg-base)",
                borderRadius: "8px",
                border: "1px solid var(--border-default)",
              }}
            >
              {isEditMode ? (
                <input
                  type="text"
                  value={item.summary}
                  onChange={(e) => handleStrengthChange(idx, e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-active)",
                    borderRadius: "4px",
                    padding: "8px",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                />
              ) : (
                <p style={{ fontSize: "13px", margin: "0 0 8px 0", lineHeight: "1.5" }}>
                  {item.summary}
                </p>
              )}

              {/* Citation Links */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Evidence Citations:</span>
                {item.citations.map((citeId) => (
                  <button
                    key={citeId}
                    onClick={() => onSelectCitation?.(citeId)}
                    style={{
                      background: "rgba(139, 92, 246, 0.15)",
                      color: "var(--accent-secondary)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    📎 {citeId}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Areas Section */}
      <div className="panel-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--state-warning)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🎯</span> Growth & Development Opportunities
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {review.growthAreas.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "12px",
                background: "var(--bg-base)",
                borderRadius: "8px",
                border: "1px solid var(--border-default)",
              }}
            >
              {isEditMode ? (
                <input
                  type="text"
                  value={item.summary}
                  onChange={(e) => handleGrowthChange(idx, e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-active)",
                    borderRadius: "4px",
                    padding: "8px",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                />
              ) : (
                <p style={{ fontSize: "13px", margin: "0 0 8px 0", lineHeight: "1.5" }}>
                  {item.summary}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Evidence Citations:</span>
                {item.citations.map((citeId) => (
                  <button
                    key={citeId}
                    onClick={() => onSelectCitation?.(citeId)}
                    style={{
                      background: "rgba(139, 92, 246, 0.15)",
                      color: "var(--accent-secondary)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    📎 {citeId}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Progress Section */}
      <div className="panel-card" style={{ padding: "20px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--accent-primary)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🚀</span> Goal Accomplishments & Milestones
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {review.goalProgress.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "12px",
                background: "var(--bg-base)",
                borderRadius: "8px",
                border: "1px solid var(--border-default)",
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
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{item.goal}</span>
                <span className="badge-tag badge-success">{item.status}</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 8px 0" }}>
                {item.summary}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Evidence:</span>
                {item.citations.map((citeId) => (
                  <button
                    key={citeId}
                    onClick={() => onSelectCitation?.(citeId)}
                    style={{
                      background: "rgba(139, 92, 246, 0.15)",
                      color: "var(--accent-secondary)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "4px",
                      fontSize: "11px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    📎 {citeId}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
