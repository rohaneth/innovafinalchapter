"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string; sources?: any[] }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.slice(-5) })
      });
      const data = await res.json();

      setMessages([...newMessages, { role: "assistant", content: data.answer || data.error, sources: data.sources }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Error communicating with AI." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Who deserves promotion?",
    "Summarize Project Alpha.",
    "Which employees have overdue goals?",
    "Who consistently exceeds expectations?"
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Org AI Chat</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* History would go here in a real app */}
          <p className="text-sm text-gray-500 italic">Conversation History</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <h1 className="text-3xl font-semibold text-gray-700">Ask the Organization Knowledge Hub</h1>
              <p className="text-gray-500 max-w-md">Get instant, evidence-backed answers about projects, employee performance, and goals.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {suggestedQuestions.map((q, idx) => (
                  <button key={idx} onClick={() => setInput(q)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-100 transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-2xl p-4 rounded-xl shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-100"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">EVIDENCE SOURCES:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {msg.sources.map((s: any, i: number) => (
                          <li key={i}>[{s.type.toUpperCase()}] {s.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-gray-500 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about the organization..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
