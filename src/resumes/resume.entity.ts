import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { CandidateProfile } from '../comparison/comparison.service';

@Schema({ timestamps: true, collection: 'resumes' })
export class ResumeEntity {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ type: String, required: true })
  fileName!: string;

  @Prop({ type: String, required: true, enum: ['pdf', 'docx'] })
  fileType!: 'pdf' | 'docx';

  @Prop({ type: String, required: true })
  rawText!: string;

  @Prop({ type: Object, default: null })
  candidateProfile!: CandidateProfile | null;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
}

export type ResumeDocument = HydratedDocument<ResumeEntity>;
export const ResumeSchema = SchemaFactory.createForClass(ResumeEntity);
