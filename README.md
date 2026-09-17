# CareerMatch AI — Coding Specification v1

## 1. Product definition

### Working name
**CareerMatch AI**

### Core promise

> Upload your resume, provide a job description, and receive an evidence-based analysis showing how your documented experience aligns with the job requirements.

The system is not a hiring decision system.

It should answer:

- What requirements does the job have?
- What evidence exists in the resume?
- Which requirements match?
- Which are related but not explicit?
- Which requirements are not found?
- Where does the candidate appear to have an experience gap?
- What should the candidate improve or clarify?

---

## 2. MVP scope

Do not build these yet:

- Job-board scraping
- Automatic applications
- Cover-letter generation
- Resume rewriting
- Interview simulator
- LinkedIn integration
- Recruiter dashboard
- Subscription billing
- AI agent
- n8n automation

Those are later phases.

## MVP v1 flow

```text
User
 │
 ▼
Upload Resume
 │
 ▼
Extract Resume Text
 │
 ▼
AI Resume Structuring
 │
 ▼
Paste Job Description
 │
 ▼
AI Job Structuring
 │
 ▼
Normalize Requirements
 │
 ▼
Comparison Engine
 │
 ▼
Evidence-Based Analysis
 │
 ▼
Results Dashboard
```

---

## 3. Technology stack

### Frontend

```text
React
TypeScript
Vite
React Router
TanStack Query
Tailwind CSS
```

### Backend

```text
NestJS
TypeScript
Mongoose
class-validator
```

### Database

```text
MongoDB
```

### AI
Use an AI API that supports reliable structured output / JSON responses.

Keep the AI provider behind your own service abstraction.

```text
AiService
    │
    └── Provider implementation
```

### File processing
Start with:

```text
PDF
DOCX
```

---

## 4. Repository structure

I recommend two repositories initially.

```text
career-match-web/
career-match-api/
```

Your GitHub structure could eventually be:

```text
Prince71602/
│
├── career-match-web
│
└── career-match-api
```

---

## 5. Frontend architecture

```text
src/
│
├── app/
│   ├── router.tsx
│   └── providers.tsx
│
├── components/
│   ├── ui/
│   ├── file-upload/
│   ├── resume/
│   ├── job/
│   └── analysis/
│
├── features/
│   ├── resume/
│   ├── job/
│   └── analysis/
│
├── pages/
│   ├── HomePage.tsx
│   ├── AnalyzePage.tsx
│   └── ResultsPage.tsx
│
├── services/
│   └── api.ts
│
├── types/
│   ├── resume.ts
│   ├── job.ts
│   └── analysis.ts
│
└── main.tsx
```

---

## 6. Backend architecture

```text
src/
│
├── main.ts
├── app.module.ts
│
├── config/
│   └── configuration.ts
│
├── modules/
│
│   ├── resume/
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── resume.controller.ts
│   │   ├── resume.service.ts
│   │   └── resume.module.ts
│   │
│   ├── job/
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── job.controller.ts
│   │   ├── job.service.ts
│   │   └── job.module.ts
│   │
│   ├── analysis/
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── analysis.controller.ts
│   │   ├── analysis.service.ts
│   │   └── analysis.module.ts
│   │
│   ├── ai/
│   │   ├── prompts/
│   │   ├── ai.service.ts
│   │   └── ai.module.ts
│   │
│   └── health/
│       ├── health.controller.ts
│       └── health.module.ts
│
└── common/
    ├── enums/
    ├── interfaces/
    ├── utils/
    └── constants/
```

---

## 7. Database design

For MVP, you only need three major collections.

```text
resumes
jobs
analyses
```

You can add users later.

---

## 8. Resume schema

Conceptually:

```ts
interface Resume {
  _id: string;

  fileName: string;

  fileType: "pdf" | "docx";

  rawText: string;

  candidateProfile: CandidateProfile;

  createdAt: Date;

  updatedAt: Date;
}
```

Candidate profile:

```ts
interface CandidateProfile {
  fullName: string | null;

  email: string | null;

  phone: string | null;

  location: string | null;

  summary: string | null;

  skills: string[];

  experience: WorkExperience[];

  education: Education[];

  certifications: string[];

  projects: Project[];
}
```

Work experience:

```ts
interface WorkExperience {
  company: string | null;

  position: string | null;

  startDate: string | null;

  endDate: string | null;

  description: string[];

  technologies: string[];
}
```

---

## 9. Job schema

