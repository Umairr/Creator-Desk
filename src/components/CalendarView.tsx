import { useMemo, useState } from 'react';
import { CalendarDays, CalendarOff, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ContentItem, PLATFORMS, Platform } from '../types/creator';
import {
  formatLongDate,
  getMonthGridDays,
  parseLocalDate,
  toLocalDateKey,
} from '../utils/dates';
import { STAGE_META } from '../utils/presentation';

interface CalendarViewProps {
  items: ContentItem[];
  onOpenItem: (item: ContentItem) => void;
  onNewForDate: (dateKey: string) => void;
  onScheduleExisting: (itemId: string, dateKey: string) => void;
  onUnscheduleItem: (itemId: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarView({
  items,
  onOpenItem,
  onNewForDate,
  onScheduleExisting,
  onUnscheduleItem,
}: CalendarViewProps) {
  const today = new Date();
  const todayKey = toLocalDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [assignItemId, setAssignItemId] = useState('');

  const monthCells = useMemo(
    () => getMonthGridDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    items.forEach((item) => {
      if (!item.scheduledDate) return;
      if (platformFilter !== 'all' && item.platform !== platformFilter) return;
      const existing = map.get(item.scheduledDate) || [];
      existing.push(item);
      map.set(item.scheduledDate, existing);
    });
    map.forEach((list) => {
      list.sort((a, b) => (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99'));
    });
    return map;
  }, [items, platformFilter]);

  const unscheduledIdeas = useMemo(
    () =>
      items.filter(
        (i) =>
          !i.scheduledDate &&
          i.stage !== 'published' &&
          (platformFilter === 'all' || i.platform === platformFilter)
      ),
    [items, platformFilter]
  );

  const selectedDayItems = itemsByDate.get(selectedDateKey) || [];

  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateKey(toLocalDateKey(now));
  };

  const handleSelectCell = (dateKey: string, inMonth: boolean) => {
    setSelectedDateKey(dateKey);
    if (!inMonth) {
      const parsed = parseLocalDate(dateKey);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  };

  const handleAssignSubmit = () => {
    if (!assignItemId) return;
    onScheduleExisting(assignItemId, selectedDateKey);
    setAssignItemId('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Month Grid */}
      <section
        aria-label="Content calendar"
        className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100">
            {monthTitle}
          </h2>

          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
              aria-label="Filter calendar by platform"
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleToday}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D131D]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthCells.map((cell) => {
            const dayItems = itemsByDate.get(cell.dateKey) || [];
            const isSelected = cell.dateKey === selectedDateKey;
            const isToday = cell.dateKey === todayKey;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => handleSelectCell(cell.dateKey, cell.inMonth)}
                className={`min-h-[58px] sm:min-h-[88px] p-1.5 sm:p-2 border-b border-r border-slate-100 dark:border-slate-800/70 text-left flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-500/12'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                } ${!cell.inMonth ? 'opacity-45' : ''}`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono tabular-nums ${
                      isToday
                        ? 'bg-blue-600 text-white font-semibold'
                        : isSelected
                          ? 'text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayItems.length > 0 && (
                    <span className="sm:hidden text-[10px] font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {dayItems.length > 0 && (
                  <div className="sm:hidden flex items-center gap-0.5 mt-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className={`h-1 flex-1 rounded-full ${STAGE_META[item.stage].barColor}`}
                      />
                    ))}
                  </div>
                )}

                <div className="hidden sm:flex flex-col gap-1 mt-1 w-full">
                  {dayItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-medium truncate ${
                        item.stage === 'published'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.title}
                    </div>
                  ))}
                  {dayItems.length > 2 && (
                    <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 px-1">
                      +{dayItems.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Day Agenda */}
      <aside
        aria-label="Selected day schedule"
        className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
              {formatLongDate(selectedDateKey)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {selectedDayItems.length} {selectedDayItems.length === 1 ? 'post' : 'posts'} planned
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNewForDate(selectedDateKey)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Post</span>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {selectedDayItems.length === 0 ? (
            <div className="py-6 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Open slot on your calendar
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create a post for this date or schedule an existing draft below.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedDayItems.map((item) => {
                const meta = STAGE_META[item.stage];
                const primaryHook = item.hooks.find((h) => h.isPrimary) || item.hooks[0];

                return (
                  <li
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`font-semibold ${meta.textColor}`}>{meta.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.platform}</span>
                        {item.scheduledTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{item.scheduledTime}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      {primaryHook && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          “{primaryHook.text}”
                        </p>
                      )}
                    </button>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onUnscheduleItem(item.id)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <CalendarOff className="w-3 h-3" />
                        <span>Unschedule</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {unscheduledIdeas.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <label
                htmlFor="schedule-existing-select"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Schedule an unscheduled draft here
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="schedule-existing-select"
                  value={assignItemId}
                  onChange={(e) => setAssignItemId(e.target.value)}
                  className="flex-1 min-w-0 min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="">Choose a draft...</option>
                  {unscheduledIdeas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title} ({idea.platform})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignSubmit}
                  disabled={!assignItemId}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 text-xs font-medium transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
