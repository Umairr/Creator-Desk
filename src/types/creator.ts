export type Platform =
  | 'YouTube'
  | 'Shorts / Reels'
  | 'TikTok'
  | 'Instagram'
  | 'X / Threads'
  | 'Newsletter';

export type Stage = 'idea' | 'hooked' | 'filming' | 'scheduled' | 'published';

export type HookAngle =
  | 'Curiosity'
  | 'Contrarian'
  | 'Story'
  | 'Data / Stat'
  | 'Outcome'
  | 'Tutorial';

export type NavTab = 'dashboard' | 'ideas' | 'hooks' | 'calendar' | 'search';

export interface VideoHook {
  id: string;
  text: string;
  angle: HookAngle;
  isPrimary: boolean;
  updatedAt: string;
}

export interface ChecklistStep {
  id: string;
  label: string;
  done: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  stage: Stage;
  category: string;
  notes: string;
  hooks: VideoHook[];
  checklist: ChecklistStep[];
  scheduledDate: string | null; // YYYY-MM-DD
  scheduledTime: string | null; // HH:mm
  createdAt: string;
  updatedAt: string;
}

export interface DeskSettings {
  weeklyGoal: number;
  theme: 'light' | 'dark';
  defaultPlatform: Platform;
}

export const PLATFORMS: Platform[] = [
  'YouTube',
  'Shorts / Reels',
  'TikTok',
  'Instagram',
  'X / Threads',
  'Newsletter',
];

export const STAGES: { id: Stage; label: string; description: string }[] = [
  { id: 'idea', label: 'Idea', description: 'Raw concept captured' },
  { id: 'hooked', label: 'Hooked', description: 'Opening hook & angle locked' },
  { id: 'filming', label: 'In Production', description: 'Scripting, filming, or editing' },
  { id: 'scheduled', label: 'Scheduled', description: 'Ready for publish date' },
  { id: 'published', label: 'Published', description: 'Live to audience' },
];

export const HOOK_ANGLES: HookAngle[] = [
  'Curiosity',
  'Contrarian',
  'Story',
  'Data / Stat',
  'Outcome',
  'Tutorial',
];
