import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  ContentItem,
  NavTab,
  PLATFORMS,
  Platform,
  STAGES,
  Stage,
} from '../types/creator';
import {
  formatRelativeDay,
  getEndOfWeek,
  getStartOfWeek,
  toLocalDateKey,
} from '../utils/dates';
import { getChecklistProgress, STAGE_META } from '../utils/presentation';

interface DashboardViewProps {
  items: ContentItem[];
  weeklyGoal: number;
  defaultPlatform: Platform;
  onQuickCreate: (title: string, platform: Platform) => void;
  onOpenItem: (item: ContentItem) => void;
  onAdvanceStage: (id: string, nextStage: Stage) => void;
  onNavigate: (tab: NavTab, stageFilter?: Stage | 'all') => void;
}

export function DashboardView({
  items,
  weeklyGoal,
  defaultPlatform,
  onQuickCreate,
  onOpenItem,
  onAdvanceStage,
  onNavigate,
}: DashboardViewProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPlatform, setQuickPlatform] = useState<Platform>(defaultPlatform);

  useEffect(() => {
    setQuickPlatform(defaultPlatform);
  }, [defaultPlatform]);

  const now = new Date();
  const todayKey = toLocalDateKey(now);
  const weekStartKey = toLocalDateKey(getStartOfWeek(now));
  const weekEndKey = toLocalDateKey(getEndOfWeek(now));

  const publishedThisWeek = items.filter((item) => {
    if (item.stage !== 'published') return false;
    const refDate = item.scheduledDate || item.updatedAt.slice(0, 10);
    return refDate >= weekStartKey && refDate <= weekEndKey;
  }).length;

  // Include overdue scheduled items (past due & not yet marked published) plus upcoming scheduled posts
  const scheduledQueue = items
    .filter((item) => item.stage === 'scheduled' && Boolean(item.scheduledDate))
    .sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));

  const scheduledThisWeek = items.filter(
    (item) =>
      (item.stage === 'scheduled' || item.stage === 'published') &&
      item.scheduledDate &&
      item.scheduledDate >= weekStartKey &&
      item.scheduledDate <= weekEndKey
  ).length;

  const activeQueue = items
    .filter((item) => item.stage === 'idea' || item.stage === 'hooked' || item.stage === 'filming')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const totalHooks = items.reduce((sum, item) => sum + item.hooks.length, 0);
  const goalPercent = weeklyGoal > 0 ? Math.min(100, Math.round((publishedThisWeek / weeklyGoal) * 100)) : 0;
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (goalPercent / 100) * ringCircumference;

  const platformCounts = PLATFORMS.map((platform) => ({
    platform,
    count: items.filter((i) => i.platform === platform).length,
  })).filter((entry) => entry.count > 0);

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    onQuickCreate(trimmed, quickPlatform);
    setQuickTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Quick Capture Strip */}
      <section aria-label="Quick idea capture">
        <form
          onSubmit={handleQuickSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Capture a content idea or working title..."
              aria-label="New content idea title"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={quickPlatform}
              onChange={(e) => setQuickPlatform(e.target.value as Platform)}
              aria-label="Select platform"
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 disabled:hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Save Idea</span>
            </button>
          </div>
        </form>
      </section>

      {/* Top Metrics */}
      <section aria-label="Creator metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Weekly goal</p>
            <p className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {publishedThisWeek} / {weeklyGoal}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {scheduledThisWeek} planned this week
            </p>
          </div>
          <svg className="w-14 h-14 -rotate-90 shrink-0" viewBox="0 0 56 56" aria-hidden="true">
            <circle
              cx="28"
              cy="28"
              r={ringRadius}
              fill="none"
              strokeWidth="5"
              className="stroke-slate-100 dark:stroke-slate-800"
            />
            <circle
              cx="28"
              cy="28"
              r={ringRadius}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-300"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('ideas', 'all')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In pipeline</p>
          <p className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {activeQueue.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ideas to filming
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('hooks')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Video hooks</p>
          <p className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {totalHooks}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Saved opening lines
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('calendar')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scheduled</p>
          <p className="mt-1 text-2xl font-display font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {scheduledQueue.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ready to publish
          </p>
        </button>
      </section>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upcoming Schedule */}
        <section
          aria-label="Upcoming schedule"
          className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
                Up next on schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Posts queued with target publish dates
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {scheduledQueue.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                No upcoming posts scheduled
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Assign a publish date to any idea in your pipeline to line up your week.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Calendar</span>
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {scheduledQueue.slice(0, 5).map((item) => {
                const primaryHook = item.hooks.find((h) => h.isPrimary) || item.hooks[0];
                const isOverdue = Boolean(item.scheduledDate && item.scheduledDate < todayKey);
                return (
                  <li key={item.id} className="p-4 sm:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="flex-1 text-left min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span
                            className={`font-medium ${
                              isOverdue
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-indigo-700 dark:text-indigo-400'
                            }`}
                          >
                            {isOverdue ? 'Overdue · ' : ''}
                            {item.scheduledDate ? formatRelativeDay(item.scheduledDate, todayKey) : 'Unscheduled'}
                            {item.scheduledTime ? ` at ${item.scheduledTime}` : ''}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.platform}</span>
                          {item.category && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{item.category}</span>
                            </>
                          )}
                        </div>

                        <h3 className="mt-1 font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </h3>

                        {primaryHook && (
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                            “{primaryHook.text}”
                          </p>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onAdvanceStage(item.id, 'published')}
                        title="Mark as published"
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30 dark:hover:text-emerald-400 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Active Production Queue */}
        <section
          aria-label="In progress queue"
          className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
                Active drafts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Advance hooks and production tasks
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ideas', 'all')}
              className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>All ideas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {activeQueue.length === 0 ? (
            <div className="p-8 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                All caught up
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Capture a fresh idea above to start drafting hooks.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {activeQueue.slice(0, 5).map((item) => {
                const meta = STAGE_META[item.stage];
                const progress = getChecklistProgress(item.checklist);
                return (
                  <li key={item.id} className="p-4 sm:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="flex-1 text-left min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className={`font-medium ${meta.textColor}`}>{meta.label}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.platform}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {item.hooks.length} {item.hooks.length === 1 ? 'hook' : 'hooks'}
                          </span>
                        </div>

                        <h3 className="mt-1 font-display font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </h3>

                        <div className="mt-2.5 flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${meta.barColor} transition-all duration-300`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                            {progress.done}/{progress.total}
                          </span>
                        </div>
                      </button>

                      {meta.nextStage && meta.nextActionLabel && (
                        <button
                          type="button"
                          onClick={() => onAdvanceStage(item.id, meta.nextStage!)}
                          className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-700 dark:hover:text-blue-400 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span>{meta.nextActionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Pipeline Summary Strip */}
      <section aria-label="Pipeline breakdown" className="rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
            Pipeline stages
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {items.length} total items
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {STAGES.map((stage) => {
            const count = items.filter((i) => i.stage === stage.id).length;
            const meta = STAGE_META[stage.id];
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onNavigate('ideas', stage.id)}
                className="min-h-[56px] p-3 rounded-xl bg-slate-50 dark:bg-[#0D131D] hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-medium ${meta.textColor}`}>{stage.label}</span>
                  <span className="font-mono font-semibold text-base tabular-nums text-slate-900 dark:text-slate-100">
                    {count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {stage.description}
                </p>
              </button>
            );
          })}
        </div>

        {platformCounts.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">By platform:</span>
            {platformCounts.map((entry, idx) => (
              <span key={entry.platform} className="inline-flex items-center gap-1.5 tabular-nums">
                {idx > 0 && <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 mr-2">/</span>}
                <span>{entry.platform}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {entry.count}
                </span>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
