"use client";

import {
  CheckCircleIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AdminToastTone } from "@/lib/admin-toast";
import { cn } from "@/lib/utils";

type ToastInput = { tone: AdminToastTone; message: string };
type Toast = ToastInput & { id: number };

/** An error stays around longer: it usually asks the person to do something. */
const DISMISS_AFTER_MS: Record<AdminToastTone, number> = {
  success: 4500,
  error: 8000,
};

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/**
 * Outside the provider this is a no-op rather than a throw: feedback going
 * missing is a smaller problem than a screen that will not render.
 */
export function useAdminToast() {
  const show = useContext(ToastContext);

  return useCallback(
    (toast: ToastInput) => {
      show?.(toast);
    },
    [show],
  );
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ tone, message }: ToastInput) => {
      const id = nextId.current++;

      setToasts((current) => [...current, { id, tone, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DISMISS_AFTER_MS[tone]),
      );
    },
    [dismiss],
  );

  // Timers outlive a fast navigation, so clear them all on unmount.
  useEffect(() => {
    const pending = timers.current;

    return () => {
      for (const timer of pending.values()) {
        clearTimeout(timer);
      }
      pending.clear();
    };
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // Success is announced politely; errors interrupt, via role="alert" on
        // the toast itself.
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const isError = toast.tone === "error";
  const Icon = isError ? WarningCircleIcon : CheckCircleIcon;

  return (
    <output
      role={isError ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-(--radius) border bg-card px-4 py-3 text-sm shadow-lg",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        isError ? "border-destructive/40" : "border-border",
      )}
    >
      <Icon
        aria-hidden="true"
        weight="fill"
        className={cn(
          "mt-px size-4 shrink-0",
          isError ? "text-destructive" : "text-emerald-600",
        )}
      />
      <p className="flex-1 text-foreground">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar aviso"
        className="-mr-1 rounded-(--radius) p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <XIcon className="size-3.5" aria-hidden="true" />
      </button>
    </output>
  );
}
