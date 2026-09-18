import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ResumeService } from './resume.service';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumeController {
  constructor(@Inject(ResumeService) private readonly resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(@Req() request: AuthenticatedRequest, @UploadedFile() file?: Express.Multer.File) {
    return this.resumeService.create(request.user.id, file);
  }

  @Get(':id')
  getById(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.resumeService.findById(id, request.user.id);
  }
}