```ts
interface Job {
  _id: string;

  title: string | null;

  company: string | null;

  rawText: string;

  requirements: JobRequirements;

  createdAt: Date;

  updatedAt: Date;
}
```

Job requirements:

```ts
interface JobRequirements {
  requiredSkills: JobSkill[];

  preferredSkills: JobSkill[];

  responsibilities: string[];

  experienceRequirement: ExperienceRequirement | null;

  educationRequirements: string[];

  certificationRequirements: string[];
}
```

---

## 10. Analysis schema

```ts
interface Analysis {
  _id: string;

  resumeId: string;

  jobId: string;

  result: AnalysisResult;

  createdAt: Date;
}
```

Result:

```ts
interface AnalysisResult {
  matchedSkills: SkillMatch[];

  relatedSkills: SkillMatch[];

  missingRequiredSkills: SkillMatch[];

  missingPreferredSkills: SkillMatch[];

  experienceAnalysis: ExperienceAnalysis;

  educationAnalysis: EducationAnalysis;

  recommendations: Recommendation[];

  summary: string;
}
```

---

## 11. Skill matching model

Each skill result should contain evidence.

```ts
interface SkillMatch {
  skill: string;

  status:
    | "MATCHED"
    | "RELATED"
    | "NOT_FOUND";

  resumeEvidence: string | null;

  jobEvidence: string | null;

  confidence: number;
}
```

Example:

```json
{
  "skill": "React",
  "status": "MATCHED",
  "resumeEvidence": "Developed responsive applications using React.",
  "jobEvidence": "Experience with React required.",
  "confidence": 0.98
}
```

---

## 12. API specification

### Health

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

Build this first.

---

## 13. Resume API

### Upload resume

```http
POST /api/resumes
Content-Type: multipart/form-data
```

Form field:

```text
file
```

Response:

```json
{
  "id": "resume_id",
  "fileName": "resume.pdf",
  "status": "PROCESSED"
}
```

### Get resume

```http
GET /api/resumes/:id
```

Response:

```json
{
  "id": "...",
  "fileName": "resume.pdf",
  "candidateProfile": {
    "fullName": "Prince Delima",
    "skills": [
      "React",
      "TypeScript",
      "NestJS"
    ]
  }
}
```

---

## 14. Job API

### Create job

```http
POST /api/jobs
Content-Type: application/json
```

Body:

```json
{
  "description": "We are looking for a Full Stack Developer..."
}
```

Response:

```json
{
  "id": "job_id",
  "title": "Full Stack Developer",
  "status": "PROCESSED"
}
```

---

## 15. Analysis API

### Analyze

```http
POST /api/analyses
```

Body:

```json
{
  "resumeId": "resume_id",
  "jobId": "job_id"
}
```

Response:

```json
{
  "id": "analysis_id",
  "summary": "...",
  "matchedSkills": [],
  "relatedSkills": [],
  "missingRequiredSkills": [],
  "missingPreferredSkills": [],
  "experienceAnalysis": {},
  "recommendations": []
}
```

---

## 16. Resume processing pipeline

```text
UPLOAD
  ↓
FILE VALIDATION
  ↓
TEXT EXTRACTION
  ↓
TEXT CLEANING
  ↓
AI STRUCTURING
  ↓
JSON VALIDATION
  ↓
SKILL NORMALIZATION
  ↓
DATABASE
```

---

## 17. File validation

Accept only:

```text
PDF
DOCX
```

Set a maximum size.

Example:

```text
10 MB
```

Reject:

```text
.exe
.zip
.js
.html
etc.
```

Do not rely solely on the filename extension.

---

## 18. Text extraction

Use a service abstraction.

```ts
interface DocumentParser {
  canParse(mimeType: string): boolean;

  extractText(buffer: Buffer): Promise<string>;
}
```

Then:

```text
PdfParser
DocxParser
```

implement it.

---

## 19. AI extraction service

Create:

```ts
AiService
```

with methods such as:

```ts
extractResumeProfile(
  resumeText: string
): Promise<CandidateProfile>;
```

and:

```ts
extractJobRequirements(
  jobDescription: string
): Promise<JobRequirements>;
```

Later:

```ts
generateAnalysisExplanation(
  result: AnalysisResult
): Promise<string>;
```

---

## 20. AI prompt architecture

Keep prompts in separate files.

```text
src/modules/ai/prompts/

resume-extraction.prompt.ts
job-extraction.prompt.ts
analysis-explanation.prompt.ts
```

---

