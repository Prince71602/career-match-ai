import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JobRequirements, JobSkill } from '../comparison/comparison.service';
import { SkillNormalizer } from '../comparison/skill-normalizer';
import { JOB_STORE, JobStore } from './job.store';

export interface JobRecord {
  id: string;
  title: string | null;
  company: string | null;
  rawText: string;
  requirements: JobRequirements;
  createdAt: string;
}

@Injectable()
export class JobService {
  private readonly normalizer = new SkillNormalizer();

  constructor(@Inject(JOB_STORE) private readonly jobStore: JobStore) {}

  async create(body?: { description?: string }) {
    const description = body?.description?.trim();

    if (!description) {
      throw new BadRequestException('A job description is required.');
    }

    const job: JobRecord = {
      id: randomUUID(),
      title: this.extractTitle(description),
      company: null,
      rawText: description,
      requirements: this.extractRequirements(description),
      createdAt: new Date().toISOString(),
    };

    await this.jobStore.create(job);

    return {
      id: job.id,
      title: job.title,
      status: 'PROCESSED' as const,
    };
  }

  async findById(id: string): Promise<JobRecord> {
    const job = await this.jobStore.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    return job;
  }

  private extractTitle(description: string): string | null {
    const match = description.match(/(?:looking for|seeking|hiring)\s+(?:a\s+)?([^.!?]+?)(?=\s+(?:with|and|for|who|that|required|preferred|responsibilities|experience)|$)/i);
    const title = match ? match[1].trim() : 'Full Stack Developer';
    return title || 'Full Stack Developer';
  }

  private extractRequirements(description: string): JobRequirements {
    const lowerDescription = description.toLowerCase();
    const jobSkills = ['React', 'TypeScript', 'Node.js', 'Node', 'Docker', 'AWS', 'MongoDB', 'SQL', 'JavaScript', 'Python', 'REST API', 'NestJS'];
    const requiredMatch = description.match(/required[:\s]+([^.]*)/i);
    const preferredMatch = description.match(/preferred[:\s]+([^.]*)/i);
    const responsibilitiesMatch = description.match(/responsibilities[:\s]+([^.]*)/i);

    const requiredText = requiredMatch ? requiredMatch[1] : description.split(/preferred|responsibilities/i)[0];
    const preferredText = preferredMatch ? preferredMatch[1] : ' ';
    const responsibilitiesText = responsibilitiesMatch ? responsibilitiesMatch[1] : ' ';

    const requiredSkills = this.findSkillsFromText(requiredText, jobSkills);
    const preferredSkills = this.findSkillsFromText(preferredText, jobSkills);

    const experienceRequirement = this.extractExperienceRequirement(description);

    return {
      requiredSkills,
      preferredSkills,
      responsibilities: this.parseResponsibilities(responsibilitiesText, description),
      experienceRequirement,
      educationRequirements: this.extractEducationRequirements(description),
      certificationRequirements: this.extractCertificationRequirements(description),
    };
  }

  private findSkillsFromText(text: string, jobSkills: string[]): JobSkill[] {
    return jobSkills
      .map((skill) => ({ skill, normalized: this.normalizer.normalize(skill) }))
      .filter(({ normalized }) => {
        const lowered = text.toLowerCase();
        return lowered.includes(normalized.toLowerCase());
      })
      .map(({ skill }) => ({ skill }));
  }

  private extractExperienceRequirement(description: string): JobRequirements['experienceRequirement'] {
    const match = description.match(/(\d+)\s*(?:\+)?\s*years?\s*(?:of\s+)?experience/i);
    if (!match) {
      return null;
    }

    return { minimumYears: Number.parseInt(match[1], 10), source: match[0] };
  }

  private parseResponsibilities(responsibilitiesText: string, description: string): string[] {
    const source = responsibilitiesText.trim() || description;
    const items = source
      .split(/[.;]/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 4);

    return items.length ? items : ['Build software and contribute to product development.'];
  }

  private extractEducationRequirements(description: string): string[] {
    const matches = description.match(/(?:bachelor|master|degree|diploma)[^.;]*/gi) ?? [];
    return matches.map((entry) => entry.trim()).filter(Boolean);
  }

  private extractCertificationRequirements(description: string): string[] {
    const matches = description.match(/(?:certification|certified)[^.;]*/gi) ?? [];
    return matches.map((entry) => entry.trim()).filter(Boolean);
  }
}
