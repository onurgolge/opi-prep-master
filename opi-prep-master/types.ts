
export enum ProficiencyLevel {
  NOVICE = 'Novice',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  SUPERIOR = 'Superior'
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
  transcript: string;
  vocabulary: string[];
  grammar: string[];
}

export interface OPIConfig {
  targetLevel: ProficiencyLevel;
  language: string;
  immediateFeedback: boolean;
}

export type AudioFrequencyData = Uint8Array;
