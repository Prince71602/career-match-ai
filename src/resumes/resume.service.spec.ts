import { BadRequestException } from '@nestjs/common';
import { DocumentParserService } from './parsers/document-parser.service';
import { ResumeService } from './resume.service';
import { InMemoryResumeStore } from './resume.store';
import { AiService } from '../ai/ai.service';

describe('ResumeService', () => {
  it('stores parsed resume text and returns the API contract', async () => {
    const parser = {
      extract: jest.fn().mockResolvedValue({ type: 'pdf', text: 'Prince Delima React TypeScript' }),
    } as unknown as DocumentParserService;
    const ai = { extractResumeProfile: jest.fn().mockResolvedValue(null) } as unknown as AiService;
    const service = new ResumeService(parser, new InMemoryResumeStore(), ai);

    const result = await service.create('test-user', {
      buffer: Buffer.from('%PDF-1.7'),
      originalname: 'resume.pdf',
    } as Express.Multer.File);

    expect(result).toEqual({
      id: expect.any(String),
      fileName: 'resume.pdf',
      status: 'PROCESSED',
    });
    expect((await service.findById(result.id, 'test-user')).rawText).toContain('React');
  });

  it('rejects a missing file', async () => {
    const parser = {
      extract: jest.fn(),
    } as unknown as DocumentParserService;
    const ai = { extractResumeProfile: jest.fn().mockResolvedValue(null) } as unknown as AiService;
    const service = new ResumeService(parser, new InMemoryResumeStore(), ai);

    await expect(service.create('test-user')).rejects.toBeInstanceOf(BadRequestException);
    expect(parser.extract).not.toHaveBeenCalled();
  });
});
