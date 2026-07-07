import { create } from 'zustand';

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

export interface PersonalData {
  name: string;
  email: string;
  phone: string;
  links: string[];
}

export interface ParsedSections {
  personal: PersonalData;
  education: string[];
  experience: WorkExperience[];
  projects: ProjectEntry[];
  skills: string[];
  achievements: string[];
  certifications: string[];
  links: string[];
}

export interface ResumeVersion {
  id: string;
  timestamp: string;
  atsScore: number;
  acceptedCount: number;
  ignoredCount: number;
  userNotes?: string;
  parsedSections: ParsedSections;
  fileName: string;
  resumeText: string;
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
  
  updateParsedSection: (
    section: keyof ParsedSections,
    entryIndex: number,
    bulletIndex: number, // -1 if updating flat string list item at entryIndex
    newValue: string,
    scoreBoost?: number
  ) => void;
  undo: () => void;
  redo: () => void;
  
  saveVersion: (notes?: string) => void;
  deleteVersion: (id: string) => void;
  restoreVersion: (id: string) => void;
  setContactInfo: (name: string, email: string, phone: string, links: string) => void;
}

/**
 * Robustly normalize parsed sections to guarantee experiences and projects
 * are always structured objects with aligned property names.
 */
export function normalizeParsedSections(parsed: any): ParsedSections {
  const normalized: ParsedSections = {
    personal: { name: '', email: '', phone: '', links: [] },
    education: Array.isArray(parsed?.education) ? parsed.education : [],
    experience: [],
    projects: [],
    skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
    achievements: Array.isArray(parsed?.achievements) ? parsed.achievements : [],
    certifications: Array.isArray(parsed?.certifications) ? parsed.certifications : [],
    links: Array.isArray(parsed?.links) ? parsed.links : [],
  };

  if (!parsed) return normalized;

  if (parsed.personal) {
    normalized.personal = {
      name: parsed.personal.name || '',
      email: parsed.personal.email || '',
      phone: parsed.personal.phone || '',
      links: Array.isArray(parsed.personal.links) ? parsed.personal.links : []
    };
  }

  // Normalize experience
  if (Array.isArray(parsed.experience)) {
    let currentExp: WorkExperience | null = null;
    parsed.experience.forEach((item: any) => {
      if (item && typeof item === 'object' && ('role' in item || 'company' in item)) {
        normalized.experience.push({
          role: item.role || 'Role',
          company: item.company || 'Organization',
          date: item.date || 'Date',
          bullets: Array.isArray(item.bullets) ? item.bullets : []
        });
      } else if (typeof item === 'string') {
        const trimmed = item.trim();
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
        if (isBullet && currentExp) {
          currentExp.bullets.push(trimmed.replace(/^[•\-\*]\s*/, '').trim());
        } else {
          let role = trimmed;
          let company = 'Organization';
          let date = 'Date';

          if (trimmed.includes(' at ')) {
            const parts = trimmed.split(' at ');
            role = parts[0].trim();
            const rest = parts[1];
            if (rest.includes('(')) {
              company = rest.split('(')[0].trim();
              const dateMatch = rest.match(/\(([^)]+)\)/);
              if (dateMatch) date = dateMatch[1].trim();
            } else {
              company = rest.trim();
            }
          } else if (trimmed.includes('|')) {
            const parts = trimmed.split('|');
            role = parts[0].trim();
            company = parts[1].trim();
            if (parts[2]) date = parts[2].trim();
          }

          currentExp = { role, company, date, bullets: [] };
          normalized.experience.push(currentExp);
        }
      }
    });
  }

  // Normalize projects
  if (Array.isArray(parsed.projects)) {
    let currentProj: ProjectEntry | null = null;
    parsed.projects.forEach((item: any) => {
      if (item && typeof item === 'object' && ('title' in item || 'techStack' in item)) {
        normalized.projects.push({
          title: item.title || 'Project Title',
          techStack: item.techStack || 'Tech Stack',
          date: item.date || 'Date',
          bullets: Array.isArray(item.bullets) ? item.bullets : []
        });
      } else if (typeof item === 'string') {
        const trimmed = item.trim();
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
        if (isBullet && currentProj) {
          currentProj.bullets.push(trimmed.replace(/^[•\-\*]\s*/, '').trim());
        } else {
          let title = trimmed;
          let techStack = 'Technologies';
          let date = 'Date';

          if (trimmed.includes('|')) {
            const parts = trimmed.split('|');
            title = parts[0].trim();
            techStack = parts[1].trim();
            if (parts[2]) date = parts[2].trim();
          }

          currentProj = { title, techStack, date, bullets: [] };
          normalized.projects.push(currentProj);
        }
      }
    });
  }

  // Fallbacks if lists remain empty
  if (normalized.experience.length === 0) {
    normalized.experience.push({
      role: 'Software Engineer',
      company: 'TechCorp',
      date: '2023 - Present',
      bullets: ['Developed features using React and Node.js.']
    });
  }
  if (normalized.projects.length === 0) {
    normalized.projects.push({
      title: 'Portfolio Website',
      techStack: 'HTML | CSS',
      date: '2024',
      bullets: ['Created interactive portfolio website.']
    });
  }

  return normalized;
}

