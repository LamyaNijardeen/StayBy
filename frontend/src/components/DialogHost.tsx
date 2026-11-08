import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  subscribeToDialogs,
  type DialogRequest,
  type DialogTone,
} from "../services/dialog";

const TITLES: Record<DialogTone, string> = {
  info: "Just a moment",
  success: "All done",
  error: "Something's not right",
};

const ICON_STYLES: Record<DialogTone, string> = {
  info: "bg-[var(--color-coral-light)] text-[var(--color-coral)]",
  success: "bg-green-50 text-green-600",
  error: "bg-red-50 text-red-600",
};

/**
 * Draws the pop-ups requested through showAlert / showConfirm.
 * Mount it once, near the top of the app.
 */
function DialogHost() {
  const [queue, setQueue] = useState<DialogRequest[]>([]);

  useEffect(() => {
    return subscribeToDialogs((request) => {
      setQueue((current) => [...current, request]);
    });
  }, []);

  const current = queue[0];

  const close = useCallback(
    (result: boolean) => {
      if (!current) return;

      current.resolve(result);
      setQueue((items) => items.slice(1));
    },
    [current]
  );

  useEffect(() => {
    if (!current) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [current, close]);

  if (!current) return null;

  const Icon =
    current.tone === "success"
      ? CheckCircle2
      : current.tone === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-navy-dark)]/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close(false);
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className="animate-fade-up w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-2xl shadow-black/20"
      >
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${ICON_STYLES[current.tone]}`}
        >
          <Icon size={24} />
        </div>

        <h2
          id="dialog-title"
          className="mt-4 text-lg font-bold text-[var(--color-navy)]"
        >
          {current.title ?? TITLES[current.tone]}
        </h2>

        <p
          id="dialog-message"
          className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {current.message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {current.kind === "confirm" && (
            <button
              type="button"
              onClick={() => close(false)}
              className="rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
            >
              {current.cancelLabel ?? "Cancel"}
            </button>
          )}

          {current.kind === "alert" && current.actionLabel && (
            <button
              type="button"
              onClick={() => {
                const action = current.onAction;
                close(true);
                action?.();
              }}
              className="rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
            >
              {current.actionLabel}
            </button>
          )}

          <button
            type="button"
            autoFocus
            onClick={() => close(true)}
            className={
              current.kind === "alert" && current.actionLabel
                ? "rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
                : "rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
            }
          >
            {current.confirmLabel ??
              (current.kind === "confirm" ? "Confirm" : "OK")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DialogHost;