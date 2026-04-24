
export type Language = 'English' | 'Hindi' | 'Marathi';

export type TravelMode = 'Train' | 'Bus' | 'Airplane' | 'Best Option';

export interface TravelPlan {
  travelMode: string;
  start: string;
  destination: string;
  estimatedTime: string;
  stops: string[];
  prerequisites: string[];
  tips: string[];
  steps: TravelStep[];
  comparison?: {
    mode: string;
    pros: string;
    cons: string;
  }[];
}

export interface TravelStep {
  title: string;
  instruction: string;
  icon?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
