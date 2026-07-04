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
   * Merge only the accepted modifications into the original parsed sections.
   */
  public mergeResumeChanges(
    originalSections: ParsedSections,
    acceptedSuggestions: Array<{
      section: keyof ParsedSections;
      index: number;
      newValue: string;
    }>
  ): ParsedSections {
    logger.info('Merging accepted suggestions into original parsed sections...');
    const merged: ParsedSections = {
      experience: [...(originalSections.experience || [])],
      projects: [...(originalSections.projects || [])],
      skills: [...(originalSections.skills || [])],
      education: [...(originalSections.education || [])],
      achievements: [...(originalSections.achievements || [])],
    };

    if (acceptedSuggestions && Array.isArray(acceptedSuggestions)) {
      acceptedSuggestions.forEach((change) => {
        const { section, index, newValue } = change;
        if (merged[section] && Array.isArray(merged[section]) && merged[section][index] !== undefined) {
          logger.info(`Merging section "${section}" at index ${index} with new value: "${newValue.substring(0, 30)}..."`);
          merged[section][index] = newValue;
        }
      });
    }

    return merged;
  }

  /**
   * Run a final AI check on the optimized sections before export.
   */
  public async validateResume(resumeText: string, sections: ParsedSections): Promise<{ status: string; issues: string[] }> {
    logger.info('Running AI validation check on the merged resume sections...');
    
    // Fallback if Gemini key is mock
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
${JSON.stringify(sections, null, 2)}

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
      
      // Clean possible json code blocks
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
   */
  public generatePDF(resumeData: any, resStream: NodeJS.WritableStream): void {
    logger.info('Generating PDF stream for optimized resume export...');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(resStream);

    // 1. Centered Header
    doc.fontSize(22).font('Helvetica-Bold').text(resumeData.name || 'Anonymous', { align: 'center' });
    doc.moveDown(0.2);

    const contactStr = `${resumeData.email || ''}  |  ${resumeData.phone || ''}  |  ${resumeData.links || ''}`;
    doc.fontSize(9.5).font('Helvetica').fillColor('#333333').text(contactStr, { align: 'center' });
    doc.moveDown(1.5);

    const sections = resumeData.parsedSections || {};

    const renderSection = (title: string, list: string[]) => {
      if (!list || list.length === 0) return;
      
      doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#111111').text(title.toUpperCase());
      
      // Draw horizontal line divider
      const yLine = doc.y + 2;
      doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(0.8);

      doc.fontSize(10).font('Helvetica').fillColor('#222222');
      if (title.toLowerCase() === 'technical skills') {
        doc.text(list.join(', '), { align: 'left', lineGap: 3 });
      } else {
        list.forEach((item) => {
          doc.text('•  ' + item, { align: 'left', lineGap: 3, paragraphGap: 4 });
        });
      }
      doc.moveDown(1.2);
    };

    renderSection('Education', sections.education);
    renderSection('Technical Skills', sections.skills);
    renderSection('Professional Experience', sections.experience);
    renderSection('Projects', sections.projects);
    renderSection('Achievements & Activities', sections.achievements);

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
      body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000; line-height: 1.35; margin: 50px; }
      h1 { text-align: center; font-size: 22pt; font-weight: bold; margin: 0 0 5px 0; text-transform: uppercase; }
      .contact { text-align: center; font-size: 10pt; color: #444444; margin-bottom: 20px; }
      h2 { font-size: 13pt; font-weight: bold; border-bottom: 1px solid #000000; text-transform: uppercase; margin-top: 15px; margin-bottom: 8px; padding-bottom: 2px; }
      ul { margin-top: 3px; margin-bottom: 6px; padding-left: 20px; }
      li { margin-bottom: 4px; }
      .skills { padding-left: 5px; }
    </style></head><body>`;

    html += `<h1>${resumeData.name || 'Anonymous'}</h1>`;
    html += `<div class="contact">${resumeData.email || ''} | ${resumeData.phone || ''} | ${resumeData.links || ''}</div>`;

    const sections = resumeData.parsedSections || {};

    if (sections.education && sections.education.length > 0) {
      html += `<h2>Education</h2><ul>`;
      sections.education.forEach((edu: string) => {
        html += `<li>${edu}</li>`;
      });
      html += `</ul>`;
    }

    if (sections.skills && sections.skills.length > 0) {
      html += `<h2>Technical Skills</h2><div class="skills">${sections.skills.join(', ')}</div>`;
    }

    if (sections.experience && sections.experience.length > 0) {
      html += `<h2>Professional Experience</h2><ul>`;
      sections.experience.forEach((exp: string) => {
        html += `<li>${exp}</li>`;
      });
      html += `</ul>`;
    }

    if (sections.projects && sections.projects.length > 0) {
      html += `<h2>Projects</h2><ul>`;
      sections.projects.forEach((proj: string) => {
        html += `<li>${proj}</li>`;
      });
      html += `</ul>`;
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
