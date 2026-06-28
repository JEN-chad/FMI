"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, FileText, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  label: string;
  description?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function FileDropzone({
  label,
  description = "PNG, JPG, PDF up to 5MB",
  value = null,
  onChange,
  error,
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (fileName: string) => {
    setUploading(true);
    setLocalError(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Simulate Cloudinary URL
          const randomId = Math.random().toString(36).substring(7);
          const extension = fileName.split(".").pop() || "jpg";
          const mockUrl = `https://res.cloudinary.com/fmi-marketplace/image/upload/v1700000000/kyc_${randomId}.${extension}`;
          onChange(mockUrl);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size exceeds limit of ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(",").map(t => t.trim());
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.endsWith(type);
    });

    if (!isAccepted) {
      setLocalError("Invalid file type format");
      return;
    }

    simulateUpload(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setProgress(0);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold text-slate-300">{label}</label>
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[140px] overflow-hidden",
          isDragActive 
            ? "border-indigo-500 bg-indigo-500/5 shadow-indigo-500/5 shadow-inner scale-[1.01]" 
            : "border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/20",
          value && "border-solid border-slate-800 bg-slate-900/10",
          (error || localError) && "border-rose-500/60 bg-rose-500/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center gap-3 w-full max-w-[200px]"
            >
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <motion.div
                  className="bg-indigo-500 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Uploading: {progress}%</span>
            </motion.div>
          ) : value ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-4 w-full"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-950/40 border border-indigo-900/40 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  Uploaded Document
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Verified in Draft
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 rounded-full bg-slate-950 border border-slate-850 text-slate-400 group-hover:text-indigo-400 transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  Drag & drop file or <span className="text-indigo-400 hover:underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-500 leading-none">{description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(error || localError) && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || localError}</span>
        </div>
      )}
    </div>
  );
}
