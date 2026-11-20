import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CalendarView } from './components/CalendarView';
import { ContentEditorSheet } from './components/ContentEditorSheet';
import { DashboardView } from './components/DashboardView';
import { HooksStudioView } from './components/HooksStudioView';
import { IdeasView } from './components/IdeasView';
import {
  DesktopNavigationRail,
  MobileBottomNav,
  MobileTopBar,
} from './components/Navigation';
import { SearchView } from './components/SearchView';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { buildStarterItems, DEFAULT_CHECKLIST } from './data/starterData';
import {
  ContentItem,
  DeskSettings,
  HookAngle,
  NavTab,
  Platform,
  Stage,
} from './types/creator';
import { getEndOfWeek, getStartOfWeek, toLocalDateKey } from './utils/dates';
import { STAGE_META } from './utils/presentation';
import {
  createId,
  loadItems,
  loadSettings,
  saveItems,
  saveSettings,
} from './utils/storage';

const VIEW_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Track weekly output, upcoming posts, and active drafts',
  },
  ideas: {
    title: 'Ideas & Pipeline',
    subtitle: 'Organize concepts from spark to published',
  },
  hooks: {
    title: 'Video Hooks',
    subtitle: 'Draft opening lines and measure spoken pacing',
  },
  calendar: {
    title: 'Content Calendar',
    subtitle: 'Plan publish dates across the month',
  },
  search: {
    title: 'Search Desk',
    subtitle: 'Find any idea, hook, or production note',
  },
};

