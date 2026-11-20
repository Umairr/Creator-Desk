import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Copy, CopyPlus, Plus, Star, Trash2, X } from 'lucide-react';
import { DEFAULT_CHECKLIST } from '../data/starterData';
import {
  ChecklistStep,
  ContentItem,
  HOOK_ANGLES,
  HookAngle,
  PLATFORMS,
  Platform,
  STAGES,
  Stage,
  VideoHook,
} from '../types/creator';
import { estimateHookSeconds } from '../utils/dates';
import { getChecklistProgress } from '../utils/presentation';
import { createId } from '../utils/storage';

interface ContentEditorSheetProps {
  isOpen: boolean;
  item: ContentItem | null;
  initialDate?: string | null;
  initialTab?: 'details' | 'hooks' | 'checklist';
  defaultPlatform: Platform;
  onClose: () => void;
  onSave: (item: ContentItem, isNew: boolean) => void;
  onDuplicate: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onNotify: (message: string) => void;
}

export function ContentEditorSheet({
  isOpen,
  item,
  initialDate,
  initialTab = 'details',
  defaultPlatform,
  onClose,
  onSave,
  onDuplicate,
  onDelete,
  onNotify,
}: ContentEditorSheetProps) {
  const isNew = !item;
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<'details' | 'hooks' | 'checklist'>(initialTab);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [stage, setStage] = useState<Stage>('idea');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [hooks, setHooks] = useState<VideoHook[]>([]);
  const [checklist, setChecklist] = useState<ChecklistStep[]>(DEFAULT_CHECKLIST());

  const [newHookText, setNewHookText] = useState('');
  const [newHookAngle, setNewHookAngle] = useState<HookAngle>('Curiosity');
  const [newStepLabel, setNewStepLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setActiveSection(initialTab);
    setConfirmDelete(false);
    setTitleError(false);
    setNewHookText('');
    setNewStepLabel('');

    if (item) {
      setTitle(item.title);
      setPlatform(item.platform);
      setStage(item.stage);
      setCategory(item.category);
      setNotes(item.notes);
      setScheduledDate(item.scheduledDate || '');
      setScheduledTime(item.scheduledTime || '');
      setHooks(item.hooks);
      setChecklist(item.checklist.length > 0 ? item.checklist : DEFAULT_CHECKLIST());
    } else {
      setTitle('');
      setPlatform(defaultPlatform);
      setStage(initialDate ? 'scheduled' : 'idea');
      setCategory('');
      setNotes('');
      setScheduledDate(initialDate || '');
      setScheduledTime(initialDate ? '12:00' : '');
      setHooks([]);
      setChecklist(DEFAULT_CHECKLIST());
    }
  }, [isOpen, item, initialDate, initialTab, defaultPlatform]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const progress = getChecklistProgress(checklist);
  const hookStats = estimateHookSeconds(newHookText);
  const notesWordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const notesSeconds = Math.round(notesWordCount / 2.42);

  const handleAddHook = () => {
    const trimmed = newHookText.trim();
    if (!trimmed) return;
    const nextHook: VideoHook = {
      id: createId('hook'),
      text: trimmed,
      angle: newHookAngle,
      isPrimary: hooks.length === 0,
      updatedAt: new Date().toISOString(),
    };
    setHooks((prev) => [nextHook, ...prev]);
    setNewHookText('');
    if (stage === 'idea') {
      setStage('hooked');
    }
    setChecklist((prev) =>
      prev.map((s) =>
        s.id === 'step-hook' || s.label.toLowerCase().includes('hook')
          ? { ...s, done: true }
          : s
      )
    );
  };

  const handleSetPrimaryHook = (hookId: string) => {
    setHooks((prev) =>
      prev.map((h) => ({
        ...h,
        isPrimary: h.id === hookId,
      }))
    );
  };

  const handleRemoveHook = (hookId: string) => {
    setHooks((prev) => {
      const remaining = prev.filter((h) => h.id !== hookId);
      if (remaining.length > 0 && !remaining.some((h) => h.isPrimary)) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      return remaining;
    });
  };

  const handleToggleStep = (stepId: string) => {
    setChecklist((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s))
    );
  };

  const handleAddStep = () => {
    const trimmed = newStepLabel.trim();
    if (!trimmed) return;
    setChecklist((prev) => [
      ...prev,
      { id: createId('step'), label: trimmed, done: false },
    ]);
    setNewStepLabel('');
  };

  const handleRemoveStep = (stepId: string) => {
    setChecklist((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleCopyHook = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify('Hook copied to clipboard');
    } catch {
      onNotify('Unable to copy');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedTitle = title.trim();
    if (!cleanedTitle) {
      setTitleError(true);
      setActiveSection('details');
      setTimeout(() => titleInputRef.current?.focus(), 0);
      return;
    }

    const nowIso = new Date().toISOString();
    const syncedChecklist =
      stage === 'scheduled' || stage === 'published'
        ? checklist.map((s) => (s.id === 'step-publish' ? { ...s, done: true } : s))
        : checklist;

    const nextItem: ContentItem = {
      id: item?.id || createId('item'),
      title: cleanedTitle,
      platform,
      stage,
      category: category.trim(),
      notes: notes.trim(),
      hooks,
      checklist: syncedChecklist,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledDate && scheduledTime ? scheduledTime : null,
      createdAt: item?.createdAt || nowIso,
      updatedAt: nowIso,
    };
    onSave(nextItem, isNew);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-sheet-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full lg:max-w-2xl max-h-[92vh] bg-white dark:bg-[#131A26] rounded-t-3xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Mobile Drag Handle */}
        <div className="lg:hidden pt-2.5 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <h2 id="editor-sheet-title" className="font-display font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
            {isNew ? 'New Content Idea' : 'Edit Content'}
          </h2>

          <div className="flex items-center gap-1 shrink-0">
            {!isNew && item && (
              <button
                type="button"
                onClick={() => onDuplicate(item)}
                title="Repurpose / duplicate idea"
                aria-label="Repurpose or duplicate idea"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
              >
                <CopyPlus className="w-4 h-4" />
              </button>
            )}

            {!isNew && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete content item"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close editor"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inline Delete Confirmation */}
        {confirmDelete && item && (
          <div className="px-5 py-3 bg-rose-50 dark:bg-rose-500/10 border-b border-rose-200 dark:border-rose-500/30 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-rose-800 dark:text-rose-300">
              Delete this idea and its hooks permanently?
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1">
          {[
            { id: 'details', label: 'Idea & Schedule' },
            { id: 'hooks', label: `Hooks (${hooks.length})` },
            { id: 'checklist', label: `Progress (${progress.done}/${progress.total})` },
          ].map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as 'details' | 'hooks' | 'checklist')}
                className={`min-h-[42px] px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                  active
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <form id="content-editor-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="editor-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Content title
                </label>
                <input
                  ref={titleInputRef}
                  id="editor-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError && e.target.value.trim()) setTitleError(false);
                  }}
                  placeholder="What is this video or post about?"
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    titleError
                      ? 'border-rose-500 dark:border-rose-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {titleError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Please enter a content title before saving.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="editor-platform" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Platform
                  </label>
                  <select
                    id="editor-platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="editor-stage" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Pipeline stage
                  </label>
                  <select
                    id="editor-stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as Stage)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="editor-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Topic or series
                </label>
                <input
                  id="editor-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Studio Setup, Growth, Gear Review"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="editor-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Target publish date
                    </label>
                    {scheduledDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setScheduledDate('');
                          setScheduledTime('');
                        }}
                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Clear date
                      </button>
                    )}
                  </div>
                  <input
                    id="editor-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScheduledDate(val);
                      if (val && (stage === 'idea' || stage === 'hooked')) {
                        setStage('scheduled');
                      }
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="editor-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Publish time (optional)
                  </label>
                  <input
                    id="editor-time"
                    type="time"
                    value={scheduledTime}
                    disabled={!scheduledDate}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="editor-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Outline & script notes
                  </label>
                  {notesWordCount > 0 && (
                    <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {notesWordCount} words · ~{notesSeconds}s spoken
                    </span>
                  )}
                </div>
                <textarea
                  id="editor-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Talking points, B-roll shots, call-to-action..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                />
              </div>
            </div>
          )}

          {activeSection === 'hooks' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Add hook variation
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {hookStats.words} words · ~{hookStats.seconds}s ({hookStats.rating})
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={newHookText}
                  onChange={(e) => setNewHookText(e.target.value)}
                  placeholder="Write an opening 3-second hook..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <select
                    value={newHookAngle}
                    onChange={(e) => setNewHookAngle(e.target.value as HookAngle)}
                    aria-label="Select hook angle"
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {HOOK_ANGLES.map((angle) => (
                      <option key={angle} value={angle}>
                        {angle}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddHook}
                    disabled={!newHookText.trim()}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hook</span>
                  </button>
                </div>
              </div>

              {hooks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No hooks saved for this idea yet. Draft 2–3 angles above and mark the strongest one primary.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {hooks.map((hook) => {
                    const est = estimateHookSeconds(hook.text);
                    return (
                      <li key={hook.id} className="py-3.5 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-blue-700 dark:text-blue-400">{hook.angle}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">~{est.seconds}s</span>
                            {hook.isPrimary && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-medium text-amber-700 dark:text-amber-400">Primary</span>
                              </>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                            “{hook.text}”
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryHook(hook.id)}
                            title="Set as primary hook"
                            aria-label="Set as primary hook"
                            className={`min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl cursor-pointer ${
                              hook.isPrimary
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Star className="w-4 h-4" fill={hook.isPrimary ? 'currentColor' : 'none'} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyHook(hook.text)}
                            title="Copy hook"
                            aria-label="Copy hook"
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveHook(hook.id)}
                            title="Remove hook"
                            aria-label="Remove hook"
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {activeSection === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <span className="text-xs font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {progress.percent}% complete
                </span>
              </div>

              <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {checklist.map((step) => (
                  <li key={step.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      className="flex-1 min-h-[48px] py-2.5 flex items-center gap-3 text-left cursor-pointer"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          step.done
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {step.done && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span
                        className={`text-sm ${
                          step.done
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>

                    {checklist.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.id)}
                        aria-label={`Remove step ${step.label}`}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newStepLabel}
                  onChange={(e) => setNewStepLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStep();
                    }
                  }}
                  placeholder="Add custom production step..."
                  className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D131D] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  disabled={!newStepLabel.trim()}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  Add Step
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Sticky Footer Action Bar */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131A26] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="content-editor-form"
            className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
          >
            {isNew ? 'Save Content' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
