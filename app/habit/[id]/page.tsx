'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Sparkles, Plus, X, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import { guestStorage } from '@/lib/storage/guest-storage';
import { Habit, GuestHabit, SectionType, HabitSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChatBubble } from '@/components/chat-bubble';

const GOOD_HABIT_LABELS: Record<SectionType, { title: string; description: string; color: string }> = {
  identity: {
    title: 'Identity',
    description: 'Who do you want to become?',
    color: 'bg-blue-50 border-blue-200',
  },
  obvious: {
    title: 'Make It Obvious',
    description: 'How can you make the cue clear and visible?',
    color: 'bg-emerald-50 border-emerald-200',
  },
  attractive: {
    title: 'Make It Attractive',
    description: 'How can you make it appealing?',
    color: 'bg-amber-50 border-amber-200',
  },
  easy: {
    title: 'Make It Easy',
    description: 'How can you reduce friction?',
    color: 'bg-violet-50 border-violet-200',
  },
  satisfying: {
    title: 'Make It Satisfying',
    description: 'How can you make it rewarding?',
    color: 'bg-pink-50 border-pink-200',
  },
};

const BAD_HABIT_LABELS: Record<SectionType, { title: string; description: string; color: string }> = {
  identity: {
    title: 'Identity',
    description: 'Who do you want to become instead?',
    color: 'bg-blue-50 border-blue-200',
  },
  obvious: {
    title: 'Make It Invisible',
    description: 'How can you hide the cue?',
    color: 'bg-rose-50 border-rose-200',
  },
  attractive: {
    title: 'Make It Unattractive',
    description: 'How can you make it less appealing?',
    color: 'bg-orange-50 border-orange-200',
  },
  easy: {
    title: 'Make It Difficult',
    description: 'How can you increase friction?',
    color: 'bg-red-50 border-red-200',
  },
  satisfying: {
    title: 'Make It Unsatisfying',
    description: 'How can you remove the reward?',
    color: 'bg-slate-50 border-slate-200',
  },
};

