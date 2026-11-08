import { KeyRound } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

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
        const text = await response.text();

        throw new Error(
          readMessage(
            text,
            "Please enter a valid email address and try again."
          )
        );
      }

      // The code was emailed, so continue to the next step.
      navigate("/reset-password", {
        state: { email: trimmedEmail },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell backTo="/login">

      {/* Heading */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-coral-light)]">
          <KeyRound
            size={26}
            className="text-[var(--color-coral)]"
          />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
          Forgot password
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
          Reset your password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Enter the email you signed up with and we'll send you a
          6-digit code.
        </p>
      </div>

      {/* Form card */}
      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5 sm:p-8">

        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="forgot-email"
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              Email address
            </label>

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral-light)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Send reset code"}
          </button>

        </form>

        <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Remembered it?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
