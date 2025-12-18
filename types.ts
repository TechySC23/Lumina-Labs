export enum LensType {
  CONVEX = 'convex',
  CONCAVE = 'concave'
}

export type AIModelMode = 'instant' | 'fast' | 'balanced' | 'genius';

export type AILevel = 'Class 6-8' | 'Class 9-10' | 'Class 11-12' | 'College' | 'University' | 'Expert';
export type AILength = 'Brief' | 'Short' | 'Medium' | 'Long' | 'Detailed';

export interface AISettings {
  level: AILevel;
  length: AILength;
}

export interface SimulationState {
  objectX: number;
  objectHeight: number;
  focalLength: number;
  lensType: LensType;
}

export interface Scenario {
  pos: string;
  img: string;
  nature: string;
  size: string;
  condition: (u: number, f: number) => boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface GroundingMetadata {
  web?: {
    uri: string;
    title: string;
  };
}

export interface DefinitionResult {
  term: string;
  definition: string;
  sources: GroundingMetadata[];
}