import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader, MessageSquare, Terminal, FileCode, CornerDownRight } from "lucide-react";
import { ChatMessage, AnalysisResult } from "../types";

interface ChatModuleProps {
  context: AnalysisResult;
}

export default function ChatModule({ context }: ChatModuleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello! I have fully indexed **${context.repository.name}** and completed a comprehensive architectural trace. 
I am ready to help you parse logic, detect vulnerabilities, explain configurations, and write secure integrations.

Try asking me:
* *How does the authentication flow work here?*
* *Where is the SQL injection risk and how can I fix it?*
* *Explain the execution flow from the router down to the payment portal.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat api failed");
      }

      const resData = await response.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: resData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        references: resData.references,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: "I encountered an issue coordinating with the server-side analysis engine. Please try resending your query.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    { label: "Explain Auth", prompt: "Explain the authentication flow in detail. Which files are responsible?" },
    { label: "Find SQL Injection", prompt: "Identify the SQL injection risk in this repository. Show me the specific file, line, and how to Remediate it." },
    { label: "Analyze Flow", prompt: "Trace the execution flow of this repository. Walk me through controller to service execution steps." },
    { label: "Local Setup Guide", prompt: "Write a high-fidelity developer setup guide with environment setups and installation terminal tasks." }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[600px] overflow-hidden">
      {/* Top title info */}
      <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Repository Intelligence Assistant</h3>
            <p className="text-2xs text-slate-400 mt-0.5">RAG context connected to {context.repository.name}</p>
          </div>
        </div>
        <span className="text-2xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" /> Active Agent
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-3xl rounded-2xl p-4 shadow-2xs ${
              msg.sender === "user"
                ? "bg-blue-600 text-white rounded-tr-none"
                : "bg-white text-slate-850 border border-slate-100 rounded-tl-none font-sans"
            }`}>
              <div className="text-xs font-semibold opacity-60 mb-1 flex items-center justify-between">
                <span>{msg.sender === "user" ? "Dev" : "CodeSage AI"}</span>
                <span className="text-2xs font-normal pl-3">{msg.timestamp}</span>
              </div>
              
              <div className="text-sm leading-relaxed whitespace-pre-wrap select-text markdown-body">
                {msg.text}
              </div>

              {/* References citations segment */}
              {msg.references && msg.references.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <h4 className="text-2xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Terminal className="w-3.5 h-3.5" /> Referenced Files Cites:
                  </h4>
                  <div className="space-y-1.5">
                    {msg.references.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-150 rounded-lg text-xs font-mono text-slate-600">
                        <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate flex-1">{r.file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none border border-slate-100 p-4 shadow-sm text-slate-500 flex items-center gap-2">
              <Loader className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs font-medium">Sage is analyzing repository tree...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Auto prompt Suggestions Bar */}
      <div className="px-6 py-2.5 bg-slate-50/50 border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 flex gap-2">
        {PROMPT_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.prompt)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="p-4 bg-white border-t border-slate-150 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything about functions, APIs, secure integrations..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-45 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
