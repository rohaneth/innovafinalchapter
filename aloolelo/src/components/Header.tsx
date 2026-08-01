"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, User, CheckCircle, Clock, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
  employeeName?: string;
  reviewPeriod?: string;
  isApproved?: boolean;
  onTriggerAgent?: () => void;
  isGenerating?: boolean;
  userRole?: string;
  employees?: Array<{ id: string; name: string }>;
  selectedEmployeeId?: string;
  onSelectEmployee?: (id: string) => void;
}

export function Header({
  employeeName = "Alex Vance",
  reviewPeriod = "2026-H1",
  isApproved = false,
  onTriggerAgent,
  isGenerating = false,
  userRole = "Manager",
  employees = [],
  selectedEmployeeId,
  onSelectEmployee,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-white/10 bg-gray-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50"
    >
      {/* Brand & Context */}
      <div className="flex items-center gap-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            AI Review Workspace
            <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-white/5">Beta</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">Employee:</span>
            {userRole === "Manager" && employees.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => onSelectEmployee?.(e.target.value)}
                  className="appearance-none text-xs bg-gray-950 text-gray-200 border border-white/10 rounded-md pl-2 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer shadow-inner"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ) : (
              <span className="text-xs text-gray-200 font-medium">{employeeName}</span>
            )}
            <span className="text-xs text-gray-500 ml-1">({reviewPeriod})</span>
          </div>
        </div>
      </div>

      {/* Role & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full border border-white/5">
          <User className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-gray-300 font-medium">{userRole}</span>
        </div>

        {isApproved ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Finalized</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Draft Pending</span>
          </div>
        )}

        {onTriggerAgent && userRole === "Manager" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTriggerAgent}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-4 h-4" />
              </motion.div>
            ) : (
              <Bot className="w-4 h-4" />
            )}
            {isGenerating ? "Synthesizing..." : "Run AI"}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signOut()}
          className="p-1.5 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.header>
  );
}
