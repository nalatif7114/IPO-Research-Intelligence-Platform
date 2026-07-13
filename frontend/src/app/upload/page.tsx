"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Upload as UploadIcon,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };
  
  const uploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError("Currently only PDF files are supported for automated processing.");
      return;
    }
    
    setUploadProgress(10);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setUploadProgress(40);
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      setUploadProgress(80);
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      
      const data = await res.json();
      setUploadProgress(100);
      
      // Data contains job_id. Redirect to the analysis page!
      setTimeout(() => {
        router.push(`/analysis/${data.job_id}`);
      }, 500);
      
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center py-12 animate-fade-in relative z-10">
        
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -z-10 pointer-events-none opacity-50" />

        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            IPO Research Intelligence Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Analysis</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base">
            Upload an IPO Prospectus PDF. Our multi-agent LangGraph orchestration engine will immediately extract, structure, and synthesize insights.
          </p>
        </div>

        <div className="w-full max-w-3xl space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Massive Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative overflow-hidden p-16 md:p-24 rounded-[2rem] border-2 border-dashed transition-all duration-500 cursor-pointer group flex flex-col items-center justify-center text-center ${
              isDragging
                ? "border-blue-400 bg-blue-500/10 scale-[1.02] shadow-[0_0_50px_rgba(59,130,246,0.15)]"
                : "border-white/10 bg-[#0B1120]/80 hover:border-blue-500/30 hover:bg-[#0f172a]/90 backdrop-blur-xl"
            }`}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
            />
            
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
                isDragging
                  ? "bg-blue-500/20 scale-110 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 group-hover:bg-blue-500/10 group-hover:scale-105"
              }`}
            >
              <UploadIcon
                className={`w-10 h-10 transition-colors duration-500 ${
                  isDragging ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                }`}
              />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              {isDragging
                ? "Drop prospectus to begin"
                : "Drag & drop prospectus here"}
            </h3>
            <p className="text-slate-400 mb-8 max-w-sm">
              Support for standard S-1 filings and IPO Prospectuses in PDF format (Max 50MB).
            </p>

            <button className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 pointer-events-none ${isDragging ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/10 text-white group-hover:bg-white/15"}`}>
              Browse Files
            </button>
          </div>

          {/* Upload progress indicator */}
          {uploadProgress !== null && (
            <div className="bg-[#0B1120] border border-white/10 p-6 rounded-2xl animate-fade-in shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Uploading & Initializing Pipeline...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadProgress(null); }}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 relative"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
