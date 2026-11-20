import { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Lightbulb, Plus, Sparkles } from 'lucide-react';
import {
  ContentItem,
  PLATFORMS,
  Platform,
  STAGES,
  Stage,
} from '../types/creator';
import { formatShortDate } from '../utils/dates';
import { getChecklistProgress, STAGE_META } from '../utils/presentation';

interface IdeasViewProps {
  items: ContentItem[];
  stageFilter: Stage | 'all';
  onStageFilterChange: (stage: Stage | 'all') => void;
  onOpenItem: (item: ContentItem, initialSection?: 'details' | 'hooks' | 'checklist') => void;
  onAdvanceStage: (id: string, nextStage: Stage) => void;
  onNewContent: () => void;
}

type SortKey = 'updated' | 'scheduled' | 'title';

export function IdeasView({
  items,
  stageFilter,
  onStageFilterChange,
  onOpenItem,
  onAdvanceStage,
  onNewContent,
}: IdeasViewProps) {
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('updated');

  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      if (stageFilter !== 'all' && item.stage !== stageFilter) return false;
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'scheduled') {
        if (!a.scheduledDate && !b.scheduledDate) return b.updatedAt.localeCompare(a.updatedAt);
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [items, stageFilter, platformFilter, sortBy]);

  return (
    <div className="space-y-5">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#131A26] border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => onStageFilterChange('all')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              stageFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All <span className="ml-1 font-mono tabular-nums opacity-75">{items.length}</span>
          </button>

          {STAGES.map((stage) => {
            const count = items.filter((i) => i.stage === stage.id).length;
            const active = stageFilter === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onStageFilterChange(stage.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {stage.label} <span className="ml-1 font-mono tabular-nums opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
            aria-label="Filter by platform"
            className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            aria-label="Sort content"
            className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="updated">Recently Updated</option>
            <option value="scheduled">Target Date</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      {/* Content List / Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-center">
          <Lightbulb className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
            No matching content items
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try switching filters or capture a new content idea to start building your queue.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2.5">
            {(stageFilter !== 'all' || platformFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  onStageFilterChange('all');
                  setPlatformFilter('all');
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={onNewContent}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Idea</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const meta = STAGE_META[item.stage];
            const progress = getChecklistProgress(item.checklist);
            const primaryHook = item.hooks.find((h) => h.isPrimary) || item.hooks[0];

            return (
              <article
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`font-semibold ${meta.textColor}`}>{meta.label}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.platform}</span>
                    {item.category && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[140px]">{item.category}</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenItem(item)}
                    className="block w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
                  >
                    <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                  </button>

                  {primaryHook ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      “{primaryHook.text}”
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                      No opening hook drafted yet
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {item.scheduledDate ? formatShortDate(item.scheduledDate) : 'Unscheduled'}
                    </span>

                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta.barColor}`}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-[11px]">
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenItem(item, 'hooks')}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="tabular-nums">Hooks ({item.hooks.length})</span>
                    </button>

                    {meta.nextStage && meta.nextActionLabel ? (
                      <button
                        type="button"
                        onClick={() => onAdvanceStage(item.id, meta.nextStage!)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-500/15 dark:text-slate-200 dark:hover:text-blue-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>{meta.nextActionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer whitespace-nowrap"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
