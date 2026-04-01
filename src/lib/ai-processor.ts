import type { GeneratedResult, SlideData, QuizQuestion } from "@/types";

// ─────────────────────────────────────────────
// TEXT EXTRACTION
// ─────────────────────────────────────────────
export async function extractTextFromPDF(file: File): Promise<string> {
  // For client-side, we pass the file to the API route
  // This function is used server-side via /api/process
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    // Dynamic import to avoid SSR issues
    let pdfParse: any;
    if (typeof window === "undefined") {
      const pdfParseModule = (await import("pdf-parse")) as any;
      pdfParse = pdfParseModule.default || pdfParseModule;
    }
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    // Fallback: return placeholder text for demo
    console.warn("PDF parse failed, using mock text");
    return getMockPDFText();
  }
}

// ─────────────────────────────────────────────
// NLP PRE-PROCESSING
// ─────────────────────────────────────────────
export function processTextWithNLP(text: string): {
  cleanText: string;
  sentences: string[];
  keywords: string[];
  paragraphs: string[];
} {
  // Clean text
  const cleanText = text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.,!?;:()\-]/g, "")
    .trim();

  // Split into sentences
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20);

  // Extract keywords (simple frequency-based)
  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for",
    "of","with","by","from","is","are","was","were","be","been",
    "have","has","had","do","does","did","will","would","could",
    "should","may","might","that","this","these","those","it","its",
    "they","them","their","we","our","you","your","i","my","me",
  ]);

  const wordFreq: Record<string, number> = {};
  cleanText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stopWords.has(w))
    .forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

  const keywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);

  // Split into paragraphs
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 50);

  return { cleanText, sentences, keywords, paragraphs };
}

// ─────────────────────────────────────────────
// SUMMARY GENERATOR
// ─────────────────────────────────────────────
export function generateSummary(text: string): string {
  const { sentences, keywords, paragraphs } = processTextWithNLP(text);

  if (sentences.length === 0) return getMockSummary();

  // Score sentences by keyword density
  const scoredSentences = sentences.map((sentence) => {
    const score = keywords.reduce((acc, kw) => {
      return acc + (sentence.toLowerCase().includes(kw) ? 1 : 0);
    }, 0);
    return { sentence, score };
  });

  // Pick top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(8, Math.ceil(sentences.length * 0.3)))
    .map((s) => s.sentence);

  const summary = topSentences.join(" ");

  return summary.length > 100
    ? summary
    : paragraphs.slice(0, 3).join("\n\n") || getMockSummary();
}

// ─────────────────────────────────────────────
// SLIDES GENERATOR
// ─────────────────────────────────────────────
export function generateSlides(text: string): SlideData[] {
  const { paragraphs, keywords } = processTextWithNLP(text);

  if (paragraphs.length < 2) return getMockSlides();

  const slides: SlideData[] = [];

  // Title slide
  slides.push({
    slideNumber: 1,
    title: "Overview & Introduction",
    bullets: [
      "Key concepts from the document",
      `Main topics: ${keywords.slice(0, 3).join(", ")}`,
      "Learning objectives and outcomes",
    ],
  });

  // Content slides from paragraphs
  const contentParagraphs = paragraphs.slice(0, 5);
  contentParagraphs.forEach((para, idx) => {
    const sentences = para.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
    const bullets = sentences
      .slice(0, 4)
      .map((s) => (s.length > 120 ? s.substring(0, 120) + "..." : s));

    if (bullets.length > 0) {
      slides.push({
        slideNumber: idx + 2,
        title: `Key Points ${idx + 1}: ${keywords[idx] || "Main Content"}`,
        bullets,
      });
    }
  });

  // Summary slide
  slides.push({
    slideNumber: slides.length + 1,
    title: "Summary & Takeaways",
    bullets: [
      "Review of main concepts covered",
      `Important terms: ${keywords.slice(0, 4).join(", ")}`,
      "Application in real-world context",
      "Further reading recommendations",
    ],
  });

  return slides.length > 2 ? slides : getMockSlides();
}

