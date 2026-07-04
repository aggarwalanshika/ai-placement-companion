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

// Client-side text parsing helper to split plain text into standard resume sections
function parseSectionsFromText(text: string): ParsedSections {
  const sections: ParsedSections = {
    experience: [],
    projects: [],
    skills: [],
    education: [],
    achievements: [],
  };

  if (!text) return sections;

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let currentSection: keyof ParsedSections | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Detect standard section headers
    if (lower.startsWith('education') || lower === 'education') {
      currentSection = 'education';
      continue;
    } else if (lower.startsWith('experience') || lower.startsWith('professional experience') || lower === 'work history') {
      currentSection = 'experience';
      continue;
    } else if (lower.startsWith('projects') || lower === 'personal projects') {
      currentSection = 'projects';
      continue;
    } else if (lower.startsWith('skills') || lower.startsWith('technical skills') || lower.startsWith('skills and interests')) {
      currentSection = 'skills';
      continue;
    } else if (lower.startsWith('achievements') || lower.startsWith('experience and achievements') || lower.startsWith('extracurriculars')) {
      currentSection = 'achievements';
      continue;
    } else if (lower.startsWith('declaration')) {
      // End parsing at declaration footer
      currentSection = null;
      continue;
    }

    if (currentSection) {
      // Remove standard bullet points markers (•, -, *, etc.)
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanLine.length > 0) {
        sections[currentSection].push(cleanLine);
      }
    }
  }

  // Fallback partitioning if sections are completely empty
  if (sections.experience.length === 0 && sections.projects.length === 0) {
    const half = Math.floor(lines.length / 2);
    sections.experience = lines.slice(0, half).map(l => l.replace(/^[•\-\*]\s*/, '').trim());
    sections.projects = lines.slice(half).map(l => l.replace(/^[•\-\*]\s*/, '').trim());
  }

  return sections;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumeText: null,
  resumeFileName: null,
  analysisResult: null,
  history: [],
  future: [],

  setResumeData: (text, fileName, analysis) => {
    let parsed = analysis.parsedSections;
    
    // Normalize and run fallback client parsing if empty
    if (!parsed || (parsed.experience.length === 0 && parsed.projects.length === 0)) {
      parsed = parseSectionsFromText(text);
    }

    const analysisWithSections = {
      ...analysis,
      parsedSections: parsed,
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
