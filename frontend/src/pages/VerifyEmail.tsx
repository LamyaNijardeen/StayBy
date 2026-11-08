import { CheckCircle2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { API_BASE_URL } from "../config";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateEmail = location.state?.email as string | undefined;

  const [email, setEmail] = useState(stateEmail || "");
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 6);
    setCode(numbersOnly);
    setError("");
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        email: trimmedEmail,
        code,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-email?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const responseText = await response.text();

      let message = responseText;

      try {
        const data = JSON.parse(responseText);
        message = data.message || responseText;
      } catch {
        // Backend returned plain text
      }

      if (!response.ok) {
        throw new Error(
          message || "Verification failed. Please check your code."
        );
      }

      setSuccess(
        message || "Email verified successfully. You can now sign in."
      );

      setCode("");

      // Give the user a moment to see the success message.
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again."
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
      const params = new URLSearchParams({
        email: trimmedEmail,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/auth/resend-verification?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const responseText = await response.text();

      let message = responseText;

      try {
        const data = JSON.parse(responseText);
        message = data.message || responseText;
      } catch {
        // Backend returned plain text
      }

      if (!response.ok) {
        throw new Error(
          message || "Could not resend the verification code."
        );
      }

      setSuccess(
        message || "A new verification code has been sent to your email."
      );

      setCode("");
      setCountdown(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not resend the verification code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell backTo="/register">

          {/* Heading */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-coral-light)]">
              <Mail
                size={26}
                className="text-[var(--color-coral)]"
              />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Verify your email
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Check your inbox
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              We sent a 6-digit verification code to your email address.
            </p>
          </div>

          {/* Form card */}
          <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5 sm:p-8">

            <form onSubmit={handleVerify} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
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
                  htmlFor="verification-email"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Email address
                </label>

                <input
                  id="verification-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={loading || resending}
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Verification code */}
              <div>
                <label
                  htmlFor="verification-code"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Verification code
                </label>

                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) =>
                    handleCodeChange(event.target.value)
                  }
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 text-center text-2xl font-semibold tracking-[0.45em] text-[var(--color-navy)] outline-none transition placeholder:text-gray-300 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  Enter the 6-digit code from your StayBy email.
                </p>
              </div>

              {/* Verify */}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral-light)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>

            </form>

            {/* Resend */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">

              <p className="text-sm text-[var(--color-text-secondary)]">
                Didn't receive the code?
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
                  ? `Resend code in ${countdown}s`
                  : "Resend verification code"}
              </button>

            </div>

            {/* Login */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
              >
                Already verified? Sign in
              </button>
            </div>

          </div>

    </AuthShell>
  );
}

export default VerifyEmail;