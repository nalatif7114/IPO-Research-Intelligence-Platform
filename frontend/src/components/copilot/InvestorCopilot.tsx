"use client"

import { BookOpen, Bot, ChevronLeft, ChevronRight, FileSearch, Maximize2, Minus, Plus, Send, Sparkles, User, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import apiClient, { API_BASE_URL } from '@/lib/api'

type Message = { id: string; role: 'user' | 'assistant'; text: string; citations?: string[] }

const suggestions = ['What are the top material risks?', 'Summarize the use of proceeds', 'How does valuation compare with peers?', 'Find related-party transactions']

export default function InvestorCopilot({ documentId }: { documentId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'I have indexed the prospectus. Ask a question and I will answer using only cited evidence.' }
  ])
  const [input, setInput] = useState('')
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [mobileView, setMobileView] = useState<'chat' | 'document'>('chat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => scrollToBottom(), [messages, loading])

  const ask = async (question: string) => {
    const value = question.trim()
    if (!value || loading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: value }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { data } = await apiClient.post('/chat/message', { document_id: documentId, query: value })
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.response,
        citations: data.citations || [],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to query the prospectus data.')
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: 'Sorry, I encountered an issue querying the prospectus data.' }])
    } finally {
      setLoading(false)
    }
  }

  const jumpToCitation = (citationStr: string) => { 
    const p = parseInt(citationStr, 10);
    if (!isNaN(p)) {
      setPage(p); 
      setMobileView('document');
    }
  }

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 list-disc mb-2 text-sm">{parts.length > 0 ? parts : line.substring(2)}</li>
      }
      return <p key={i} className="mb-3 last:mb-0 text-sm">{parts.length > 0 ? parts : line}</p>
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-border shadow-xl">
      <div className="flex items-center border-b bg-card/45 p-2 lg:hidden">
        <button onClick={() => setMobileView('chat')} className={`flex-1 rounded-md px-3 py-2 text-xs ${mobileView === 'chat' ? 'bg-primary/12 text-primary' : 'text-muted-foreground'}`}>Conversation</button>
        <button onClick={() => setMobileView('document')} className={`flex-1 rounded-md px-3 py-2 text-xs ${mobileView === 'document' ? 'bg-primary/12 text-primary' : 'text-muted-foreground'}`}>Prospectus</button>
      </div>
      
      <div className="flex min-h-0 flex-1">
        <section className={`${mobileView === 'chat' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col border-r bg-background lg:flex lg:basis-[40%]`} aria-label="Copilot conversation">
          <div className="border-b bg-card/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md border bg-secondary"><Bot className="size-4 text-primary" /></span>
              <div><h1 className="text-sm font-semibold">IPO Research Copilot</h1><p className="text-[11px] text-muted-foreground">Answers are restricted to indexed source material</p></div>
            </div>
          </div>
          
          <div className="pipeline-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => ask(suggestion)} className="rounded-lg border bg-card/60 p-3 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
                  <Sparkles aria-hidden="true" className="mb-2 size-3.5 text-primary" />{suggestion}
                </button>
              ))}
            </div>
            
            {messages.map((message) => (
              <article key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'ml-auto max-w-[85%] flex-row-reverse' : 'max-w-[94%]'}`}>
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-md border ${message.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {message.role === 'assistant' ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                </span>
                <div className={`rounded-lg border p-4 ${message.role === 'assistant' ? 'bg-card/70' : 'bg-secondary'}`}>
                  <div className="leading-relaxed text-pretty text-muted-foreground">
                    {message.role === 'user' ? <p className="text-sm">{message.text}</p> : renderMessageContent(message.text)}
                  </div>
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.citations.map((citation, idx) => (
                        <button key={idx} onClick={() => jumpToCitation(citation)} className="flex items-center gap-1 rounded-sm border border-primary/25 bg-primary/8 px-2 py-1 font-mono text-[9px] text-primary hover:bg-primary/15">
                          <BookOpen className="size-3" />p. {citation}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
            
            {loading && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex size-7 items-center justify-center rounded-md border bg-primary/10"><Bot className="size-3.5 text-primary animate-pulse" /></span>
                <div className="flex gap-1.5 pt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} /><div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} /></div>
              </div>
            )}
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={(event) => { event.preventDefault(); ask(input) }} className="border-t bg-card/65 p-3 md:p-4">
            <label className="flex items-end gap-2 rounded-lg border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
              <span className="sr-only">Ask the prospectus</span>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); ask(input) } }} rows={2} placeholder="Ask about risks, financials, governance, or valuation…" className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" disabled={loading} />
              <button type="submit" className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50" disabled={!input.trim() || loading} aria-label="Send question"><Send className="size-4" /></button>
            </label>
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">AI-generated answers · verify source citations</p>
          </form>
        </section>

        <section className={`${mobileView === 'document' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col bg-secondary/25 lg:flex lg:basis-[60%] relative`} aria-label="Prospectus viewer">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-card/75 px-3 py-2">
            <div className="flex items-center gap-2"><FileSearch className="size-4 text-primary" /><span className="max-w-48 truncate text-xs font-medium sm:max-w-none">Prospectus Viewer</span></div>
            <div className="flex items-center gap-1">
              <button className="icon-button" onClick={() => setZoom((value) => Math.max(75, value - 25))} aria-label="Zoom out"><Minus /></button>
              <span className="w-12 text-center font-mono text-[9px] text-muted-foreground">{zoom}%</span>
              <button className="icon-button" onClick={() => setZoom((value) => Math.min(150, value + 25))} aria-label="Zoom in"><Plus /></button>
              <button className="icon-button" aria-label="Full screen"><Maximize2 /></button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background/70 px-3 py-2">
            <div className="flex items-center gap-1 ml-auto">
              <button className="icon-button" onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft /></button>
              <span className="font-mono text-[9px] text-muted-foreground">Page {page}</span>
              <button className="icon-button" onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight /></button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-[#525659] overflow-hidden flex items-center justify-center">
            <iframe
              key={`${documentId}-${page}`}
              src={`${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/download#page=${page}&toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${zoom}`}
              className="w-full h-full border-none"
              style={{ backgroundColor: '#525659' }}
              title="PDF Viewer"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
