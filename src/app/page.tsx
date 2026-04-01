"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, FileText, Presentation, Brain,
  MessageCircle, ArrowRight, Zap, Shield, Globe,
  BookOpen, GraduationCap, ChevronRight
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Generate Summary",
    description: "Ringkasan cerdas dari konten PDF menggunakan ekstraksi kalimat kunci berbasis NLP",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Presentation,
    title: "Generate Slides",
    description: "Konversi otomatis isi PDF menjadi struktur slide presentasi yang siap digunakan",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Brain,
    title: "Generate Quiz",
    description: "Buat soal pilihan ganda otomatis lengkap dengan kunci jawaban dan penjelasan",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: MessageCircle,
    title: "Discussion Questions",
    description: "Hasilkan pertanyaan diskusi terbuka yang merangsang pemikiran kritis siswa",
    color: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
  },
];

const stats = [
  { value: "10x", label: "Lebih cepat dari manual" },
  { value: "4", label: "Jenis output sekaligus" },
  { value: "100%", label: "Siap untuk kelas" },
];

const howItWorks = [
  {
    step: "01",
    title: "Upload PDF",
    desc: "Drag & drop dokumen PDF Anda — silabus, modul, atau buku teks",
  },
  {
    step: "02",
    title: "Pilih Output",
    desc: "Centang jenis materi yang ingin dihasilkan: summary, slides, quiz, atau diskusi",
  },
  {
    step: "03",
    title: "AI Proses",
    desc: "Sistem AI mengekstrak teks, menganalisis konten, dan menghasilkan materi",
  },
  {
    step: "04",
    title: "Gunakan Hasilnya",
    desc: "Copy, download, atau langsung gunakan materi di kelas Anda",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[rgb(8,8,20)] bg-grid overflow-hidden relative">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">LearnAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Fitur</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Cara Kerja</a>
          <a href="#about" className="hover:text-white transition-colors">Tentang</a>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
        >
          Mulai Sekarang
          <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-16 pt-16 md:pt-24 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              Powered by AI & NLP Processing
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
          >
            AI Learning{" "}
            <span className="gradient-text">Material</span>
            <br />Generator
          </motion.h1>

          <motion.p
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Ubah dokumen PDF menjadi materi ajar interaktif dalam hitungan detik.
            Summary, slides, quiz, dan pertanyaan diskusi — semua otomatis.
          </motion.p>

          <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Get Started — Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-white/60 hover:text-white font-medium px-6 py-4 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Lihat Cara Kerja
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-10 mt-16"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl font-black gradient-text">{stat.value}</div>
                <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 1, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="glass-card glow-purple p-1">
            <div className="bg-[rgb(12,12,28)] rounded-lg overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-white/30 text-xs">
                  learnai.app/dashboard
                </div>
              </div>
              {/* Mock UI */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Summary", "Slides", "Quiz", "Diskusi"].map((item, i) => (
                  <div
                    key={item}
                    className="glass-card-bright p-3 rounded-lg"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-6 h-1.5 bg-violet-500/40 rounded-full mb-2" />
                    <div className="text-white/70 text-xs font-medium mb-1">{item}</div>
                    <div className="space-y-1">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className="h-1.5 bg-white/10 rounded-full shimmer"
                          style={{ width: `${70 + j * 10}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="text-violet-400 text-sm font-medium mb-3">Fitur Lengkap</div>
            <h2 className="font-display text-4xl font-black text-white mb-4">
              Semua yang Guru Butuhkan
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Dari ringkasan hingga soal ujian — semua dihasilkan otomatis dari satu PDF
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card border ${f.border} p-6 group hover:scale-[1.01] transition-transform duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="text-violet-400 text-sm font-medium mb-3">Alur Kerja</div>
            <h2 className="font-display text-4xl font-black text-white mb-4">Cara Kerjanya</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Proses sederhana dalam 4 langkah untuk menghasilkan materi ajar berkualitas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-5">
                  <div className="font-mono text-violet-400/60 text-xs mb-3">{step.step}</div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 z-10 text-violet-500/40">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <motion.div
          initial={{ opacity: 1, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card-bright p-12 rounded-2xl glow-purple-sm"
        >
          <GraduationCap className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="font-display text-4xl font-black text-white mb-4">
            Siap Membuat Materi Ajar?
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            Mulai gratis sekarang. Upload PDF dan hasilkan materi pembelajaran interaktif dalam hitungan detik.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            Mulai Generate Sekarang
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-16 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-white/60 text-sm font-medium">LearnAI Generator</span>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <Shield className="w-3 h-3" />
            File tidak disimpan di server — diproses lokal
            <Globe className="w-3 h-3 ml-2" />
            Made for Indonesian Educators
          </div>
        </div>
      </footer>
    </main>
  );
}
