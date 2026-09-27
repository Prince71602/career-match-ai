import { ComparisonService } from '../comparison/comparison.service';
import { SkillNormalizer } from '../comparison/skill-normalizer';
import { AnalysisService } from './analysis.service';
import { InMemoryAnalysisStore } from './analysis.store';
import { ResumeService } from '../resumes/resume.service';
import { JobService } from '../jobs/job.service';
import { InMemoryResumeStore } from '../resumes/resume.store';
import { InMemoryJobStore } from '../jobs/job.store';
import { DocumentParserService } from '../resumes/parsers/document-parser.service';
import { AiService } from '../ai/ai.service';

describe('ComparisonService', () => {
  it('matches skills and flags missing requirements', () => {
    const service = new ComparisonService(new SkillNormalizer());

    const result = service.compare(
      {
        fullName: 'Prince Delima',
        email: null,
        phone: null,
        location: null,
        summary: 'Senior developer',
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: [{ company: 'Acme', position: 'Developer', startDate: '2022-01-01', endDate: '2024-01-01', description: ['Built apps'], technologies: ['React'] }],
        education: [],
        certifications: [],
        projects: [],
      },
      {
        requiredSkills: [{ skill: 'React' }, { skill: 'Docker' }],
        preferredSkills: [{ skill: 'AWS' }],
        responsibilities: ['Build software'],
        experienceRequirement: { minimumYears: 3 },
        educationRequirements: [],
        certificationRequirements: [],
      },
    );

    expect(result.matchedSkills.some((match) => match.skill === 'React')).toBe(true);
    expect(result.missingRequiredSkills.some((match) => match.skill === 'Docker')).toBe(true);
    expect(result.summary).toContain('React');
  });
});

describe('AnalysisService', () => {
  it('returns saved analyses for a user', async () => {
    const resumeService = new ResumeService(
      { extract: jest.fn().mockResolvedValue({ type: 'pdf', text: 'React TypeScript' }) } as unknown as DocumentParserService,
      new InMemoryResumeStore(),
      { extractResumeProfile: jest.fn().mockResolvedValue({ fullName: 'Test User', email: null, phone: null, location: null, summary: null, skills: ['React', 'TypeScript'], experience: [], education: [], certifications: [], projects: [] }) } as unknown as AiService,
    );
    const jobService = new JobService(new InMemoryJobStore(), { extractJobRequirements: jest.fn().mockResolvedValue({ requiredSkills: [{ skill: 'React' }], preferredSkills: [], responsibilities: ['Build'], experienceRequirement: null, educationRequirements: [], certificationRequirements: [] }) } as unknown as AiService);
    const analysisStore = new InMemoryAnalysisStore();
    const service = new AnalysisService(resumeService, jobService, analysisStore);

    const resume = await resumeService.create('user-1', { buffer: Buffer.from('pdf'), originalname: 'resume.pdf' } as Express.Multer.File);
    const job = await jobService.create('user-1', { description: 'We require React.' } as any);
    await service.create('user-1', { resumeId: resume.id, jobId: job.id });

    const analyses = await service.findByUser('user-1');

    expect(analyses).toHaveLength(1);
    expect(analyses[0].resumeId).toBe(resume.id);
    expect(analyses[0].jobId).toBe(job.id);
  });

  it('deletes a saved analysis for a user', async () => {
    const resumeService = new ResumeService(
      { extract: jest.fn().mockResolvedValue({ type: 'pdf', text: 'React TypeScript' }) } as unknown as DocumentParserService,
      new InMemoryResumeStore(),
      { extractResumeProfile: jest.fn().mockResolvedValue({ fullName: 'Test User', email: null, phone: null, location: null, summary: null, skills: ['React', 'TypeScript'], experience: [], education: [], certifications: [], projects: [] }) } as unknown as AiService,
    );
    const jobService = new JobService(new InMemoryJobStore(), { extractJobRequirements: jest.fn().mockResolvedValue({ requiredSkills: [{ skill: 'React' }], preferredSkills: [], responsibilities: ['Build'], experienceRequirement: null, educationRequirements: [], certificationRequirements: [] }) } as unknown as AiService);
    const service = new AnalysisService(resumeService, jobService, new InMemoryAnalysisStore());

    const resume = await resumeService.create('user-1', { buffer: Buffer.from('pdf'), originalname: 'resume.pdf' } as Express.Multer.File);
    const job = await jobService.create('user-1', { description: 'We require React.' } as any);
    const created = await service.create('user-1', { resumeId: resume.id, jobId: job.id });

    await service.delete('user-1', created.id);

    await expect(service.findByUser('user-1')).resolves.toHaveLength(0);
  });
});