## 21. Resume extraction prompt

The instruction should effectively be:

```text
Extract only information explicitly supported
by the supplied resume.

Do not infer skills that are not supported.

Return structured JSON matching the schema.

If information is missing, return null or [].

Do not invent information.
```

---

## 22. Job extraction prompt

```text
Extract requirements explicitly stated
in the job description.

Separate:

1. Required skills
2. Preferred skills
3. Experience requirements
4. Education requirements
5. Certifications
6. Responsibilities

Do not invent requirements.
```

---

## 23. JSON validation

AI output must pass validation before entering MongoDB.

```text
AI
 ↓
JSON
 ↓
Schema Validator
 ↓
Valid?
 ├── YES → Continue
 └── NO → Retry / Fail
```

Do not blindly trust `JSON.parse(aiResponse)` and then save everything.

---

## 24. Skill normalization

Create:

```text
SkillNormalizer
```

Examples:

```text
React.js
ReactJS
react

       ↓

React
```

Another:

```text
Node
NodeJS
Node.js

       ↓

Node.js
```

Be conservative.

---

## 25. Comparison engine

Create a dedicated service:

```text
ComparisonService
```

It receives:

```text
CandidateProfile
+
JobRequirements
```

and produces:

```text
AnalysisResult
```

---

## 26. Comparison algorithm

For every required skill:

```text
Does normalized resume skill exist?
        │
   ┌────┴────┐
  YES        NO
   │          │
MATCHED    RELATED?
             │
        ┌────┴────┐
       YES        NO
        │          │
     RELATED    NOT_FOUND
```

---

## 27. Required vs preferred

This distinction matters.

Example:

```text
Required:
React

Preferred:
Docker
```

If Docker is missing, do not make it look equally serious.

---

## 28. Experience analysis

Extract:

```text
Required experience:
2 years
```

Resume:

```text
1 year 3 months
```

Then calculate:

```text
requiredMonths = 24
candidateMonths = 15
```

Result:

```text
candidateMonths < requiredMonths
```

Display:

> The resume documents approximately 15 months of experience compared with the stated 24-month requirement.

---

## 29. Overall score

Delay a single score until matching logic is stable.

Initially show:

```text
Required Skill Alignment
8 / 10

Preferred Skill Alignment
2 / 5

Experience Alignment
Below stated requirement
```

---

## 30. Frontend user journey

### Landing

```text
CareerMatch AI

Analyze how your resume aligns
with a specific job.

[ Start Analysis ]
```

### Step 1

```text
Upload Resume

[ Drag & Drop ]

or

[ Browse Files ]
```

### Step 2

```text
Job Description

Paste the complete job description below.

┌──────────────────────────────┐
│                              │
│                              │
│                              │
└──────────────────────────────┘

[ Analyze Job ]
```

### Step 3

```text
Analyzing your profile

✓ Resume processed
✓ Skills extracted
✓ Job requirements extracted
● Comparing requirements
○ Preparing report
```

---

## 31. Results page

Top:

```text
FULL STACK DEVELOPER

Resume vs Job Analysis
```

Then:

```text
REQUIRED SKILL ALIGNMENT

8 / 10
```

### Matched

```text
✓ React
✓ TypeScript
✓ MongoDB
✓ REST APIs
```

### Related

```text
⚠ Node.js

Evidence:
NestJS experience detected.

Recommendation:
Explicitly mention Node.js if applicable.
```

### Not found

```text
✗ Docker
✗ AWS
```

---

## 32. Evidence drawer

When the user clicks React, show:

```text
WHY THIS MATCHED

Job requirement:

"Strong React experience required."

Resume evidence:

"Developed responsive mobile and web
applications using React."
```

---

## 33. Recommendations

Good examples are evidence-based and specific.

```text
The job requires Docker, but no Docker experience is explicitly documented in the resume. If you have used Docker, consider adding the relevant project or work experience.
```

---

## 34. Milestone: Multiple job analysis

Once MVP works:

```text
Target Role

Junior Full Stack Developer

[ Add Job Description ]

[ Add Another ]

[ Add Another ]
```

Allow 3–10 jobs initially.

---

## 35. Market analysis pipeline

```text
Job 1 ──┐
Job 2 ──┤
Job 3 ──┤
Job 4 ──┼──> Extract Requirements
Job 5 ──┤
Job 6 ──┤
Job 7 ──┘
             ↓
       Normalize Skills
             ↓
       Count Frequency
             ↓
       Market Profile
             ↓
       Compare Resume
```

