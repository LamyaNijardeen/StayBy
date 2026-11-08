import { CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { showAlert } from "../services/dialog";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";

import { API_BASE_URL } from "../config";

/** Pulls a readable message out of a JSON or plain-text answer. */
function readMessage(text: string, fallback: string): string {
  try {
    const data = JSON.parse(text);

    return data.message || data.detail || text || fallback;
  } catch {
    return text || fallback;
  }
}

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateEmail = location.state?.email as string | undefined;

  const [email, setEmail] = useState(stateEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  /* Show the problem inline AND as a pop-up, so it can't be missed. */
  const fail = (message: string) => {
    setError(message);
    void showAlert(message, {
      tone: "error",
      title: "Couldn't reset password",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      fail("Please enter your email address.");
      return;
    }

    if (code.length !== 6) {
      fail("Please enter the 6-digit code from your email.");
      return;
    }

    if (newPassword.length < 8) {
      fail("Your new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      fail("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: trimmedEmail,
            code,
            newPassword,
          }),
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          readMessage(text, "Could not reset your password.")
        );
      }

      const doneMessage = readMessage(
        text,
        "Your password has been updated. You can now sign in."
      );

      setSuccess(doneMessage);

      setCode("");
      setNewPassword("");
      setConfirmPassword("");

      await showAlert(doneMessage, {
        tone: "success",
        title: "Password updated",
        confirmLabel: "Sign in",
      });

      navigate("/login");
    } catch (err) {
      fail(
        err instanceof Error
          ? err.message
          : "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (countdown > 0) {
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail }),
        }
      );

      if (!response.ok) {
        throw new Error(
          readMessage(
            await response.text(),
            "Could not send a new code."
          )
        );
      }

      setSuccess("A new code has been sent to your email.");
      setCode("");
      setCountdown(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send a new code."
      );
    } finally {
      setResending(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <AuthShell backTo="/forgot-password">

      {/* Heading */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-coral-light)]">
          <Mail
            size={26}
            className="text-[var(--color-coral)]"
          />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
          Check your inbox
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
          Choose a new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Enter the 6-digit code we emailed you, then pick a new
          password. The code works for 10 minutes.
        </p>
      </div>

      {/* Form card */}
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5 sm:p-8">

        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{success}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="reset-email"
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              Email address
            </label>

            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* Code */}
          <div>
            <label
              htmlFor="reset-code"
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              6-digit code
            </label>

            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                );
                setError("");
              }}
              placeholder="000000"
              maxLength={6}
              disabled={loading}
              className={`${inputClass} text-center text-lg font-semibold tracking-[0.5em]`}
            />
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="reset-password"
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={loading}
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label
              htmlFor="reset-confirm"
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              Confirm new password
            </label>

            <input
              id="reset-confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Type it again"
              autoComplete="new-password"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral-light)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Update password"}
          </button>

        </form>

        {/* Resend */}
        <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Didn't get the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="mt-2 text-sm font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending
              ? "Sending..."
              : countdown > 0
              ? `Send a new code in ${countdown}s`
              : "Send a new code"}
          </button>

          <div className="mt-4">
            <Link
              to="/login"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              Back to sign in
            </Link>
          </div>
        </div>

      </div>
    </AuthShell>
  );
}

export default ResetPassword;
