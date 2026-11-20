export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseLocalDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatShortDate(dateKey: string): string {
  const date = parseLocalDate(dateKey);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLongDate(dateKey: string): string {
  const date = parseLocalDate(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDay(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'Today';
  const tomorrowKey = toLocalDateKey(addDays(parseLocalDate(todayKey), 1));
  if (dateKey === tomorrowKey) return 'Tomorrow';
  const yesterdayKey = toLocalDateKey(addDays(parseLocalDate(todayKey), -1));
  if (dateKey === yesterdayKey) return 'Yesterday';
  return formatShortDate(dateKey);
}

export function getStartOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function getEndOfWeek(date: Date): Date {
  return addDays(getStartOfWeek(date), 6);
}

export function getMonthGridDays(year: number, monthIndex: number): { dateKey: string; inMonth: boolean; dayNumber: number }[] {
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const startDate = addDays(firstDay, -startOffset);
  const cells: { dateKey: string; inMonth: boolean; dayNumber: number }[] = [];

  for (let i = 0; i < 42; i++) {
    const d = addDays(startDate, i);
    cells.push({
      dateKey: toLocalDateKey(d),
      inMonth: d.getMonth() === monthIndex,
      dayNumber: d.getDate(),
    });
  }
  return cells;
}

export function estimateHookSeconds(text: string): { words: number; seconds: number; rating: 'Optimal' | 'Tight' | 'Trim' } {
  const cleaned = text.trim();
  if (!cleaned) return { words: 0, seconds: 0, rating: 'Optimal' };
  const words = cleaned.split(/\s+/).length;
  // ~145 words per minute (~2.42 words/sec) for energetic short-form delivery
  const seconds = Number((words / 2.42).toFixed(1));
  let rating: 'Optimal' | 'Tight' | 'Trim' = 'Optimal';
  if (seconds > 5.0) {
    rating = 'Trim';
  } else if (seconds > 3.5) {
    rating = 'Tight';
  }
  return { words, seconds, rating };
}
