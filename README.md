# 🎓 AI Learning Material Generator

> Ubah dokumen PDF menjadi materi ajar interaktif dalam hitungan detik — summary, slides, quiz, dan pertanyaan diskusi.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-purple)

---

## 🚀 Quick Start

```bash
# 1. Clone / masuk ke folder project
cd ai-learning-generator

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev

# 4. Buka di browser
# http://localhost:3000
```

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/
│   │   └── process/
│   │       └── route.ts          # POST /api/process — API utama
│   ├── dashboard/
│   │   └── page.tsx              # Halaman generator
│   ├── globals.css               # Global styles + animasi
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── dashboard/
│   │   ├── UploadZone.tsx        # Drag & drop PDF upload
│   │   ├── OutputSelector.tsx    # Checkbox pilih output
│   │   └── ProcessingOverlay.tsx # Loading modal + progress bar
│   └── results/
│       └── ResultTabs.tsx        # Tabs: Summary | Slides | Quiz | Diskusi
│
├── lib/
│   ├── ai-processor.ts           # Logika NLP + generator (mock & real AI ready)
│   └── utils.ts                  # Helper functions
│
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 🧠 Alur Sistem AI

```
PDF File
   ↓
extractTextFromPDF()       → Ekstrak teks mentah dari PDF
   ↓
processTextWithNLP()       → Bersihkan, tokenisasi, ekstrak keywords
   ↓
┌─────────────────────────────────────────┐
│  generateSummary()   → Scoring kalimat  │
│  generateSlides()    → Segment paragraf │
│  generateQuiz()      → Template soal    │
│  generateDiscussion()→ Template diskusi │
└─────────────────────────────────────────┘
   ↓
JSON Response → Result Tabs UI
```

---

## 🔧 Upgrade ke Real AI API

Buka `src/lib/ai-processor.ts` dan ikuti instruksi di bagian bawah file.

### Contoh dengan Claude API (Anthropic):

```typescript
// Di src/app/api/process/route.ts
// Tambahkan env variable: ANTHROPIC_API_KEY

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": process.env.ANTHROPIC_API_KEY!,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Generate summary, slides, quiz, and discussion questions from:
      ${extractedText.substring(0, 8000)}
      
      Return JSON: { summary, slides, quiz, discussion }`
    }]
  })
});
```

### Contoh dengan OpenAI:

```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" },
});
```

---

## ✨ Fitur

| Fitur | Status |
|-------|--------|
| 📄 PDF Upload (drag & drop) | ✅ |
| 🤖 AI Processing (mock NLP) | ✅ |
| 📝 Generate Summary | ✅ |
| 📊 Generate Slides | ✅ |
| 🧠 Generate Quiz (interaktif) | ✅ |
| 💬 Discussion Questions | ✅ |
| 📋 Copy to clipboard | ✅ |
| 💾 Download JSON | ✅ |
| 🎞️ Animasi Framer Motion | ✅ |
| 📱 Responsive design | ✅ |
| 🔔 Toast notifications | ✅ |
| 🔌 Real AI API ready | ✅ |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS variables
- **Animations**: Framer Motion
- **File Upload**: react-dropzone
- **UI Notifications**: sonner
- **Icons**: Lucide React
- **PDF Parsing**: pdfjs-dist / pdf-parse

---

## 📝 Environment Variables (opsional untuk real AI)

Buat file `.env.local`:

```env
ANTHROPIC_API_KEY=your_key_here
# atau
OPENAI_API_KEY=your_key_here
```

---

Made with ❤️ untuk para pendidik Indonesia 🇮🇩
