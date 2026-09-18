import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResumeDocument, ResumeEntity } from './resume.entity';
import type { ResumeRecord } from './resume.service';

export const RESUME_STORE = Symbol('RESUME_STORE');

export interface ResumeStore {
  create(resume: ResumeRecord): Promise<ResumeRecord>;

  findById(id: string): Promise<ResumeRecord | undefined>;
}

export class InMemoryResumeStore implements ResumeStore {
  private readonly resumes = new Map<string, ResumeRecord>();

  async create(resume: ResumeRecord): Promise<ResumeRecord> {
    this.resumes.set(resume.id, resume);
    return resume;
  }

  async findById(id: string): Promise<ResumeRecord | undefined> {
    return this.resumes.get(id);
  }
}

export class MongoResumeStore implements ResumeStore {
  constructor(
    @InjectModel(ResumeEntity.name)
    private readonly resumeModel: Model<ResumeDocument>,
  ) {}

  async create(resume: ResumeRecord): Promise<ResumeRecord> {
    const document = await this.resumeModel.create(resume);
    return this.toRecord(document);
  }

  async findById(id: string): Promise<ResumeRecord | undefined> {
    const document = await this.resumeModel.findOne({ id }).exec();
    return document ? this.toRecord(document) : undefined;
  }

  private toRecord(document: ResumeDocument): ResumeRecord {
    return {
      id: document.id,
      userId: document.userId,
      fileName: document.fileName,
      fileType: document.fileType,
      rawText: document.rawText,
      createdAt: document.createdAt?.toISOString() ?? new Date().toISOString(),
      candidateProfile: document.candidateProfile,
    };
  }
}
