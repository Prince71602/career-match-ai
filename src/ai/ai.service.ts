import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { z } from 'zod';
import type { CandidateProfile, JobRequirements } from '../comparison/comparison.service';
import { jobExtractionPrompt } from './prompts/job-extraction.prompt';
import { resumeExtractionPrompt } from './prompts/resume-extraction.prompt';

const workExperienceSchema = z.object({
  company: z.string().nullable(), position: z.string().nullable(), startDate: z.string().nullable(), endDate: z.string().nullable(), description: z.array(z.string()), technologies: z.array(z.string()),
});
const candidateProfileSchema = z.object({
  fullName: z.string().nullable(), email: z.string().nullable(), phone: z.string().nullable(), location: z.string().nullable(), summary: z.string().nullable(), skills: z.array(z.string()), experience: z.array(workExperienceSchema), education: z.array(z.object({ institution: z.string().nullable(), degree: z.string().nullable(), startDate: z.string().nullable(), endDate: z.string().nullable() })), certifications: z.array(z.string()), projects: z.array(z.object({ name: z.string().nullable(), description: z.string().nullable() })),
});
const jobRequirementsSchema = z.object({
  requiredSkills: z.array(z.object({ skill: z.string(), confidence: z.number().optional() })), preferredSkills: z.array(z.object({ skill: z.string(), confidence: z.number().optional() })), responsibilities: z.array(z.string()), experienceRequirement: z.object({ minimumYears: z.number(), source: z.string().optional() }).nullable(), educationRequirements: z.array(z.string()), certificationRequirements: z.array(z.string()),
});

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

  async extractResumeProfile(text: string): Promise<CandidateProfile | null> {
    if (!this.client) return null;
    return this.complete(resumeExtractionPrompt, text, candidateProfileSchema) as Promise<CandidateProfile | null>;
  }

  async extractJobRequirements(text: string): Promise<JobRequirements | null> {
    if (!this.client) return null;
    return this.complete(jobExtractionPrompt, text, jobRequirementsSchema) as Promise<JobRequirements | null>;
  }

  private async complete<T>(instruction: string, input: string, schema: z.ZodType<T>): Promise<T | null> {
    try {
      const response = await this.client!.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${instruction}\nReturn JSON only.` },
          { role: 'user', content: input },
        ],
      });
      const content = response.choices[0]?.message.content;
      if (!content) return null;
      const parsed = schema.safeParse(JSON.parse(content));
      if (!parsed.success) {
        this.logger.warn('AI response failed schema validation. Using deterministic fallback.');
        return null;
      }
      return parsed.data;
    } catch (error) {
      this.logger.warn(`AI extraction failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      return null;
    }
  }
}
