import { JobService } from './job.service';
import { InMemoryJobStore } from './job.store';

describe('JobService', () => {
  it('stores a job description and extracts requirements', async () => {
    const service = new JobService(new InMemoryJobStore());

    const result = await service.create({
      description:
        'We are looking for a Full Stack Developer with React, TypeScript, and 3 years of experience. Preferred: Docker. Responsibilities: build APIs and modern web apps.',
    } as any);

    expect(result).toEqual({
      id: expect.any(String),
      title: 'Full Stack Developer',
      status: 'PROCESSED',
    });

    const job = await service.findById(result.id);
    expect(job.requirements.requiredSkills.some((skill) => skill.skill === 'React')).toBe(true);
    expect(job.requirements.preferredSkills.some((skill) => skill.skill === 'Docker')).toBe(true);
    expect(job.requirements.experienceRequirement).toMatchObject({ minimumYears: 3 });
  });
});
