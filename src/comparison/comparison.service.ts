import { SkillNormalizer } from './skill-normalizer';

export interface SkillMatch {
  skill: string;
  status: 'MATCHED' | 'RELATED' | 'NOT_FOUND';
  resumeEvidence: string | null;
  jobEvidence: string | null;
  confidence: number;
}

export interface WorkExperience {
  company: string | null;
  position: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string[];
  technologies: string[];
}

export interface Education {
  institution: string | null;
  degree: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface CandidateProfile {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: string[];
  projects: Array<{ name: string | null; description: string | null }>;
}

export interface JobSkill {
  skill: string;
  confidence?: number;
}

export interface ExperienceRequirement {
  minimumYears: number;
  source?: string;
}

export interface JobRequirements {
  requiredSkills: JobSkill[];
  preferredSkills: JobSkill[];
  responsibilities: string[];
  experienceRequirement: ExperienceRequirement | null;
  educationRequirements: string[];
  certificationRequirements: string[];
}

export interface ExperienceAnalysis {
  requiredMonths: number;
  candidateMonths: number;
  meetsRequirement: boolean;
  summary: string;
}

export interface EducationAnalysis {
  required: string[];
  observed: string[];
  meetsRequirement: boolean;
  summary: string;
}

export interface Recommendation {
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  matchedSkills: SkillMatch[];
  relatedSkills: SkillMatch[];
  missingRequiredSkills: SkillMatch[];
  missingPreferredSkills: SkillMatch[];
  experienceAnalysis: ExperienceAnalysis;
  educationAnalysis: EducationAnalysis;
  recommendations: Recommendation[];
  summary: string;
}

export class ComparisonService {
  constructor(private readonly normalizer: SkillNormalizer) {}

  compare(candidate: CandidateProfile, jobRequirements: JobRequirements): AnalysisResult {
    const matchedSkills: SkillMatch[] = [];
    const relatedSkills: SkillMatch[] = [];
    const missingRequiredSkills: SkillMatch[] = [];
    const missingPreferredSkills: SkillMatch[] = [];
    const resumeSkills = candidate.skills.map((skill) => this.normalizer.normalize(skill));

    const requiredSkills = jobRequirements.requiredSkills ?? [];
    const preferredSkills = jobRequirements.preferredSkills ?? [];

    for (const requirement of requiredSkills) {
      const normalizedRequirement = this.normalizer.normalize(requirement.skill);
      const matchingResumeSkill = candidate.skills.find((skill) =>
        this.normalizer.matches(skill, requirement.skill),
      );

      if (matchingResumeSkill) {
        matchedSkills.push({
          skill: requirement.skill,
          status: 'MATCHED',
          resumeEvidence: matchingResumeSkill,
          jobEvidence: requirement.skill,
          confidence: 0.95,
        });
        continue;
      }

      const relatedResumeSkill = candidate.skills.find((skill) => {
        const normalizedSkill = this.normalizer.normalize(skill);
        return (
          normalizedSkill.includes(normalizedRequirement) ||
          normalizedRequirement.includes(normalizedSkill) ||
          normalizedSkill.split(/[^a-z0-9]+/i).some((part) =>
            normalizedRequirement.split(/[^a-z0-9]+/i).includes(part),
          )
        );
      });

      if (relatedResumeSkill) {
        relatedSkills.push({
          skill: requirement.skill,
          status: 'RELATED',
          resumeEvidence: relatedResumeSkill,
          jobEvidence: requirement.skill,
          confidence: 0.6,
        });
      } else {
        missingRequiredSkills.push({
          skill: requirement.skill,
          status: 'NOT_FOUND',
          resumeEvidence: null,
          jobEvidence: requirement.skill,
          confidence: 0.35,
        });
      }
    }

    for (const requirement of preferredSkills) {
      const matchingResumeSkill = candidate.skills.find((skill) => this.normalizer.matches(skill, requirement.skill));

      if (!matchingResumeSkill) {
        missingPreferredSkills.push({
          skill: requirement.skill,
          status: 'NOT_FOUND',
          resumeEvidence: null,
          jobEvidence: requirement.skill,
          confidence: 0.2,
        });
      }
    }

    const requiredMonths = jobRequirements.experienceRequirement?.minimumYears
      ? jobRequirements.experienceRequirement.minimumYears * 12
      : 0;
    const candidateMonths = this.calculateExperienceMonths(candidate.experience);
    const meetsRequirement = requiredMonths === 0 || candidateMonths >= requiredMonths;

    const experienceAnalysis: ExperienceAnalysis = {
      requiredMonths,
      candidateMonths,
      meetsRequirement,
      summary: requiredMonths
        ? `The resume documents approximately ${candidateMonths} months of experience compared with the stated ${requiredMonths}-month requirement.`
        : 'No specific experience requirement was provided.',
    };

    const educationAnalysis: EducationAnalysis = {
      required: jobRequirements.educationRequirements,
      observed: candidate.education.map((item) => item.degree ?? item.institution ?? 'Education'),
      meetsRequirement: jobRequirements.educationRequirements.length === 0 || candidate.education.length > 0,
      summary: jobRequirements.educationRequirements.length
        ? 'Education requirements were provided for review.'
        : 'No explicit education requirement was provided.',
    };

    const recommendations: Recommendation[] = [
      ...missingRequiredSkills.map((item) => ({
        title: item.skill,
        detail: `The job requires ${item.skill}, but no explicit evidence was found in the resume. If applicable, add project or role details that demonstrate this skill.`,
        priority: 'high' as const,
      })),
      ...missingPreferredSkills.map((item) => ({
        title: item.skill,
        detail: `The role prefers ${item.skill}. Consider highlighting relevant experience if it exists.`,
        priority: 'medium' as const,
      })),
    ];

    const matchedSkillNames = matchedSkills.map((entry) => entry.skill).join(', ') || 'none';
    const summary = [
      `Matched skills: ${matchedSkillNames}.`,
      `Required Skill Alignment: ${matchedSkills.length} matched, ${missingRequiredSkills.length} missing.`,
      `Preferred Skill Alignment: ${preferredSkills.length - missingPreferredSkills.length} of ${preferredSkills.length}.`,
      `Experience Alignment: ${meetsRequirement ? 'Meets stated requirement' : 'Below stated requirement'}.`,
    ].join(' ');

    return {
      matchedSkills,
      relatedSkills,
      missingRequiredSkills,
      missingPreferredSkills,
      experienceAnalysis,
      educationAnalysis,
      recommendations,
      summary,
    };
  }

  private calculateExperienceMonths(experience: WorkExperience[]): number {
    let totalMonths = 0;

    for (const entry of experience) {
      const start = this.parseDate(entry.startDate);
      const end = this.parseDate(entry.endDate) ?? new Date();

      if (!start) {
        continue;
      }

      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(diffMonths, 0);
    }

    return totalMonths;
  }

  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
