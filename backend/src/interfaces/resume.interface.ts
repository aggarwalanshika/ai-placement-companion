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
  resumeText?: string;
}
