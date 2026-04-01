"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Hanya file PDF yang diterima");
        } else if (rejection.errors[0]?.code === "file-too-large") {
          setError("Ukuran file maksimal 10MB");
        } else {
          setError("File tidak valid");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <div
            className="flex items-center gap-4 p-4 glass-card-bright rounded-xl border border-violet-500/20"
          >
            <div className="w-12 h-12 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{selectedFile.name}</p>
              <p className="text-white/40 text-xs mt-0.5">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <button
                onClick={removeFile}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center
              transition-all duration-200 group
              ${isDragActive && !isDragReject
                ? "border-violet-400 bg-violet-500/10"
                : isDragReject
                ? "border-red-400 bg-red-500/5"
                : "border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5"
              }
            `}
          >
            <input {...getInputProps()} />

            <div
              className={`flex flex-col items-center gap-4 transition-transform duration-200 ${isDragActive ? "scale-110" : "scale-100"}`}
            >
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
                ${isDragActive
                  ? "bg-violet-500/20 border border-violet-400/30"
                  : "bg-white/5 border border-white/10 group-hover:bg-violet-500/10 group-hover:border-violet-500/20"
                }
              `}>
                <Upload className={`w-7 h-7 ${isDragActive ? "text-violet-400" : "text-white/30 group-hover:text-violet-400"} transition-colors`} />
              </div>

              {isDragActive ? (
                <div>
                  <p className="text-violet-300 font-semibold">Lepas file di sini...</p>
                  <p className="text-violet-400/60 text-sm mt-1">File akan segera diproses</p>
                </div>
              ) : (
                <div>
                  <p className="text-white/70 font-medium">
                    Drag & drop PDF Anda di sini
                  </p>
                  <p className="text-white/30 text-sm mt-1">
                    atau{" "}
                    <span className="text-violet-400 font-medium">klik untuk browse</span>
                    {" "}— maksimal 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Decorative corner dots */}
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-white/10" />
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/10" />
            <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-white/10" />
            <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-white/10" />
          </div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
