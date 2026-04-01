"use client";

import { motion } from "framer-motion";
import { FileText, Presentation, Brain, MessageCircle } from "lucide-react";
import type { SelectedOutputs } from "@/types";

const options = [
  {
    key: "summary" as const,
    label: "Summary",
    description: "Ringkasan paragraf dari isi PDF",
    icon: FileText,
    color: "violet",
    bg: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    check: "bg-violet-500",
  },
  {
    key: "slides" as const,
    label: "Slides",
    description: "Struktur slide presentasi",
    icon: Presentation,
    color: "blue",
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    check: "bg-blue-500",
  },
  {
    key: "quiz" as const,
    label: "Quiz",
    description: "Soal pilihan ganda + jawaban",
    icon: Brain,
    color: "emerald",
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    check: "bg-emerald-500",
  },
  {
    key: "discussion" as const,
    label: "Diskusi",
    description: "Pertanyaan diskusi terbuka",
    icon: MessageCircle,
    color: "rose",
    bg: "from-rose-500/10 to-pink-500/10",
    border: "border-rose-500/20",
    check: "bg-rose-500",
  },
];

interface OutputSelectorProps {
  selected: SelectedOutputs;
  onChange: (key: keyof SelectedOutputs) => void;
}

export function OutputSelector({ selected, onChange }: OutputSelectorProps) {
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/80 text-sm font-medium">Pilih Output yang Diinginkan</h3>
        <span className="text-white/30 text-xs">{selectedCount} dipilih</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isSelected = selected[opt.key];
          return (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onChange(opt.key)}
              className={`
                relative flex items-start gap-3 p-4 rounded-xl border text-left
                transition-all duration-200 cursor-pointer
                ${isSelected
                  ? `bg-gradient-to-br ${opt.bg} ${opt.border} scale-[1.01]`
                  : "bg-white/2 border-white/8 hover:bg-white/5 hover:border-white/15"
                }
              `}
            >
              {/* Checkbox indicator */}
              <div className={`
                absolute top-3 right-3 w-4 h-4 rounded flex items-center justify-center
                transition-all duration-200 border flex-shrink-0
                ${isSelected
                  ? `${opt.check} border-transparent`
                  : "border-white/20 bg-transparent"
                }
              `}>
                {isSelected && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                transition-colors bg-gradient-to-br ${opt.bg} border ${opt.border}
              `}>
                <opt.icon className={`w-4 h-4 text-${opt.color}-400`} />
              </div>

              <div>
                <p className="text-white font-medium text-sm">{opt.label}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-tight">{opt.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
