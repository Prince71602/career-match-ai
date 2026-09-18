import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('jobs')
@UseGuards(AuthGuard)
export class JobController {
  constructor(@Inject(JobService) private readonly jobService: JobService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: { description?: string }) {
    return this.jobService.create(request.user.id, body);
  }

  @Get(':id')
  getById(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.jobService.findById(id, request.user.id);
  }
}
