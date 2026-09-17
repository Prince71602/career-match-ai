import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobDocument, JobEntity } from './job.entity';
import type { JobRecord } from './job.service';

export const JOB_STORE = Symbol('JOB_STORE');

export interface JobStore {
  create(job: JobRecord): Promise<JobRecord>;
  findById(id: string): Promise<JobRecord | undefined>;
}

export class InMemoryJobStore implements JobStore {
  private readonly jobs = new Map<string, JobRecord>();

  async create(job: JobRecord): Promise<JobRecord> {
    this.jobs.set(job.id, job);
    return job;
  }

  async findById(id: string): Promise<JobRecord | undefined> {
    return this.jobs.get(id);
  }
}

export class MongoJobStore implements JobStore {
  constructor(
    @InjectModel(JobEntity.name)
    private readonly jobModel: Model<JobDocument>,
  ) {}

  async create(job: JobRecord): Promise<JobRecord> {
    const document = await this.jobModel.create(job);
    return this.toRecord(document);
  }

  async findById(id: string): Promise<JobRecord | undefined> {
    const document = await this.jobModel.findOne({ id }).exec();
    return document ? this.toRecord(document) : undefined;
  }

  private toRecord(document: JobDocument): JobRecord {
    return {
      id: document.id,
      title: document.title,
      company: document.company,
      rawText: document.rawText,
      requirements: document.requirements,
      createdAt: document.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
