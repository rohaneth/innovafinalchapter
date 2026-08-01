"use client";

import React, { useState, useEffect } from "react";
import { AuditFlag, EvidenceChunk } from "../types/agents";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, BookOpen, ScrollText, CheckCircle2, Rocket, XCircle } from "lucide-react";

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
  userRole?: string;
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
  userRole = "Manager",
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState<"auditor" | "citation" | "audit_trail">("auditor");

  useEffect(() => {
    if (selectedCitationId) {
      setActiveTab("citation");
    }
  }, [selectedCitationId]);

  const selectedChunk = evidenceChunks.find((c) => c.id === selectedCitationId);

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-gray-900/40 border-l border-white/5 flex flex-col h-[calc(100vh-64px)] backdrop-blur-md"
    >
      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-gray-950/50">
        <button
          onClick={() => setActiveTab("auditor")}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "auditor" ? "text-amber-400 border-b-2 border-amber-400 bg-gray-900/50 shadow-inner" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Auditor ({auditFlags.length})
        </button>
        <button
          onClick={() => setActiveTab("citation")}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "citation" ? "text-indigo-400 border-b-2 border-indigo-400 bg-gray-900/50 shadow-inner" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Source
        </button>
        <button
          onClick={() => setActiveTab("audit_trail")}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "audit_trail" ? "text-green-400 border-b-2 border-green-400 bg-gray-900/50 shadow-inner" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" /> Trail ({auditLogs.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "auditor" && (
            <motion.div key="auditor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Bias Inspector</h4>
              
              {auditFlags.length === 0 ? (
                <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-green-300/80">No active bias warnings detected. Claim grounding is secure.</p>
                </div>
              ) : (
                auditFlags.map((flag) => (
                  <div key={flag.id} className="bg-gray-950/80 border border-white/5 rounded-xl p-3 overflow-hidden relative shadow-sm">
                    <div className={`absolute top-0 left-0 w-1 h-full ${flag.severity === "high" ? "bg-red-500" : "bg-amber-500"}`} />
                    <div className="flex items-center justify-between mb-3 pl-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${flag.severity === "high" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {flag.biasType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mb-4 pl-2 leading-relaxed">{flag.description}</p>
                    
                    {flag.suggestedRevision && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-4 ml-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Suggestion</span>
                        <p className="text-xs text-indigo-200/80 italic">"{flag.suggestedRevision}"</p>
                      </div>
                    )}
                    
                    {userRole === "Manager" && (
                      <div className="flex gap-2 pl-2">
                        <button onClick={() => onApplySuggestedRevision(flag)} className="flex-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] font-bold py-1.5 rounded transition-colors">
                          Apply
                        </button>
                        <button onClick={() => onDismissFlag(flag.id)} className="flex-1 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white text-[10px] font-bold py-1.5 rounded transition-colors">
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "citation" && (
            <motion.div key="citation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
               <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Evidence Inspector</h4>
               
               {selectedChunk ? (
                <div className="bg-gray-950/80 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {selectedChunk.sourceType.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-gray-500">{(selectedChunk.relevanceScore * 100).toFixed(0)}% match</span>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-300 font-mono leading-relaxed mb-4 border border-white/5 shadow-inner overflow-y-auto max-h-60">
                    "{selectedChunk.content}"
                  </div>
                  
                  <div className="text-[10px] text-gray-500 flex justify-between mb-4">
                    <span>By: <span className="text-gray-400">{selectedChunk.authorRole}</span></span>
                    <span>{new Date(selectedChunk.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  <button onClick={onCloseCitation} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <XCircle className="w-3.5 h-3.5" /> Close Inspector
                  </button>
                </div>
               ) : (
                <div className="h-40 flex items-center justify-center text-center p-6 border border-dashed border-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500">Click any <span className="text-indigo-400 bg-indigo-500/10 px-1 rounded">citation</span> in the report to inspect raw text.</p>
                </div>
               )}
            </motion.div>
          )}

          {activeTab === "audit_trail" && (
            <motion.div key="audit_trail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Governance Log</h4>
              
              <div className="relative border-l border-gray-800 ml-2 space-y-4 pl-4 pb-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-gray-950" />
                    <div className="bg-gray-950/50 border border-white/5 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-green-400">{log.action}</span>
                        <span className="text-[9px] text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-1">{log.details}</p>
                      <span className="text-[9px] text-gray-600 font-medium">Actor: {log.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Release Button */}
      {userRole === "Manager" && (
        <div className="p-4 bg-gray-950/80 border-t border-white/5 backdrop-blur-xl">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApproveRelease}
            disabled={isApproved}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              isApproved 
                ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed" 
                : "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600"
            }`}
          >
            {isApproved ? (
              <><CheckCircle2 className="w-4 h-4" /> Released</>
            ) : (
              <><Rocket className="w-4 h-4" /> Finalize & Release</>
            )}
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
}
