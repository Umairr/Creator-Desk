import { Stage } from '../types/creator';

export const STAGE_META: Record<
  Stage,
  {
    label: string;
    textColor: string;
    barColor: string;
    nextStage: Stage | null;
    nextActionLabel: string | null;
  }
> = {
  idea: {
    label: 'Idea',
    textColor: 'text-slate-600 dark:text-slate-400',
    barColor: 'bg-slate-400 dark:bg-slate-500',
    nextStage: 'hooked',
    nextActionLabel: 'Mark Hooked',
  },
  hooked: {
    label: 'Hooked',
    textColor: 'text-blue-700 dark:text-blue-400',
    barColor: 'bg-blue-600 dark:bg-blue-500',
    nextStage: 'filming',
    nextActionLabel: 'Start Filming',
  },
  filming: {
    label: 'In Production',
    textColor: 'text-amber-700 dark:text-amber-400',
    barColor: 'bg-amber-600 dark:bg-amber-500',
    nextStage: 'scheduled',
    nextActionLabel: 'Move to Scheduled',
  },
  scheduled: {
    label: 'Scheduled',
    textColor: 'text-indigo-700 dark:text-indigo-400',
    barColor: 'bg-indigo-600 dark:bg-indigo-500',
    nextStage: 'published',
    nextActionLabel: 'Mark Published',
  },
  published: {
    label: 'Published',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    barColor: 'bg-emerald-600 dark:bg-emerald-500',
    nextStage: null,
    nextActionLabel: null,
  },
};

export function getChecklistProgress(checklist: { done: boolean }[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = checklist.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const done = checklist.filter((step) => step.done).length;
  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
  };
}
