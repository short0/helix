'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useHabits } from '@/lib/hooks/use-habits';
import { HabitType } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { createHabit } = useHabits();
  const [habitName, setHabitName] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('good');
  const [loading, setLoading] = useState(false);

  const handleStartDesigning = async () => {
    if (!habitName.trim()) return;

    setLoading(true);
    try {
      const habit = await createHabit(habitName, habitType);
      router.push(`/habit/${habit.id}`);
    } catch (error) {
      console.error('Error creating habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartDesigning();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 max-sm:p-4">
      <div className="w-full max-w-2xl space-y-8 max-sm:space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg max-sm:h-12 max-sm:w-12">
            <span className="text-2xl font-bold max-sm:text-xl">⚡</span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 max-sm:text-2xl">
            What habit do you want to design?
          </h1>
          <p className="text-neutral-600 max-sm:text-sm">Using Helix & the 4 Laws from Atomic Habits</p>
        </div>

        <div className="space-y-4 rounded-lg bg-white p-8 shadow-sm max-sm:p-6">
          <Textarea
            placeholder="Describe your habit... (e.g., Exercise every morning, Stop checking social media at night)"
            value={habitName}
            onChange={e => setHabitName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none border-neutral-300 text-base focus:border-neutral-400 focus:ring-neutral-400 max-sm:text-sm"
          />

          <div className="space-y-3 max-sm:space-y-2">
            <span className="block text-sm font-medium text-neutral-700">Choose habit type:</span>
            <div className="grid grid-cols-2 gap-3 max-sm:gap-2">
              <button
                onClick={() => setHabitType('good')}
                className={`rounded-lg border-2 px-4 py-3 font-medium transition-all max-sm:px-3 max-sm:py-2 max-sm:text-sm ${
                  habitType === 'good'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Build Good Habit
              </button>
              <button
                onClick={() => setHabitType('bad')}
                className={`rounded-lg border-2 px-4 py-3 font-medium transition-all max-sm:px-3 max-sm:py-2 max-sm:text-sm ${
                  habitType === 'bad'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Break Bad Habit
              </button>
            </div>
          </div>

          <Button
            onClick={handleStartDesigning}
            disabled={!habitName.trim() || loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 max-sm:text-sm"
            size="lg"
          >
            {loading ? 'Creating...' : 'Start Designing'}
          </Button>
        </div>

        <p className="text-center text-xs text-neutral-400 max-sm:text-xs">
          Powered by Helix • Design, track, and master your habits
        </p>
      </div>
    </div>
  );
}
