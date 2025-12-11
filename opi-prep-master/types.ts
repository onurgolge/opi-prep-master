
export enum ProficiencyLevel {
  NOVICE = 'Novice',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  SUPERIOR = 'Superior'
}

export enum PracticeMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  groundingMetadata?: any;
}

export interface FeedbackSection {
  rating: string;
  strengths: string[];
  areasForImprovement: string[];
  tips: string[];
  detailedAnalysis: string;
}

export interface OPIConfig {
  targetLevel: ProficiencyLevel;
  language: string;
  mode: PracticeMode;
  immediateFeedback: boolean;
}

export type AudioFrequencyData = Uint8Array;
