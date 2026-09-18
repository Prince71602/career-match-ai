import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalysisDocument, AnalysisEntity } from './analysis.entity';
import type { AnalysisResult } from '../comparison/comparison.service';

export const ANALYSIS_STORE = Symbol('ANALYSIS_STORE');

export interface AnalysisRecord {
  id: string;
  userId: string;
  resumeId: string;
  jobId: string;
  result: AnalysisResult;
  createdAt: string;
}

export interface AnalysisStore {
  create(record: AnalysisRecord): Promise<AnalysisRecord>;
}

export class InMemoryAnalysisStore implements AnalysisStore {
  private readonly analyses = new Map<string, AnalysisRecord>();

  async create(record: AnalysisRecord): Promise<AnalysisRecord> {
    this.analyses.set(record.id, record);
    return record;
  }
}

export class MongoAnalysisStore implements AnalysisStore {
  constructor(
    @InjectModel(AnalysisEntity.name)
    private readonly analysisModel: Model<AnalysisDocument>,
  ) {}

  async create(record: AnalysisRecord): Promise<AnalysisRecord> {
    const document = await this.analysisModel.create(record);
    return {
      id: document.id,
      userId: document.userId,
      resumeId: document.resumeId,
      jobId: document.jobId,
      result: document.result,
      createdAt: document.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
