export type AnalyzeRequest = {
  job_description: string;
  applicant_background: string;
  refine_instruction?: string;
};

export type QAItem = {
  question: string;
  answer: string;
};

export type AnalyzeResponse = {
  tailored_cv: string;
  questions: QAItem[];
};