// ─────────────────────────────────────────────
// QUIZ GENERATOR
// ─────────────────────────────────────────────
export function generateQuiz(text: string): QuizQuestion[] {
  const { sentences, keywords } = processTextWithNLP(text);

  if (sentences.length < 5) return getMockQuiz();

  const questions: QuizQuestion[] = [];

  // Generate questions from key sentences
  const questionableSentences = sentences
    .filter((s) => {
      const hasKeyword = keywords.some((kw) => s.toLowerCase().includes(kw));
      const isStatement =
        s.includes(" is ") ||
        s.includes(" are ") ||
        s.includes(" was ") ||
        s.includes(" means ");
      return hasKeyword && isStatement;
    })
    .slice(0, 5);

  questionableSentences.forEach((sentence, idx) => {
    const words = sentence.split(" ");
    const keywordInSentence = keywords.find((kw) =>
      sentence.toLowerCase().includes(kw)
    );

    if (keywordInSentence) {
      questions.push({
        id: idx + 1,
        question: `Berdasarkan teks, manakah pernyataan yang benar mengenai "${keywordInSentence}"?`,
        options: [
          sentence.length > 100 ? sentence.substring(0, 100) + "..." : sentence,
          `${keywordInSentence} tidak memiliki peran penting dalam konteks ini`,
          `${keywords[idx + 1] || "Konsep ini"} lebih relevan dari ${keywordInSentence}`,
          `Pernyataan tentang ${keywordInSentence} tidak disebutkan dalam teks`,
        ],
        correctAnswer: 0,
        explanation: `Jawaban ini langsung dikutip dari teks sumber mengenai ${keywordInSentence}.`,
      });
    }
  });

  return questions.length >= 3 ? questions : getMockQuiz();
}

// ─────────────────────────────────────────────
// DISCUSSION GENERATOR
// ─────────────────────────────────────────────
export function generateDiscussion(text: string): string[] {
  const { keywords } = processTextWithNLP(text);

  if (keywords.length < 3) return getMockDiscussion();

  const templates = [
    `Bagaimana konsep "${keywords[0]}" dapat diterapkan dalam kehidupan nyata? Berikan contoh konkret!`,
    `Apa hubungan antara "${keywords[1] || keywords[0]}" dan "${keywords[2] || keywords[0]}" dalam konteks yang dibahas?`,
    `Menurut Anda, mengapa "${keywords[0]}" menjadi aspek penting yang perlu dipahami? Jelaskan alasannya!`,
    `Jika Anda adalah seorang praktisi di bidang ini, bagaimana Anda akan menggunakan pemahaman tentang "${keywords[3] || keywords[0]}"?`,
    `Apa tantangan terbesar dalam memahami dan menerapkan konsep yang dibahas dalam teks ini?`,
    `Bagaimana perkembangan "${keywords[1] || "topik ini"}" dapat mempengaruhi bidang pendidikan di masa depan?`,
  ];

  return templates;
}

// ─────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────
export async function processDocument(
  text: string,
  options: {
    summary: boolean;
    slides: boolean;
    quiz: boolean;
    discussion: boolean;
  }
): Promise<GeneratedResult> {
  const { keywords, sentences } = processTextWithNLP(text);

  return {
    summary: options.summary ? generateSummary(text) : "",
    slides: options.slides ? generateSlides(text) : [],
    quiz: options.quiz ? generateQuiz(text) : [],
    discussion: options.discussion ? generateDiscussion(text) : [],
    metadata: {
      wordCount: text.split(/\s+/).length,
      pageCount: Math.ceil(text.length / 3000),
      topic: keywords.slice(0, 3).join(", "),
      processedAt: new Date().toISOString(),
    },
  };
}

// ─────────────────────────────────────────────
// MOCK DATA (Realistic Indonesian Education Content)
// ─────────────────────────────────────────────
function getMockPDFText(): string {
  return `Kurikulum Merdeka merupakan kebijakan pendidikan terbaru yang diluncurkan oleh Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia. Kurikulum ini dirancang untuk memberikan fleksibilitas kepada satuan pendidikan dalam mengembangkan pembelajaran yang sesuai dengan kebutuhan dan karakteristik peserta didik.

Dalam implementasinya, Kurikulum Merdeka mengedepankan pembelajaran berbasis proyek (Project-Based Learning) yang memungkinkan peserta didik untuk mengembangkan kompetensi lintas mata pelajaran secara terintegrasi. Pendekatan ini mendorong siswa untuk berpikir kritis, kreatif, dan kolaboratif dalam memecahkan masalah nyata.

Profil Pelajar Pancasila menjadi landasan utama dalam pengembangan Kurikulum Merdeka. Profil ini mencakup enam dimensi: beriman dan bertakwa kepada Tuhan Yang Maha Esa, berkebhinekaan global, bergotong royong, mandiri, bernalar kritis, dan kreatif. Keenam dimensi ini menjadi acuan dalam merancang pengalaman belajar yang bermakna.

Capaian Pembelajaran (CP) dalam Kurikulum Merdeka disusun per fase, bukan per tahun ajaran. Fase A untuk kelas 1-2 SD, Fase B untuk kelas 3-4 SD, Fase C untuk kelas 5-6 SD, Fase D untuk kelas 7-9 SMP, dan Fase E-F untuk kelas 10-12 SMA. Struktur ini memberikan guru lebih banyak kebebasan dalam menentukan kapan dan bagaimana mencapai kompetensi yang ditargetkan.

Asesmen dalam Kurikulum Merdeka bersifat formatif dan diagnostik, bukan hanya sumatif. Guru didorong untuk menggunakan berbagai instrumen asesmen yang autentik untuk mengukur perkembangan kompetensi peserta didik secara holistik dan komprehensif.`;
}

