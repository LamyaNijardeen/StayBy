/*
 * Pop-up dialogs for the whole site (replaces the browser's alert()).
 *
 *   showAlert("Please choose your dates.");
 *   showAlert("Please log in.", { actionLabel: "Log in", onAction: () => navigate("/login") });
 *   if (await showConfirm("Delete this room?")) { ... }
 *
 * <DialogHost /> (mounted once in App.tsx) draws them.
 */

export type DialogTone = "info" | "success" | "error";

export interface DialogOptions {
  title?: string;
  tone?: DialogTone;
  /** Text of the main button. */
  confirmLabel?: string;
  /** Text of the cancel button (showConfirm only). */
  cancelLabel?: string;
  /** Optional extra button, e.g. "Log in". */
  actionLabel?: string;
  onAction?: () => void;
}

export interface DialogRequest extends DialogOptions {
  id: number;
  kind: "alert" | "confirm";
  message: string;
  tone: DialogTone;
  resolve: (value: boolean) => void;
}

type Listener = (request: DialogRequest) => void;

let nextId = 1;
let listener: Listener | null = null;
const waiting: DialogRequest[] = [];

export function subscribeToDialogs(next: Listener): () => void {
  listener = next;

  // Anything requested before the host was ready.
  while (waiting.length > 0) {
    next(waiting.shift() as DialogRequest);
  }

  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}

function guessTone(message: string): DialogTone {
  if (/copied|saved|updated|success|done|sent/i.test(message)) {
    return "success";
  }

  if (
    /fail|error|could not|couldn't|unable|cannot|can't|invalid|not allowed|only |went wrong|try again|permission|expired|too many|too large/i.test(
      message
    )
  ) {
    return "error";
  }

  return "info";
}

function push(request: DialogRequest) {
  if (listener) {
    listener(request);
  } else {
    waiting.push(request);
  }
}

export function showAlert(
  message: string,
  options: DialogOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    push({
      ...options,
      id: nextId++,
      kind: "alert",
      message,
      tone: options.tone ?? guessTone(message),
      resolve: () => resolve(),
    });
  });
}

export function showConfirm(
  message: string,
  options: DialogOptions = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    push({
      ...options,
      id: nextId++,
      kind: "confirm",
      message,
      tone: options.tone ?? "info",
      resolve,
    });
  });
}
