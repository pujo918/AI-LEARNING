"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Presentation, Brain, MessageCircle,
  Copy, Download, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import type { GeneratedResult } from "@/types";
import { copyToClipboard, downloadAsJSON } from "@/lib/utils";

interface ResultTabsProps {
  result: GeneratedResult;
  selectedOutputs: {
    summary: boolean;
    slides: boolean;
    quiz: boolean;
    discussion: boolean;
  };
}

type TabKey = "summary" | "slides" | "quiz" | "discussion";

const tabConfig = [
  { key: "summary" as TabKey, label: "Summary", icon: FileText, color: "violet" },
  { key: "slides" as TabKey, label: "Slides", icon: Presentation, color: "blue" },
  { key: "quiz" as TabKey, label: "Quiz", icon: Brain, color: "emerald" },
  { key: "discussion" as TabKey, label: "Diskusi", icon: MessageCircle, color: "rose" },
];

// ── Summary Tab ───────────────────────────────────
function SummaryTab({ summary }: { summary: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(summary);
    setCopied(true);
    toast.success("Summary disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Ringkasan Materi</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Tersalin!" : "Copy"}
        </button>
      </div>
      <div className="glass-card p-6 rounded-xl">
        <p className="text-white/70 leading-relaxed text-sm whitespace-pre-line">{summary}</p>
      </div>
      {/* Metadata hint */}
      <div className="flex items-center gap-4 text-xs text-white/25">
        <span>~{summary.split(" ").length} kata</span>
        <span>•</span>
        <span>~{Math.ceil(summary.split(" ").length / 200)} menit baca</span>
      </div>
    </div>
  );
}

// ── Slides Tab ────────────────────────────────────
function SlidesTab({ slides }: { slides: GeneratedResult["slides"] }) {
  const [expandedSlide, setExpandedSlide] = useState<number | null>(null);

  const handleCopyAll = async () => {
    const text = slides.map(s =>
      `SLIDE ${s.slideNumber}: ${s.title}\n${s.bullets.map(b => `• ${b}`).join("\n")}`
    ).join("\n\n");
    await copyToClipboard(text);
    toast.success("Semua slide disalin!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{slides.length} Slide Dihasilkan</h3>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Semua
        </button>
      </div>
      <div className="space-y-3">
        {slides.map((slide, i) => (
          <motion.div
            key={slide.slideNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedSlide(expandedSlide === i ? null : i)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/2 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-xs font-mono font-bold">{String(slide.slideNumber).padStart(2, "0")}</span>
              </div>
              <span className="text-white font-medium text-sm flex-1">{slide.title}</span>
              <span className="text-white/30 text-xs">{slide.bullets.length} poin</span>
              {expandedSlide === i
                ? <ChevronUp className="w-4 h-4 text-white/30" />
                : <ChevronDown className="w-4 h-4 text-white/30" />
              }
            </button>

            <AnimatePresence>
              {expandedSlide === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 border-t border-white/5">
                    <ul className="space-y-2 mt-3">
                      {slide.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-1.5 flex-shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Quiz Tab ──────────────────────────────────────
function QuizTab({ quiz }: { quiz: GeneratedResult["quiz"] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Record<number, number>>({});

  const handleAnswer = (qId: number, optIndex: number) => {
    if (revealed.has(qId)) return;
    setSelected((prev) => ({ ...prev, [qId]: optIndex }));
    setRevealed((prev) => new Set(prev).add(qId));
  };

  const correct = Object.entries(selected).filter(
    ([id, ans]) => quiz.find(q => q.id === Number(id))?.correctAnswer === ans
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{quiz.length} Soal Quiz</h3>
        {revealed.size > 0 && (
          <span className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {correct}/{revealed.size} Benar
          </span>
        )}
      </div>

      <div className="space-y-4">
        {quiz.map((q, i) => {
          const isRevealed = revealed.has(q.id);
          const userAnswer = selected[q.id];

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 rounded-xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold flex-shrink-0">
                  {q.id}
                </span>
                <p className="text-white/90 text-sm leading-relaxed">{q.question}</p>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, j) => {
                  const isCorrect = j === q.correctAnswer;
                  const isSelected = userAnswer === j;
                  let style = "border-white/8 bg-white/2 text-white/60 hover:bg-white/5 hover:border-white/15";

                  if (isRevealed) {
                    if (isCorrect) style = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                    else if (isSelected && !isCorrect) style = "border-red-500/40 bg-red-500/10 text-red-300";
                    else style = "border-white/5 bg-white/1 text-white/30";
                  }

                  return (
                    <button
                      key={j}
                      onClick={() => handleAnswer(q.id, j)}
                      disabled={isRevealed}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-sm text-left transition-all duration-200 ${style}`}
                    >
                      <span className="w-5 h-5 rounded border border-current/30 flex items-center justify-center text-xs font-mono flex-shrink-0">
                        {String.fromCharCode(65 + j)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                      {isRevealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-start gap-2 text-xs text-white/40 bg-white/3 rounded-lg p-3"
                >
                  <Brain className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span>{q.explanation}</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Discussion Tab ────────────────────────────────
function DiscussionTab({ questions }: { questions: string[] }) {
  const handleCopyAll = async () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
    await copyToClipboard(text);
    toast.success("Pertanyaan diskusi disalin!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{questions.length} Pertanyaan Diskusi</h3>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Semua
        </button>
      </div>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-4 glass-card p-4 rounded-xl group"
          >
            <span className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-mono font-bold flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-white/70 text-sm leading-relaxed flex-1">{q}</p>
            <button
              onClick={async () => {
                await copyToClipboard(q);
                toast.success("Pertanyaan disalin!");
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded-lg"
            >
              <Copy className="w-3.5 h-3.5 text-white/30" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Result Tabs ──────────────────────────────
export function ResultTabs({ result, selectedOutputs }: ResultTabsProps) {
  const availableTabs = tabConfig.filter((t) => selectedOutputs[t.key]);
  const [activeTab, setActiveTab] = useState<TabKey>(availableTabs[0]?.key || "summary");

  const handleDownload = () => {
    downloadAsJSON(result, "learning-material.json");
    toast.success("File JSON berhasil diunduh!");
  };

  return (
    <div className="space-y-4">
      {/* Metadata */}
      {result.metadata && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-white/30">
          <span>📄 {result.metadata.pageCount} halaman diproses</span>
          <span>📝 {result.metadata.wordCount.toLocaleString()} kata diekstrak</span>
          <span>🏷️ Topik: {result.metadata.topic}</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
        {availableTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all text-sm ml-1"
          title="Download semua hasil"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "summary" && result.summary && (
            <SummaryTab summary={result.summary} />
          )}
          {activeTab === "slides" && result.slides.length > 0 && (
            <SlidesTab slides={result.slides} />
          )}
          {activeTab === "quiz" && result.quiz.length > 0 && (
            <QuizTab quiz={result.quiz} />
          )}
          {activeTab === "discussion" && result.discussion.length > 0 && (
            <DiscussionTab questions={result.discussion} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
