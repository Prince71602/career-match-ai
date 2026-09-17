import mammoth = require('mammoth');
import { DocumentParser } from './document-parser';

export class DocxParser implements DocumentParser {
  readonly type = 'docx' as const;

  canParse(buffer: Buffer): boolean {
    return buffer.subarray(0, 4).toString('binary') === 'PK\x03\x04';
  }

  async extractText(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
