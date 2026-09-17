import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalysisModule } from './analyses/analysis.module';
import { HealthModule } from './health/health.module';
import { JobModule } from './jobs/job.module';
import { ResumeModule } from './resumes/resume.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(process.env.MONGODB_URI ? [MongooseModule.forRoot(process.env.MONGODB_URI)] : []),
    HealthModule,
    ResumeModule,
    JobModule,
    AnalysisModule,
  ],
})
export class AppModule {}
