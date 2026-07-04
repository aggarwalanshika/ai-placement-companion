import { create } from 'zustand';

export interface ParsedSections {
  experience: string[];
  projects: string[];
  skills: string[];
  education: string[];
  achievements: string[];
}

export interface ResumeVersion {
  id: string;
  timestamp: string;
  atsScore: number;
  acceptedCount: number;
  ignoredCount: number;
  userNotes?: string;
  parsedSections: ParsedSections;
}

interface ResumeState {
  resumeText: string | null;
  resumeFileName: string | null;
  analysisResult: any | null;
  originalSections: ParsedSections | null;
  versions: ResumeVersion[];
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateLinks: string;
  history: Array<{ parsedSections: ParsedSections; overallScore: number }>;
  future: Array<{ parsedSections: ParsedSections; overallScore: number }>;
  
  setResumeData: (text: string, fileName: string, analysis: any) => void;
  clearResume: () => void;
  
  updateParsedSection: (section: keyof ParsedSections, index: number, newValue: string, scoreBoost?: number) => void;
  undo: () => void;
  redo: () => void;
  
  saveVersion: (notes?: string) => void;
  deleteVersion: (id: string) => void;
  setContactInfo: (name: string, email: string, phone: string, links: string) => void;
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

// Check localStorage for persisted resume data to prevent resets on refresh
const loadSavedState = () => {
  if (typeof window === 'undefined') {
    return {
      resumeText: null,
      resumeFileName: null,
      analysisResult: null,
      originalSections: null,
      versions: [],
      candidateName: 'Anshika Aggarwal',
      candidateEmail: 'aggarwalanshika4@gmail.com',
      candidatePhone: '+91-8707881770',
      candidateLinks: 'LinkedIn | LeetCode | GitHub',
    };
  }
  try {
    const saved = localStorage.getItem('resume-copilot-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        resumeText: parsed.resumeText || null,
        resumeFileName: parsed.resumeFileName || null,
        analysisResult: parsed.analysisResult || null,
        originalSections: parsed.originalSections || null,
        versions: parsed.versions || [],
        candidateName: parsed.candidateName || 'Anshika Aggarwal',
        candidateEmail: parsed.candidateEmail || 'aggarwalanshika4@gmail.com',
        candidatePhone: parsed.candidatePhone || '+91-8707881770',
        candidateLinks: parsed.candidateLinks || 'LinkedIn | LeetCode | GitHub',
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return {
    resumeText: null,
    resumeFileName: null,
    analysisResult: null,
    originalSections: null,
    versions: [],
    candidateName: 'Anshika Aggarwal',
    candidateEmail: 'aggarwalanshika4@gmail.com',
    candidatePhone: '+91-8707881770',
    candidateLinks: 'LinkedIn | LeetCode | GitHub',
  };
};

const savedState = loadSavedState();

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumeText: savedState.resumeText,
  resumeFileName: savedState.resumeFileName,
  analysisResult: savedState.analysisResult,
  originalSections: savedState.originalSections,
  versions: savedState.versions,
  candidateName: savedState.candidateName,
  candidateEmail: savedState.candidateEmail,
  candidatePhone: savedState.candidatePhone,
  candidateLinks: savedState.candidateLinks,
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

    // Extract contact info dynamically from text if present
    let name = 'Anshika Aggarwal';
    let email = 'aggarwalanshika4@gmail.com';
    let phone = '+91-8707881770';
    let links = 'LinkedIn | LeetCode | GitHub';

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];

    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\d{10}/);
    if (phoneMatch) phone = phoneMatch[0];

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0 && lines[0].length < 50 && !lines[0].includes('@')) {
      name = lines[0];
    }
    
    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText: text,
          resumeFileName: fileName,
          analysisResult: analysisWithSections,
          originalSections: parsed,
          versions: [],
          candidateName: name,
          candidateEmail: email,
          candidatePhone: phone,
          candidateLinks: links,
        })
      );
    } catch (e) {
      console.error('Failed to persist resume data:', e);
    }

    set({
      resumeText: text,
      resumeFileName: fileName,
      analysisResult: analysisWithSections,
      originalSections: parsed,
      versions: [],
      candidateName: name,
      candidateEmail: email,
      candidatePhone: phone,
      candidateLinks: links,
      history: [],
      future: [],
    });
  },

  clearResume: () => {
    try {
      localStorage.removeItem('resume-copilot-data');
    } catch (e) {
      console.error('Failed to remove persisted data:', e);
    }
    set({
      resumeText: null,
      resumeFileName: null,
      analysisResult: null,
      originalSections: null,
      versions: [],
      candidateName: 'Anshika Aggarwal',
      candidateEmail: 'aggarwalanshika4@gmail.com',
      candidatePhone: '+91-8707881770',
      candidateLinks: 'LinkedIn | LeetCode | GitHub',
      history: [],
      future: [],
    });
  },

  updateParsedSection: (section, index, newValue, scoreBoost = 0) => {
    const { analysisResult, history, resumeText, resumeFileName, originalSections, versions, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
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

    const updatedAnalysis = {
      ...analysisResult,
      overallScore: newScore,
      parsedSections: newSections,
    };

    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText,
          resumeFileName,
          analysisResult: updatedAnalysis,
          originalSections,
          versions,
          candidateName,
          candidateEmail,
          candidatePhone,
          candidateLinks,
        })
      );
    } catch (e) {
      console.error('Failed to persist updated section data:', e);
    }

    set({
      analysisResult: updatedAnalysis,
      history: [...history, newHistoryEntry],
      future: [], // clear redo stack on new action
    });
  },

  undo: () => {
    const { history, future, analysisResult, resumeText, resumeFileName, originalSections, versions, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    if (history.length === 0 || !analysisResult) return;

    // Pop the last entry from history
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Save current state to future for redo
    const currentState = {
      parsedSections: JSON.parse(JSON.stringify(analysisResult.parsedSections)),
      overallScore: analysisResult.overallScore,
    };

    const updatedAnalysis = {
      ...analysisResult,
      overallScore: previousState.overallScore,
      parsedSections: previousState.parsedSections,
    };

    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText,
          resumeFileName,
          analysisResult: updatedAnalysis,
          originalSections,
          versions,
          candidateName,
          candidateEmail,
          candidatePhone,
          candidateLinks,
        })
      );
    } catch (e) {
      console.error('Failed to persist undo data:', e);
    }

    set({
      analysisResult: updatedAnalysis,
      history: newHistory,
      future: [...future, currentState],
    });
  },

  redo: () => {
    const { history, future, analysisResult, resumeText, resumeFileName, originalSections, versions, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    if (future.length === 0 || !analysisResult) return;

    // Pop the last entry from future
    const nextState = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    // Save current state to history for undo
    const currentState = {
      parsedSections: JSON.parse(JSON.stringify(analysisResult.parsedSections)),
      overallScore: analysisResult.overallScore,
    };

    const updatedAnalysis = {
      ...analysisResult,
      overallScore: nextState.overallScore,
      parsedSections: nextState.parsedSections,
    };

    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText,
          resumeFileName,
          analysisResult: updatedAnalysis,
          originalSections,
          versions,
          candidateName,
          candidateEmail,
          candidatePhone,
          candidateLinks,
        })
      );
    } catch (e) {
      console.error('Failed to persist redo data:', e);
    }

    set({
      analysisResult: updatedAnalysis,
      history: [...history, currentState],
      future: newFuture,
    });
  },

  saveVersion: (notes) => {
    const { analysisResult, originalSections, versions, resumeText, resumeFileName, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    if (!analysisResult || !analysisResult.parsedSections) return;

    // Calculate changes count
    let acceptedCount = 0;
    const orig = originalSections || { experience: [], projects: [], skills: [], education: [], achievements: [] };
    const curr = analysisResult.parsedSections;

    const countChanges = (sec: keyof ParsedSections) => {
      const oList = orig[sec] || [];
      const cList = curr[sec] || [];
      cList.forEach((val: string, idx: number) => {
        if (oList[idx] !== undefined && oList[idx] !== val) {
          acceptedCount++;
        }
      });
    };
    countChanges('experience');
    countChanges('projects');
    countChanges('skills');

    const totalSuggestions = 5;
    const ignoredCount = Math.max(0, totalSuggestions - acceptedCount);

    const newVersion: ResumeVersion = {
      id: `version-${versions.length + 1}`,
      timestamp: new Date().toLocaleString(),
      atsScore: analysisResult.overallScore,
      acceptedCount,
      ignoredCount,
      userNotes: notes || `Revision ${versions.length + 1}`,
      parsedSections: JSON.parse(JSON.stringify(curr)),
    };

    const newVersionsList = [...versions, newVersion];

    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText,
          resumeFileName,
          analysisResult,
          originalSections,
          versions: newVersionsList,
          candidateName,
          candidateEmail,
          candidatePhone,
          candidateLinks,
        })
      );
    } catch (e) {
      console.error('Failed to persist saveVersion data:', e);
    }

    set({
      versions: newVersionsList,
    });
  },

  deleteVersion: (id) => {
    const { analysisResult, originalSections, versions, resumeText, resumeFileName, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    const newVersionsList = versions.filter((v) => v.id !== id);

    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText,
          resumeFileName,
          analysisResult,
          originalSections,
          versions: newVersionsList,
          candidateName,
          candidateEmail,
          candidatePhone,
          candidateLinks,
        })
      );
    } catch (e) {
      console.error('Failed to persist deleteVersion data:', e);
    }

    set({
      versions: newVersionsList,
    });
  },

  setContactInfo: (name, email, phone, links) => {
    const { analysisResult, originalSections, versions, resumeText, resumeFileName } = get();
    
    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText,
          resumeFileName,
          analysisResult,
          originalSections,
          versions,
          candidateName: name,
          candidateEmail: email,
          candidatePhone: phone,
          candidateLinks: links,
        })
      );
    } catch (e) {
      console.error('Failed to persist contact info:', e);
    }

    set({
      candidateName: name,
      candidateEmail: email,
      candidatePhone: phone,
      candidateLinks: links,
    });
  }
}));
