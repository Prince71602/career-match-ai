import { ComparisonService } from '../comparison/comparison.service';
import { SkillNormalizer } from '../comparison/skill-normalizer';

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
