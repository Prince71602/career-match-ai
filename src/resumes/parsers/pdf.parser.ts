import { PDFParse } from 'pdf-parse';
import { DocumentParser } from './document-parser';

export class PdfParser implements DocumentParser {
  readonly type = 'pdf' as const;

  canParse(buffer: Buffer): boolean {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  async extractText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
}
