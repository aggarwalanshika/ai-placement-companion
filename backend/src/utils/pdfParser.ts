import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export async function parsePdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  
  const parser = new PDFParse(uint8Array);
  const result = await parser.getText();
  
  if (!result || !result.text) {
    throw new Error('Could not parse text from PDF or PDF is empty.');
  }
  
  return result.text.trim();
}
