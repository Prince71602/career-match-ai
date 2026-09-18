import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DocumentParserService } from './parsers/document-parser.service';
import { RESUME_STORE } from './resume.store';
import type { ResumeStore } from './resume.store';
import { AiService } from '../ai/ai.service';
import type { CandidateProfile } from '../comparison/comparison.service';

export interface ResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  rawText: string;
  createdAt: string;
  candidateProfile: CandidateProfile | null;
}

@Injectable()
export class ResumeService {
  constructor(
    @Inject(DocumentParserService) private readonly documentParser: DocumentParserService,
    @Inject(RESUME_STORE) private readonly resumeStore: ResumeStore,
    @Inject(AiService) private readonly aiService: AiService,
  ) {}

  async create(userId: string, file?: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('A resume file is required.');
    }

    const parsed = await this.documentParser.extract(file.buffer);
    const resume: ResumeRecord = {
      id: randomUUID(),
      userId,
      fileName: file.originalname,
      fileType: parsed.type,
      rawText: parsed.text,
      createdAt: new Date().toISOString(),
      candidateProfile: await this.aiService.extractResumeProfile(parsed.text),
    };

    await this.resumeStore.create(resume);

    return {
      id: resume.id,
      fileName: resume.fileName,
      status: 'PROCESSED' as const,
    };
  }

  async findById(id: string, userId: string): Promise<ResumeRecord> {
    const resume = await this.resumeStore.findById(id);

    if (!resume || resume.userId !== userId) {
      throw new NotFoundException('Resume not found.');
    }

    return resume;
  }
}
