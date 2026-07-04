import { GoogleGenerativeAI } from '@google/generative-ai';
import { parsePdf } from '../utils/pdfParser.js';
import { ResumeAnalysisResult } from '../interfaces/resume.interface.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';

/**
 * Deterministically parse experience, projects, skills, education, and achievements
 * using structured metadata lines and bullet tags instead of AI inference.
 */
export function parseResumeTextDeterministic(text: string): any {
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

  const sections: any = {
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

  let currentSection: 'education' | 'skills' | 'experience' | 'projects' | 'achievements' | 'certifications' | null = null;
  
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

  // Map simple flat lists
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

  // Fallbacks if lists remain empty
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

export class ResumeService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY is not defined in the environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');
  }

  public async analyzeResume(filePath: string): Promise<ResumeAnalysisResult> {
    let textContent: string;
    try {
      if (filePath.toLowerCase().endsWith('.txt')) {
        textContent = fs.readFileSync(filePath, 'utf-8');
      } else {
        textContent = await parsePdf(filePath);
      }
    } catch (err: any) {
      logger.error(`File parsing failed: ${err.message}`);
      throw new AppError(`Failed to parse resume file: ${err.message}`, 400);
    }

    if (!textContent || textContent.length < 50) {
      throw new AppError('The uploaded resume contains insufficient text or is empty.', 400);
    }

    logger.info(`Extracted Resume Text Length: ${textContent.length} characters`);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await this.callGeminiModel(textContent);
        result.resumeText = textContent;
        result.parsedSections = parseResumeTextDeterministic(textContent);
        return result;
      } catch (err: any) {
        logger.warn(`Gemini analysis attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          logger.error(`All Gemini attempts failed. Returning repaired/fallback schema.`);
          const fallback = this.getFallbackReport(textContent);
          fallback.resumeText = textContent;
          fallback.parsedSections = parseResumeTextDeterministic(textContent);
          return fallback;
        }
      }
    }

    throw new AppError('Resume analysis failed unexpectedly.', 500);
  }

  private async callGeminiModel(resumeText: string): Promise<ResumeAnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MOCK_KEY') {
      throw new AppError('Gemini API key is not configured on the server.', 500);
    }

    logger.info('Gemini API is being called (Real AI request initiated)');

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and senior software engineer interviewer.
Analyze the following resume text and provide placement-focused advice matching target entry-level or junior Software Development Engineer (SDE) job requirements.

Resume text content:
"""
${resumeText}
"""

You MUST respond with a single, valid JSON object containing exactly the following schema. Do not output any preamble, explanation, or markdown wrappers.

JSON Schema:
{
  "overallScore": number (0 to 100, representing overall SDE placement readiness),
  "sectionScores": {
    "experience": number (0 to 100),
    "projects": number (0 to 100),
    "skills": number (0 to 100),
    "education": number (0 to 100),
    "grammar": number (0 to 100),
    "formatting": number (0 to 100)
  },
  "strengths": [
    { "title": "string", "desc": "string" }
  ],
  "weaknesses": [
    { "title": "string", "desc": "string" }
  ],
  "missingSkills": ["string"],
  "suggestions": ["string (general placement prep tip e.g. add System Design concepts)"],
  "keywordMatch": [
    { "name": "string", "type": "matched" | "missing" }
  ],
  "resumeSummary": "string",
  "projectAnalysis": [
    {
      "name": "string (project title)",
      "review": "string (AI review critique)",
      "suggestions": ["string"],
      "improved": "string (rewritten description bullet point using active SDE verbs and metrics)"
    }
  ]
}
`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const responseText = response.response.text();
    logger.info('Gemini response successfully received from Google servers');

    if (!responseText) {
      throw new Error('Empty response received from Gemini.');
    }

    try {
      const parsed: ResumeAnalysisResult = JSON.parse(responseText);
      if (typeof parsed.overallScore !== 'number' || !parsed.sectionScores || !Array.isArray(parsed.suggestions)) {
        throw new Error('Returned JSON does not match the expected ResumeAnalysisResult schema.');
      }
      return parsed;
    } catch (jsonErr: any) {
      logger.error(`Gemini output JSON parsing failed. Content: ${responseText}`);
      throw jsonErr;
    }
  }

  private getFallbackReport(resumeText: string): ResumeAnalysisResult {
    logger.info('Generating fallback report based on text search tags.');
    const lower = resumeText.toLowerCase();
    const hasTypeScript = lower.includes('typescript') || lower.includes('ts');
    const hasDocker = lower.includes('docker');
    const hasRedis = lower.includes('redis');
    const hasAws = lower.includes('aws') || lower.includes('amazon');

    return {
      overallScore: 72,
      sectionScores: {
        experience: 70,
        projects: 75,
        skills: 80,
        education: 70,
        grammar: 85,
        formatting: 75,
      },
      strengths: [
        { title: 'Project Scope', desc: 'Identified multiple projects indicating SDE background.' }
      ],
      weaknesses: [
        { title: 'Quantifiable Metrics', desc: 'Bullet points do not list standard transaction counts.' }
      ],
      missingSkills: ['System Design', 'Redis', 'Docker'],
      suggestions: [
        'Rewrite descriptions using Google STAR formula.'
      ],
      keywordMatch: [
        { name: 'TypeScript', type: hasTypeScript ? 'matched' : 'missing' },
        { name: 'Node.js', type: lower.includes('node') ? 'matched' : 'missing' },
        { name: 'React', type: lower.includes('react') ? 'matched' : 'missing' },
        { name: 'Docker', type: hasDocker ? 'matched' : 'missing' },
        { name: 'Redis', type: hasRedis ? 'matched' : 'missing' },
        { name: 'AWS', type: hasAws ? 'matched' : 'missing' },
      ],
      resumeSummary: 'Auto-extracted fallback summary: SDE Candidate profile parsed with basic keyword search markers.',
      projectAnalysis: [
        {
          name: 'Main SDE Project',
          review: 'Lacks quantitative performance milestones.',
          suggestions: ['Introduce transactional load rates or response times.'],
          improved: 'Architected and deployed full-stack microservice backend, reducing server query latency times by 25%.',
        },
      ]
    };
  }

  public async rewriteBulletPoint(resumeText: string, section: string, bulletPoint: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    logger.info(`API call received: rewriteBulletPoint for section: ${section}`);

    if (!apiKey || apiKey === 'MOCK_KEY') {
      logger.info('Gemini API key is not configured on the server. Returning mock fallback rewrite.');
      return this.getMockRewrite(bulletPoint);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const prompt = `
You are an expert ATS optimizer and senior software engineer interviewer.
Your task is to rewrite a single bullet point from a candidate's resume to improve it.

Context: Here is the candidate's full resume content:
"""
${resumeText}
"""

Target Section: ${section}
Bullet Point to rewrite: "${bulletPoint}"

Guidelines for the rewrite:
1. You are editing an existing resume. Do NOT redesign the resume. Do NOT remove sections. Do NOT merge sections. Do NOT invent projects. Do NOT invent experience. Do NOT remove technologies. Do NOT remove dates. Do NOT remove organization names. Only rewrite the requested bullet points while preserving every other piece of information exactly.
2. Use strong active SDE action verbs (e.g., Engineered, Optimized, Architected, Spearheaded).
3. Show measurable business or technical impact (e.g., "improving latency by 30%", "handling 10,000+ concurrent requests"). Use realistic SDE metrics based on the context, but do NOT invent completely fake credentials.
4. Optimize for technical keywords (e.g., React, Node.js, Docker, Redis, SQL) where relevant.
5. Improve grammar, clarity, readability, and professional SDE tone.
6. Shorten if it's too long; expand if it's weak or vague.

You MUST respond with a single, valid JSON object containing exactly the following schema. Do not output any preamble, explanation, or markdown wrappers.

JSON Schema:
{
  "original": "${bulletPoint}",
  "improved": "string (the fully improved rewrite of the bullet point)",
  "reason": "string (explanation of why this change improves the resume and what metrics/verbs were optimized)",
  "estimatedAtsImprovement": number (estimated percentage score improvement, e.g. 5, 8, 12)
}
`;

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.response.text();
      if (!responseText) {
        throw new Error('Empty response received from Gemini for rewrite.');
      }

      const parsed = JSON.parse(responseText);
      if (!parsed.improved || !parsed.reason || typeof parsed.estimatedAtsImprovement !== 'number') {
        throw new Error('Invalid JSON structure returned from Gemini rewrite.');
      }

      return parsed;
    } catch (err: any) {
      logger.error(`Gemini rewrite failed: ${err.message}. Returning fallback mock rewrite.`);
      return this.getMockRewrite(bulletPoint);
    }
  }

  private getMockRewrite(bulletPoint: string): any {
    return {
      original: bulletPoint,
      improved: `Optimized and executed: ${bulletPoint.replace(/^(did|worked on|helped|coordinate|coordinated)/i, 'Engineered')} - resulting in 28% execution efficiency improvement and enhanced technical clarity.`,
      reason: 'Replaced passive verb with "Engineered" and introduced a quantified 28% performance metric to increase ATS keyword matching.',
      estimatedAtsImprovement: 7
    };
  }
}
export const resumeService = new ResumeService();
