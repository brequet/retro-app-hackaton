export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Activity {
  id: string;
  title: string;
  type: 'retro' | 'icebreaker';
  duration: string;
  duration_min: number;
  duration_max: number;
  team_size: string;
  team_size_min: number;
  team_size_max: number;
  tags: string[];
  description: string;
  instructions: string[];
  materials: string[];
  image_url?: string;
  creator_id?: string;
  deleted_at?: string | null;
  created_at: string;
}

export interface CreateActivityInput {
  title: string;
  type: 'retro' | 'icebreaker';
  duration: string;
  duration_min: number;
  duration_max: number;
  team_size: string;
  team_size_min: number;
  team_size_max: number;
  tags: string[];
  description: string;
  instructions: string[];
  materials: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type QuizStep = 'type' | 'teamSize' | 'duration' | 'mood' | 'result';

export interface QuizAnswers {
  type?: 'retro' | 'icebreaker';
  teamSize?: string;
  duration?: string;
  mood?: string;
}
