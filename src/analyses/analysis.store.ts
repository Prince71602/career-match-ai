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
  findByUser(userId: string): Promise<AnalysisRecord[]>;
  delete(userId: string, analysisId: string): Promise<boolean>;
}

export class InMemoryAnalysisStore implements AnalysisStore {
  private readonly analyses = new Map<string, AnalysisRecord>();

  async create(record: AnalysisRecord): Promise<AnalysisRecord> {
    this.analyses.set(record.id, record);
    return record;
  }

  async findByUser(userId: string): Promise<AnalysisRecord[]> {
    return Array.from(this.analyses.values()).filter((analysis) => analysis.userId === userId);
  }

  async delete(userId: string, analysisId: string): Promise<boolean> {
    const record = this.analyses.get(analysisId);
    if (!record || record.userId !== userId) return false;
    this.analyses.delete(analysisId);
    return true;
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

  async findByUser(userId: string): Promise<AnalysisRecord[]> {
    const documents = await this.analysisModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return documents.map((document) => ({
      id: document.id,
      userId: document.userId,
      resumeId: document.resumeId,
      jobId: document.jobId,
      result: document.result,
      createdAt: document.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async delete(userId: string, analysisId: string): Promise<boolean> {
    const deleted = await this.analysisModel.findOneAndDelete({ id: analysisId, userId }).exec();
    return !!deleted;
  }
}
