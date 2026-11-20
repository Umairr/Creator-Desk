import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Search, X } from 'lucide-react';
import {
  ContentItem,
  PLATFORMS,
  Platform,
  STAGES,
  Stage,
} from '../types/creator';
import { formatShortDate } from '../utils/dates';
import { STAGE_META } from '../utils/presentation';

interface SearchViewProps {
  items: ContentItem[];
  onOpenItem: (item: ContentItem) => void;
}

export function SearchView({ items, onOpenItem }: SearchViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'scheduled' | 'unscheduled'>('all');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .map((item) => {
        if (platformFilter !== 'all' && item.platform !== platformFilter) return null;
        if (stageFilter !== 'all' && item.stage !== stageFilter) return null;
        if (scheduleFilter === 'scheduled' && !item.scheduledDate) return null;
        if (scheduleFilter === 'unscheduled' && item.scheduledDate) return null;

        if (!q) {
          return { item, matchSource: null as string | null };
        }

        if (item.title.toLowerCase().includes(q)) {
          return { item, matchSource: 'Title match' };
        }
        const matchedHook = item.hooks.find((h) => h.text.toLowerCase().includes(q));
        if (matchedHook) {
          return { item, matchSource: `Hook: “${matchedHook.text}”` };
        }
        if (item.category.toLowerCase().includes(q)) {
          return { item, matchSource: `Category: ${item.category}` };
        }
        if (item.notes.toLowerCase().includes(q)) {
          return { item, matchSource: 'Matched in notes' };
        }
        if (item.platform.toLowerCase().includes(q)) {
          return { item, matchSource: `Platform: ${item.platform}` };
        }
        return null;
      })
      .filter((entry): entry is { item: ContentItem; matchSource: string | null } => entry !== null)
      .sort((a, b) => b.item.updatedAt.localeCompare(a.item.updatedAt));
  }, [items, query, platformFilter, stageFilter, scheduleFilter]);

  const hasFilters =
    query.trim() !== '' ||
    platformFilter !== 'all' ||
    stageFilter !== 'all' ||
    scheduleFilter !== 'all';

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Search Bar & Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, video hooks, categories, or notes..."
            aria-label="Search Creator Desk"
            className="w-full min-h-[46px] pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
            aria-label="Filter by platform"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
            aria-label="Filter by stage"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value as 'all' | 'scheduled' | 'unscheduled')}
            aria-label="Filter by schedule status"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Any Schedule</option>
            <option value="scheduled">Scheduled Only</option>
            <option value="unscheduled">Unscheduled Only</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setPlatformFilter('all');
                setStageFilter('all');
                setScheduleFilter('all');
              }}
              className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {results.length === 0 ? (
          <div className="p-10 text-center">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No matching content found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try a different keyword across your titles, hooks, or notes.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {results.map(({ item, matchSource }) => {
              const meta = STAGE_META[item.stage];
              const primaryHook = item.hooks.find((h) => h.isPrimary) || item.hooks[0];

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onOpenItem(item)}
                    className="w-full p-4 sm:px-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/35 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className={`font-semibold ${meta.textColor}`}>{meta.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.platform}</span>
                        {item.category && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.category}</span>
                          </>
                        )}
                      </div>

                      {item.scheduledDate && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatShortDate(item.scheduledDate)}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>

                    {matchSource ? (
                      <p className="mt-1 text-xs text-blue-700 dark:text-blue-400 line-clamp-1">
                        {matchSource}
                      </p>
                    ) : (
                      primaryHook && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          “{primaryHook.text}”
                        </p>
                      )
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
