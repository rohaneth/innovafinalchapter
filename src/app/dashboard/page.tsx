"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { LeftSidebar } from "../../components/LeftSidebar";
import { CenterCanvas } from "../../components/CenterCanvas";
import { RightInspector, AuditLogItem } from "../../components/RightInspector";
import {
  AuditFlag,
  EvidenceChunk,
  RawFeedbackInput,
  SynthesizedReview,
} from "../../types/agents";
import { MOCK_FEEDBACK_DATASET } from "../../lib/agents/collector";

export default function DashboardPage() {
  const [employeeId] = useState("emp-001");
  const [reviewPeriod] = useState("2026-H1");
  const [rawInputs, setRawInputs] = useState<RawFeedbackInput[]>(MOCK_FEEDBACK_DATASET);
  const [draftReview, setDraftReview] = useState<SynthesizedReview | null>(null);
  const [auditFlags, setAuditFlags] = useState<AuditFlag[]>([]);
  const [evidenceChunks, setEvidenceChunks] = useState<EvidenceChunk[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: "log-001",
      timestamp: new Date().toISOString(),
      actor: "System",
      action: "Review Cycle Initialized",
      details: "360° review cycle 2026-H1 created for employee emp-001.",
    },
  ]);

  const addAuditLog = (action: string, details: string) => {
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "HR Reviewer (HITL)",
        action,
        details,
      },
      ...prev,
    ]);
  };

  // Trigger Multi-Agent Synthesis via API or Client Fallback
  const handleTriggerSynthesis = async () => {
    setIsGenerating(true);
    addAuditLog("Agent Synthesis Triggered", "Dispatched state graph pipeline (Collector -> Retriever -> Synthesizer -> Auditor).");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, reviewPeriod, rawInputs }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setDraftReview(json.data.draftReview);
        setAuditFlags(json.data.auditFlags);
        setEvidenceChunks(json.data.evidenceChunks);
        addAuditLog("Synthesis Completed", `Generated ${json.data.draftReview?.strengths.length} strengths and ${json.data.auditFlags.length} audit flags.`);
      } else {
        throw new Error(json.error || "Failed API response");
      }
    } catch {
      // Fallback local execution if running without server route
      const { runReviewGraph } = await import("../../lib/agents/graph");
      const state = await runReviewGraph(employeeId, reviewPeriod, rawInputs);
      setDraftReview(state.draftReview);
      setAuditFlags(state.auditFlags);
      setEvidenceChunks(state.evidenceChunks);
      addAuditLog("Synthesis Completed (Local Fallback)", `Generated report draft with ${state.auditFlags.length} audit flags.`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleTriggerSynthesis();
  }, []);

  const handleDismissFlag = (flagId: string) => {
    const flag = auditFlags.find((f) => f.id === flagId);
    setAuditFlags((prev) => prev.filter((f) => f.id !== flagId));
    if (flag) {
      addAuditLog("Bias Flag Dismissed", `Dismissed ${flag.biasType} flag on section ${flag.targetSection}.`);
    }
  };

  const handleApplySuggestedRevision = (flag: AuditFlag) => {
    if (!draftReview) return;
    if (flag.targetSection.includes("growth")) {
      const updatedGrowth = draftReview.growthAreas.map((g) => {
        if (g.summary.toLowerCase().includes("aggressive") || g.summary.toLowerCase().includes("communication")) {
          return { ...g, summary: flag.suggestedRevision };
        }
        return g;
      });
      setDraftReview({ ...draftReview, growthAreas: updatedGrowth });
    } else if (flag.targetSection.includes("strength")) {
      const updatedStrengths = draftReview.strengths.map((s, idx) => {
        if (idx === 0) return { ...s, summary: flag.suggestedRevision };
        return s;
      });
      setDraftReview({ ...draftReview, strengths: updatedStrengths });
    }
    handleDismissFlag(flag.id);
    addAuditLog("Suggested Revision Applied", `Updated claim text in ${flag.targetSection} based on auditor suggestion.`);
  };


  const handleApproveRelease = () => {
    setIsApproved(true);
    addAuditLog("Review Approved & Released", "Final Human-in-the-Loop approval granted. Review report released to employee.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-base)" }}>
      <Header
        employeeName="Alex Vance"
        reviewPeriod={reviewPeriod}
        isApproved={isApproved}
        onTriggerAgent={handleTriggerSynthesis}
        isGenerating={isGenerating}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <LeftSidebar
          employeeId={employeeId}
          rawInputs={rawInputs}
          selectedSourceId={selectedSourceId}
          onSelectSource={(sourceId) => setSelectedSourceId(sourceId)}
        />

        <CenterCanvas
          draftReview={draftReview}
          onSelectCitation={(citeId) => setSelectedCitationId(citeId)}
          onUpdateDraft={(updated) => {
            setDraftReview(updated);
            addAuditLog("Manual Override", "Modified synthesized performance report claims.");
          }}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
        />

        <RightInspector
          auditFlags={auditFlags}
          evidenceChunks={evidenceChunks}
          selectedCitationId={selectedCitationId}
          onCloseCitation={() => setSelectedCitationId(null)}
          auditLogs={auditLogs}
          onDismissFlag={handleDismissFlag}
          onApplySuggestedRevision={handleApplySuggestedRevision}
          onApproveRelease={handleApproveRelease}
          isApproved={isApproved}
        />
      </div>
    </div>
  );
}
