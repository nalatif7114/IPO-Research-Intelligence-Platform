"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Upload as UploadIcon,
  FileText,
  FileSpreadsheet,
  FileArchive,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";

const supportedFormats = [
  { icon: FileText, label: "PDF", desc: "Prospectus, S-1 filings" },
  { icon: FileSpreadsheet, label: "XLSX / CSV", desc: "Financial data" },
  { icon: FileArchive, label: "ZIP", desc: "Bundled documents" },
  { icon: FileText, label: "DOCX", desc: "Research notes" },
];

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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload prospectus for fully automated analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upload zone */}
          <div className="xl:col-span-2 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass-card p-12 border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                isDragging
                  ? "border-blue-400 bg-blue-500/5 scale-[1.01]"
                  : "border-white/10 hover:border-blue-500/30 hover:bg-white/[0.02]"
              }`}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
              />
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isDragging
                      ? "bg-blue-500/20 scale-110"
                      : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/15 group-hover:to-purple-500/15"
                  }`}
                >
                  <UploadIcon
                    className={`w-8 h-8 transition-colors ${
                      isDragging ? "text-blue-400" : "text-slate-400"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {isDragging
                    ? "Drop files here"
                    : "Drag & drop files here"}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  or click to browse from your computer
                </p>
                <button className="gradient-btn text-sm px-6 py-2.5 pointer-events-none">
                  Browse Files
                </button>
                <p className="text-xs text-slate-600 mt-3">
                  Maximum file size: 50 MB
                </p>
              </div>
            </div>

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="glass-card-sm p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Uploading document and initiating pipeline...
                      </p>
                      <p className="text-xs text-slate-500">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadProgress(null)}
                    className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Supported formats sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Supported Formats
              </h3>
              <div className="space-y-3">
                {supportedFormats.map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <div
                      key={fmt.label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {fmt.label}
                        </p>
                        <p className="text-xs text-slate-500">{fmt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-2">
                Upload Tips
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Ensure PDF files are text-searchable (not scanned images).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Financial data should include column headers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  ZIP bundles will be automatically extracted.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Use company name in filenames for auto-matching.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
