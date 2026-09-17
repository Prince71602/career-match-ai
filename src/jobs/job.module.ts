import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobController } from './job.controller';
import { JobEntity, JobSchema } from './job.entity';
import { jobStoreProvider } from './job.providers';
import { JobService } from './job.service';
import { JOB_STORE } from './job.store';

@Module({
  imports: [
    ...(process.env.MONGODB_URI ? [MongooseModule.forFeature([{ name: JobEntity.name, schema: JobSchema }])] : []),
  ],
  controllers: [JobController],
  providers: [JobService, jobStoreProvider, ...(process.env.MONGODB_URI ? [] : [])],
  exports: [JobService],
})
export class JobModule {}