// Client-side text parsing helper to split plain text into structured resume sections
function parseSectionsFromText(text: string): ParsedSections {
  let name = 'Candidate Name';
  let email = '';
  let phone = '';
  const linksList: string[] = [];

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\d{10}/);
  if (phoneMatch) phone = phoneMatch[0];

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length > 0) {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (line.length < 50 && !line.includes('@') && !line.includes('http') && !line.includes('|')) {
        name = line;
        break;
      }
    }
  }

  lines.forEach(line => {
    if (/(linkedin\.com|github\.com|leetcode\.com|hackerrank\.com|twitter\.com|portfolio)/i.test(line)) {
      const parts = line.split(/[|\t\s,]+/).map(p => p.trim());
      parts.forEach(part => {
        if (/(linkedin|github|leetcode|hackerrank|twitter|portfolio|http)/i.test(part) && part.length > 5) {
          linksList.push(part.replace(/^[•\-\*]\s*/, '').trim());
        }
      });
    }
  });

  const uniqueLinks = Array.from(new Set(linksList));

  const sections: ParsedSections = {
    personal: {
      name,
      email,
      phone,
      links: uniqueLinks
    },
    experience: [],
    projects: [],
    skills: [],
    education: [],
    achievements: [],
    certifications: [],
    links: uniqueLinks
  };

  if (!text) return sections;

  let currentSection: keyof ParsedSections | 'certifications' | null = null;
  
  const sectionLines: Record<string, string[]> = {
    education: [],
    skills: [],
    experience: [],
    projects: [],
    achievements: [],
    certifications: []
  };

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
    } else if (lower.startsWith('certifications') || lower.startsWith('licenses and certifications') || lower === 'certifications') {
      currentSection = 'certifications';
      continue;
    } else if (lower.startsWith('declaration')) {
      currentSection = null;
      continue;
    }

    if (currentSection) {
      sectionLines[currentSection].push(line);
    }
  }

  // Parse Education, Skills, Achievements, Certifications
  sections.skills = sectionLines.skills.map(l => l.replace(/^[•\-\*]\s*/, '').trim());
  sections.education = sectionLines.education.map(l => l.replace(/^[•\-\*]\s*/, '').trim());
  sections.achievements = sectionLines.achievements.map(l => l.replace(/^[•\-\*]\s*/, '').trim());
  sections.certifications = sectionLines.certifications.map(l => l.replace(/^[•\-\*]\s*/, '').trim());

  // Date regex matching timelines and years
  const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December|Present)\s+\d{4}|\b\d{4}\s*-\s*(?:\d{4}|Present)\b|\b\d{4}\b/i;
  const isDateLine = (str: string) => dateRegex.test(str);

  // Parse Experience using Date line anchors
  const expLines = sectionLines.experience;
  const expDateIndices: number[] = [];
  expLines.forEach((l, idx) => {
    const isBullet = l.startsWith('•') || l.startsWith('-') || l.startsWith('*');
    if (!isBullet && isDateLine(l)) {
      expDateIndices.push(idx);
    }
  });

  if (expDateIndices.length > 0) {
    expDateIndices.forEach((dateIdx, i) => {
      const roleIdx = Math.max(0, dateIdx - 2);
      const companyIdx = Math.max(0, dateIdx - 1);
      
      const role = expLines[roleIdx];
      const company = expLines[companyIdx];
      const date = expLines[dateIdx];

      const nextEntryStartIdx = i + 1 < expDateIndices.length ? Math.max(0, expDateIndices[i + 1] - 2) : expLines.length;
      const bulletsLines = expLines.slice(dateIdx + 1, nextEntryStartIdx);
      const bullets = bulletsLines.map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(l => l.length > 0);

      sections.experience.push({ role, company, date, bullets });
    });
  } else {
    // Fallback if no dates detected
    let currentExp: any = null;
    let expLineCount = 0;
    expLines.forEach((line) => {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      if (isBullet) {
        if (!currentExp) {
          currentExp = { role: 'Software Engineer', company: 'Organization', date: 'Date', bullets: [] };
          sections.experience.push(currentExp);
        }
        currentExp.bullets.push(cleanLine);
      } else {
        if (!currentExp || currentExp.bullets.length > 0) {
          currentExp = { role: cleanLine, company: 'Organization', date: 'Date', bullets: [] };
          sections.experience.push(currentExp);
          expLineCount = 0;
        } else {
          expLineCount++;
          if (expLineCount === 1) currentExp.company = cleanLine;
          else if (expLineCount === 2) currentExp.date = cleanLine;
          else currentExp.bullets.push(cleanLine);
        }
      }
    });
  }

  // Parse Projects using Date line anchors
  const projLines = sectionLines.projects;
  const projDateIndices: number[] = [];
  projLines.forEach((l, idx) => {
    const isBullet = l.startsWith('•') || l.startsWith('-') || l.startsWith('*');
    if (!isBullet && isDateLine(l)) {
      projDateIndices.push(idx);
    }
  });

  if (projDateIndices.length > 0) {
    projDateIndices.forEach((dateIdx, i) => {
      const titleIdx = Math.max(0, dateIdx - 2);
      const techIdx = Math.max(0, dateIdx - 1);

      const title = projLines[titleIdx];
      const techStack = projLines[techIdx];
      const date = projLines[dateIdx];

      const nextEntryStartIdx = i + 1 < projDateIndices.length ? Math.max(0, projDateIndices[i + 1] - 2) : projLines.length;
      const bulletsLines = projLines.slice(dateIdx + 1, nextEntryStartIdx);
      const bullets = bulletsLines.map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(l => l.length > 0);

      sections.projects.push({ title, techStack, date, bullets });
    });
  } else {
    // Fallback if no dates detected
    let currentProj: any = null;
    let projLineCount = 0;
    projLines.forEach((line) => {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      if (isBullet) {
        if (!currentProj) {
          currentProj = { title: 'Project Title', techStack: 'Technologies', date: 'Date', bullets: [] };
          sections.projects.push(currentProj);
        }
        currentProj.bullets.push(cleanLine);
      } else {
        if (!currentProj || currentProj.bullets.length > 0) {
          currentProj = { title: cleanLine, techStack: 'Technologies', date: 'Date', bullets: [] };
          sections.projects.push(currentProj);
          projLineCount = 0;
        } else {
          projLineCount++;
          if (projLineCount === 1) currentProj.techStack = cleanLine;
          else if (projLineCount === 2) currentProj.date = cleanLine;
          else currentProj.bullets.push(cleanLine);
        }
      }
    });
  }

  // Fallbacks if experience or projects remain empty
  if (sections.experience.length === 0) {
    sections.experience.push({
      role: 'Software Engineer',
      company: 'TechCorp',
      date: '2023 - Present',
      bullets: ['Developed features using React and Node.js.']
    });
  }
  if (sections.projects.length === 0) {
    sections.projects.push({
      title: 'Portfolio Website',
      techStack: 'HTML | CSS',
      date: '2024',
      bullets: ['Created interactive portfolio website.']
    });
  }

  return sections;
}

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
      let normalizedOriginal = normalizeParsedSections(parsed.originalSections);
      let normalizedAnalysis = parsed.analysisResult ? {
        ...parsed.analysisResult,
        parsedSections: normalizeParsedSections(parsed.analysisResult.parsedSections)
      } : null;

      const hasCorruptRole = (sections: ParsedSections) => {
        return (sections.experience || []).some(e => 
          (e.role || '').length > 50 || 
          (e.role || '').toLowerCase().includes('coordinated') || 
          (e.role || '').toLowerCase().includes('permissions') || 
          (e.role || '').toLowerCase().includes('supported') || 
          (e.role || '').toLowerCase().includes('led')
        );
      };

      if (parsed.resumeText && (hasCorruptRole(normalizedOriginal) || (normalizedAnalysis && hasCorruptRole(normalizedAnalysis.parsedSections)))) {
        const corrected = parseSectionsFromText(parsed.resumeText);
        normalizedOriginal = corrected;
        if (normalizedAnalysis) {
          normalizedAnalysis.parsedSections = JSON.parse(JSON.stringify(corrected));
        }
        try {
          localStorage.setItem('resume-copilot-data', JSON.stringify({
            ...parsed,
            originalSections: corrected,
            analysisResult: normalizedAnalysis
          }));
        } catch (e) {
          console.error('Failed to save repaired state in localStorage:', e);
        }
      }

      return {
        resumeText: parsed.resumeText || null,
        resumeFileName: parsed.resumeFileName || null,
        analysisResult: normalizedAnalysis,
        originalSections: normalizedOriginal,
        versions: (parsed.versions || []).map((v: any) => ({
          ...v,
          parsedSections: normalizeParsedSections(v.parsedSections)
        })),
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
    let parsed = normalizeParsedSections(analysis.parsedSections);
    
    if (!parsed || parsed.experience.length === 0) {
      parsed = parseSectionsFromText(text);
    }

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

    // Set structured personal sub-object
    parsed.personal = {
      name,
      email,
      phone,
      links: parsed.personal?.links && parsed.personal.links.length > 0 
        ? parsed.personal.links 
        : [links]
    };

    const analysisWithSections = {
      ...analysis,
      parsedSections: parsed,
    };

    const currentVersions = get().versions || [];
    const nextVerIndex = currentVersions.length + 1;
    const version1: ResumeVersion = {
      id: `version-${nextVerIndex}`,
      timestamp: new Date().toLocaleString(),
      atsScore: analysis?.overallScore || 70,
      acceptedCount: 0,
      ignoredCount: 0,
      userNotes: `Original Upload (${fileName})`,
      parsedSections: JSON.parse(JSON.stringify(parsed)),
      fileName: fileName,
      resumeText: text,
    };
    
    const newVersionsList = [version1, ...currentVersions];

    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText: text,
          resumeFileName: fileName,
          analysisResult: analysisWithSections,
          originalSections: parsed,
          versions: newVersionsList,
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
      versions: newVersionsList,
      candidateName: name,
      candidateEmail: email,
      candidatePhone: phone,
      candidateLinks: links,
      history: [],
      future: [],
    });
  },

  clearResume: () => {
    const { versions } = get();
    try {
      localStorage.setItem(
        'resume-copilot-data',
        JSON.stringify({
          resumeText: null,
          resumeFileName: null,
          analysisResult: null,
          originalSections: null,
          versions,
          candidateName: 'Anshika Aggarwal',
          candidateEmail: 'aggarwalanshika4@gmail.com',
          candidatePhone: '+91-8707881770',
          candidateLinks: 'LinkedIn | LeetCode | GitHub',
        })
      );
    } catch (e) {
      console.error('Failed to persist cleared data:', e);
    }
    set({
      resumeText: null,
      resumeFileName: null,
      analysisResult: null,
      originalSections: null,
      versions,
      candidateName: 'Anshika Aggarwal',
      candidateEmail: 'aggarwalanshika4@gmail.com',
      candidatePhone: '+91-8707881770',
      candidateLinks: 'LinkedIn | LeetCode | GitHub',
      history: [],
      future: [],
    });
  },

  updateParsedSection: (section, entryIndex, bulletIndex, newValue, scoreBoost = 0) => {
    const { analysisResult, history, resumeText, resumeFileName, originalSections, versions, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    if (!analysisResult || !analysisResult.parsedSections) return;

    const currentSections = { ...analysisResult.parsedSections };
    const currentScore = analysisResult.overallScore;
    
    const newHistoryEntry = {
      parsedSections: JSON.parse(JSON.stringify(currentSections)),
      overallScore: currentScore,
    };

    const newSections = JSON.parse(JSON.stringify(currentSections));

    if (section === 'experience' || section === 'projects') {
      const entry = newSections[section][entryIndex];
      if (entry && entry.bullets && entry.bullets[bulletIndex] !== undefined) {
        entry.bullets[bulletIndex] = newValue;
      }
    } else {
      if (newSections[section] && newSections[section][entryIndex] !== undefined) {
        newSections[section][entryIndex] = newValue;
      }
    }

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
      future: [],
    });
  },

  undo: () => {
    const { history, future, analysisResult, resumeText, resumeFileName, originalSections, versions, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    if (history.length === 0 || !analysisResult) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

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

    const nextState = future[future.length - 1];
    const newFuture = future.slice(0, -1);

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

    let acceptedCount = 0;
    const orig = originalSections || { experience: [], projects: [], skills: [], education: [], achievements: [] };
    const curr = analysisResult.parsedSections;

    const countExperienceChanges = () => {
      const origList = orig.experience || [];
      const currList = curr.experience || [];
      currList.forEach((entry: WorkExperience, eIdx: number) => {
        const origEntry = origList[eIdx];
        if (origEntry && origEntry.bullets && entry.bullets) {
          entry.bullets.forEach((bullet: string, bIdx: number) => {
            if (origEntry.bullets[bIdx] !== undefined && origEntry.bullets[bIdx] !== bullet) {
              acceptedCount++;
            }
          });
        }
      });
    };

    const countProjectChanges = () => {
      const origList = orig.projects || [];
      const currList = curr.projects || [];
      currList.forEach((entry: ProjectEntry, eIdx: number) => {
        const origEntry = origList[eIdx];
        if (origEntry && origEntry.bullets && entry.bullets) {
          entry.bullets.forEach((bullet: string, bIdx: number) => {
            if (origEntry.bullets[bIdx] !== undefined && origEntry.bullets[bIdx] !== bullet) {
              acceptedCount++;
            }
          });
        }
      });
    };

    countExperienceChanges();
    countProjectChanges();

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
      fileName: resumeFileName || 'optimized_resume.pdf',
      resumeText: resumeText || '',
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

  restoreVersion: (id) => {
    const { versions, resumeText, resumeFileName, originalSections, candidateName, candidateEmail, candidatePhone, candidateLinks } = get();
    const ver = versions.find((v) => v.id === id);
    if (!ver) return;

    const updatedAnalysis = {
      ...get().analysisResult,
      overallScore: ver.atsScore,
      parsedSections: JSON.parse(JSON.stringify(ver.parsedSections))
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
      console.error('Failed to persist restoreVersion state:', e);
    }

    set({
      analysisResult: updatedAnalysis,
      history: [],
      future: [],
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
