import { ChecklistStep, ContentItem, HookAngle } from '../types/creator';
import { addDays, toLocalDateKey } from '../utils/dates';

export const DEFAULT_CHECKLIST = (): ChecklistStep[] => [
  { id: 'step-idea', label: 'Core angle validated', done: true },
  { id: 'step-hook', label: 'Opening hook locked', done: false },
  { id: 'step-outline', label: 'Script or talking points', done: false },
  { id: 'step-film', label: 'Filmed / recorded', done: false },
  { id: 'step-edit', label: 'Edited & captioned', done: false },
  { id: 'step-publish', label: 'Scheduled or posted', done: false },
];

export interface HookFramework {
  id: string;
  angle: HookAngle;
  name: string;
  template: string;
  tip: string;
}

export const HOOK_FRAMEWORKS: HookFramework[] = [
  {
    id: 'fw-contrarian',
    angle: 'Contrarian',
    name: 'Challenge Common Advice',
    template: 'Stop [common habit] if you want [desired outcome] — do this instead.',
    tip: 'Pairs tension with an immediate alternative in under 3 seconds.',
  },
  {
    id: 'fw-curiosity',
    angle: 'Curiosity',
    name: 'Open Loop Observation',
    template: 'I tested [specific method] for [timeframe] and one small change doubled my results.',
    tip: 'Hold back the exact change for sentence two so viewers watch past second 4.',
  },
  {
    id: 'fw-outcome',
    angle: 'Outcome',
    name: 'Result-First Proof',
    template: 'Here is how to go from [pain point] to [specific result] in under [time/steps].',
    tip: 'Concrete numbers outperform vague adjectives in the first frame.',
  },
  {
    id: 'fw-stat',
    angle: 'Data / Stat',
    name: 'Surprising Benchmark',
    template: '9 out of 10 creators miss this [detail] — and it costs them half their retention.',
    tip: 'State the cost immediately so the viewer feels urgency to fix it.',
  },
  {
    id: 'fw-story',
    angle: 'Story',
    name: 'In-Media-Res Moment',
    template: 'Three minutes before publishing, I scrapped the entire edit because I noticed this.',
    tip: 'Drop the viewer straight into a high-stakes moment without backstory.',
  },
  {
    id: 'fw-tutorial',
    angle: 'Tutorial',
    name: 'Zero-Fluff Breakdown',
    template: 'If you only change three settings in [tool], start with these exact ones.',
    tip: 'Signals high utility and low fluff right away.',
  },
];

