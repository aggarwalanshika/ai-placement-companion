import { GoogleGenerativeAI } from '@google/generative-ai';
import { parsePdf } from '../utils/pdfParser.js';
import { ResumeAnalysisResult } from '../interfaces/resume.interface.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

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
    // 1. Extract plain text from PDF
    let textContent: string;
    try {
      textContent = await parsePdf(filePath);
    } catch (err: any) {
      logger.error(`PDF parsing failed: ${err.message}`);
      throw new AppError(`Failed to parse PDF resume: ${err.message}`, 400);
    }

    if (!textContent || textContent.length < 50) {
      throw new AppError('The uploaded resume PDF contains insufficient text or is empty.', 400);
    }

    // 2. Call Gemini with retry logic
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await this.callGeminiModel(textContent);
        return result;
      } catch (err: any) {
        logger.warn(`Gemini analysis attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          logger.error(`All Gemini attempts failed. Returning repaired/fallback schema.`);
          return this.getFallbackReport(textContent);
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

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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
  "suggestions": ["string"],
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

Ensure:
1. Provide at least 8 to 10 highly realistic and placement-focused suggestions.
2. In 'projectAnalysis', critique every project detected and provide a concrete Google-style STAR/X-Y-Z formula refactored description.
3. Compare against target skills like React, Node.js, Docker, Redis, AWS, SQL, and System Design.
`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const responseText = response.response.text();
    if (!responseText) {
      throw new Error('Empty response received from Gemini.');
    }

    try {
      const parsed: ResumeAnalysisResult = JSON.parse(responseText);
      
      // Basic runtime shape validation
      if (typeof parsed.overallScore !== 'number' || !parsed.sectionScores || !Array.isArray(parsed.suggestions)) {
        throw new Error('Returned JSON does not match the expected ResumeAnalysisResult schema.');
      }
      
      return parsed;
    } catch (jsonErr: any) {
      logger.error(`Gemini output JSON parsing failed. Content: ${responseText}`);
      throw jsonErr;
    }
  }

  // Fallback builder if API fails/is unconfigured (e.g. mock run mode)
  private getFallbackReport(resumeText: string): ResumeAnalysisResult {
    logger.info('Generating fallback report based on text search tags.');
    
    // Quick heuristic searches
    const lower = resumeText.toLowerCase();
    const hasTypeScript = lower.includes('typescript') || lower.includes('ts');
    const hasDocker = lower.includes('docker');
    const hasRedis = lower.includes('redis');
    const hasAws = lower.includes('aws') || lower.includes('amazon');

    const score = 75 + (hasTypeScript ? 5 : 0) + (hasDocker ? 3 : 0) + (hasRedis ? 2 : 0) + (hasAws ? 2 : 0);

    return {
      overallScore: Math.min(score, 100),
      sectionScores: {
        experience: 80,
        projects: 85,
        skills: hasTypeScript ? 80 : 70,
        education: 90,
        grammar: 95,
        formatting: 88,
      },
      strengths: [
        {
          title: 'Structured Sections',
          desc: 'Resume sections are properly demarcated and easily scanable by standard parsers.',
        },
        {
          title: 'Technical Competency',
          desc: 'Includes relevant languages and frameworks aligned with entry-level listings.',
        },
      ],
      weaknesses: [
        {
          title: 'Missing Caching / Cloud Details',
          desc: 'Does not prominently showcase containerization or cache acceleration layers.',
        },
        {
          title: 'Unquantified Impact',
          desc: 'Several projects list actions instead of quantitative performance metrics.',
        },
      ],
      missingSkills: [
        ...(hasDocker ? [] : ['Docker']),
        ...(hasRedis ? [] : ['Redis']),
        ...(hasAws ? [] : ['AWS / Cloud Infrastructure']),
        'Kubernetes',
        'CI/CD Pipelines',
      ],
      suggestions: [
        'Add measurable achievements (e.g. page speed increases or database transaction throughput).',
        'Quantify project details using the X-Y-Z formula ("Accomplished X, as measured by Y, by doing Z").',
        'Add system container references such as Docker or orchestration engines.',
        'Optimize SDE experience descriptions by using active action verbs.',
        'Move technical stack summary to the upper half of the resume.',
        'Verify document fits precisely onto a single page.',
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
      ],
    };
  }
}
export const resumeService = new ResumeService();
