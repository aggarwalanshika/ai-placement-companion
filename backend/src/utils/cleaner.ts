import { ParsedSections } from '../interfaces/resume.interface.js';

/**
 * Robust cleaner to strip PDF/Unicode garbage sequences, normalize separators,
 * and preserve clean UTF-8 structures.
 */
export function cleanResumeText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Fix common PDF icon/bullet corruption characters (like ï, ¤, æö, etc.)
  cleaned = cleaned.replace(/ï\s*(LinkedIn|GitHub|LeetCode|Email|Phone)/gi, ' | $1');
  cleaned = cleaned.replace(/ï/g, ''); // Remove stray ï characters

  // 2. Remove typical garbage sequences like ";Ä5\" ¤\"•B æö–F Ö y"
  cleaned = cleaned.replace(/;Ä5".*?Ö\s*y/g, '');
  cleaned = cleaned.replace(/;Ä5".*?y/g, '');
  cleaned = cleaned.replace(/;Ä5"/g, '');
  
  // Strip out other corrupt characters like ¤, æö, Ö, Ä when they appear as noise:
  cleaned = cleaned.replace(/[¤æöÖÄ]/g, '');

  // 3. Fix contact separator issues (# separator adjacent to emails)
  cleaned = cleaned.replace(/#\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, ' | $1');
  cleaned = cleaned.replace(/\|\s*\|/g, '|');

  // Fix double spaces preserving newlines
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned;
}

/**
 * Deep clean structured parsed sections of any garbage characters.
 */
export function cleanParsedSections(sections: ParsedSections): ParsedSections {
  if (!sections) {
    return {
      personal: { name: '', email: '', phone: '', links: [] },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      achievements: [],
      certifications: [],
      links: []
    };
  }
  
  const cleanStr = (s: string) => cleanResumeText(s || '');

  const cleaned: ParsedSections = {
    personal: {
      name: cleanStr(sections.personal?.name || ''),
      email: cleanStr(sections.personal?.email || ''),
      phone: cleanStr(sections.personal?.phone || ''),
      links: (sections.personal?.links || []).map(cleanStr)
    },
    experience: (sections.experience || []).map((exp) => ({
      role: cleanStr(exp.role),
      company: cleanStr(exp.company),
      date: cleanStr(exp.date),
      bullets: (exp.bullets || []).map(cleanStr)
    })),
    projects: (sections.projects || []).map((proj) => ({
      title: cleanStr(proj.title),
      techStack: cleanStr(proj.techStack),
      date: cleanStr(proj.date),
      bullets: (proj.bullets || []).map(cleanStr)
    })),
    skills: (sections.skills || []).map(cleanStr),
    education: (sections.education || []).map(cleanStr),
    achievements: (sections.achievements || []).map(cleanStr),
    certifications: (sections.certifications || []).map(cleanStr),
    links: (sections.links || []).map(cleanStr)
  };

  return cleaned;
}
