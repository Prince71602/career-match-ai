import { BadRequestException, Injectable } from '@nestjs/common';
import { DocxParser } from './docx.parser';
import { DocumentParser, DocumentType } from './document-parser';
import { PdfParser } from './pdf.parser';

@Injectable()
export class DocumentParserService {
  private readonly parsers: DocumentParser[] = [new PdfParser(), new DocxParser()];

  async extract(buffer: Buffer): Promise<{ type: DocumentType; text: string }> {
    const parser = this.parsers.find((candidate) => candidate.canParse(buffer));

    if (!parser) {
      throw new BadRequestException('Only valid PDF or DOCX files are supported.');
    }

    try {
      const text = (await parser.extractText(buffer)).replace(/\s+/g, ' ').trim();

      if (!text) {
        throw new BadRequestException('The resume does not contain readable text.');
      }

      return { type: parser.type, text };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('The resume could not be parsed.');
    }
  }
}
