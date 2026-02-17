'use client';

import { useRouter } from 'next/navigation';
import { Plus, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useHabits } from '@/lib/hooks/use-habits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const { habits } = useHabits();

  const handleNewHabit = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <span className="text-sm font-bold">H</span>
          </div>
          <span className="font-semibold text-neutral-900">Habit System</span>
        </div>

        <Button
          onClick={handleNewHabit}
          className="mb-6 w-full gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Habit
        </Button>

        {isGuest && (
          <div className="mb-6">
            <Badge variant="secondary" className="w-full justify-center bg-amber-100 text-amber-700">
              Guest Mode
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-neutral-500">Your Habits</p>
          {habits.length === 0 ? (
            <p className="text-sm text-neutral-400">No habits yet</p>
          ) : (
            <div className="space-y-1">
              {habits.map(habit => (
                <Link
                  key={habit.id}
                  href={`/habit/${habit.id}`}
                  className="block truncate rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  {habit.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200 p-6">
        <div className="mb-4 flex items-center gap-2 text-sm">
          <UserIcon className="h-4 w-4 text-neutral-600" />
          <span className="text-neutral-600">
            {user?.email || 'Guest'}
          </span>
        </div>

        {isGuest ? (
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            size="sm"
            className="w-full border-neutral-300"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        ) : (
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full border-neutral-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}