---

## 36. Market result

```text
JOBS ANALYZED

10
```

Then:

```text
MOST COMMON REQUIREMENTS

React             9 / 10
TypeScript        8 / 10
Node.js           7 / 10
Git               7 / 10
SQL               6 / 10
Docker            5 / 10
AWS               3 / 10
```

Then:

```text
YOUR PROFILE

React        ✓
TypeScript   ✓
Node.js      ✓
Git          ✓
SQL          ?
Docker       ✗
AWS          ✗
```

---

## 37. Market gap report

```text
HIGH PRIORITY

SQL

Appears in 60% of analyzed jobs.
Not explicitly found in your resume.

MEDIUM PRIORITY

Docker

Appears in 50% of analyzed jobs.

LOWER PRIORITY

AWS

Appears in 30% of analyzed jobs.
```

---

## 38. How to obtain job-market data

Do not make scraping your first implementation.

### V1
User pastes job descriptions.

### V2
User provides multiple job descriptions.

### V3
Integrate a legitimate job-data provider/API where available.

### V4
Build automated recurring market analysis.

---

## 39. Automation phase

```text
Scheduled Job Data Collection
             ↓
New Jobs
             ↓
Requirement Extraction
             ↓
Skill Normalization
             ↓
Aggregate Market Data
             ↓
Update Market Trends
```

---

## 40. Testing strategy

### Unit tests

Test:

```text
SkillNormalizer
ComparisonService
ExperienceCalculator
ScoreCalculator
```

### Integration tests

Test:

```text
POST /api/resumes
POST /api/jobs
POST /api/analyses
```

### End-to-end test

```text
Upload resume
     ↓
Paste job
     ↓
Analyze
     ↓
View results
```

---

## 41. Create a test dataset

```text
test-data/

├── resumes/
│   ├── frontend-developer.pdf
│   ├── backend-developer.pdf
│   ├── junior-fullstack.pdf
│   └── career-changer.pdf
│
└── jobs/
    ├── frontend-job.txt
    ├── backend-job.txt
    └── fullstack-job.txt
```

---

## 42. Accuracy benchmark

For each test case:

```text
Expected:
React = MATCHED

Actual:
React = MATCHED
```

Then PASS.

---

## 43. Security requirements

At minimum:

```text
Helmet
CORS configuration
Rate limiting
File validation
Request validation
Environment variables
Authentication later
```

Never commit `.env` to GitHub.

Use `.env.example` instead.

---

## 44. Privacy

Because resumes contain personal information, add:

```text
Delete Resume
Delete Analysis
Delete Account
```

Eventually.

---

## 45. Production architecture

```text
                    INTERNET
                       │
                       ▼
                ┌─────────────┐
                │  Frontend   │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   NestJS    │
                │     API     │
                └──────┬──────┘
                       │
           ┌───────────┼───────────┐
           ▼           ▼           ▼
       MongoDB       AI API    File Storage
```

---

## 46. Deployment order

```text
LOCAL DEVELOPMENT
       ↓
LOCAL TESTING
       ↓
STAGING
       ↓
PRODUCTION
```

---

## 47. Environment configuration

Development:

```text
NODE_ENV=development
PORT=3000
MONGODB_URI=...
AI_API_KEY=...
```

Production:

```text
NODE_ENV=production
PORT=3000
MONGODB_URI=...
AI_API_KEY=...
```

---

## 48. Git workflow

```text
main
│
├── feature/resume-upload
├── feature/resume-parser
├── feature/ai-resume-extraction
├── feature/job-analysis
├── feature/comparison-engine
└── feature/results-dashboard
```

Example commits:

```text
feat: add resume upload endpoint
feat: add PDF text extraction
feat: add resume profile extraction
feat: add job requirement extraction
feat: add skill normalization
feat: add resume job comparison
feat: add analysis results dashboard
test: add comparison engine tests
```

---

## 49. Development sequence

### Phase 1 — Foundation

```text
[ ] Create frontend
[ ] Create backend
[ ] Connect MongoDB
[ ] Configure environment variables
[ ] Create health endpoint
[ ] Create API error handling
[ ] Configure validation
[ ] Configure CORS
```

### Phase 2 — Resume

```text
[ ] Resume module
[ ] File upload
[ ] PDF validation
[ ] DOCX validation
[ ] Text extraction
[ ] Text cleaning
[ ] Resume schema
[ ] Resume database
```

