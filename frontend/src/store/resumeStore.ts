import { create } from 'zustand';

export interface ParsedSections {
  experience: string[];
  projects: string[];
  skills: string[];
  education: string[];
  achievements: string[];
}

interface ResumeState {
  resumeText: string | null;
  resumeFileName: string | null;
  analysisResult: any | null;
  history: Array<{ parsedSections: ParsedSections; overallScore: number }>;
  future: Array<{ parsedSections: ParsedSections; overallScore: number }>;
  
  setResumeData: (text: string, fileName: string, analysis: any) => void;
  clearResume: () => void;
  
  updateParsedSection: (section: keyof ParsedSections, index: number, newValue: string, scoreBoost?: number) => void;
  undo: () => void;
  redo: () => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumeText: null,
  resumeFileName: null,
  analysisResult: null,
  history: [],
  future: [],

  setResumeData: (text, fileName, analysis) => {
    // If parsedSections is missing, normalize it to avoid runtime exceptions
    const analysisWithSections = {
      ...analysis,
      parsedSections: analysis.parsedSections || {
        experience: [],
        projects: [],
        skills: [],
        education: [],
        achievements: [],
      },
    };
    set({
      resumeText: text,
      resumeFileName: fileName,
      analysisResult: analysisWithSections,
      history: [],
      future: [],
    });
  },

  clearResume: () =>
    set({
      resumeText: null,
      resumeFileName: null,
      analysisResult: null,
      history: [],
      future: [],
    }),

  updateParsedSection: (section, index, newValue, scoreBoost = 0) => {
    const { analysisResult, history } = get();
    if (!analysisResult || !analysisResult.parsedSections) return;

    // 1. Capture current state for undo
    const currentSections = { ...analysisResult.parsedSections };
    const currentScore = analysisResult.overallScore;
    
    const newHistoryEntry = {
      parsedSections: JSON.parse(JSON.stringify(currentSections)),
      overallScore: currentScore,
    };

    // 2. Clone and update section array
    const updatedSectionArray = [...(currentSections[section] || [])];
    updatedSectionArray[index] = newValue;

    const newSections = {
      ...currentSections,
      [section]: updatedSectionArray,
    };

    // Recalculate score (capping at 100)
    const newScore = Math.min(currentScore + scoreBoost, 100);

    set({
      analysisResult: {
        ...analysisResult,
        overallScore: newScore,
        parsedSections: newSections,
      },
      history: [...history, newHistoryEntry],
      future: [], // clear redo stack on new action
    });
  },

  undo: () => {
    const { history, future, analysisResult } = get();
    if (history.length === 0 || !analysisResult) return;

    // Pop the last entry from history
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Save current state to future for redo
    const currentState = {
      parsedSections: JSON.parse(JSON.stringify(analysisResult.parsedSections)),
      overallScore: analysisResult.overallScore,
    };

    set({
      analysisResult: {
        ...analysisResult,
        overallScore: previousState.overallScore,
        parsedSections: previousState.parsedSections,
      },
      history: newHistory,
      future: [...future, currentState],
    });
  },

  redo: () => {
    const { history, future, analysisResult } = get();
    if (future.length === 0 || !analysisResult) return;

    // Pop the last entry from future
    const nextState = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    // Save current state to history for undo
    const currentState = {
      parsedSections: JSON.parse(JSON.stringify(analysisResult.parsedSections)),
      overallScore: analysisResult.overallScore,
    };

    set({
      analysisResult: {
        ...analysisResult,
        overallScore: nextState.overallScore,
        parsedSections: nextState.parsedSections,
      },
      history: [...history, currentState],
      future: newFuture,
    });
  },
}));