export default function App() {
  const [items, setItems] = useState<ContentItem[]>(() => loadItems());
  const [settings, setSettings] = useState<DeskSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [ideasStageFilter, setIdeasStageFilter] = useState<Stage | 'all'>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editorInitialDate, setEditorInitialDate] = useState<string | null>(null);
  const [editorInitialTab, setEditorInitialTab] = useState<'details' | 'hooks' | 'checklist'>('details');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    saveSettings(settings);
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !editorOpen && !settingsOpen) {
        const target = e.target as HTMLElement | null;
        const isTyping =
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.tagName === 'SELECT';
        if (!isTyping) {
          e.preventDefault();
          setActiveTab('search');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorOpen, settingsOpen]);

  const weeklyPublished = useMemo(() => {
    const now = new Date();
    const weekStartKey = toLocalDateKey(getStartOfWeek(now));
    const weekEndKey = toLocalDateKey(getEndOfWeek(now));
    return items.filter((item) => {
      if (item.stage !== 'published') return false;
      const refDate = item.scheduledDate || item.updatedAt.slice(0, 10);
      return refDate >= weekStartKey && refDate <= weekEndKey;
    }).length;
  }, [items]);

  const handleOpenNew = (dateKey: string | null = null) => {
    setEditingItem(null);
    setEditorInitialDate(dateKey);
    setEditorInitialTab('details');
    setEditorOpen(true);
  };

  const handleOpenItem = (
    item: ContentItem,
    initialTab: 'details' | 'hooks' | 'checklist' = 'details'
  ) => {
    setEditingItem(item);
    setEditorInitialDate(null);
    setEditorInitialTab(initialTab);
    setEditorOpen(true);
  };

  const handleQuickCreate = (title: string, platform: Platform) => {
    const nowIso = new Date().toISOString();
    const newItem: ContentItem = {
      id: createId('item'),
      title,
      platform,
      stage: 'idea',
      category: '',
      notes: '',
      hooks: [],
      checklist: DEFAULT_CHECKLIST(),
      scheduledDate: null,
      scheduledTime: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setItems((prev) => [newItem, ...prev]);
    notify('Idea saved locally');
  };

  const handleSaveItem = (saved: ContentItem, isNew: boolean) => {
    setItems((prev) => {
      if (isNew) {
        return [saved, ...prev];
      }
      return prev.map((existing) => (existing.id === saved.id ? saved : existing));
    });
    setEditorOpen(false);
    notify(isNew ? 'Content idea saved' : 'Changes saved');
  };

  const handleDuplicateItem = (source: ContentItem) => {
    const nowIso = new Date().toISOString();
    const clone: ContentItem = {
      ...source,
      id: createId('item'),
      title: `${source.title} (Copy)`,
      stage: 'idea',
      scheduledDate: null,
      scheduledTime: null,
      hooks: source.hooks.map((h) => ({ ...h, id: createId('hook'), updatedAt: nowIso })),
      checklist: DEFAULT_CHECKLIST(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setItems((prev) => [clone, ...prev]);
    setEditingItem(clone);
    setEditorInitialTab('details');
    notify('Duplicated as new draft');
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setEditorOpen(false);
    notify('Content item deleted');
  };

  const handleAdvanceStage = (id: string, nextStage: Stage) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updatedChecklist =
          nextStage === 'published'
            ? item.checklist.map((step) => ({ ...step, done: true }))
            : item.checklist;
        return {
          ...item,
          stage: nextStage,
          checklist: updatedChecklist,
          updatedAt: nowIso,
        };
      })
    );
    notify(`Moved to ${STAGE_META[nextStage].label}`);
  };

  const handleAddHookToItem = (
    itemId: string,
    text: string,
    angle: HookAngle,
    isPrimary: boolean
  ) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const shouldBePrimary = isPrimary || item.hooks.length === 0;
        const nextHooks = shouldBePrimary
          ? item.hooks.map((h) => ({ ...h, isPrimary: false }))
          : [...item.hooks];
        nextHooks.unshift({
          id: createId('hook'),
          text,
          angle,
          isPrimary: shouldBePrimary,
          updatedAt: nowIso,
        });
        return {
          ...item,
          stage: item.stage === 'idea' ? 'hooked' : item.stage,
          hooks: nextHooks,
          checklist: item.checklist.map((s) =>
            s.id === 'step-hook' || s.label.toLowerCase().includes('hook')
              ? { ...s, done: true }
              : s
          ),
          updatedAt: nowIso,
        };
      })
    );
    notify('Hook added to idea');
  };

  const handleCreateIdeaWithHook = (title: string, text: string, angle: HookAngle) => {
    const nowIso = new Date().toISOString();
    const newItem: ContentItem = {
      id: createId('item'),
      title,
      platform: settings.defaultPlatform,
      stage: 'hooked',
      category: '',
      notes: '',
      hooks: [
        {
          id: createId('hook'),
          text,
          angle,
          isPrimary: true,
          updatedAt: nowIso,
        },
      ],
      checklist: DEFAULT_CHECKLIST().map((s) =>
        s.id === 'step-hook' ? { ...s, done: true } : s
      ),
      scheduledDate: null,
      scheduledTime: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setItems((prev) => [newItem, ...prev]);
    notify('Created idea with primary hook');
  };

  const handleUpdateHook = (itemId: string, hookId: string, text: string, angle: HookAngle) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          hooks: item.hooks.map((h) =>
            h.id === hookId ? { ...h, text, angle, updatedAt: nowIso } : h
          ),
          updatedAt: nowIso,
        };
      })
    );
    notify('Hook updated');
  };

  const handleDeleteHook = (itemId: string, hookId: string) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const remaining = item.hooks.filter((h) => h.id !== hookId);
        if (remaining.length > 0 && !remaining.some((h) => h.isPrimary)) {
          remaining[0] = { ...remaining[0], isPrimary: true };
        }
        return {
          ...item,
          hooks: remaining,
          updatedAt: nowIso,
        };
      })
    );
    notify('Hook deleted');
  };

  const handleTogglePrimaryHook = (itemId: string, hookId: string) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          hooks: item.hooks.map((h) => ({
            ...h,
            isPrimary: h.id === hookId,
          })),
          updatedAt: nowIso,
        };
      })
    );
    notify('Primary hook updated');
  };

  const handleScheduleExisting = (itemId: string, dateKey: string) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          scheduledDate: dateKey,
          scheduledTime: item.scheduledTime || '12:00',
          stage: item.stage === 'published' ? 'published' : 'scheduled',
          updatedAt: nowIso,
        };
      })
    );
    notify('Scheduled on calendar');
  };

  const handleUnscheduleItem = (itemId: string) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          scheduledDate: null,
          scheduledTime: null,
          stage: item.stage === 'scheduled' ? 'filming' : item.stage,
          updatedAt: nowIso,
        };
      })
    );
    notify('Removed from schedule');
  };

  const handleNavigate = (tab: NavTab, stageFilter?: Stage | 'all') => {
    if (stageFilter !== undefined) {
      setIdeasStageFilter(stageFilter);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const viewHeader = VIEW_TITLES[activeTab];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* Desktop Left Navigation Rail */}
      <DesktopNavigationRail
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        onNewContent={() => handleOpenNew(null)}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={settings.theme}
        onToggleTheme={() =>
          setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        }
        weeklyPublished={weeklyPublished}
        weeklyGoal={settings.weeklyGoal}
      />

      {/* Mobile Top Bar */}
      <MobileTopBar
        activeTab={activeTab}
        onNewContent={() => handleOpenNew(null)}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={settings.theme}
        onToggleTheme={() =>
          setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        }
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header */}
        <header className="hidden lg:flex h-16 px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-20 items-center justify-between gap-8">
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100 truncate">
              {viewHeader.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab !== 'search' && (
              <button
                type="button"
                onClick={() => handleNavigate('search')}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-[#131A26] dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search ideas & hooks</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                  /
                </kbd>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenNew(null)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Idea</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:py-7">
          {activeTab === 'dashboard' && (
            <DashboardView
              items={items}
              weeklyGoal={settings.weeklyGoal}
              defaultPlatform={settings.defaultPlatform}
              onQuickCreate={handleQuickCreate}
              onOpenItem={(item) => handleOpenItem(item)}
              onAdvanceStage={handleAdvanceStage}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasView
              items={items}
              stageFilter={ideasStageFilter}
              onStageFilterChange={setIdeasStageFilter}
              onOpenItem={handleOpenItem}
              onAdvanceStage={handleAdvanceStage}
              onNewContent={() => handleOpenNew(null)}
            />
          )}

          {activeTab === 'hooks' && (
            <HooksStudioView
              items={items}
              onAddHookToItem={handleAddHookToItem}
              onCreateIdeaWithHook={handleCreateIdeaWithHook}
              onUpdateHook={handleUpdateHook}
              onDeleteHook={handleDeleteHook}
              onTogglePrimaryHook={handleTogglePrimaryHook}
              onOpenItem={(item) => handleOpenItem(item, 'hooks')}
              onCopySuccess={notify}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              items={items}
              onOpenItem={(item) => handleOpenItem(item)}
              onNewForDate={(dateKey) => handleOpenNew(dateKey)}
              onScheduleExisting={handleScheduleExisting}
              onUnscheduleItem={handleUnscheduleItem}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              items={items}
              onOpenItem={(item) => handleOpenItem(item)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onSelectTab={(tab) => handleNavigate(tab)} />

      {/* Content Editor Bottom Sheet / Modal */}
      <ContentEditorSheet
        isOpen={editorOpen}
        item={editingItem}
        initialDate={editorInitialDate}
        initialTab={editorInitialTab}
        defaultPlatform={settings.defaultPlatform}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveItem}
        onDuplicate={handleDuplicateItem}
        onDelete={handleDeleteItem}
        onNotify={notify}
      />

      {/* Settings & Local Storage Backup Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        items={items}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={setSettings}
        onImportItems={(imported) => {
          setItems(imported);
          notify(`Imported ${imported.length} items`);
        }}
        onResetSample={() => {
          setItems(buildStarterItems());
          notify('Sample workspace restored');
        }}
        onClearAll={() => {
          setItems([]);
          notify('Workspace cleared');
        }}
        onNotify={notify}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
