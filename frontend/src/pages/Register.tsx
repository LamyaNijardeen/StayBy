import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { API_BASE_URL } from "../config";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accountType, setAccountType] = useState<"TRAVELER" | "OWNER">(
    "TRAVELER"
  );
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const trimmedPhone = phone.trim();

    if (accountType === "OWNER" && !trimmedPhone) {
      setError("Property owners must enter a phone number.");
      return;
    }

    if (
      trimmedPhone &&
      !/^(0\d{9}|\+94\d{9})$/.test(trimmedPhone.replace(/[\s()-]/g, ""))
    ) {
      setError(
        "Please enter a valid Sri Lankan phone number, like 0771234567 or +94771234567."
      );
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
            role: accountType,
            phone: trimmedPhone,
          }),
        }
      );

      const responseText = await response.text();

      let data: {
        message?: string;
        email?: string;
        id?: number;
        name?: string;
        role?: string;
        token?: string | null;
      } = {};

      try {
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch {
        // Response was not JSON
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            responseText ||
            "Registration failed. Please try again."
        );
      }

      // Registration succeeded.
      // Go to email verification page and pass the email.
      navigate("/verify-email", {
        state: {
          email: data.email || trimmedEmail,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell backTo="/">

          {/* Heading */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Get started
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Create your StayBy account
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {accountType === "OWNER"
                ? "List your property and reach guests who need a stay near their destination."
                : "Create an account to discover and book stays."}
            </p>
          </div>

          {/* Form card */}
          <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5 sm:p-8">

            <form onSubmit={handleRegister} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Account type */}
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  I want to
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-[var(--color-background)] p-1">
                  {(
                    [
                      ["TRAVELER", "Find a stay"],
                      ["OWNER", "List my property"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      disabled={loading}
                      onClick={() => setAccountType(value)}
                      aria-pressed={accountType === value}
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                        accountType === value
                          ? "bg-[var(--color-coral)] text-white shadow-sm"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {accountType === "OWNER" && (
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                    Your properties appear to guests after our team
                    verifies them.
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Email address
                </label>

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="register-phone"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Phone number
                  {accountType === "TRAVELER" && (
                    <span className="font-normal text-[var(--color-text-secondary)]">
                      {" "}
                      (optional)
                    </span>
                  )}
                </label>

                <input
                  id="register-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0771234567"
                  disabled={loading}
                  autoComplete="tel"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pr-12 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)] disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Confirm password
                </label>

                <div className="relative mt-2">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm your password"
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pr-12 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)] disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral-light)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

            </form>

            {/* Login */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
                >
                  Sign in
                </button>
              </p>
            </div>

          </div>

    </AuthShell>
  );
}

export default Register;