import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, Copy, Pencil, Plus, Sparkles, Star, Trash2, X } from 'lucide-react';
import { HOOK_FRAMEWORKS } from '../data/starterData';
import { ContentItem, HOOK_ANGLES, HookAngle } from '../types/creator';
import { estimateHookSeconds } from '../utils/dates';

interface HooksStudioViewProps {
  items: ContentItem[];
  onAddHookToItem: (itemId: string, text: string, angle: HookAngle, isPrimary: boolean) => void;
  onCreateIdeaWithHook: (title: string, text: string, angle: HookAngle) => void;
  onUpdateHook: (itemId: string, hookId: string, text: string, angle: HookAngle) => void;
  onDeleteHook: (itemId: string, hookId: string) => void;
  onTogglePrimaryHook: (itemId: string, hookId: string) => void;
  onOpenItem: (item: ContentItem) => void;
  onCopySuccess: (message: string) => void;
}

export function HooksStudioView({
  items,
  onAddHookToItem,
  onCreateIdeaWithHook,
  onUpdateHook,
  onDeleteHook,
  onTogglePrimaryHook,
  onOpenItem,
  onCopySuccess,
}: HooksStudioViewProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || 'new');
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [hookText, setHookText] = useState('');
  const [hookAngle, setHookAngle] = useState<HookAngle>('Curiosity');
  const [markPrimary, setMarkPrimary] = useState(true);
  const [angleFilter, setAngleFilter] = useState<HookAngle | 'all'>('all');
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editingHookId, setEditingHookId] = useState<string | null>(null);
  const [editDraftText, setEditDraftText] = useState('');
  const [editDraftAngle, setEditDraftAngle] = useState<HookAngle>('Curiosity');

  // Keep selectedItemId valid whenever items are deleted, cleared, or restored
  useEffect(() => {
    if (items.length === 0) {
      setSelectedItemId('new');
      return;
    }
    if (selectedItemId !== 'new' && !items.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  const metrics = estimateHookSeconds(hookText);

  const allHooks = useMemo(() => {
    const flat: {
      hookId: string;
      itemId: string;
      itemTitle: string;
      platform: string;
      text: string;
      angle: HookAngle;
      isPrimary: boolean;
      updatedAt: string;
      item: ContentItem;
    }[] = [];

    items.forEach((item) => {
      item.hooks.forEach((hook) => {
        if (angleFilter !== 'all' && hook.angle !== angleFilter) return;
        if (primaryOnly && !hook.isPrimary) return;
        flat.push({
          hookId: hook.id,
          itemId: item.id,
          itemTitle: item.title,
          platform: item.platform,
          text: hook.text,
          angle: hook.angle,
          isPrimary: hook.isPrimary,
          updatedAt: hook.updatedAt,
          item,
        });
      });
    });

    return flat.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items, angleFilter, primaryOnly]);

  const handleSaveHook = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = hookText.trim();
    if (!cleaned) return;

    if (selectedItemId === 'new' || items.length === 0) {
      const title = newIdeaTitle.trim() || cleaned.slice(0, 56);
      onCreateIdeaWithHook(title, cleaned, hookAngle);
      setNewIdeaTitle('');
      setHookText('');
      return;
    }

    onAddHookToItem(selectedItemId, cleaned, hookAngle, markPrimary);
    setHookText('');
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onCopySuccess('Hook copied to clipboard');
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      onCopySuccess('Unable to access clipboard');
    }
  };

  const startEditing = (hookId: string, text: string, angle: HookAngle) => {
    setEditingHookId(hookId);
    setEditDraftText(text);
    setEditDraftAngle(angle);
  };

  const commitEdit = (itemId: string, hookId: string) => {
    const cleaned = editDraftText.trim();
    if (!cleaned) return;
    onUpdateHook(itemId, hookId, cleaned, editDraftAngle);
    setEditingHookId(null);
  };

  const durationTone =
    metrics.rating === 'Optimal'
      ? 'text-emerald-700 dark:text-emerald-400'
      : metrics.rating === 'Tight'
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Hook Composer & Frameworks */}
      <div className="lg:col-span-5 space-y-5">
        <form
          onSubmit={handleSaveHook}
          className="p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div>
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              Write a video hook
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aim for under 3.5 seconds spoken so viewers stay past frame one.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="hook-target-idea" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Attach to content idea
            </label>
            <select
              id="hook-target-idea"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.platform})
                </option>
              ))}
              <option value="new">+ Create new idea from this hook</option>
            </select>
          </div>

          {(selectedItemId === 'new' || items.length === 0) && (
            <div className="space-y-1.5">
              <label htmlFor="hook-new-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                New idea title
              </label>
              <input
                id="hook-new-title"
                type="text"
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                placeholder="e.g., 3 Lighting Tweaks for Desk Setups"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="hook-angle-select" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Hook angle
            </label>
            <div id="hook-angle-select" className="flex flex-wrap gap-1.5">
              {HOOK_ANGLES.map((angle) => {
                const active = hookAngle === angle;
                return (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => setHookAngle(angle)}
                    className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-50 dark:bg-[#0D131D] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {angle}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="hook-editor-text" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Opening line
              </label>
              <span className={`text-xs font-mono tabular-nums font-medium ${durationTone}`}>
                {metrics.words} words · ~{metrics.seconds}s ({metrics.rating})
              </span>
            </div>
            <textarea
              id="hook-editor-text"
              rows={4}
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="Write the exact first sentence you will speak on camera..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer min-h-[40px]">
              <input
                type="checkbox"
                checked={markPrimary}
                onChange={(e) => setMarkPrimary(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>Set as primary hook</span>
            </label>

            <button
              type="submit"
              disabled={!hookText.trim()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Save Hook</span>
            </button>
          </div>
        </form>

        {/* Hook Starter Frameworks */}
        <section className="p-5 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
              Proven hook starters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tap any formula to load it into the editor
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {HOOK_FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                type="button"
                onClick={() => {
                  setHookAngle(fw.angle);
                  setHookText(fw.template);
                }}
                className="w-full py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{fw.name}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{fw.angle}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{fw.template}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right: Saved Hook Bank */}
      <section className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              Hook library
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {allHooks.length} {allHooks.length === 1 ? 'hook' : 'hooks'} matching filter
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={angleFilter}
              onChange={(e) => setAngleFilter(e.target.value as HookAngle | 'all')}
              aria-label="Filter hooks by angle"
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Angles</option>
              {HOOK_ANGLES.map((angle) => (
                <option key={angle} value={angle}>
                  {angle}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setPrimaryOnly((v) => !v)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                primaryOnly
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400'
                  : 'bg-slate-50 dark:bg-[#0D131D] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Primary Only
            </button>
          </div>
        </div>

        {allHooks.length === 0 ? (
          <div className="p-10 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No hooks found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Write your first hook using the composer or clear your filters.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {allHooks.map((entry) => {
              const est = estimateHookSeconds(entry.text);
              const isCopied = copiedId === entry.hookId;
              const isEditing = editingHookId === entry.hookId;

              return (
                <li key={entry.hookId} className="p-4 sm:px-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/25 transition-colors">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={editDraftText}
                        onChange={(e) => setEditDraftText(e.target.value)}
                        aria-label="Edit hook text"
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <select
                          value={editDraftAngle}
                          onChange={(e) => setEditDraftAngle(e.target.value as HookAngle)}
                          aria-label="Edit hook angle"
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {HOOK_ANGLES.map((angle) => (
                            <option key={angle} value={angle}>
                              {angle}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingHookId(null)}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => commitEdit(entry.itemId, entry.hookId)}
                            disabled={!editDraftText.trim()}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-blue-700 dark:text-blue-400">{entry.angle}</span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.platform}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">~{est.seconds}s ({est.rating})</span>
                          {entry.isPrimary && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-amber-700 dark:text-amber-400">Primary</span>
                            </>
                          )}
                        </div>

                        <p className="mt-1.5 text-sm sm:text-[15px] font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                          “{entry.text}”
                        </p>

                        <button
                          type="button"
                          onClick={() => onOpenItem(entry.item)}
                          className="mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left truncate max-w-full"
                        >
                          For: {entry.itemTitle}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onTogglePrimaryHook(entry.itemId, entry.hookId)}
                          aria-label={entry.isPrimary ? 'Primary hook selected' : 'Set as primary hook'}
                          title={entry.isPrimary ? 'Primary hook' : 'Set as primary'}
                          className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                            entry.isPrimary
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={entry.isPrimary ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditing(entry.hookId, entry.text, entry.angle)}
                          aria-label="Edit hook"
                          title="Edit hook"
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteHook(entry.itemId, entry.hookId)}
                          aria-label="Delete hook"
                          title="Delete hook"
                          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(entry.hookId, entry.text)}
                          aria-label="Copy hook text"
                          className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
