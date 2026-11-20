import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium shadow-lg flex items-center gap-2 pointer-events-none"
    >
      <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span className="whitespace-nowrap">{message}</span>
    </div>
  );
}
