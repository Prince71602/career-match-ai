import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DocumentParserService } from './parsers/document-parser.service';
import { RESUME_STORE, ResumeStore } from './resume.store';

export interface ResumeRecord {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  rawText: string;
  createdAt: string;
  candidateProfile: null;
}

@Injectable()
export class ResumeService {
  constructor(
    private readonly documentParser: DocumentParserService,
    @Inject(RESUME_STORE) private readonly resumeStore: ResumeStore,
  ) {}

  async create(file?: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('A resume file is required.');
    }

    const parsed = await this.documentParser.extract(file.buffer);
    const resume: ResumeRecord = {
      id: randomUUID(),
      fileName: file.originalname,
      fileType: parsed.type,
      rawText: parsed.text,
      createdAt: new Date().toISOString(),
      candidateProfile: null,
    };

    await this.resumeStore.create(resume);

    return {
      id: resume.id,
      fileName: resume.fileName,
      status: 'PROCESSED' as const,
    };
  }

  async findById(id: string): Promise<ResumeRecord> {
    const resume = await this.resumeStore.findById(id);

    if (!resume) {
      throw new NotFoundException('Resume not found.');
    }

    return resume;
  }
}
