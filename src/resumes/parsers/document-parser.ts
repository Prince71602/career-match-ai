export type DocumentType = 'pdf' | 'docx';

export interface DocumentParser {
  readonly type: DocumentType;

  canParse(buffer: Buffer): boolean;

  extractText(buffer: Buffer): Promise<string>;
}
