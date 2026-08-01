"use client";

import React from "react";
import { RawFeedbackInput } from "../types/agents";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, FileText, Target, Mic, FileSpreadsheet, ServerCrash } from "lucide-react";

interface LeftSidebarProps {
  employeeId?: string;
  employeeName?: string;
  rawInputs?: RawFeedbackInput[];
  selectedSourceId?: string | null;
  onSelectSource?: (sourceId: string | null) => void;
}

export function LeftSidebar({
  employeeId = "emp-001",
  employeeName = "Alex Vance",
  rawInputs = [],
  selectedSourceId = null,
  onSelectSource,
}: LeftSidebarProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case "self": return <User className="w-4 h-4" />;
      case "manager": return <Briefcase className="w-4 h-4" />;
      case "peer": return <User className="w-4 h-4" />;
      case "meeting_transcript": return <Mic className="w-4 h-4" />;
      case "project_goal": return <Target className="w-4 h-4" />;
      case "jira": return <ServerCrash className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-gray-900/30 border-r border-white/5 p-4 flex flex-col gap-4 h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden backdrop-blur-md"
    >
      {/* Profile Card */}
      <div className="bg-gray-800/40 border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 flex items-center justify-center text-white font-bold shadow-inner">
            {employeeName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{employeeName}</h3>
            <p className="text-[11px] text-indigo-300 uppercase tracking-wider font-semibold mt-0.5">Senior Engineer</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-y-2 text-xs">
          <div>
            <span className="text-gray-500 block mb-0.5 text-[10px] uppercase tracking-wider">ID</span>
            <span className="text-gray-300 font-medium font-mono">{employeeId.substring(0, 8)}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5 text-[10px] uppercase tracking-wider">Dept</span>
            <span className="text-gray-300 font-medium">Platform</span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Evidence Sources
          </h4>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
            {rawInputs.length}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectSource?.(null)}
            className={`p-3 rounded-xl text-xs cursor-pointer border transition-all ${
              selectedSourceId === null
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-lg shadow-indigo-500/10"
                : "bg-gray-800/30 border-transparent text-gray-400 hover:bg-gray-800/50 hover:border-white/5"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <FileSpreadsheet className="w-4 h-4" /> All Evidence
            </div>
          </motion.div>

          <AnimatePresence>
            {rawInputs.map((item, idx) => {
              const isSelected = selectedSourceId === item.id;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id}
                  onClick={() => onSelectSource?.(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-xl text-xs cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-gray-800/20 border-white/5 hover:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`flex items-center gap-1.5 font-medium ${isSelected ? 'text-indigo-300' : 'text-gray-300'}`}>
                      {getIcon(item.type)}
                      {item.type.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded block max-w-[60px] truncate">
                      {item.authorRole || "System"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
