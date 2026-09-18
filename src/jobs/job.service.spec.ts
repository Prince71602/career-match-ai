import { JobService } from './job.service';
import { InMemoryJobStore } from './job.store';
import { AiService } from '../ai/ai.service';

describe('JobService', () => {
  it('stores a job description and extracts requirements', async () => {
    const ai = { extractJobRequirements: jest.fn().mockResolvedValue(null) } as unknown as AiService;
    const service = new JobService(new InMemoryJobStore(), ai);

    const result = await service.create('test-user', {
      description:
        'We are looking for a Full Stack Developer with React, TypeScript, and 3 years of experience. Preferred: Docker. Responsibilities: build APIs and modern web apps.',
    } as any);

    expect(result).toEqual({
      id: expect.any(String),
      title: 'Full Stack Developer',
      status: 'PROCESSED',
    });

    const job = await service.findById(result.id, 'test-user');
    expect(job.requirements.requiredSkills.some((skill) => skill.skill === 'React')).toBe(true);
    expect(job.requirements.preferredSkills.some((skill) => skill.skill === 'Docker')).toBe(true);
    expect(job.requirements.experienceRequirement).toMatchObject({ minimumYears: 3 });
  });
});
