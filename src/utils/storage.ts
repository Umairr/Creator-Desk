import { buildStarterItems, DEFAULT_CHECKLIST } from '../data/starterData';
import {
  ChecklistStep,
  ContentItem,
  DeskSettings,
  HOOK_ANGLES,
  HookAngle,
  PLATFORMS,
  Platform,
  STAGES,
  Stage,
  VideoHook,
} from '../types/creator';

const ITEMS_KEY = 'creator_desk_items_v1';
const SETTINGS_KEY = 'creator_desk_settings_v1';

const VALID_PLATFORMS = new Set<string>(PLATFORMS);
const VALID_STAGES = new Set<string>(STAGES.map((s) => s.id));
const VALID_ANGLES = new Set<string>(HOOK_ANGLES);

export function getDefaultSettings(): DeskSettings {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    weeklyGoal: 4,
    theme: prefersDark ? 'dark' : 'light',
    defaultPlatform: 'Shorts / Reels',
  };
}

export function sanitizeContentItems(rawList: unknown): ContentItem[] {
  if (!Array.isArray(rawList)) return [];

  const nowIso = new Date().toISOString();

  return rawList
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'))
    .map((raw) => {
      const title = typeof raw.title === 'string' ? raw.title.trim() : '';
      if (!title) return null;

      const platform: Platform =
        typeof raw.platform === 'string' && VALID_PLATFORMS.has(raw.platform)
          ? (raw.platform as Platform)
          : 'Shorts / Reels';

      const stage: Stage =
        typeof raw.stage === 'string' && VALID_STAGES.has(raw.stage)
          ? (raw.stage as Stage)
          : 'idea';

      const hooks: VideoHook[] = Array.isArray(raw.hooks)
        ? raw.hooks
            .filter((h): h is Record<string, unknown> => Boolean(h && typeof h === 'object'))
            .map((h) => ({
              id: typeof h.id === 'string' && h.id ? h.id : createId('hook'),
              text: typeof h.text === 'string' ? h.text.trim() : '',
              angle:
                typeof h.angle === 'string' && VALID_ANGLES.has(h.angle)
                  ? (h.angle as HookAngle)
                  : 'Curiosity',
              isPrimary: Boolean(h.isPrimary),
              updatedAt: typeof h.updatedAt === 'string' ? h.updatedAt : nowIso,
            }))
            .filter((h) => h.text.length > 0)
        : [];

      if (hooks.length > 0 && !hooks.some((h) => h.isPrimary)) {
        hooks[0].isPrimary = true;
      }

      const checklist: ChecklistStep[] = Array.isArray(raw.checklist)
        ? raw.checklist
            .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === 'object'))
            .map((s) => ({
              id: typeof s.id === 'string' && s.id ? s.id : createId('step'),
              label: typeof s.label === 'string' ? s.label.trim() : '',
              done: Boolean(s.done),
            }))
            .filter((s) => s.label.length > 0)
        : DEFAULT_CHECKLIST();

      const scheduledDate =
        typeof raw.scheduledDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.scheduledDate)
          ? raw.scheduledDate
          : null;

      const scheduledTime =
        scheduledDate && typeof raw.scheduledTime === 'string' && /^\d{2}:\d{2}$/.test(raw.scheduledTime)
          ? raw.scheduledTime
          : null;

      return {
        id: typeof raw.id === 'string' && raw.id ? raw.id : createId('item'),
        title,
        platform,
        stage,
        category: typeof raw.category === 'string' ? raw.category.trim() : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        hooks,
        checklist: checklist.length > 0 ? checklist : DEFAULT_CHECKLIST(),
        scheduledDate,
        scheduledTime,
        createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : nowIso,
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : nowIso,
      };
    })
    .filter((item): item is ContentItem => item !== null);
}

export function sanitizeSettings(raw: unknown, fallback: DeskSettings): DeskSettings {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  const weeklyGoal =
    typeof obj.weeklyGoal === 'number' && Number.isFinite(obj.weeklyGoal)
      ? Math.min(21, Math.max(1, Math.round(obj.weeklyGoal)))
      : fallback.weeklyGoal;
  const theme = obj.theme === 'dark' || obj.theme === 'light' ? obj.theme : fallback.theme;
  const defaultPlatform =
    typeof obj.defaultPlatform === 'string' && VALID_PLATFORMS.has(obj.defaultPlatform)
      ? (obj.defaultPlatform as Platform)
      : fallback.defaultPlatform;

  return { weeklyGoal, theme, defaultPlatform };
}

export function loadItems(): ContentItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      const starter = buildStarterItems();
      localStorage.setItem(ITEMS_KEY, JSON.stringify(starter));
      return starter;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return buildStarterItems();
    }
    return sanitizeContentItems(parsed);
  } catch {
    return buildStarterItems();
  }
}

export function saveItems(items: ContentItem[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota errors cleanly
  }
}

export function loadSettings(): DeskSettings {
  const defaults = getDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return sanitizeSettings(parsed, defaults);
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: DeskSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors cleanly
  }
}

export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