function getMockSummary(): string {
  return `Kurikulum Merdeka adalah kebijakan pendidikan inovatif dari Kemendikbudristek yang memberikan fleksibilitas kepada sekolah dalam mengembangkan pembelajaran. Kurikulum ini mengutamakan pembelajaran berbasis proyek (Project-Based Learning) untuk mendorong kompetensi abad 21 seperti berpikir kritis, kreatif, dan kolaboratif pada peserta didik.

Landasan utama kurikulum ini adalah Profil Pelajar Pancasila yang terdiri dari enam dimensi: beriman dan bertakwa, berkebhinekaan global, bergotong royong, mandiri, bernalar kritis, dan kreatif. Keenam dimensi ini menjadi acuan dalam merancang pengalaman belajar yang bermakna dan kontekstual.

Secara struktural, Capaian Pembelajaran (CP) disusun per fase (bukan per tahun), mulai Fase A (SD kelas 1-2) hingga Fase F (SMA kelas 12). Pendekatan ini memberi guru kebebasan lebih besar dalam menentukan strategi pencapaian kompetensi. Asesmen pun bergeser dari sumatif semata menuju asesmen formatif, diagnostik, dan autentik yang mengukur perkembangan peserta didik secara holistik.`;
}

function getMockSlides(): SlideData[] {
  return [
    {
      slideNumber: 1,
      title: "Pengantar: Kurikulum Merdeka",
      bullets: [
        "Kebijakan pendidikan terbaru Kemendikbudristek RI",
        "Memberikan fleksibilitas kepada satuan pendidikan",
        "Berfokus pada pengembangan kompetensi holistik siswa",
        "Implementasi bertahap sejak tahun ajaran 2022/2023",
      ],
    },
    {
      slideNumber: 2,
      title: "Pembelajaran Berbasis Proyek (PjBL)",
      bullets: [
        "Mengintegrasikan berbagai mata pelajaran secara kontekstual",
        "Mendorong berpikir kritis dan kreatif pada peserta didik",
        "Siswa memecahkan masalah nyata di lingkungan sekitar",
        "Kolaborasi antar siswa menjadi kunci keberhasilan",
      ],
    },
    {
      slideNumber: 3,
      title: "Profil Pelajar Pancasila",
      bullets: [
        "Beriman dan bertakwa kepada Tuhan Yang Maha Esa",
        "Berkebhinekaan global & bergotong royong",
        "Mandiri dan bernalar kritis dalam setiap situasi",
        "Kreatif dalam menghasilkan karya dan solusi",
      ],
    },
    {
      slideNumber: 4,
      title: "Struktur Capaian Pembelajaran (CP)",
      bullets: [
        "Fase A: Kelas 1-2 SD — Fondasi literasi dasar",
        "Fase B-C: Kelas 3-6 SD — Pengembangan kompetensi dasar",
        "Fase D: Kelas 7-9 SMP — Pendalaman konsep",
        "Fase E-F: Kelas 10-12 SMA — Spesialisasi dan peminatan",
      ],
    },
    {
      slideNumber: 5,
      title: "Asesmen Autentik & Formatif",
      bullets: [
        "Asesmen diagnostik di awal untuk memetakan kemampuan awal",
        "Asesmen formatif berkelanjutan selama proses belajar",
        "Asesmen sumatif di akhir fase pembelajaran",
        "Instrumen beragam: portofolio, observasi, unjuk kerja",
      ],
    },
    {
      slideNumber: 6,
      title: "Peran Guru dalam Kurikulum Merdeka",
      bullets: [
        "Fasilitator pembelajaran yang berpusat pada siswa",
        "Mengembangkan modul ajar sesuai konteks lokal",
        "Melakukan refleksi dan perbaikan berkelanjutan",
        "Berkolaborasi dalam komunitas belajar profesional (KKG/MGMP)",
      ],
    },
  ];
}

