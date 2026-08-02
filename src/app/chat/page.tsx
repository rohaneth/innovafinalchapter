"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string; sources?: any[] }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.slice(-5) }),
      });
      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.answer || data.error, sources: data.sources },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error communicating with AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  const suggestedQuestions = [
    "Who deserves a promotion?",
    "Summarize Project Alpha.",
    "Which employees have overdue goals?",
    "Who consistently exceeds expectations?",
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        
        .prose pre { background: #f1f5f9 !important; border: 1px solid #e2e8f0; }
        .prose code { color: #334155; background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 0.3em; font-size: 85%; }
        .prose pre code { background: transparent; padding: 0; font-size: 14px; }
        .prose a { color: #2563eb; text-decoration: none; }
        .prose a:hover { text-decoration: underline; }
        .prose p { margin-top: 1em; margin-bottom: 1em; }
        .prose ul, .prose ol { margin-top: 1em; margin-bottom: 1em; padding-left: 1.5em; }
        .prose li { margin-bottom: 0.5em; }
      `}} />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manager"
            className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="font-semibold text-slate-900 text-lg tracking-tight">
            Organization AI
          </div>
        </div>
        <div>
          <button
            onClick={resetChat}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            title="New chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M12 7v0M12 11v0M12 15v0" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">How can I help you today?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInput(q); }}
                  className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <span className="text-sm font-medium text-slate-700">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col pb-10 w-full pt-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`w-full py-6 px-4 sm:px-6 ${msg.role === "assistant" ? "bg-white border-y border-slate-100" : "bg-slate-50"}`}
              >
                <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === "user" ? (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white text-sm shadow-sm">
                        U
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          <path d="M12 7v0M12 11v0M12 15v0" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content Bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm mb-1.5">
                      {msg.role === "user" ? "You" : "Organization AI"}
                    </div>
                    {msg.role === "user" ? (
                      <div className="text-[15px] whitespace-pre-wrap leading-relaxed text-slate-800">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="text-[15px] leading-relaxed prose prose-slate max-w-none text-slate-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <details className="cursor-pointer group">
                              <summary className="text-xs font-semibold text-slate-500 select-none flex items-center gap-2 hover:text-slate-700">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-90 transition-transform">
                                  <path d="m9 18 6-6-6-6" />
                                </svg>
                                Sources ({msg.sources.length})
                              </summary>
                              <div className="mt-3 flex flex-col gap-2">
                                {msg.sources.map((s: any, i: number) => (
                                  <div key={i} className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                                    <span className="font-semibold text-slate-500 mr-2">[{s.type}]</span>
                                    {s.title}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="w-full py-6 px-4 sm:px-6 bg-white border-y border-slate-100">
                <div className="max-w-3xl mx-auto flex gap-4 md:gap-6">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M12 7v0M12 11v0M12 15v0" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Bottom Composer */}
      <div className="w-full bg-slate-50 border-t border-slate-200 px-4 pb-6 pt-4 z-20">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative bg-white border border-slate-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 rounded-xl flex items-end p-2 shadow-sm transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Organization AI..."
              className="flex-1 bg-transparent border-none text-slate-900 px-3 py-2 min-h-[44px] max-h-[200px] resize-none focus:outline-none focus:ring-0 placeholder-slate-400 text-base custom-scrollbar"
              disabled={loading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="mb-1 mr-1 p-2 rounded-lg bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Send message (Enter)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-3 font-normal">
            Organization AI can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  );
}