import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

interface ChatPanelProps {
  documentId: string;
}

export default function ChatPanel({ documentId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am ready to answer questions about this prospectus. What would you like to know?",
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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
        citations: data.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          Chat with Prospectus
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.role === "user" ? "ml-auto" : "mr-auto"
            }`}
          >
            <div
              className={`p-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-blue-500/20 text-blue-100 rounded-tr-sm"
                  : "bg-white/5 text-slate-300 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {msg.citations.map((c, i) => (
                  <span key={i} className="text-[10px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-[85%]">
            <div className="p-3 rounded-2xl bg-white/5 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this prospectus..."
            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:hover:bg-blue-500 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