function getMockQuiz(): QuizQuestion[] {
  return [
    {
      id: 1,
      question: "Apa tujuan utama dari penerapan Kurikulum Merdeka?",
      options: [
        "Meningkatkan nilai ujian nasional siswa secara keseluruhan",
        "Memberikan fleksibilitas kepada sekolah untuk mengembangkan pembelajaran sesuai kebutuhan siswa",
        "Menyeragamkan metode pembelajaran di seluruh Indonesia",
        "Mengurangi beban administrasi guru di sekolah",
      ],
      correctAnswer: 1,
      explanation:
        "Kurikulum Merdeka dirancang untuk memberikan fleksibilitas kepada satuan pendidikan dalam mengembangkan pembelajaran yang sesuai dengan kebutuhan dan karakteristik peserta didik.",
    },
    {
      id: 2,
      question: "Berapa jumlah dimensi dalam Profil Pelajar Pancasila?",
      options: ["4 dimensi", "5 dimensi", "6 dimensi", "7 dimensi"],
      correctAnswer: 2,
      explanation:
        "Profil Pelajar Pancasila terdiri dari 6 dimensi: beriman dan bertakwa, berkebhinekaan global, bergotong royong, mandiri, bernalar kritis, dan kreatif.",
    },
    {
      id: 3,
      question: "Pada fase berapa Capaian Pembelajaran untuk kelas 7-9 SMP?",
      options: ["Fase C", "Fase D", "Fase E", "Fase B"],
      correctAnswer: 1,
      explanation:
        "Fase D mencakup kelas 7-9 SMP, sesuai dengan struktur Capaian Pembelajaran per fase dalam Kurikulum Merdeka.",
    },
    {
      id: 4,
      question:
        "Pendekatan pembelajaran apa yang diutamakan dalam Kurikulum Merdeka?",
      options: [
        "Teacher-Centered Learning (TCL)",
        "Drill and Practice",
        "Project-Based Learning (PjBL)",
        "Memorization-Based Learning",
      ],
      correctAnswer: 2,
      explanation:
        "Kurikulum Merdeka mengedepankan Project-Based Learning (PjBL) yang memungkinkan peserta didik mengembangkan kompetensi lintas mata pelajaran secara terintegrasi.",
    },
    {
      id: 5,
      question:
        "Jenis asesmen manakah yang BUKAN merupakan fokus dalam Kurikulum Merdeka?",
      options: [
        "Asesmen formatif",
        "Asesmen diagnostik",
        "Asesmen autentik",
        "Asesmen komparatif antar sekolah",
      ],
      correctAnswer: 3,
      explanation:
        "Kurikulum Merdeka berfokus pada asesmen formatif, diagnostik, dan autentik. Asesmen komparatif antar sekolah tidak menjadi prioritas karena setiap sekolah memiliki konteks berbeda.",
    },
  ];
}

function getMockDiscussion(): string[] {
  return [
    "Bagaimana Kurikulum Merdeka dapat mengubah cara Anda mengajar di kelas? Apa peluang dan tantangan yang akan Anda hadapi?",
    "Menurut Anda, apakah semua sekolah di Indonesia siap mengimplementasikan Kurikulum Merdeka? Apa faktor-faktor yang mempengaruhinya?",
    "Bagaimana cara Anda mengintegrasikan Profil Pelajar Pancasila ke dalam mata pelajaran yang Anda ajarkan? Berikan contoh konkret!",
    "Apa perbedaan mendasar antara asesmen formatif dan sumatif? Mengapa keseimbangan keduanya penting dalam proses pembelajaran?",
    "Jika Anda diberi kebebasan merancang satu proyek PjBL untuk siswa Anda, apa yang akan Anda pilih? Jelaskan alasannya!",
    "Bagaimana peran orang tua dan komunitas dapat diintegrasikan dalam Kurikulum Merdeka untuk mendukung pembelajaran peserta didik?",
  ];
}

// ─────────────────────────────────────────────
// AI API UPGRADE GUIDE
// ─────────────────────────────────────────────
/**
 * TO UPGRADE TO REAL AI API:
 *
 * Replace processDocument() with:
 *
 * export async function processDocumentWithAI(text: string, options) {
 *   const response = await fetch("https://api.anthropic.com/v1/messages", {
 *     method: "POST",
 *     headers: {
 *       "x-api-key": process.env.ANTHROPIC_API_KEY!,
 *       "anthropic-version": "2023-06-01",
 *       "content-type": "application/json",
 *     },
 *     body: JSON.stringify({
 *       model: "claude-opus-4-5",
 *       max_tokens: 4096,
 *       messages: [{
 *         role: "user",
 *         content: `You are an educational content expert. Given the following PDF text, generate:
 *           ${options.summary ? "1. A comprehensive summary\n" : ""}
 *           ${options.slides ? "2. Presentation slides with title and bullet points\n" : ""}
 *           ${options.quiz ? "3. Multiple choice quiz questions with answers\n" : ""}
 *           ${options.discussion ? "4. Open-ended discussion questions\n" : ""}
 *
 *           Return as JSON with keys: summary, slides, quiz, discussion
 *
 *           PDF TEXT:
 *           ${text.substring(0, 8000)}
 *         `
 *       }]
 *     })
 *   });
 *   const data = await response.json();
 *   return JSON.parse(data.content[0].text);
 * }
 */
