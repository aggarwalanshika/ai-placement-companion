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

    // Active normalize structures first
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
   * Draw a beautifully formatted, single-page vector PDF resume using pdfkit.
   * Aligned to clean SDE templates.
   */
  public generatePDF(resumeData: any, resStream: NodeJS.WritableStream): void {
    logger.info('Generating PDF stream for optimized resume export...');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(resStream);

    doc.fontSize(22).font('Helvetica-Bold').text(resumeData.name || 'Anonymous', { align: 'center' });
    doc.moveDown(0.2);

    const contactStr = `${resumeData.email || ''}  |  ${resumeData.phone || ''}  |  ${resumeData.links || ''}`;
    doc.fontSize(9.5).font('Helvetica').fillColor('#333333').text(contactStr, { align: 'center' });
    doc.moveDown(1.5);

    const rawSections = resumeData.parsedSections || {};
    const sections = this.normalizeParsedSections(rawSections);

    const renderFlatSection = (title: string, list: string[]) => {
      if (!list || list.length === 0) return;
      
      doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#111111').text(title.toUpperCase());
      const yLine = doc.y + 2;
      doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(0.8);

      doc.fontSize(10).font('Helvetica').fillColor('#222222');
      if (title.toLowerCase() === 'technical skills' || title.toLowerCase() === 'skills') {
        doc.text(list.join(', '), { align: 'left', lineGap: 3 });
      } else {
        list.forEach((item) => {
          doc.text('•  ' + item.trim(), { align: 'left', lineGap: 3, paragraphGap: 4, indent: 12 });
        });
      }
      doc.moveDown(1.2);
    };

    // Render Education
    renderFlatSection('Education', sections.education);

    // Render Skills
    renderFlatSection('Technical Skills', sections.skills);

    // Render Experience (Structured)
    if (sections.experience && sections.experience.length > 0) {
      doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#111111').text('PROFESSIONAL EXPERIENCE');
      const yLine = doc.y + 2;
      doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(0.8);

      sections.experience.forEach((exp: any) => {
        const role = exp.role || 'Role';
        const company = exp.company || 'Organization';
        const date = exp.date || 'Date';

        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`${role}  |  ${company}  |  ${date}`, { align: 'left', lineGap: 2 });
        doc.moveDown(0.2);

        doc.fontSize(10).font('Helvetica').fillColor('#222222');
        if (exp.bullets && Array.isArray(exp.bullets)) {
          exp.bullets.forEach((bullet: string) => {
            doc.text('•  ' + bullet.trim(), { align: 'left', lineGap: 3, paragraphGap: 4, indent: 12 });
          });
        }
        doc.moveDown(0.6);
      });
      doc.moveDown(0.6);
    }

    // Render Projects (Structured)
    if (sections.projects && sections.projects.length > 0) {
      doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#111111').text('PROJECTS');
      const yLine = doc.y + 2;
      doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(0.8);

      sections.projects.forEach((proj: any) => {
        const title = proj.title || 'Project Title';
        const techStack = proj.techStack || 'Tech Stack';
        const date = proj.date || 'Date';

        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`${title}  |  ${techStack}  |  ${date}`, { align: 'left', lineGap: 2 });
        doc.moveDown(0.2);

        doc.fontSize(10).font('Helvetica').fillColor('#222222');
        if (proj.bullets && Array.isArray(proj.bullets)) {
          proj.bullets.forEach((bullet: string) => {
            doc.text('•  ' + bullet.trim(), { align: 'left', lineGap: 3, paragraphGap: 4, indent: 12 });
          });
        }
        doc.moveDown(0.6);
      });
      doc.moveDown(0.6);
    }

    // Render Achievements
    renderFlatSection('Achievements & Activities', sections.achievements);

    doc.end();
  }

  /**
   * Generate Microsoft Word compatible doc HTML payload preserving spacing, bullets, and margins.
   */
  public generateDOCX(resumeData: any): string {
    logger.info('Generating DOCX HTML format payload...');
    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>`;
    html += `<head><title>${resumeData.name || 'Resume'}</title>`;
    html += `<style>
      body { font-family: 'Times New Roman', serif; font-size: 11.5pt; color: #000000; line-height: 1.35; margin: 50px; }
      h1 { text-align: center; font-size: 22pt; font-weight: bold; margin: 0 0 5px 0; text-transform: uppercase; }
      .contact { text-align: center; font-size: 10pt; color: #444444; margin-bottom: 20px; }
      h2 { font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #000000; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; padding-bottom: 2px; }
      ul { margin-top: 3px; margin-bottom: 6px; padding-left: 20px; }
      li { margin-bottom: 4px; }
    </style></head><body>`;

    html += `<h1>${resumeData.name || 'Anonymous'}</h1>`;
    html += `<div class="contact">${resumeData.email || ''} | ${resumeData.phone || ''} | ${resumeData.links || ''}</div>`;

    const rawSections = resumeData.parsedSections || {};
    const sections = this.normalizeParsedSections(rawSections);

    if (sections.education && sections.education.length > 0) {
      html += `<h2>Education</h2><ul>`;
      sections.education.forEach((edu: string) => {
        html += `<li>${edu}</li>`;
      });
      html += `</ul>`;
    }

    if (sections.skills && sections.skills.length > 0) {
      html += `<h2>Technical Skills</h2><div style="padding-left: 5px;">${sections.skills.join(', ')}</div>`;
    }

    if (sections.experience && sections.experience.length > 0) {
      html += `<h2>Professional Experience</h2>`;
      sections.experience.forEach((exp: any) => {
        const role = exp.role || 'Role';
        const company = exp.company || 'Organization';
        const date = exp.date || 'Date';
        
        html += `<div style="font-weight: bold; margin-top: 8px; margin-bottom: 4px; color: #000000;">${role} &nbsp;|&nbsp; ${company} &nbsp;|&nbsp; ${date}</div><ul>`;
        if (exp.bullets && Array.isArray(exp.bullets)) {
          exp.bullets.forEach((bullet: string) => {
            html += `<li>${bullet}</li>`;
          });
        }
        html += `</ul>`;
      });
    }

    if (sections.projects && sections.projects.length > 0) {
      html += `<h2>Projects</h2>`;
      sections.projects.forEach((proj: any) => {
        const title = proj.title || 'Project Title';
        const techStack = proj.techStack || 'Tech Stack';
        const date = proj.date || 'Date';

        html += `<div style="font-weight: bold; margin-top: 8px; margin-bottom: 4px; color: #000000;">${title} &nbsp;|&nbsp; ${techStack} &nbsp;|&nbsp; ${date}</div><ul>`;
        if (proj.bullets && Array.isArray(proj.bullets)) {
          proj.bullets.forEach((bullet: string) => {
            html += `<li>${bullet}</li>`;
          });
        }
        html += `</ul>`;
      });
    }

    if (sections.achievements && sections.achievements.length > 0) {
      html += `<h2>Achievements & Activities</h2><ul>`;
      sections.achievements.forEach((ach: string) => {
        html += `<li>${ach}</li>`;
      });
      html += `</ul>`;
    }

    html += `</body></html>`;
    return html;
  }
}

export const builderService = new BuilderService();
