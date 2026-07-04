export interface SectionScores {
  experience: number;
  projects: number;
  skills: number;
  education: number;
  grammar: number;
  formatting: number;
}

export interface StrengthOrWeakness {
  title: string;
  desc: string;
}

export interface KeywordMatch {
  name: string;
  type: 'matched' | 'missing';
}

export interface ProjectAnalysisItem {
  name: string;
  review: string;
  suggestions: string[];
  improved: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  date: string;
  bullets: string[];
}

export interface ProjectEntry {
  title: string;
  techStack: string;
  date: string;
  bullets: string[];
}

export interface ParsedSections {
  experience: WorkExperience[];
  projects: ProjectEntry[];
  skills: string[];
  education: string[];
  achievements: string[];
}

export interface ResumeAnalysisResult {
  overallScore: number;
  sectionScores: SectionScores;
  strengths: StrengthOrWeakness[];
  weaknesses: StrengthOrWeakness[];
  missingSkills: string[];
  suggestions: string[];
  keywordMatch: KeywordMatch[];
  resumeSummary: string;
  projectAnalysis: ProjectAnalysisItem[];
  parsedSections?: ParsedSections;
  resumeText?: string;
}
