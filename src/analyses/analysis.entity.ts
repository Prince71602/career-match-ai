import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AnalysisResult } from '../comparison/comparison.service';

@Schema({ timestamps: true, collection: 'analyses' })
export class AnalysisEntity {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ type: String, required: true, index: true })
  resumeId!: string;

  @Prop({ type: String, required: true, index: true })
  jobId!: string;

  @Prop({ type: Object, required: true })
  result!: AnalysisResult;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
}

export type AnalysisDocument = HydratedDocument<AnalysisEntity>;
export const AnalysisSchema = SchemaFactory.createForClass(AnalysisEntity);
