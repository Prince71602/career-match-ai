import { Module } from '@nestjs/common';
import { JobModule } from '../jobs/job.module';
import { ResumeModule } from '../resumes/resume.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [ResumeModule, JobModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