export function buildStarterItems(): ContentItem[] {
  const now = new Date();
  const today = toLocalDateKey(now);
  const tomorrow = toLocalDateKey(addDays(now, 1));
  const inThreeDays = toLocalDateKey(addDays(now, 3));
  const inFiveDays = toLocalDateKey(addDays(now, 5));
  const twoDaysAgo = toLocalDateKey(addDays(now, -2));
  const fourDaysAgo = toLocalDateKey(addDays(now, -4));

  return [
    {
      id: 'item-1',
      title: '3-Second Audio Mix Trick for Talking-Head Reels',
      platform: 'Shorts / Reels',
      stage: 'scheduled',
      category: 'Audio & Editing',
      notes: 'Show raw mic waveform vs. light compression + room EQ. Keep total runtime under 38 seconds with punchy B-roll cuts.',
      scheduledDate: tomorrow,
      scheduledTime: '11:30',
      createdAt: addDays(now, -6).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
      hooks: [
        {
          id: 'hook-1a',
          text: 'Your lighting is fine — your audio is why people scroll away in two seconds.',
          angle: 'Contrarian',
          isPrimary: true,
          updatedAt: addDays(now, -1).toISOString(),
        },
        {
          id: 'hook-1b',
          text: 'Copy these two EQ tweaks to make a $40 mic sound like a broadcast studio.',
          angle: 'Tutorial',
          isPrimary: false,
          updatedAt: addDays(now, -2).toISOString(),
        },
      ],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: true },
        { id: 'c3', label: 'Script or talking points', done: true },
        { id: 'c4', label: 'Filmed / recorded', done: true },
        { id: 'c5', label: 'Edited & captioned', done: true },
        { id: 'c6', label: 'Scheduled or posted', done: true },
      ],
    },
    {
      id: 'item-2',
      title: 'My Sunday Batching Workflow (4 Videos in 90 Minutes)',
      platform: 'YouTube',
      stage: 'filming',
      category: 'Creator Systems',
      notes: 'Walk through the exact 3-block timer method: 25m hooks, 45m A-roll batching, 20m thumbnail frame pulls.',
      scheduledDate: inThreeDays,
      scheduledTime: '16:00',
      createdAt: addDays(now, -5).toISOString(),
      updatedAt: now.toISOString(),
      hooks: [
        {
          id: 'hook-2a',
          text: 'I stopped filming every day and filmed four videos in ninety minutes — here is the exact timer.',
          angle: 'Outcome',
          isPrimary: true,
          updatedAt: now.toISOString(),
        },
        {
          id: 'hook-2b',
          text: 'Why batching fails for most solo creators (and the tiny tweak that fixed mine).',
          angle: 'Curiosity',
          isPrimary: false,
          updatedAt: addDays(now, -1).toISOString(),
        },
      ],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: true },
        { id: 'c3', label: 'Script or talking points', done: true },
        { id: 'c4', label: 'Filmed / recorded', done: true },
        { id: 'c5', label: 'Edited & captioned', done: false },
        { id: 'c6', label: 'Scheduled or posted', done: false },
      ],
    },
    {
      id: 'item-3',
      title: 'Why Soft Key Light Beats Ring Lights Every Time',
      platform: 'TikTok',
      stage: 'hooked',
      category: 'Studio Setup',
      notes: 'Side-by-side comparison shot at desk with 45-degree softbox vs flat front ring light.',
      scheduledDate: inFiveDays,
      scheduledTime: '18:00',
      createdAt: addDays(now, -3).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
      hooks: [
        {
          id: 'hook-3a',
          text: 'If you wear glasses on camera, throw your ring light out and try this 45-degree angle.',
          angle: 'Contrarian',
          isPrimary: true,
          updatedAt: addDays(now, -1).toISOString(),
        },
      ],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: true },
        { id: 'c3', label: 'Script or talking points', done: false },
        { id: 'c4', label: 'Filmed / recorded', done: false },
        { id: 'c5', label: 'Edited & captioned', done: false },
        { id: 'c6', label: 'Scheduled or posted', done: false },
      ],
    },
    {
      id: 'item-4',
      title: '5 Retention Mistakes in the First 8 Seconds',
      platform: 'YouTube',
      stage: 'scheduled',
      category: 'Growth & Retention',
      notes: 'Audit 3 real retention graphs: slow intros, greeting the audience, and redundant title repetition.',
      scheduledDate: today,
      scheduledTime: '17:00',
      createdAt: addDays(now, -8).toISOString(),
      updatedAt: now.toISOString(),
      hooks: [
        {
          id: 'hook-4a',
          text: 'Forty percent of viewers leave before second eight because of one sentence almost everyone says.',
          angle: 'Data / Stat',
          isPrimary: true,
          updatedAt: now.toISOString(),
        },
      ],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: true },
        { id: 'c3', label: 'Script or talking points', done: true },
        { id: 'c4', label: 'Filmed / recorded', done: true },
        { id: 'c5', label: 'Edited & captioned', done: true },
        { id: 'c6', label: 'Scheduled or posted', done: true },
      ],
    },
    {
      id: 'item-5',
      title: 'Pocket Rig Checklist for Travel Creators',
      platform: 'Instagram',
      stage: 'idea',
      category: 'Gear',
      notes: 'Carousel + short reel: phone cage, ND filter, wireless lav, mini tripod that fits in a jacket pocket.',
      scheduledDate: null,
      scheduledTime: null,
      createdAt: addDays(now, -2).toISOString(),
      updatedAt: addDays(now, -2).toISOString(),
      hooks: [],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: false },
        { id: 'c3', label: 'Script or talking points', done: false },
        { id: 'c4', label: 'Filmed / recorded', done: false },
        { id: 'c5', label: 'Edited & captioned', done: false },
        { id: 'c6', label: 'Scheduled or posted', done: false },
      ],
    },
    {
      id: 'item-6',
      title: 'The Hook Bank Habit: Never Start From a Blank Page',
      platform: 'Newsletter',
      stage: 'published',
      category: 'Writing',
      notes: 'Published issue #42 breaking down how collecting 3 hooks a day eliminates writer’s block.',
      scheduledDate: twoDaysAgo,
      scheduledTime: '09:00',
      createdAt: addDays(now, -10).toISOString(),
      updatedAt: twoDaysAgo,
      hooks: [
        {
          id: 'hook-6a',
          text: 'The best creators do not write better hooks on filming day — they collect them all week.',
          angle: 'Story',
          isPrimary: true,
          updatedAt: addDays(now, -3).toISOString(),
        },
      ],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: true },
        { id: 'c3', label: 'Script or talking points', done: true },
        { id: 'c4', label: 'Filmed / recorded', done: true },
        { id: 'c5', label: 'Edited & captioned', done: true },
        { id: 'c6', label: 'Scheduled or posted', done: true },
      ],
    },
    {
      id: 'item-7',
      title: 'Color Grading Log Footage in 60 Seconds',
      platform: 'Shorts / Reels',
      stage: 'published',
      category: 'Audio & Editing',
      notes: 'Quick CST node order + contrast pivot tip for natural skin tones.',
      scheduledDate: fourDaysAgo,
      scheduledTime: '14:00',
      createdAt: addDays(now, -9).toISOString(),
      updatedAt: fourDaysAgo,
      hooks: [
        {
          id: 'hook-7a',
          text: 'Stop slapping LUTs on gray footage before setting these two exposure sliders.',
          angle: 'Tutorial',
          isPrimary: true,
          updatedAt: addDays(now, -5).toISOString(),
        },
      ],
      checklist: [
        { id: 'c1', label: 'Core angle validated', done: true },
        { id: 'c2', label: 'Opening hook locked', done: true },
        { id: 'c3', label: 'Script or talking points', done: true },
        { id: 'c4', label: 'Filmed / recorded', done: true },
        { id: 'c5', label: 'Edited & captioned', done: true },
        { id: 'c6', label: 'Scheduled or posted', done: true },
      ],
    },
  ];
}
