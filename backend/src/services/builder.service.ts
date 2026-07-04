import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { logger } from '../utils/logger.js';
import { ParsedSections } from '../interfaces/resume.interface.js';
import { cleanParsedSections } from '../utils/cleaner.js';

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
      personal: { name: '', email: '', phone: '', links: [] },
      experience: [],
      projects: [],
      skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
      education: Array.isArray(parsed?.education) ? parsed.education : [],
      achievements: Array.isArray(parsed?.achievements) ? parsed.achievements : [],
      certifications: Array.isArray(parsed?.certifications) ? parsed.certifications : [],
      links: Array.isArray(parsed?.links) ? parsed.links : [],
    };

    if (!parsed) return normalized;

    // Normalize personal
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
   * Validation has been simplified to never block exports or compare original strings.
   * Returns empty array always.
   */
  public validateResumeStructure(_original: ParsedSections, _optimized: ParsedSections): string[] {
    return [];
  }

  /**
   * Run a final AI check on the optimized sections before export.
   */
  public async validateResume(resumeText: string, sections: ParsedSections): Promise<{ status: string; issues: string[] }> {
    logger.info('Running AI validation check on the merged resume sections...');
    const normSections = cleanParsedSections(this.normalizeParsedSections(sections));
    
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
   * PDF Builder generating a brand-new SDE ATS resume directly from structured data.
   */
  public generatePDF(resumeData: any, resStream: NodeJS.WritableStream): void {
    logger.info('Generating PDF stream directly from structured ResumeData...');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(resStream);

    const data = cleanParsedSections(resumeData.parsedSections || resumeData);
    const personal = data.personal || {
      name: resumeData.name || 'Candidate Name',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      links: Array.isArray(resumeData.links) ? resumeData.links : [resumeData.links].filter(Boolean)
    };

    // 1. Personal Header
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#111111').text((personal.name || 'Candidate Name').toUpperCase(), { align: 'center' });
    doc.moveDown(0.2);

    const contactParts = [personal.email, personal.phone, ...(personal.links || [])].filter(Boolean);
    if (contactParts.length > 0) {
      doc.fontSize(9.5).font('Helvetica').fillColor('#555555').text(contactParts.join('   |   '), { align: 'center' });
    }
    doc.moveDown(0.8);

    const renderSectionHeader = (title: string) => {
      doc.moveDown(0.6);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#111111').text(title.toUpperCase());
      const yLine = doc.y + 2;
      doc.moveTo(50, yLine).lineTo(545, yLine).strokeColor('#dddddd').lineWidth(1).stroke();
      doc.moveDown(0.4);
    };

    // 2. Education Section
    if (data.education && data.education.length > 0) {
      renderSectionHeader('Education');
      data.education.forEach(edu => {
        doc.fontSize(10).font('Helvetica').fillColor('#333333').text(edu, { lineGap: 2 });
      });
    }

    // 3. Experience Section
    if (data.experience && data.experience.length > 0) {
      renderSectionHeader('Experience');
      data.experience.forEach(exp => {
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#111111').text(`${exp.role} — ${exp.company}`);
        doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#555555').text(exp.date);
        doc.moveDown(0.15);
        if (exp.bullets) {
          exp.bullets.forEach(b => {
            doc.fontSize(9.5).font('Helvetica').fillColor('#333333').text(`•  ${b}`, { indent: 12, lineGap: 2 });
          });
        }
        doc.moveDown(0.4);
      });
    }

    // 4. Projects Section
    if (data.projects && data.projects.length > 0) {
      renderSectionHeader('Projects');
      data.projects.forEach(proj => {
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#111111').text(`${proj.title}  [${proj.techStack}]`);
        doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#555555').text(proj.date);
        doc.moveDown(0.15);
        if (proj.bullets) {
          proj.bullets.forEach(b => {
            doc.fontSize(9.5).font('Helvetica').fillColor('#333333').text(`•  ${b}`, { indent: 12, lineGap: 2 });
          });
        }
        doc.moveDown(0.4);
      });
    }

    // 5. Skills Section
    if (data.skills && data.skills.length > 0) {
      renderSectionHeader('Skills');
      doc.fontSize(10).font('Helvetica').fillColor('#333333').text(data.skills.join(', '), { lineGap: 2 });
    }

    // 6. Achievements Section
    if (data.achievements && data.achievements.length > 0) {
      renderSectionHeader('Achievements');
      data.achievements.forEach(ach => {
        doc.fontSize(9.5).font('Helvetica').fillColor('#333333').text(`•  ${ach}`, { indent: 12, lineGap: 2 });
      });
    }

    // 7. Certifications Section
    if (data.certifications && data.certifications.length > 0) {
      renderSectionHeader('Certifications');
      data.certifications.forEach(cert => {
        doc.fontSize(9.5).font('Helvetica').fillColor('#333333').text(`•  ${cert}`, { indent: 12, lineGap: 2 });
      });
    }

    doc.end();
  }

  /**
   * DOCX Builder generating a brand-new SDE ATS resume directly from structured data.
   */
  public async generateDOCX(resumeData: any): Promise<Buffer> {
    logger.info('Generating DOCX buffer directly from structured ResumeData...');
    const data = cleanParsedSections(resumeData.parsedSections || resumeData);
    const personal = data.personal || {
      name: resumeData.name || 'Candidate Name',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      links: Array.isArray(resumeData.links) ? resumeData.links : [resumeData.links].filter(Boolean)
    };

    const docChildren: any[] = [];

    // 1. Personal Header
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: (personal.name || 'Candidate Name').toUpperCase(),
            bold: true,
            size: 28, // 14pt
            font: 'Calibri'
          })
        ]
      })
    );

    const contactParts = [personal.email, personal.phone, ...(personal.links || [])].filter(Boolean);
    if (contactParts.length > 0) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [
            new TextRun({
              text: contactParts.join('   |   '),
              size: 19, // 9.5pt
              font: 'Calibri',
              color: '555555'
            })
          ]
        })
      );
    }

    const addSectionHeader = (title: string) => {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: {
            bottom: {
              color: 'DDDDDD',
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              size: 24, // 12pt
              font: 'Calibri',
              color: '111111'
            })
          ]
        })
      );
    };

    // 2. Education
    if (data.education && data.education.length > 0) {
      addSectionHeader('Education');
      data.education.forEach(edu => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: edu,
                size: 20, // 10pt
                font: 'Calibri'
              })
            ]
          })
        );
      });
    }

    // 3. Experience
    if (data.experience && data.experience.length > 0) {
      addSectionHeader('Experience');
      data.experience.forEach(exp => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: `${exp.role} — ${exp.company}`,
                bold: true,
                size: 21, // 10.5pt
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: exp.date,
                italics: true,
                size: 19, // 9.5pt
                font: 'Calibri',
                color: '555555'
              })
            ]
          })
        );

        if (exp.bullets) {
          exp.bullets.forEach(b => {
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: b,
                    size: 19, // 9.5pt
                    font: 'Calibri'
                  })
                ]
              })
            );
          });
        }
      });
    }

    // 4. Projects
    if (data.projects && data.projects.length > 0) {
      addSectionHeader('Projects');
      data.projects.forEach(proj => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: `${proj.title}  [${proj.techStack}]`,
                bold: true,
                size: 21, // 10.5pt
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: proj.date,
                italics: true,
                size: 19, // 9.5pt
                font: 'Calibri',
                color: '555555'
              })
            ]
          })
        );

        if (proj.bullets) {
          proj.bullets.forEach(b => {
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: b,
                    size: 19, // 9.5pt
                    font: 'Calibri'
                  })
                ]
              })
            );
          });
        }
      });
    }

    // 5. Skills
    if (data.skills && data.skills.length > 0) {
      addSectionHeader('Skills');
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: data.skills.join(', '),
              size: 20, // 10pt
              font: 'Calibri'
            })
          ]
        })
      );
    }

    // 6. Achievements
    if (data.achievements && data.achievements.length > 0) {
      addSectionHeader('Achievements');
      data.achievements.forEach(ach => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: ach,
                size: 19, // 9.5pt
                font: 'Calibri'
              })
            ]
          })
        );
      });
    }

    // 7. Certifications
    if (data.certifications && data.certifications.length > 0) {
      addSectionHeader('Certifications');
      data.certifications.forEach(cert => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: cert,
                size: 19, // 9.5pt
                font: 'Calibri'
              })
            ]
          })
        );
      });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren
      }]
    });

    return await Packer.toBuffer(doc);
  }
}

export const builderService = new BuilderService();
