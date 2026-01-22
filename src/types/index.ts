export interface EvalInput {
  ClassYear?: string;
  Country?: string;
  Skills?: string;
  Context?: string;
  FirstSkill?: string;
  IsFirstPeriod?: boolean;
  PreviousLessonSkills?: string;
  [key: string]: string | boolean | number | undefined;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface EvalOutput {
  easy?: QuestionAnswer;
  medium?: QuestionAnswer;
  hard?: QuestionAnswer;
  prerequisitesChosen?: string[];
  [key: string]: QuestionAnswer | string[] | string | undefined;
}

export interface EvalItem {
  id: string;
  input: EvalInput;
  output: EvalOutput;
  model_critique: string;
  model_outcome: 'PASS' | 'FAIL' | '';
  human_critique: string;
  human_outcome: 'PASS' | 'FAIL' | '';
  human_revised_response: string;
  agreement: string;
}

export interface RawEvalItem {
  id: string;
  input: string;
  output: string;
  model_critique: string;
  model_outcome: string;
  human_critique: string;
  human_outcome: string;
  human_revised_response: string;
  agreement: string;
}

export type LabelStatus = 'unlabeled' | 'pass' | 'fail';

export interface TraceItem {
  id: string;
  input_trace: string;
  output_trace: string;
  [key: string]: string | number | boolean | undefined;
}
