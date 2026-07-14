import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Plus, Sparkles, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

interface ChatPanelProps {
  documentId: string;
  onSelectPage?: (page: number) => void;
}

const SUGGESTED_QUESTIONS = [
  "What are the main risks faced by GoTo?",
  "How is GoTo's financial performance trend?",
  "What is the company's competitive advantage?",
  "Explain the valuation and fair value range."
];

export default function ChatPanel({ documentId, onSelectPage }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Here are the key risks identified in the prospectus:\n\n**1. Intense Competition Risk**\n- The company faces intense competition across all segments which may impact market share and profitability. (Page 42-43)\n\n**2. Regulatory Risk**\n- Changes in regulations related to fintech and digital services could materially impact the business. (Page 67-68)",
      citations: ["42", "67"]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleClear = () => {
    setMessages([]);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: documentId,
          query: userMessage.content,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an issue querying the prospectus data.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Basic markdown parser for bold text and lists
  const renderMessageContent = (content: string) => {
    return content.split('\\n').map((line, i) => {
      // Bold rendering
      let formattedLine = line;
      const boldRegex = /\\*\\*(.*?)\\*\\*/g;
      
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 list-disc text-[13px] text-[var(--text-secondary)] leading-relaxed mb-2">
            {parts.length > 0 ? parts : line.substring(2)}
          </li>
        );
      }
      
      return (
        <p key={i} className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3 last:mb-0">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className="flex h-full bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] overflow-hidden shadow-xl">
      
      {/* Sidebar for Copilot */}
      <div className="w-[240px] border-r border-[var(--border-glass)] bg-[var(--bg-secondary)] flex flex-col">
        <div className="p-5 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white leading-tight">Investor Copilot</h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Ask anything about the IPO prospectus</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button 
            onClick={handleClear}
            className="w-full py-2.5 rounded-[12px] bg-[var(--primary)] hover:bg-[var(--accent)] text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 mb-6"
          >
            New Chat
          </button>

          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Suggested Questions
          </p>

          <div className="space-y-3">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-[12px] border border-[var(--border-glass)] hover:bg-[var(--bg-card)] transition-colors group"
              >
                <div className="w-4 h-4 rounded-full border border-[var(--text-muted)]/50 flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:border-[var(--primary)] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]/50 group-hover:bg-[var(--primary)] transition-colors" />
                </div>
                <span className="text-[12px] text-[var(--text-secondary)] leading-snug group-hover:text-white transition-colors">{q}</span>
              </button>
            ))}
          </div>

          <button className="w-full mt-4 py-2 rounded-lg border border-[var(--border-glass)] text-[11px] text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)] transition-colors">
            View All Questions
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full max-w-2xl mx-auto">
              {msg.role === "user" ? (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <div className="pt-1.5">
                    <p className="text-[14px] font-medium text-white">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pt-1.5">
                    {renderMessageContent(msg.content)}
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.citations.map((page, i) => (
                          <button
                            key={i}
                            onClick={() => onSelectPage?.(parseInt(page, 10))}
                            className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-glass)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-white hover:border-[var(--primary)]/50 transition-colors shadow-sm"
                          >
                            Page {page}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Mockup specific 'Show more risks' button context */}
                    {msg.id === "1" && (
                      <button className="mt-4 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-glass)] text-[12px] text-[var(--primary)] font-medium hover:bg-[var(--bg-card-hover)] transition-colors inline-flex items-center gap-1.5">
                        Show more risks ↓
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-4 w-full max-w-2xl mx-auto">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="pt-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-6 pb-4 max-w-3xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-[16px] py-4 pl-5 pr-14 text-[13px] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]/50 shadow-lg transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-3 p-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:hover:bg-[var(--primary)] text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-3">
            Responses are AI-generated and may contain errors.
          </p>
        </div>

      </div>
    </div>
  );
}
