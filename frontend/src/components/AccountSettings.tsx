import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Pencil } from "lucide-react";
import { changePassword, updateName } from "../services/userService";
import { showAlert } from "../services/dialog";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-coral)]";

const buttonClass =
  "rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60";

function AccountSettings() {
  let storedName = "";

  try {
    const raw = localStorage.getItem("user");
    storedName = raw ? JSON.parse(raw).name || "" : "";
  } catch {
    /* ignore */
  }

  const [name, setName] = useState(storedName);
  const [savingName, setSavingName] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleName(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();

    if (trimmed.length < 2) {
      await showAlert("Name must be at least 2 characters.", {
        tone: "error",
      });
      return;
    }

    if (trimmed === storedName) {
      return;
    }

    try {
      setSavingName(true);

      const updated = await updateName(trimmed);

      const raw = localStorage.getItem("user");

      if (raw) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...JSON.parse(raw), ...updated })
        );
      }

      await showAlert("Your name has been updated.", {
        tone: "success",
      });

      // Refresh so the navbar and page show the new name
      window.location.reload();
    } catch (err) {
      await showAlert(
        err instanceof Error ? err.message : "Failed to update name.",
        { tone: "error" }
      );
    } finally {
      setSavingName(false);
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();

    if (next.length < 8) {
      await showAlert("New password must be at least 8 characters.", {
        tone: "error",
      });
      return;
    }

    if (next !== confirm) {
      await showAlert("The new passwords do not match.", {
        tone: "error",
      });
      return;
    }

    try {
      setSavingPassword(true);

      await changePassword(current, next);

      setCurrent("");
      setNext("");
      setConfirm("");

      await showAlert("Your password has been changed.", {
        tone: "success",
      });
    } catch (err) {
      await showAlert(
        err instanceof Error ? err.message : "Failed to change password.",
        { tone: "error" }
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Name */}
      <form
        onSubmit={handleName}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-coral-light)]">
            <Pencil size={17} className="text-[var(--color-coral)]" />
          </div>

          <h3 className="text-base font-semibold text-[var(--color-navy)]">
            Edit name
          </h3>
        </div>

        <label className="mt-5 block text-xs font-medium text-[var(--color-text-secondary)]">
          Full name
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className={`${inputClass} mt-1`}
        />

        <button
          type="submit"
          disabled={savingName}
          className={`${buttonClass} mt-5`}
        >
          {savingName ? "Saving..." : "Save name"}
        </button>
      </form>

      {/* Password */}
      <form
        onSubmit={handlePassword}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-coral-light)]">
            <KeyRound size={17} className="text-[var(--color-coral)]" />
          </div>

          <h3 className="text-base font-semibold text-[var(--color-navy)]">
            Change password
          </h3>
        </div>

        <div className="mt-5 space-y-3">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          />

          <input
            type="password"
            autoComplete="new-password"
            placeholder="New password (min. 8 characters)"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            maxLength={100}
            className={inputClass}
          />

          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            maxLength={100}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={savingPassword || !current || !next || !confirm}
          className={`${buttonClass} mt-5`}
        >
          {savingPassword ? "Saving..." : "Change password"}
        </button>
      </form>
    </section>
  );
}

export default AccountSettings;