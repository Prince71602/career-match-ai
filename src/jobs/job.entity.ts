import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class JobSkill {
  skill!: string;
  confidence?: number;
}

export class ExperienceRequirement {
  minimumYears!: number;
  source?: string;
}

export class JobRequirements {
  requiredSkills!: JobSkill[];
  preferredSkills!: JobSkill[];
  responsibilities!: string[];
  experienceRequirement!: ExperienceRequirement | null;
  educationRequirements!: string[];
  certificationRequirements!: string[];
}

@Schema({ timestamps: true, collection: 'jobs' })
export class JobEntity {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ type: String, default: null })
  title!: string | null;

  @Prop({ type: String, default: null })
  company!: string | null;

  @Prop({ type: String, required: true })
  rawText!: string;

  @Prop({ type: Object, required: true })
  requirements!: JobRequirements;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
}

export type JobDocument = HydratedDocument<JobEntity>;
export const JobSchema = SchemaFactory.createForClass(JobEntity);
