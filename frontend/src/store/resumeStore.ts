import { create } from 'zustand';

interface ResumeState {
  resumeText: string | null;
  resumeFileName: string | null;
  analysisResult: any | null;
  setResumeData: (text: string, fileName: string, analysis: any) => void;
  clearResume: () => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumeText: null,
  resumeFileName: null,
  analysisResult: null,
  setResumeData: (text, fileName, analysis) =>
    set({
      resumeText: text,
      resumeFileName: fileName,
      analysisResult: analysis,
    }),
  clearResume: () =>
    set({
      resumeText: null,
      resumeFileName: null,
      analysisResult: null,
    }),
}));
