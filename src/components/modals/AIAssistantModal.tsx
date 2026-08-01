"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Project {
  id: string;
  name: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority?: string;
  deadline?: string | null;
  successCriteria?: string | null;
  progress: number;
  project?: Project | null;
}

interface Submission {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
}

interface ManagerFeedback {
  id: string;
  type: string;
  content: string;
  createdAt: Date | string;
  author?: { email: string; role: string };
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  goals: Goal[];
  submissions: Submission[];
  managerFeedback: ManagerFeedback[];
}

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  time: string;
}

export function AIAssistantModal({
  isOpen,
  onClose,
  userEmail,
  goals,
  submissions,
  managerFeedback,
}: AIAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Hello! I'm your AI Performance Assistant. Ask me anything about your pending goals, upcoming deadlines, feedback summary, project progress, or improvement suggestions!`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("pending") || q.includes("goal") || q.includes("active")) {
      const activeGoals = goals.filter((g) => g.status !== "Completed");
      if (activeGoals.length === 0) {
        return "You have 0 pending goals! All assigned goals are marked as Completed. Great job! 🎉";
      }
      const goalList = activeGoals
        .map(
          (g) =>
            `• **${g.title}** (${g.progress}% complete, Priority: ${g.priority || "Medium"}${
              g.deadline ? `, Due: ${g.deadline}` : ""
            })`
        )
        .join("\n");
      return `You have **${activeGoals.length} pending goal(s)**:\n\n${goalList}\n\n*Tip: Click on any goal in your dashboard to update progress.*`;
    }

    if (q.includes("deadline") || q.includes("due") || q.includes("urgent")) {
      const datedGoals = goals
        .filter((g) => g.deadline && g.status !== "Completed")
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

      if (datedGoals.length === 0) {
        return "No upcoming deadlines detected for your active goals.";
      }

      const list = datedGoals
        .map((g) => `• **${g.title}** - Due: **${g.deadline}** (${g.status}, ${g.progress}%)`)
        .join("\n");
      return `Here are your upcoming deadlines:\n\n${list}`;
    }

    if (q.includes("feedback") || q.includes("comment") || q.includes("manager")) {
      if (managerFeedback.length === 0) {
        return "You don't have any manager feedback posted yet. Keep submitting self-assessments to prompt manager reviews!";
      }
      const latest = managerFeedback[0];
      return `Here is a summary of your latest feedback from **${latest.author?.email || "Manager"}**:\n\n> "${latest.content}"\n\n*Category: ${latest.type} Feedback*`;
    }

    if (q.includes("progress") || q.includes("project")) {
      const total = goals.length;
      const avg = total > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / total) : 0;
      const completed = goals.filter((g) => g.status === "Completed").length;
      return `Your overall project completion rate is **${avg}%** across **${total} goal(s)** (${completed} completed, ${total - completed} in progress).`;
    }

    if (q.includes("tip") || q.includes("suggest") || q.includes("improve") || q.includes("bias")) {
      return `Here are personalized recommendations based on your performance profile:\n\n1. 🎯 **Update Progress Regularly**: Document incremental progress on High priority goals before sprint retros.\n2. 📝 **Submit Detailed Notes**: Self-assessments with quantitative metrics reduce manager review bias by 85%.\n3. ⏳ **Focus on Deadlines**: Prioritize goals near completion to boost team momentum.`;
    }

    return `I analyzed your workspace (${goals.length} goals, ${submissions.length} submissions, ${managerFeedback.length} feedback items).\n\n• Active Goals: ${
      goals.filter((g) => g.status !== "Completed").length
    }\n• Average Progress: ${
      goals.length > 0 ? Math.round(goals.reduce((a, b) => a + b.progress, 0) / goals.length) : 0
    }%\n\nHow else can I assist you with your performance reviews?`;
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const aiText = generateAIResponse(input.trim());
    const aiMsg: ChatMessage = {
      sender: "ai",
      text: aiText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const quickPrompts = [
    "What are my pending goals?",
    "Show upcoming deadlines",
    "Summarize manager feedback",
    "Give me performance tips",
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        right: "24px",
        width: "380px",
        height: "520px",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          background: "linear-gradient(135deg, rgba(224, 53, 162, 0.2), rgba(139, 92, 246, 0.2))",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "14px", color: "var(--text-primary)" }}>
              AI Performance Assistant
            </div>
            <div style={{ fontSize: "11px", color: "var(--state-success)" }}>● Online & Context-Aware</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "18px",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Quick Prompts */}
      <div
        style={{
          padding: "10px 14px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          gap: "6px",
          overflowX: "auto",
        }}
      >
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            onClick={() => {
              setInput(qp);
            }}
            style={{
              whiteSpace: "nowrap",
              padding: "4px 8px",
              borderRadius: "12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--accent-primary)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--bg-base)",
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: m.sender === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background:
                m.sender === "user"
                  ? "var(--accent-primary)"
                  : "var(--bg-surface)",
              color: "var(--text-primary)",
              border: m.sender === "user" ? "none" : "1px solid var(--border-default)",
              fontSize: "13px",
              lineHeight: "1.5",
              whiteSpace: "pre-line",
            }}
          >
            {m.text}
            <div
              style={{
                fontSize: "10px",
                color: m.sender === "user" ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                marginTop: "4px",
                textAlign: "right",
              }}
            >
              {m.time}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          padding: "12px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-default)",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Assistant..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--bg-base)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            fontSize: "13px",
          }}
        />
        <Button type="submit" style={{ padding: "8px 14px", fontSize: "13px" }}>
          Send
        </Button>
      </form>
    </div>
  );
}
