"use client";

import { useState } from "react";
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

interface UploadItem {
  id: string;
  name: string;
  size: string;
  type: string;
  status: "uploaded" | "processing" | "processed" | "error";
  date: string;
}

const recentUploads: UploadItem[] = [
  {
    id: "1",
    name: "TechCorp_Prospectus_2026.pdf",
    size: "4.2 MB",
    type: "PDF",
    status: "processed",
    date: "2026-07-10",
  },
  {
    id: "2",
    name: "GreenEnergy_Financials_Q2.xlsx",
    size: "1.8 MB",
    type: "XLSX",
    status: "processing",
    date: "2026-07-10",
  },
  {
    id: "3",
    name: "CloudScale_S1_Filing.pdf",
    size: "12.1 MB",
    type: "PDF",
    status: "uploaded",
    date: "2026-07-09",
  },
  {
    id: "4",
    name: "BioHealth_Annual_Report.pdf",
    size: "8.7 MB",
    type: "PDF",
    status: "error",
    date: "2026-07-09",
  },
  {
    id: "5",
    name: "FinLedger_Market_Data.csv",
    size: "340 KB",
    type: "CSV",
    status: "processed",
    date: "2026-07-08",
  },
];

const statusMap = {
  uploaded: {
    label: "Uploaded",
    badgeClass: "badge-info",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    badgeClass: "badge-warning",
    icon: Clock,
  },
  processed: {
    label: "Processed",
    badgeClass: "badge-success",
    icon: CheckCircle2,
  },
  error: {
    label: "Error",
    badgeClass: "badge-error",
    icon: AlertCircle,
  },
};

const supportedFormats = [
  { icon: FileText, label: "PDF", desc: "Prospectus, S-1 filings" },
  { icon: FileSpreadsheet, label: "XLSX / CSV", desc: "Financial data" },
  { icon: FileArchive, label: "ZIP", desc: "Bundled documents" },
  { icon: FileText, label: "DOCX", desc: "Research notes" },
];

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate upload
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload prospectus, financial statements, and research documents for
            analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upload zone */}
          <div className="xl:col-span-2 space-y-6">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`glass-card p-12 border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                isDragging
                  ? "border-blue-400 bg-blue-500/5 scale-[1.01]"
                  : "border-white/10 hover:border-blue-500/30 hover:bg-white/[0.02]"
              }`}
            >
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
                <button className="gradient-btn text-sm px-6 py-2.5">
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
                        Uploading document...
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

            {/* Recent uploads */}
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">
                  Recent Uploads
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {recentUploads.map((file) => {
                  const cfg = statusMap[file.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.size} · {file.date}
                          </p>
                        </div>
                      </div>
                      <span className={`badge ${cfg.badgeClass}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
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
