import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  create(@Body() body: { description?: string }) {
    return this.jobService.create(body);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.jobService.findById(id);
  }
}
