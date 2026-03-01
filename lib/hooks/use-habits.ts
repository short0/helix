'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import { guestStorage } from '@/lib/storage/guest-storage';
import { Habit, GuestHabit, HabitType } from '@/lib/types';

export function useHabits() {
  const { user, isGuest } = useAuth();
  const [habits, setHabits] = useState<(Habit | GuestHabit)[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadHabits();
  }, [user, isGuest, refreshTrigger]);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      if (isGuest) {
        const guestHabits = guestStorage.getHabits();
        setHabits(guestHabits);
      } else {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHabits(data || []);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  const createHabit = async (name: string, type: HabitType) => {
    if (isGuest) {
      const newHabit = guestStorage.createHabit(name, type);
      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } else {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          name,
          type,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('habit_sections').insert([
        { habit_id: data.id, section_type: 'identity', content: [] },
        { habit_id: data.id, section_type: 'obvious', content: [] },
        { habit_id: data.id, section_type: 'attractive', content: [] },
        { habit_id: data.id, section_type: 'easy', content: [] },
        { habit_id: data.id, section_type: 'satisfying', content: [] },
      ]);

      setHabits(prev => [data, ...prev]);
      return data;
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (isGuest) {
      guestStorage.deleteHabit(habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } else {
      const { error } = await supabase.from('habits').delete().eq('id', habitId);
      if (error) throw error;
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  };

  const refreshHabits = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    habits,
    loading,
    createHabit,
    deleteHabit,
    refreshHabits,
  };
}
