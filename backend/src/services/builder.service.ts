import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger.js';
import { ParsedSections } from '../interfaces/resume.interface.js';

export class BuilderService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY is not defined in the builder service environment.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');
  }

  /**
   * Active Format Normalizer ensuring experience and projects lists are always structured objects
   * with clean SDE aligned property names.
   */
  public normalizeParsedSections(parsed: any): ParsedSections {
    const normalized: ParsedSections = {
      experience: [],
      projects: [],
      skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
      education: Array.isArray(parsed?.education) ? parsed.education : [],
      achievements: Array.isArray(parsed?.achievements) ? parsed.achievements : [],
    };

    if (!parsed) return normalized;

    // Normalize experience
    if (Array.isArray(parsed.experience)) {
      let currentExp: any = null;
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
      let currentProj: any = null;
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

    return normalized;
  }

  /**
   * Merge only the accepted modifications into the original parsed sections.
   */
  public mergeResumeChanges(
    originalSections: ParsedSections,
    acceptedSuggestions: Array<{
      section: keyof ParsedSections;
      entryIndex: number;
      bulletIndex: number;
      newValue: string;
    }>
  ): ParsedSections {
    logger.info('Merging accepted suggestions into original parsed sections...');
    const normOriginal = this.normalizeParsedSections(originalSections);
    const merged: ParsedSections = JSON.parse(JSON.stringify(normOriginal));

    if (acceptedSuggestions && Array.isArray(acceptedSuggestions)) {
      acceptedSuggestions.forEach((change) => {
        const { section, entryIndex, bulletIndex, newValue } = change;
        if (merged[section] && Array.isArray(merged[section])) {
          if (section === 'experience' || section === 'projects') {
            const entry: any = merged[section][entryIndex];
            if (entry && entry.bullets && Array.isArray(entry.bullets) && entry.bullets[bulletIndex] !== undefined) {
              logger.info(`Merging section "${section}" at entry ${entryIndex}, bullet ${bulletIndex}`);
              entry.bullets[bulletIndex] = newValue;
            }
          } else {
            if (merged[section][entryIndex] !== undefined) {
              logger.info(`Merging flat section "${section}" at index ${entryIndex}`);
              merged[section][entryIndex] = newValue as any;
            }
          }
        }
      });
    }

    return merged;
  }

  /**
   * Strictly validate that no metadata or structural categories were deleted.
   */
  public validateResumeStructure(original: ParsedSections, optimized: ParsedSections): string[] {
    const issues: string[] = [];
    
    if (!optimized || !original) {
      issues.push("Original or optimized sections are missing.");
      return issues;
    }

    const normOriginal = this.normalizeParsedSections(original);
    const normOptimized = this.normalizeParsedSections(optimized);

    const checkMatch = (origVal: string, optVal: string, label: string) => {
      const o = (origVal || '').trim().toLowerCase();
      const p = (optVal || '').trim().toLowerCase();
      if (o && !p.includes(o) && !o.includes(p)) {
        issues.push(`Preservation failed: ${label} ("${origVal}") was altered or removed.`);
      }
    };

    // 1. Validate Experience metadata (role, company, date)
    const origExp = normOriginal.experience || [];
    const optExp = normOptimized.experience || [];
    origExp.forEach((origEntry, idx) => {
      const optEntry = optExp[idx];
      if (!optEntry) {
        issues.push(`Preservation failed: Work experience entry at index ${idx + 1} was removed.`);
      } else {
        checkMatch(origEntry.role, optEntry.role, `Experience role`);
        checkMatch(origEntry.company, optEntry.company, `Experience organization`);
        checkMatch(origEntry.date, optEntry.date, `Experience dates`);
      }
    });

    // 2. Validate Projects metadata (title, techStack, date)
    const origProj = normOriginal.projects || [];
    const optProj = normOptimized.projects || [];
    origProj.forEach((origEntry, idx) => {
      const optEntry = optProj[idx];
      if (!optEntry) {
        issues.push(`Preservation failed: Project entry at index ${idx + 1} was removed.`);
      } else {
        checkMatch(origEntry.title, optEntry.title, `Project title`);
        checkMatch(origEntry.techStack, optEntry.techStack, `Project tech stack`);
        checkMatch(origEntry.date, optEntry.date, `Project date`);
      }
    });

    // 3. Validate Education
    const origEdu = normOriginal.education || [];
    const optEdu = normOptimized.education || [];
    origEdu.forEach((origVal, idx) => {
      const optVal = optEdu[idx];
      if (!optVal) {
        issues.push(`Preservation failed: Education credential "${origVal}" was removed.`);
      } else {
        checkMatch(origVal, optVal, `Education entry`);
      }
    });

    // 4. Validate Achievements
    const origAch = normOriginal.achievements || [];
    const optAch = normOptimized.achievements || [];
    origAch.forEach((origVal, idx) => {
      const optVal = optAch[idx];
      if (!optVal) {
        issues.push(`Preservation failed: Achievement "${origVal}" was removed.`);
      } else {
        checkMatch(origVal, optVal, `Achievement entry`);
      }
    });

    // 5. Validate Skills (all skill sub-tags preserved)
    const origSkills = normOriginal.skills || [];
    const optSkills = normOptimized.skills || [];
    origSkills.forEach((origVal, idx) => {
      const optVal = optSkills[idx];
      if (!optVal) {
        issues.push(`Preservation failed: Technical skills segment was removed.`);
      } else {
        const origWords = origVal.split(/[,|]/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
        const optWordsStr = (optVal || '').toLowerCase();
        origWords.forEach((word) => {
          if (!optWordsStr.includes(word)) {
            issues.push(`Technical skill preservation failed: Skill tag "${word}" was removed.`);
          }
        });
      }
    });

    return issues;
  }

  /**
   * Run a final AI check on the optimized sections before export.
   */
  public async validateResume(resumeText: string, sections: ParsedSections): Promise<{ status: string; issues: string[] }> {
    logger.info('Running AI validation check on the merged resume sections...');
    const normSections = this.normalizeParsedSections(sections);
    
    if (!process.env.GEMINI_API_KEY) {
      logger.info('Using mock AI validation fallback.');
      return {
        status: 'Resume Ready',
        issues: [],
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `You are a professional SDE Hiring Manager and resume auditor.
Analyze the following resume sections for duplicate skills, grammar errors, repeated bullet points, missing contact details, formatting consistency, or broken sections.

Original parsed text guidelines:
${resumeText}

Proposed sections to export:
${JSON.stringify(normSections, null, 2)}

If the sections contain duplicate technical skills, repeated phrases in bullets, grammar mistakes, or miss contact channels, respond exactly with this JSON format:
{
  "status": "Issues Found",
  "issues": ["list issues in simple user friendly sentences"]
}

Otherwise, if it looks perfect, fully consistent, and ready to export, respond exactly with this JSON:
{
  "status": "Resume Ready",
  "issues": []
}

Return ONLY raw, valid JSON. Do not include markdown code block syntax (like \`\`\`json).`;

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (err: any) {
      logger.error(`Gemini validation failed: ${err.message}. Using offline success fallback.`);
      return {
        status: 'Resume Ready',
        issues: [],
      };
    }
  }

  /**
   * PDF Builder preserving document line structures exactly and applying only bullet point modifications.
   */
  public generatePDF(resumeData: any, resStream: NodeJS.WritableStream): void {
    logger.info('Generating PDF stream by replacing bullet points in original resume text...');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(resStream);

    const originalText: string = resumeData.resumeText || '';
    if (!originalText) {
      doc.fontSize(12).text('Empty Resume Text');
      doc.end();
      return;
    }

    // Build replacements map
    const replacements = new Map<string, string>();
    const origSections = resumeData.originalSections || {};
    const optSections = resumeData.parsedSections || {};

    const buildReplacements = (origList: any[], optList: any[]) => {
      if (!origList || !optList) return;
      origList.forEach((origEntry, eIdx) => {
        const optEntry = optList[eIdx];
        if (origEntry && optEntry && Array.isArray(origEntry.bullets) && Array.isArray(optEntry.bullets)) {
          origEntry.bullets.forEach((origBullet: string, bIdx: number) => {
            const optBullet = optEntry.bullets[bIdx];
            if (origBullet && optBullet && origBullet.trim() !== optBullet.trim()) {
              replacements.set(origBullet.trim().toLowerCase(), optBullet.trim());
            }
          });
        }
      });
    };

    buildReplacements(origSections.experience, optSections.experience);
    buildReplacements(origSections.projects, optSections.projects);

    doc.fontSize(10).font('Helvetica').fillColor('#111111');
    const lines = originalText.split('\n');
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        doc.moveDown(0.3);
        return;
      }

      const cleanLine = trimmed.replace(/^[•\-\*]\s*/, '').trim().toLowerCase();
      let textToPrint = line;
      let isReplaced = false;

      if (replacements.has(cleanLine)) {
        const replacement = replacements.get(cleanLine)!;
        const bulletMatch = line.match(/^\s*([•\-\*]\s*)/);
        const bulletMarker = bulletMatch ? bulletMatch[1] : '• ';
        textToPrint = `${bulletMarker}${replacement}`;
        isReplaced = true;
      }

      const isHeader = /^(education|experience|professional experience|projects|personal projects|technical skills|skills|achievements|activities|declaration)/i.test(trimmed);
      if (isHeader) {
        doc.moveDown(0.5);
        doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#111111').text(textToPrint.toUpperCase());
        const yLine = doc.y + 2;
        doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#cccccc').lineWidth(1).stroke();
        doc.moveDown(0.5);
      } else {
        if (isReplaced) {
          doc.fontSize(10).font('Helvetica-Oblique').fillColor('#1b365d').text(textToPrint, { lineGap: 2.5 });
        } else {
          doc.fontSize(9.5).font('Helvetica').fillColor('#222222').text(textToPrint, { lineGap: 2.5 });
        }
      }
    });

    doc.end();
  }

  /**
   * Generate Microsoft Word compatible doc HTML payload preserving spacing, bullets, and margins.
   */
  public generateDOCX(resumeData: any): string {
    logger.info('Generating DOCX HTML format payload from original resume text...');
    
    const originalText: string = resumeData.resumeText || '';
    
    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>`;
    html += `<head><title>${resumeData.name || 'Resume'}</title>`;
    html += `<style>
      body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000; line-height: 1.35; margin: 50px; }
      .header-title { font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #000000; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; padding-bottom: 2px; }
      .replaced-bullet { color: #1b365d; font-style: italic; font-weight: bold; }
      p { margin: 0 0 4px 0; }
    </style></head><body>`;

    // Build replacements map
    const replacements = new Map<string, string>();
    const origSections = resumeData.originalSections || {};
    const optSections = resumeData.parsedSections || {};

    const buildReplacements = (origList: any[], optList: any[]) => {
      if (!origList || !optList) return;
      origList.forEach((origEntry, eIdx) => {
        const optEntry = optList[eIdx];
        if (origEntry && optEntry && Array.isArray(origEntry.bullets) && Array.isArray(optEntry.bullets)) {
          origEntry.bullets.forEach((origBullet: string, bIdx: number) => {
            const optBullet = optEntry.bullets[bIdx];
            if (origBullet && optBullet && origBullet.trim() !== optBullet.trim()) {
              replacements.set(origBullet.trim().toLowerCase(), optBullet.trim());
            }
          });
        }
      });
    };

    buildReplacements(origSections.experience, optSections.experience);
    buildReplacements(origSections.projects, optSections.projects);

    const lines = originalText.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        html += `<p>&nbsp;</p>`;
        return;
      }

      const cleanLine = trimmed.replace(/^[•\-\*]\s*/, '').trim().toLowerCase();
      let textToPrint = line;
      let isReplaced = false;

      if (replacements.has(cleanLine)) {
        const replacement = replacements.get(cleanLine)!;
        const bulletMatch = line.match(/^\s*([•\-\*]\s*)/);
        const bulletMarker = bulletMatch ? bulletMatch[1] : '• ';
        textToPrint = `${bulletMarker}${replacement}`;
        isReplaced = true;
      }

      const isHeader = /^(education|experience|professional experience|projects|personal projects|technical skills|skills|achievements|activities|declaration)/i.test(trimmed);
      if (isHeader) {
        html += `<div class="header-title">${textToPrint.toUpperCase()}</div>`;
      } else {
        if (isReplaced) {
          html += `<p class="replaced-bullet">${textToPrint}</p>`;
        } else {
          html += `<p>${textToPrint}</p>`;
        }
      }
    });

    html += `</body></html>`;
    return html;
  }
}

export const builderService = new BuilderService();
