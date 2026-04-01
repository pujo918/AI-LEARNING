"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowLeft, Wand2, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { OutputSelector } from "@/components/dashboard/OutputSelector";
import { ProcessingOverlay } from "@/components/dashboard/ProcessingOverlay";
import { ResultTabs } from "@/components/results/ResultTabs";
import type { GeneratedResult, SelectedOutputs } from "@/types";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputs, setOutputs] = useState<SelectedOutputs>({
    summary: true,
    slides: true,
    quiz: true,
    discussion: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleOutput = (key: keyof SelectedOutputs) => {
    setOutputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const anySelected = Object.values(outputs).some(Boolean);
  const canGenerate = file !== null && anySelected;

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Silakan upload file PDF terlebih dahulu");
      return;
    }
    if (!anySelected) {
      toast.error("Pilih setidaknya satu jenis output");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("options", JSON.stringify(outputs));

      const response = await fetch("http://localhost:5000/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Terjadi kesalahan saat memproses");
      }

      const data = await response.json();

      // Ensure 100% progress visual
      await new Promise((r) => setTimeout(r, 500));

      setResult(data);
      toast.success("✨ Materi pembelajaran berhasil dibuat!", {
        description: "Semua output telah dihasilkan oleh AI",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      toast.error("Gagal memproses PDF", { description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setOutputs({ summary: true, slides: true, quiz: true, discussion: true });
  };

  return (
    <>
      <ProcessingOverlay isProcessing={isProcessing} />

      <div className="min-h-screen bg-[rgb(8,8,20)] bg-grid relative">
        {/* Ambient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/5 px-6 md:px-10 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Link>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">LearnAI Generator</span>
              </div>
            </div>

            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-white/40 hover:text-white text-sm border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-8">
          <div className={`grid gap-6 ${result ? "md:grid-cols-[380px,1fr]" : "max-w-xl mx-auto"}`}>

            {/* Left panel: Input */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  Generate Materi Ajar
                </h1>
                <p className="text-white/40 text-sm">
                  Upload PDF dan pilih output yang diinginkan
                </p>
              </motion.div>

              {/* Upload */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass-card p-5 rounded-xl space-y-3"
              >
                <h3 className="text-white/80 text-sm font-medium">Upload PDF</h3>
                <UploadZone onFileSelect={setFile} selectedFile={file} />
              </motion.div>

              {/* Output selector */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5 rounded-xl"
              >
                <OutputSelector selected={outputs} onChange={toggleOutput} />
              </motion.div>

              {/* Generate button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isProcessing}
                  className={`
                    w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold
                    transition-all duration-200
                    ${canGenerate && !isProcessing
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:shadow-xl hover:shadow-violet-500/25 hover:-translate-y-0.5"
                      : "bg-white/5 text-white/25 cursor-not-allowed"
                    }
                  `}
                >
                  <Wand2 className="w-5 h-5" />
                  Generate dengan AI
                </button>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/20 rounded-xl text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium">Gagal memproses</p>
                      <p className="text-red-400/60 text-xs mt-0.5">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tips when no result */}
              {!result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-white/20 space-y-1 pt-2"
                >
                  <p>💡 Tips: Upload PDF silabus, modul, atau buku teks</p>
                  <p>📏 Ukuran maksimal: 10MB per file</p>
                  <p>🔒 File tidak disimpan di server kami</p>
                </motion.div>
              )}
            </div>

            {/* Right panel: Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResultTabs result={result} selectedOutputs={outputs} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state when no result and no file */}
            {!result && !file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="hidden md:flex items-center justify-center"
              >
                <div className="text-center space-y-4 p-12">
                  <div className="w-20 h-20 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-white/15" />
                  </div>
                  <div>
                    <p className="text-white/25 font-medium">Hasil akan muncul di sini</p>
                    <p className="text-white/15 text-sm mt-1">Upload PDF dan klik Generate</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
