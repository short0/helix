'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Sparkles, Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import { guestStorage } from '@/lib/storage/guest-storage';
import { Habit, GuestHabit, SectionType, HabitSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const SECTION_LABELS: Record<SectionType, { title: string; description: string }> = {
  identity: {
    title: 'Identity',
    description: 'Who do you want to become?',
  },
  obvious: {
    title: 'Make It Obvious',
    description: 'How can you make the cue clear and visible?',
  },
  attractive: {
    title: 'Make It Attractive',
    description: 'How can you make it appealing?',
  },
  easy: {
    title: 'Make It Easy',
    description: 'How can you reduce friction?',
  },
  satisfying: {
    title: 'Make It Satisfying',
    description: 'How can you make it rewarding?',
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
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-medium text-neutral-900">{habit.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  habit.type === 'good'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }
              >
                {habit.type === 'good' ? 'Good Habit' : 'Bad Habit'}
              </Badge>
              {habit.current_streak > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {habit.current_streak} day streak
                </Badge>
              )}
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete habit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All progress and data will be permanently
                  deleted.
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

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="inline-flex h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
            {Object.keys(SECTION_LABELS).map(key => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm whitespace-nowrap data-[state=active]:border-neutral-900 data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
              >
                {SECTION_LABELS[key as SectionType].title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const sectionType = key as SectionType;
            return (
              <TabsContent key={key} value={key} className="space-y-4">
                <div>
                  <h2 className="text-xl font-medium text-neutral-900">{label.title}</h2>
                  <p className="text-sm text-neutral-600">{label.description}</p>
                </div>

                <Button
                  onClick={() => generateSuggestions(sectionType)}
                  disabled={generatingSection === sectionType}
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
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

                <div className="space-y-2">
                  {sections[sectionType].map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-4"
                    >
                      <p className="flex-1 text-sm text-neutral-700">{item}</p>
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

                <div className="flex gap-2">
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
                    className="border-neutral-300 resize-none"
                  />
                  <Button
                    onClick={() => addItem(sectionType)}
                    disabled={!newItems[sectionType].trim()}
                    className="bg-neutral-900 hover:bg-neutral-800"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