export default function HabitPage() {
  const params = useParams();
  const router = useRouter();
  const { isGuest } = useAuth();
  const [habit, setHabit] = useState<Habit | GuestHabit | null>(null);
  const [sections, setSections] = useState<Record<SectionType, string[]>>({
    identity: [],
    obvious: [],
    attractive: [],
    easy: [],
    satisfying: [],
  });
  const [loading, setLoading] = useState(true);
  const [generatingSection, setGeneratingSection] = useState<SectionType | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [newItems, setNewItems] = useState<Record<SectionType, string>>({
    identity: '',
    obvious: '',
    attractive: '',
    easy: '',
    satisfying: '',
  });

  useEffect(() => {
    loadHabit();
  }, [params.id, isGuest]);

  const loadHabit = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        const guestHabit = guestStorage.getHabit(params.id as string);
        if (guestHabit) {
          setHabit(guestHabit);
          setSections(guestHabit.sections);
        }
      } else {
        const { data: habitData, error: habitError } = await supabase
          .from('habits')
          .select('*')
          .eq('id', params.id)
          .maybeSingle();

        if (habitError) throw habitError;

        if (habitData) {
          const { data: sectionsData, error: sectionsError } = await supabase
            .from('habit_sections')
            .select('*')
            .eq('habit_id', params.id);

          if (sectionsError) throw sectionsError;

          setHabit(habitData);
          const sectionsMap: Record<SectionType, string[]> = {
            identity: [],
            obvious: [],
            attractive: [],
            easy: [],
            satisfying: [],
          };

          sectionsData?.forEach((section: HabitSection) => {
            sectionsMap[section.section_type] = section.content as string[];
          });

          setSections(sectionsMap);
        }
      }
    } catch (error) {
      console.error('Error loading habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async (sectionType: SectionType) => {
    if (!habit) return;

    setGeneratingSection(sectionType);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitName: habit.name,
          habitType: habit.type,
          sectionType,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate suggestions');

      const { suggestions } = await response.json();
      await updateSection(sectionType, [...sections[sectionType], ...suggestions]);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGeneratingSection(null);
    }
  };

  const updateSection = async (sectionType: SectionType, content: string[]) => {
    if (!habit) return;

    if (isGuest) {
      guestStorage.updateSection(habit.id, sectionType, content);
      setSections(prev => ({ ...prev, [sectionType]: content }));
    } else {
      const { error } = await supabase
        .from('habit_sections')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('habit_id', habit.id)
        .eq('section_type', sectionType);

      if (error) throw error;
      setSections(prev => ({ ...prev, [sectionType]: content }));
    }
  };

  const addItem = async (sectionType: SectionType) => {
    const newItem = newItems[sectionType].trim();
    if (!newItem) return;

    await updateSection(sectionType, [...sections[sectionType], newItem]);
    setNewItems(prev => ({ ...prev, [sectionType]: '' }));
  };

  const removeItem = async (sectionType: SectionType, index: number) => {
    const updated = sections[sectionType].filter((_, i) => i !== index);
    await updateSection(sectionType, updated);
  };

  const deleteHabit = async () => {
    if (!habit) return;

    try {
      if (isGuest) {
        guestStorage.deleteHabit(habit.id);
      } else {
        await supabase.from('habits').delete().eq('id', habit.id);
      }
      router.push('/');
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const labels = habit?.type === 'good' ? GOOD_HABIT_LABELS : BAD_HABIT_LABELS;
  const sectionOrder: SectionType[] = ['identity', 'obvious', 'attractive', 'easy', 'satisfying'];

  const renderSection = (sectionType: SectionType) => {
    const label = labels[sectionType];
    return (
      <div
        key={sectionType}
        className={`rounded-lg border-2 p-6 transition-all ${label.color} max-sm:p-4`}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">{label.title}</h3>
          <p className="text-sm text-neutral-600">{label.description}</p>
        </div>

        <Button
          onClick={() => generateSuggestions(sectionType)}
          disabled={generatingSection === sectionType}
          variant="outline"
          size="sm"
          className="mb-4 border-neutral-300 text-neutral-700 hover:bg-white max-sm:w-full"
        >
          {generatingSection === sectionType ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Suggest with AI
            </>
          )}
        </Button>

        <div className="mb-4 space-y-2">
          {sections[sectionType].map((item, index) => (
            <div
              key={index}
              className="group flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-3 text-sm max-sm:text-xs"
            >
              <p className="flex-1 text-neutral-700">{item}</p>
              <Button
                onClick={() => removeItem(sectionType, index)}
                variant="ghost"
                size="sm"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 max-sm:flex-col">
          <Textarea
            placeholder="Add your own..."
            value={newItems[sectionType]}
            onChange={e =>
              setNewItems(prev => ({ ...prev, [sectionType]: e.target.value }))
            }
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addItem(sectionType);
              }
            }}
            className="border-neutral-300 resize-none text-sm max-sm:min-h-16"
          />
          <Button
            onClick={() => addItem(sectionType)}
            disabled={!newItems[sectionType].trim()}
            className="bg-neutral-900 hover:bg-neutral-800 max-sm:w-12 max-sm:p-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-neutral-600">Habit not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 max-sm:p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between max-sm:flex-col max-sm:gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 max-sm:text-2xl">{habit.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                className={`${
                  habit.type === 'good'
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                    : 'border-rose-300 bg-rose-100 text-rose-800'
                } border-2 text-base max-sm:text-sm`}
              >
                {habit.type === 'good' ? 'Build Good Habit' : 'Break Bad Habit'}
              </Badge>
              {habit.current_streak > 0 && (
                <Badge variant="secondary" className="border-2 border-amber-300 bg-amber-100 text-base text-amber-800 max-sm:text-sm">
                  {habit.current_streak} day streak
                </Badge>
              )}
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-300 max-sm:self-start">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-sm:max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete habit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All progress and data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteHabit} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 max-sm:grid-cols-1">
          {/* Identity section - full width */}
          <div className="lg:col-span-2">{renderSection('identity')}</div>

          {/* Other sections in 2-column grid */}
          {renderSection('obvious')}
          {renderSection('attractive')}
          {renderSection('easy')}
          {renderSection('satisfying')}
        </div>
      </div>

      {/* Chat bubble */}
      {chatOpen && <ChatBubble habitName={habit.name} onClose={() => setChatOpen(false)} />}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg transition-transform hover:scale-110 max-sm:bottom-4 max-sm:right-4 max-sm:h-12 max-sm:w-12"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
