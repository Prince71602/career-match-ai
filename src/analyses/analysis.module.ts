import { Module } from '@nestjs/common';
import { JobModule } from '../jobs/job.module';
import { ResumeModule } from '../resumes/resume.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisEntity, AnalysisSchema } from './analysis.entity';
import { analysisStoreProvider } from './analysis.providers';
import { AnalysisService } from './analysis.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ResumeModule,
    JobModule,
    AuthModule,
    ...(process.env.MONGODB_URI
      ? [MongooseModule.forFeature([{ name: AnalysisEntity.name, schema: AnalysisSchema }])]
      : []),
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, analysisStoreProvider],
  exports: [AnalysisService],
})
export class AnalysisModule {}
