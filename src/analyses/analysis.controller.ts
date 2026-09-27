import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('analyses')
@UseGuards(AuthGuard)
export class AnalysisController {
  constructor(@Inject(AnalysisService) private readonly analysisService: AnalysisService) {}

  @Get()
  getAll(@Req() request: AuthenticatedRequest) {
    return this.analysisService.findByUser(request.user.id);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: { resumeId: string; jobId: string }) {
    return this.analysisService.create(request.user.id, body);
  }

  @Delete(':id')
  delete(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.analysisService.delete(request.user.id, id);
  }
}
