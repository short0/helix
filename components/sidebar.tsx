'use client';

import { useRouter, useParams } from 'next/navigation';
import { Plus, LogOut, LogIn, User as UserIcon, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useHabits } from '@/lib/hooks/use-habits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const { user, isGuest, signOut } = useAuth();
  const { habits, refreshHabits } = useHabits();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      const draggedIndex = habits.findIndex(h => h.id === draggedId);
      const targetIndex = habits.findIndex(h => h.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newHabits = [...habits];
        const [draggedHabit] = newHabits.splice(draggedIndex, 1);
        newHabits.splice(targetIndex, 0, draggedHabit);
      }
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const getHabitColor = (type: string) => {
    return type === 'good'
      ? 'border-l-4 border-emerald-500 bg-emerald-50 hover:bg-emerald-100'
      : 'border-l-4 border-rose-500 bg-rose-50 hover:bg-rose-100';
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white max-sm:w-16">
      <div className="flex-1 overflow-y-auto p-6 max-sm:p-3">
        <div className="mb-8 flex items-center gap-3 max-sm:flex-col max-sm:gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white max-sm:h-8 max-sm:w-8">
            <span className="text-base font-bold max-sm:text-sm">⚡</span>
          </div>
          <span className="font-semibold text-neutral-900 max-sm:hidden">Helix</span>
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
          <p className="text-xs font-semibold uppercase text-neutral-500 max-sm:hidden">Your Habits</p>
          {habits.length === 0 ? (
            <p className="text-sm text-neutral-400 max-sm:hidden">No habits yet</p>
          ) : (
            <div className="space-y-1">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, habit.id)}
                  onDragOver={(e) => handleDragOver(e, habit.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, habit.id)}
                  className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${getHabitColor(habit.type)} ${
                    dragOverId === habit.id ? 'opacity-50' : ''
                  } ${draggedId === habit.id ? 'opacity-30' : ''}`}
                >
                  <GripVertical className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50 max-sm:hidden" />
                  <Link
                    href={`/habit/${habit.id}`}
                    className={`flex-1 truncate font-medium ${
                      params.id === habit.id ? 'text-neutral-900' : 'text-neutral-700'
                    }`}
                  >
                    <span className="max-sm:hidden">{habit.name}</span>
                    <span className="sm:hidden text-xs">{habit.name.slice(0, 3)}</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200 p-6 max-sm:p-3">
        <div className="mb-4 flex items-center gap-2 text-sm max-sm:flex-col max-sm:gap-1">
          <UserIcon className="h-4 w-4 text-neutral-600" />
          <span className="text-neutral-600 truncate text-xs max-sm:text-center">
            {user?.email || 'Guest'}
          </span>
        </div>

        {isGuest ? (
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            size="sm"
            className="w-full border-neutral-300 max-sm:p-1 max-sm:h-auto max-sm:text-xs"
          >
            <LogIn className="mr-2 h-4 w-4 max-sm:mr-0" />
            <span className="max-sm:hidden">Sign In</span>
          </Button>
        ) : (
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full border-neutral-300 max-sm:p-1 max-sm:h-auto max-sm:text-xs"
          >
            <LogOut className="mr-2 h-4 w-4 max-sm:mr-0" />
            <span className="max-sm:hidden">Sign Out</span>
          </Button>
        )}
      </div>
    </div>
  );
}
