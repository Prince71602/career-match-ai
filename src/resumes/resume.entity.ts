import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'resumes' })
export class ResumeEntity {
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ type: String, required: true })
  fileName!: string;

  @Prop({ required: true, enum: ['pdf', 'docx'] })
  fileType!: 'pdf' | 'docx';

  @Prop({ required: true })
  rawText!: string;

  @Prop({ type: Object, default: null })
  candidateProfile!: null;

  createdAt?: Date;
}

export type ResumeDocument = HydratedDocument<ResumeEntity>;
export const ResumeSchema = SchemaFactory.createForClass(ResumeEntity);
