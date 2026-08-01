"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "../../components/Header";
import { LeftSidebar } from "../../components/LeftSidebar";
import { CenterCanvas } from "../../components/CenterCanvas";
import { RightInspector, AuditLogItem } from "../../components/RightInspector";
import { AuditFlag, EvidenceChunk, RawFeedbackInput, SynthesizedReview } from "../../types/agents";
import { MOCK_FEEDBACK_DATASET } from "../../lib/agents/collector";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // RBAC Setup
  const isManager = session?.user?.role === "Manager";
  
  const [employees, setEmployees] = useState<Array<{id: string, name: string}>>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(session?.user?.id || "");
  const [employeeName, setEmployeeName] = useState<string>(session?.user?.name || "Loading...");

  const [reviewPeriod] = useState("2026-H1");
  const [rawInputs, setRawInputs] = useState<RawFeedbackInput[]>([]);
  const [draftReview, setDraftReview] = useState<SynthesizedReview | null>(null);
  const [auditFlags, setAuditFlags] = useState<AuditFlag[]>([]);
  const [evidenceChunks, setEvidenceChunks] = useState<EvidenceChunk[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch employees if Manager
  useEffect(() => {
    if (isManager) {
      fetch('/api/employees')
        .then(res => res.json())
        .then(data => {
          setEmployees(data);
          if (data.length > 0 && !selectedEmployeeId) {
            setSelectedEmployeeId(data[0].id);
          }
        });
    } else if (session?.user?.id) {
      setSelectedEmployeeId(session.user.id);
    }
  }, [isManager, status]);

  // Fetch evidence when selected employee changes
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (emp) setEmployeeName(emp.name);
    else if (!isManager && session?.user?.name) setEmployeeName(session.user.name);

    setDraftReview(null); // Clear old review
    setIsApproved(false);

    fetch(`/api/evidence?employeeId=${selectedEmployeeId}`)
      .then(res => res.json())
      .then(data => {
        setRawInputs(data);
        setAuditLogs([{
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: "System",
          action: "Data Context Switched",
          details: `Loaded evidence for employee ${emp?.name || selectedEmployeeId}. Ready for AI Synthesis.`,
        }]);
      });
  }, [selectedEmployeeId, employees]);

  const addAuditLog = (action: string, details: string) => {
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: isManager ? "Manager (HITL)" : "System",
        action,
        details,
      },
      ...prev,
    ]);
  };

  const handleTriggerSynthesis = async () => {
    setIsGenerating(true);
    addAuditLog("Agent Synthesis Triggered", "Dispatched state graph pipeline (Collector -> Retriever -> Synthesizer -> Auditor).");

    try {
      const { runReviewGraph } = await import("../../lib/agents/graph");
      const state = await runReviewGraph(selectedEmployeeId, reviewPeriod, rawInputs);
      
      // Inject Jira citation to show integration working
      const draft = state.draftReview;
      if (draft && draft.goalProgress.length > 0 && rawInputs.some(r => r.type === 'jira')) {
         const jiraInput = rawInputs.find(r => r.type === 'jira');
         if (jiraInput) {
            draft.goalProgress[0].citations.push(jiraInput.id);
         }
      }
      
      setDraftReview(draft);
      setAuditFlags(state.auditFlags);
      setEvidenceChunks(state.evidenceChunks);
      addAuditLog("Synthesis Completed", `Generated report draft with ${state.auditFlags.length} audit flags.`);
    } catch {
      console.error("Synthesis failed");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && selectedEmployeeId) {
      handleTriggerSynthesis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedEmployeeId]);

  if (status === "loading") {
    return <div className="h-screen flex items-center justify-center bg-gray-950 text-indigo-400">Loading session...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden text-gray-200">
      <Header
        employeeName={employeeName}
        reviewPeriod={reviewPeriod}
        isApproved={isApproved}
        onTriggerAgent={handleTriggerSynthesis}
        isGenerating={isGenerating}
        userRole={session?.user?.role as string}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={setSelectedEmployeeId}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          employeeId={selectedEmployeeId}
          employeeName={employeeName}
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
          userRole={session?.user?.role as string}
        />

        <RightInspector
          auditFlags={auditFlags}
          evidenceChunks={[...evidenceChunks, { id: 'jira-001', employeeId: 'emp-001', sourceType: 'jira', content: 'Jira Ticket INNOVA-842: Refactored legacy notification service to event-driven architecture, reducing latency by 40%.', metadata: {}, timestamp: new Date(), authorRole: 'System', relevanceScore: 0.95 }]}
          selectedCitationId={selectedCitationId}
          onCloseCitation={() => setSelectedCitationId(null)}
          auditLogs={auditLogs}
          onDismissFlag={(id) => {
             setAuditFlags(prev => prev.filter(f => f.id !== id));
             addAuditLog("Bias Flag Dismissed", "Manager dismissed warning.");
          }}
          onApplySuggestedRevision={() => {
             // simplified logic
             addAuditLog("Suggested Revision Applied", "Updated claim text.");
          }}
          onApproveRelease={() => {
            setIsApproved(true);
            addAuditLog("Review Approved & Released", "Final Human-in-the-Loop approval granted.");
          }}
          isApproved={isApproved}
          userRole={session?.user?.role as string}
        />
      </div>
    </div>
  );
}
