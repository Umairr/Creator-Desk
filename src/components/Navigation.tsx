import {
  CalendarDays,
  LayoutDashboard,
  Lightbulb,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
} from 'lucide-react';
import { NavTab } from '../types/creator';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewContent: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  weeklyPublished: number;
  weeklyGoal: number;
}

const NAV_ITEMS: { id: NavTab; label: string; mobileLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard },
  { id: 'ideas', label: 'Ideas & Pipeline', mobileLabel: 'Ideas', icon: Lightbulb },
  { id: 'hooks', label: 'Video Hooks', mobileLabel: 'Hooks', icon: Sparkles },
  { id: 'calendar', label: 'Calendar', mobileLabel: 'Calendar', icon: CalendarDays },
  { id: 'search', label: 'Search', mobileLabel: 'Search', icon: Search },
];

export function DesktopNavigationRail({
  activeTab,
  onSelectTab,
  onNewContent,
  onOpenSettings,
  theme,
  onToggleTheme,
  weeklyPublished,
  weeklyGoal,
}: NavigationProps) {
  const goalPct = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyPublished / weeklyGoal) * 100)) : 0;

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 dark:lg:border-slate-800/90 bg-white dark:bg-[#101621] h-screen sticky top-0">
      <div className="px-5 h-16 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
        >
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-display font-bold text-sm tracking-tight">
            CD
          </span>
          <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
            Creator Desk
          </span>
        </button>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onNewContent}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Content</span>
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151D2B] border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">Weekly goal</span>
            <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100 font-semibold">
              {weeklyPublished}/{weeklyGoal}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Workspace settings and local backup"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar({
  activeTab,
  onNewContent,
  onOpenSettings,
  theme,
  onToggleTheme,
}: Pick<NavigationProps, 'activeTab' | 'onNewContent' | 'onOpenSettings' | 'theme' | 'onToggleTheme'>) {
  const current = NAV_ITEMS.find((i) => i.id === activeTab);

  return (
    <header className="lg:hidden sticky top-0 z-30 h-[52px] px-4 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-display font-bold text-xs shrink-0">
          CD
        </span>
        <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 truncate">
          {activeTab === 'dashboard' ? 'Creator Desk' : current?.mobileLabel || 'Creator Desk'}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Workspace settings and local backup"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>

        <button
          type="button"
          onClick={onNewContent}
          aria-label="Create new content idea"
          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New</span>
        </button>
      </div>
    </header>
  );
}

export function MobileBottomNav({
  activeTab,
  onSelectTab,
}: Pick<NavigationProps, 'activeTab' | 'onSelectTab'>) {
  return (
    <nav
      aria-label="Bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-white/95 dark:bg-[#101621]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center px-1"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`min-h-[44px] py-1 flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div
              className={`px-3 py-0.5 rounded-full transition-colors ${
                isActive ? 'bg-blue-50 dark:bg-blue-500/15' : ''
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
              {item.mobileLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
