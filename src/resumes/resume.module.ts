import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { DocumentParserService } from './parsers/document-parser.service';
import { ResumeEntity, ResumeSchema } from './resume.entity';
import { resumeStoreProvider } from './resume.providers';
import { ResumeService } from './resume.service';
import { MongoResumeStore } from './resume.store';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AuthModule,
    AiModule,
    ...(process.env.MONGODB_URI
      ? [MongooseModule.forFeature([{ name: ResumeEntity.name, schema: ResumeSchema }])]
      : []),
  ],
  controllers: [ResumeController],
  providers: [
    DocumentParserService,
    ResumeService,
    resumeStoreProvider,
    ...(process.env.MONGODB_URI ? [MongoResumeStore] : []),
  ],
  exports: [ResumeService],
})
export class ResumeModule {}
