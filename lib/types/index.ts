export type HabitType = 'good' | 'bad';
export type SectionType = 'identity' | 'obvious' | 'attractive' | 'easy' | 'satisfying';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: HabitType;
  created_at: string;
  updated_at: string;
  current_streak: number;
  best_streak: number;
}

export interface HabitSection {
  id: string;
  habit_id: string;
  section_type: SectionType;
  content: string[];
  updated_at: string;
}

export interface GuestHabit {
  id: string;
  name: string;
  type: HabitType;
  created_at: string;
  updated_at: string;
  current_streak: number;
  best_streak: number;
  sections: Record<SectionType, string[]>;
  completions: string[];
}
