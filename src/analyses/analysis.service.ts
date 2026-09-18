import { Inject, Injectable } from '@nestjs/common';
import { ComparisonService, SkillMatch } from '../comparison/comparison.service';
import { SkillNormalizer } from '../comparison/skill-normalizer';
import { ResumeService } from '../resumes/resume.service';
import { JobService } from '../jobs/job.service';
import { ANALYSIS_STORE } from './analysis.store';
import type { AnalysisStore } from './analysis.store';

export interface AnalysisInput {
  resumeId: string;
  jobId: string;
}

@Injectable()
export class AnalysisService {
  private readonly comparisonService = new ComparisonService(new SkillNormalizer());

  constructor(
    @Inject(ResumeService) private readonly resumeService: ResumeService,
    @Inject(JobService) private readonly jobService: JobService,
    @Inject(ANALYSIS_STORE) private readonly analysisStore: AnalysisStore,
  ) {}

  async create(userId: string, { resumeId, jobId }: AnalysisInput) {
    const resume = await this.resumeService.findById(resumeId, userId);
    const job = await this.jobService.findById(jobId, userId);

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

    const analysis = {
      id: `${resumeId}-${jobId}`,
      summary: result.summary,
      matchedSkills: result.matchedSkills,
      relatedSkills: result.relatedSkills,
      missingRequiredSkills: result.missingRequiredSkills,
      missingPreferredSkills: result.missingPreferredSkills,
      experienceAnalysis: result.experienceAnalysis,
      recommendations: result.recommendations,
    };

    await this.analysisStore.create({
      id: analysis.id,
      userId,
      resumeId,
      jobId,
      result: {
        summary: analysis.summary,
        matchedSkills: analysis.matchedSkills,
        relatedSkills: analysis.relatedSkills,
        missingRequiredSkills: analysis.missingRequiredSkills,
        missingPreferredSkills: analysis.missingPreferredSkills,
        experienceAnalysis: analysis.experienceAnalysis,
        educationAnalysis: result.educationAnalysis,
        recommendations: analysis.recommendations,
      },
      createdAt: new Date().toISOString(),
    });

    return analysis;
  }
}