### Phase 3 — AI Resume Extraction

```text
[ ] AiService
[ ] Resume extraction prompt
[ ] Structured output
[ ] Schema validation
[ ] Retry handling
[ ] CandidateProfile storage
```

### Phase 4 — Job

```text
[ ] Job module
[ ] Job DTO
[ ] Job schema
[ ] Job description input
[ ] AI job extraction
[ ] Requirement normalization
```

### Phase 5 — Comparison

```text
[ ] Skill normalization
[ ] Direct skill matching
[ ] Related skill matching
[ ] Missing skill detection
[ ] Required/preferred separation
[ ] Experience comparison
[ ] Evidence extraction
```

### Phase 6 — Analysis

```text
[ ] Analysis schema
[ ] Analysis service
[ ] Analysis endpoint
[ ] Result storage
[ ] Recommendation generation
```

### Phase 7 — Frontend

```text
[ ] Landing page
[ ] Resume upload
[ ] Job input
[ ] Processing screen
[ ] Results page
[ ] Skill cards
[ ] Evidence display
[ ] Recommendations
```

### Phase 8 — Testing

```text
[ ] Unit tests
[ ] Integration tests
[ ] E2E test
[ ] AI failure tests
[ ] Invalid file tests
[ ] Large file tests
[ ] Missing data tests
```

### Phase 9 — Deployment

```text
[ ] Production frontend
[ ] Production backend
[ ] Production database
[ ] Environment variables
[ ] HTTPS
[ ] Logging
[ ] Rate limiting
```

---

## 50. Definition of Done for MVP

MVP is finished when this works:

```text
                  USER
                    │
                    ▼
             Upload Resume
                    │
                    ▼
             PDF/DOCX Parser
                    │
                    ▼
           Structured Candidate
                    │
                    ▼
          Paste Job Description
                    │
                    ▼
          Structured Requirements
                    │
                    ▼
           Comparison Engine
                    │
                    ▼
             Analysis Result
                    │
                    ▼
            Evidence Dashboard
```

And these cases work:

```text
✓ Valid resume
✓ Invalid file
✓ Empty resume
✓ Job with no skills
✓ Job with required + preferred skills
✓ Missing skill
✓ Matching skill
✓ Related skill
✓ Experience mismatch
✓ AI failure
✓ Database failure
```

---

## 51. Then build the market feature

```text
                    RESUME
                       │
                       ▼
                 Candidate Profile
                       │
                       │
      ┌────────────────┼─────────────────┐
      │                │                 │
      ▼                ▼                 ▼
     Job 1            Job 2             Job 3
      │                │                 │
      └────────────────┼─────────────────┘
                       ▼
               Requirement Extraction
                       │
                       ▼
                Skill Normalization
                       │
                       ▼
                 Frequency Analysis
                       │
                       ▼
                  Market Profile
                       │
                       ▼
                Candidate Gap
```

---

## 52. Final product positioning

> CareerMatch AI — Evidence-based resume and job alignment analysis.

Not:

> AI tells you whether you will get hired.

And not:

> AI gives your resume an ATS score.

Instead:

> Understand exactly how your documented skills and experience align with the jobs you're targeting.

---

## 53. What makes this portfolio-worthy

Your portfolio project can demonstrate all of this:

```text
React
TypeScript
NestJS
REST APIs
MongoDB
AI API Integration
PDF/DOCX Processing
Structured AI Output
Data Validation
Algorithmic Matching
Skill Normalization
File Uploads
Authentication
Security
Testing
Deployment
```

---

## 54. The eventual roadmap

```text
                    ┌─────────────────────┐
                    │       MVP v1        │
                    │ Resume vs Job        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       v2            │
                    │ Multiple Jobs       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       v3            │
                    │ Market Skill Gap    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       v4            │
                    │ Career Profile      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       v5            │
                    │ AI Career Assistant │
                    └─────────────────────┘
```

## Most important rule

Build v1 first.

Your first working product should be:

```text
          RESUME
             +
       JOB DESCRIPTION
             │
             ▼
      STRUCTURED DATA
             │
             ▼
      COMPARISON ENGINE
             │
             ▼
      EVIDENCE-BASED
          REPORT
```

Once that is reliable, then we build the job-market intelligence layer.

---

## Summary

This project should be a technically defensible AI resume alignment engine rather than a generic chatbot or ATS score wrapper. The MVP focus is clear: parse a resume, structure the job requirements, compare them, and show evidence-backed findings in a dashboard.
