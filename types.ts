export interface SurveyQuestion {
  id: string;
  text: string;
  helperText?: string;
  type: 'text' | 'textarea' | 'select' | 'header';
  options?: string[]; // For select inputs
}

export interface SurveyBlock {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  position: string;
  yearsInCompany: string;
  workingYears: string;
}

export interface SurveySubmission {
  id: string;
  timestamp: number;
  personalInfo: PersonalInfo;
  answers: Record<string, string>;
}

export interface CsvRow {
  [key: string]: string | number;
}