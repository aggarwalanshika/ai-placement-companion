import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { cleanResumeText } from './cleaner.js';

export async function parsePdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  
  // Use unpkg CDN mapping URLs to fetch predefined Adobe CMaps and standard font data.
  // This preserves UTF-8/Unicode mappings and prevents garbage character corruptions.
  const parser = new PDFParse({
    data: uint8Array,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.4.296/standard_fonts/',
    verbosity: 0 // Suppress verbose pdfjs console warnings
  });
  
  const result = await parser.getText();
  
  if (!result || !result.text) {
    throw new Error('Could not parse text from PDF or PDF is empty.');
  }
  
  // Apply our robust text cleaner to filter any remaining formatting artifacts or stray characters.
  return cleanResumeText(result.text.trim());
}
