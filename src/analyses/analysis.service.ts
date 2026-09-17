import { Injectable, NotFoundException } from '@nestjs/common';
import { ComparisonService, SkillMatch } from '../comparison/comparison.service';
import { SkillNormalizer } from '../comparison/skill-normalizer';
import { ResumeService } from '../resumes/resume.service';
import { JobService } from '../jobs/job.service';

export interface AnalysisInput {
  resumeId: string;
  jobId: string;
}

@Injectable()
export class AnalysisService {
  private readonly comparisonService = new ComparisonService(new SkillNormalizer());

  constructor(
    private readonly resumeService: ResumeService,
    private readonly jobService: JobService,
  ) {}

  async create({ resumeId, jobId }: AnalysisInput) {
    const resume = await this.resumeService.findById(resumeId);
    const job = await this.jobService.findById(jobId);

    const candidateProfile = resume.candidateProfile ?? {
      fullName: null,
      email: null,
      phone: null,
      location: null,
      summary: null,
      skills: Array.from(new Set((resume.rawText.match(/[A-Za-z][A-Za-z+.#/\-]*/g) ?? []).slice(0, 10))),
      experience: [],
      education: [],
      certifications: [],
      projects: [],
    };

    const result = this.comparisonService.compare(candidateProfile, job.requirements);

    return {
      id: `${resumeId}-${jobId}`,
      summary: result.summary,
      matchedSkills: result.matchedSkills,
      relatedSkills: result.relatedSkills,
      missingRequiredSkills: result.missingRequiredSkills,
      missingPreferredSkills: result.missingPreferredSkills,
      experienceAnalysis: result.experienceAnalysis,
      recommendations: result.recommendations,
    };
  }
}
