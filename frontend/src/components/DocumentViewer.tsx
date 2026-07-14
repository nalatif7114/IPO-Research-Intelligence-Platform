import { useState } from "react";
import { Loader2, FileText, AlertCircle, Menu, Minus, Plus, Maximize, MinusCircle, X, Search } from "lucide-react";

interface DocumentViewerProps {
  documentId: string;
  pageNumber?: number;
}

export default function DocumentViewer({ documentId, pageNumber = 42 }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback filename for mockup purposes
  const filename = "GoTo_Prospektus.pdf";
  const totalPages = 486;

  // The actual URL would stream from the backend
  const pdfUrl = `http://localhost:8000/api/v1/documents/${documentId}/download#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] rounded-[24px] border border-[var(--border-glass)] overflow-hidden shadow-xl relative">
      
      {/* Top Header - Dark */}
      <div className="px-4 py-3 bg-[var(--bg-secondary)] flex items-center justify-between border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-3">
          <Menu className="w-4 h-4 text-[var(--text-secondary)] hover:text-white cursor-pointer" />
          <h3 className="text-[13px] font-semibold text-white tracking-wide">{filename}</h3>
        </div>
        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
          <MinusCircle className="w-4 h-4 hover:text-white cursor-pointer" />
          <X className="w-4 h-4 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Toolbar - Dark */}
      <div className="px-4 py-2 bg-[var(--bg-card)] flex items-center justify-between border-b border-[var(--border-glass)]">
        
        <div className="flex items-center gap-2">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-md px-3 py-1 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[11px] font-mono text-white">{pageNumber} <span className="text-[var(--text-muted)]">/ {totalPages}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-md px-2 py-1">
            <Minus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
            <span className="text-[11px] font-mono text-white px-2 border-x border-[var(--border-glass)]">100%</span>
            <Plus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
          </div>
          <Maximize className="w-3.5 h-3.5 text-[var(--text-secondary)] hover:text-white cursor-pointer" />
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] hover:text-white cursor-pointer" />
        </div>
        
      </div>

      {/* PDF View Area (White bg usually for documents) */}
      <div className="flex-1 relative bg-[#525659]">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-secondary)] z-10 animate-fade-in">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mb-4" />
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Loading Prospectus (Page {pageNumber})...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-secondary)] z-10">
            <AlertCircle className="w-12 h-12 text-[var(--error)] mb-4" />
            <p className="text-[13px] font-medium text-white">{error}</p>
          </div>
        )}

        {/* Embedded PDF - Setting background to match typical PDF viewer grey */}
        <iframe
          key={`${documentId}-${pageNumber}`}
          src={pdfUrl}
          className="w-full h-full border-none"
          style={{ backgroundColor: '#525659' }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            // Don't show error for now if it fails to load, just let it render standard error page or blank
            // setError("Failed to load PDF document.");
          }}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}
