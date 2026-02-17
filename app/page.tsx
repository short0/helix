'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-white p-4 shadow-sm">
            <Target className="h-8 w-8 text-neutral-700" />
          </div>
          <h1 className="text-3xl font-medium text-neutral-900">
            What habit do you want to design?
          </h1>
        </div>

        <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <Textarea
            placeholder="Describe your habit... (e.g., Exercise every morning, Stop checking social media at night)"
            value={habitName}
            onChange={e => setHabitName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none border-neutral-300 text-base focus:border-neutral-400 focus:ring-neutral-400"
          />

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">Habit Type:</span>
            <Select value={habitType} onValueChange={value => setHabitType(value as HabitType)}>
              <SelectTrigger className="w-[180px] border-neutral-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good Habit</SelectItem>
                <SelectItem value="bad">Bad Habit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStartDesigning}
            disabled={!habitName.trim() || loading}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
            size="lg"
          >
            {loading ? 'Creating...' : 'Start Designing'}
          </Button>
        </div>

        <p className="text-center text-sm text-neutral-500">
          Design habits using the 4 Laws from Atomic Habits by James Clear
        </p>
      </div>
    </div>
  );
}
