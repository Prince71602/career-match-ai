import { Body, Controller, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analyses')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  create(@Body() body: { resumeId: string; jobId: string }) {
    return this.analysisService.create(body);
  }
}
