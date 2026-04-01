"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, FileSearch, Cpu, Wand2 } from "lucide-react";

interface ProcessingOverlayProps {
  isProcessing: boolean;
}

const steps = [
  { icon: FileSearch, label: "Mengekstrak teks dari PDF...", duration: 20 },
  { icon: Brain, label: "Menganalisis konten dengan NLP...", duration: 50 },
  { icon: Cpu, label: "Memproses dengan AI...", duration: 75 },
  { icon: Wand2, label: "Menghasilkan materi pembelajaran...", duration: 95 },
];

export function ProcessingOverlay({ isProcessing }: ProcessingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;

        // Update step based on progress
        const stepIndex = steps.findIndex((s, i) => {
          const nextStep = steps[i + 1];
          return next < s.duration || (!nextStep && next < 100);
        });
        if (stepIndex !== -1) setCurrentStep(stepIndex);

        if (next >= 98) {
          clearInterval(interval);
          return 98;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(8,8,20)]/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card glow-purple p-8 rounded-2xl max-w-md w-full mx-6 text-center"
          >
            {/* Animated brain icon */}
            <div className="relative flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-violet-400" />
              </div>
              {/* Orbit rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-violet-500/20 animate-spin"
                  style={{ animationDuration: "3s" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border border-violet-500/10 animate-spin"
                  style={{ animationDuration: "5s", animationDirection: "reverse" }} />
              </div>
            </div>

            <h3 className="font-display text-2xl font-bold text-white mb-1">
              AI Sedang Memproses
            </h3>
            <p className="text-white/40 text-sm mb-8">
              Mohon tunggu, AI kami menganalisis dokumen Anda
            </p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs">Progress</span>
                <span className="text-violet-400 text-xs font-mono">{progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full progress-bar rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {steps.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                return (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: isActive ? 1 : isDone ? 0.5 : 0.2,
                    }}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive ? "bg-violet-500/20 border border-violet-400/30" :
                      isDone ? "bg-emerald-500/20 border border-emerald-400/20" :
                      "bg-white/5 border border-white/10"
                    }`}>
                      <step.icon className={`w-3 h-3 ${
                        isActive ? "text-violet-400" :
                        isDone ? "text-emerald-400" : "text-white/30"
                      }`} />
                    </div>
                    <span className={`text-xs ${isActive ? "text-white/80" : "text-white/30"}`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto flex gap-0.5">
                        {[...Array(3)].map((_, j) => (
                          <motion.span
                            key={j}
                            className="w-1 h-1 rounded-full bg-violet-400"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, delay: j * 0.2, repeat: Infinity }}
                          />
                        ))}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
