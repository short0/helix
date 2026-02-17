'use client';

import { GuestHabit, HabitType, SectionType } from '@/lib/types';

const STORAGE_KEY = 'habit_system_guest_data';

export const guestStorage = {
  getHabits(): GuestHabit[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading guest habits:', error);
      return [];
    }
  },

  saveHabits(habits: GuestHabit[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving guest habits:', error);
    }
  },

  createHabit(name: string, type: HabitType): GuestHabit {
    const habits = this.getHabits();
    const newHabit: GuestHabit = {
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_streak: 0,
      best_streak: 0,
      sections: {
        identity: [],
        obvious: [],
        attractive: [],
        easy: [],
        satisfying: [],
      },
      completions: [],
    };
    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  },

  getHabit(id: string): GuestHabit | null {
    const habits = this.getHabits();
    return habits.find(h => h.id === id) || null;
  },

  updateHabit(id: string, updates: Partial<GuestHabit>): void {
    const habits = this.getHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index] = {
        ...habits[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.saveHabits(habits);
    }
  },

  updateSection(habitId: string, sectionType: SectionType, content: string[]): void {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.sections[sectionType] = content;
      habit.updated_at = new Date().toISOString();
      this.saveHabits(habits);
    }
  },

  deleteHabit(id: string): void {
    const habits = this.getHabits();
    const filtered = habits.filter(h => h.id !== id);
    this.saveHabits(filtered);
  },

  toggleCompletion(habitId: string, date: string): void {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const completionIndex = habit.completions.indexOf(date);
      if (completionIndex > -1) {
        habit.completions.splice(completionIndex, 1);
      } else {
        habit.completions.push(date);
      }
      this.updateStreak(habit);
      this.saveHabits(habits);
    }
  },

  updateStreak(habit: GuestHabit): void {
    const sortedCompletions = habit.completions
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    habit.current_streak = currentStreak;
    habit.best_streak = Math.max(habit.best_streak, currentStreak);
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
