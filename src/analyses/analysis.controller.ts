import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('analyses')
@UseGuards(AuthGuard)
export class AnalysisController {
  constructor(@Inject(AnalysisService) private readonly analysisService: AnalysisService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: { resumeId: string; jobId: string }) {
    return this.analysisService.create(request.user.id, body);
  }
}
