"use client";

import React, { useState, useEffect } from "react";
import { SynthesizedReview } from "../types/agents";
import { motion } from "framer-motion";
import { Edit3, Save, Zap, AlertTriangle, CheckCircle2, TrendingUp, Search } from "lucide-react";

interface CenterCanvasProps {
  draftReview: SynthesizedReview | null;
  onSelectCitation?: (citationId: string) => void;
  onUpdateDraft?: (updatedReview: SynthesizedReview) => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  userRole?: string;
}

export function CenterCanvas({
  draftReview,
  onSelectCitation,
  onUpdateDraft,
  isEditMode = false,
  onToggleEditMode,
  userRole = "Manager",
}: CenterCanvasProps) {
  const [editedReview, setEditedReview] = useState<SynthesizedReview | null>(draftReview);

  useEffect(() => {
    setEditedReview(draftReview);
  }, [draftReview]);

  if (!draftReview) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-950 p-8 text-gray-500">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-24 mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"
        >
          <Zap className="w-10 h-10 text-indigo-400" />
        </motion.div>
        <p className="text-sm">No review draft available. Trigger AI Synthesis to generate report.</p>
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
    <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-64px)] bg-gray-950 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-gray-950 to-gray-950 pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 tracking-tight">
              Synthesized Performance Report
            </h2>
            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
              Review, edit claims, inspect evidence, and approve release.
            </p>
          </div>

          {userRole === "Manager" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleEditMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isEditMode
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-white/10 shadow-sm"
              }`}
            >
              {isEditMode ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {isEditMode ? "Save Edits" : "Manual Override"}
            </motion.button>
          )}
        </div>

        {/* Overall Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Executive Summary
            </h3>
            {isEditMode && <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/20">Editing</span>}
          </div>
          
          {isEditMode ? (
            <textarea
              value={review.overallSummary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              className="w-full min-h-[100px] bg-gray-950/50 text-gray-300 border border-indigo-500/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed">
              {review.overallSummary}
            </p>
          )}
        </motion.div>

        {/* Strengths */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-extrabold text-green-400 flex items-center gap-2 mb-4 uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" /> Core Strengths
          </h3>
          <div className="space-y-4">
            {review.strengths.map((item, idx) => (
              <div key={idx} className="bg-gray-950/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                {isEditMode ? (
                  <input
                    type="text"
                    value={item.summary}
                    onChange={(e) => handleStrengthChange(idx, e.target.value)}
                    className="w-full bg-gray-900 text-gray-300 border border-indigo-500/50 rounded-lg p-3 text-sm focus:outline-none mb-3"
                  />
                ) : (
                  <p className="text-sm text-gray-300 mb-3">{item.summary}</p>
                )}
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Citations:</span>
                  {item.citations.map((citeId) => (
                    <button
                      key={citeId}
                      onClick={() => onSelectCitation?.(citeId)}
                      className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-xs hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" /> {citeId}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Growth Areas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4" /> Growth Areas
          </h3>
          <div className="space-y-4">
            {review.growthAreas.map((item, idx) => (
              <div key={idx} className="bg-gray-950/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                {isEditMode ? (
                  <input
                    type="text"
                    value={item.summary}
                    onChange={(e) => handleGrowthChange(idx, e.target.value)}
                    className="w-full bg-gray-900 text-gray-300 border border-indigo-500/50 rounded-lg p-3 text-sm focus:outline-none mb-3"
                  />
                ) : (
                  <p className="text-sm text-gray-300 mb-3">{item.summary}</p>
                )}
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Citations:</span>
                  {item.citations.map((citeId) => (
                    <button
                      key={citeId}
                      onClick={() => onSelectCitation?.(citeId)}
                      className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-xs hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" /> {citeId}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Goal Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-fuchsia-400 flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4" /> Goal Progress & Jira Metrics
          </h3>
          <div className="space-y-4">
            {review.goalProgress.map((item, idx) => (
              <div key={idx} className="bg-gray-950/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-200">{item.goal}</span>
                  <span className="bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">{item.summary}</p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Evidence:</span>
                  {item.citations.map((citeId) => (
                    <button
                      key={citeId}
                      onClick={() => onSelectCitation?.(citeId)}
                      className="bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 px-2 py-0.5 rounded text-xs hover:bg-fuchsia-500/20 transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" /> {citeId}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
