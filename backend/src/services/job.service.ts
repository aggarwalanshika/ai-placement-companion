import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/appError.js';

interface SubScores {
  skillsMatch: number;
  experienceMatch: number;
  projectMatch: number;
  educationMatch: number;
}

export interface JobMatchResult {
  overallMatchScore: number;
  subScores: SubScores;
  matchSummary: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  experienceAnalysis: string;
  educationAnalysis: string;
  projectAnalysis: string;
  atsCompatibility: string;
  resumeImprovements: string[];
  optimizedBulletPoints: string[];
  top10KeywordsToAdd: string[];
  hiringRecommendation: string;
  interviewProbability: 'High' | 'Medium' | 'Low';
  estimatedATSScoreAfterChanges: number;
}

export class JobService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY is not defined in the environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');
  }

  public async matchJob(resumeText: string, jobDescription: string): Promise<JobMatchResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MOCK_KEY') {
      throw new AppError('Gemini API key is not configured on the server.', 500);
    }

    logger.info('Gemini API is being called (Job Description Matching initiated)');

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `
You are an advanced SDE recruiter and placement screening system.
Compare the candidate's Resume Text against the target Job Description (JD).
Evaluate the match and recommend actions to optimize the resume.

Resume Text:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""

You MUST respond with a single, valid JSON object containing exactly the following schema. Do not output any preamble, explanation, or markdown wrappers.

JSON Schema:
{
  "overallMatchScore": number (0 to 100, representing general suitability),
  "subScores": {
    "skillsMatch": number (0 to 100),
    "experienceMatch": number (0 to 100),
    "projectMatch": number (0 to 100),
    "educationMatch": number (0 to 100)
  },
  "matchSummary": "string (1-2 sentences summarizing the match)",
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "experienceAnalysis": "string (analysis of experience compatibility)",
  "educationAnalysis": "string (analysis of education alignment)",
  "projectAnalysis": "string (critique of projects relative to JD needs)",
  "atsCompatibility": "string (general scan formatting recommendations)",
  "resumeImprovements": ["string (general bullet improvements)"],
  "optimizedBulletPoints": ["string (4 to 6 specific, refactored STAR/X-Y-Z description bullet points optimized directly for keywords in this JD)"],
  "top10KeywordsToAdd": ["string (10 essential keywords from the JD that are missing or sparse in the resume)"],
  "hiringRecommendation": "string (short executive summary of hiring suitability)",
  "interviewProbability": "High" | "Medium" | "Low",
  "estimatedATSScoreAfterChanges": number (0 to 100, must be higher than overallMatchScore)
}
`;

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const responseText = response.response.text();
        logger.info('Gemini response successfully received from Google servers for Job Match');

        if (!responseText) {
          throw new Error('Empty response received from Gemini.');
        }

        const parsed: JobMatchResult = JSON.parse(responseText.trim());

        // Basic runtime shape validation
        if (
          typeof parsed.overallMatchScore !== 'number' ||
          !parsed.subScores ||
          typeof parsed.subScores.skillsMatch !== 'number' ||
          !Array.isArray(parsed.matchedSkills) ||
          !Array.isArray(parsed.optimizedBulletPoints)
        ) {
          throw new Error('Returned JSON does not match the expected JobMatchResult schema.');
        }

        return parsed;
      } catch (err: any) {
        logger.warn(`Gemini job match attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          throw new AppError(`AI job description comparison failed: ${err.message}`, 500);
        }
      }
    }

    throw new AppError('Job matching failed unexpectedly.', 500);
  }
}

export const jobService = new JobService();
