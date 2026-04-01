export interface SlideData {
  title: string;
  bullets: string[];
  slideNumber: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedResult {
  summary: string;
  slides: SlideData[];
  quiz: QuizQuestion[];
  discussion: string[];
  metadata?: {
    wordCount: number;
    pageCount: number;
    topic: string;
    processedAt: string;
  };
}

export type OutputType = "summary" | "slides" | "quiz" | "discussion";

export interface SelectedOutputs {
  summary: boolean;
  slides: boolean;
  quiz: boolean;
  discussion: boolean;
}
