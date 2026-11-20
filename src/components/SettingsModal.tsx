import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Download, Minus, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { ContentItem, DeskSettings, PLATFORMS, Platform } from '../types/creator';
import { sanitizeContentItems, sanitizeSettings } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  settings: DeskSettings;
  items: ContentItem[];
  onClose: () => void;
  onUpdateSettings: (next: DeskSettings) => void;
  onImportItems: (items: ContentItem[]) => void;
  onResetSample: () => void;
  onClearAll: () => void;
  onNotify: (message: string) => void;
}

export function SettingsModal({
  isOpen,
  settings,
  items,
  onClose,
  onUpdateSettings,
  onImportItems,
  onResetSample,
  onClearAll,
  onNotify,
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setConfirmClear(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Creator Desk',
      settings,
      items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-desk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Backup exported as JSON');
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawItems = Array.isArray(parsed) ? parsed : parsed?.items;
      if (!Array.isArray(rawItems)) {
        onNotify('Invalid backup file format');
        return;
      }
      const cleanItems = sanitizeContentItems(rawItems);
      if (rawItems.length > 0 && cleanItems.length === 0) {
        onNotify('No valid content items found in backup');
        return;
      }
      if (!Array.isArray(parsed) && parsed?.settings) {
        onUpdateSettings(sanitizeSettings(parsed.settings, settings));
      }
      onImportItems(cleanItems);
      onClose();
    } catch {
      onNotify('Could not read backup JSON');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full lg:max-w-md max-h-[90vh] bg-white dark:bg-[#131A26] rounded-t-3xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        <div className="lg:hidden pt-2.5 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
        </div>

        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <h2 id="settings-modal-title" className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
            Workspace & Local Data
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Weekly Goal */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Weekly publish goal</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Posts target per week</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    weeklyGoal: Math.max(1, settings.weeklyGoal - 1),
                  })
                }
                aria-label="Decrease weekly goal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono font-semibold text-base tabular-nums text-slate-900 dark:text-slate-100">
                {settings.weeklyGoal}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    weeklyGoal: Math.min(21, settings.weeklyGoal + 1),
                  })
                }
                aria-label="Increase weekly goal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Default Platform */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <label htmlFor="default-platform-select" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Default platform
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pre-selected for new ideas</p>
            </div>
            <select
              id="default-platform-select"
              value={settings.defaultPlatform}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultPlatform: e.target.value as Platform,
                })
              }
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Appearance */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Appearance</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved locally on this device</p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800">
              {(['light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, theme: mode })}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                    settings.theme === mode
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Local Storage Backup */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Local data storage
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                {items.length} content items stored in browser local storage
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onResetSample();
                  onClose();
                }}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Samples</span>
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="min-h-[42px] px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-medium text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                    onClose();
                  }}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Confirm Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
