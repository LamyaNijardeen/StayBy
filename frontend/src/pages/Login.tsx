import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { API_BASE_URL } from "../config";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      // Read the response as text first.
      // This allows us to handle both JSON and plain-text backend errors.
      const responseText = await response.text();

      let data: {
        token?: string;
        id?: number;
        name?: string;
        email?: string;
        role?: string;
        message?: string;
        error?: string;
      } = {};

      // Try to parse JSON only when the response is JSON.
      try {
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch {
        // Backend returned plain text, so keep data as an empty object.
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            responseText ||
            "Invalid email or password"
        );
      }

      // Make sure a token was actually returned.
      if (!data.token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      // Store JWT for authenticated API requests.
      localStorage.setItem("token", data.token);

      // Store basic user information.
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      // Redirect users to the correct area based on their role.
if (data.role === "OWNER") {
  navigate("/owner/dashboard");
} else if (data.role === "ADMIN") {
  navigate("/admin/dashboard");
} else {
  navigate("/search");
}
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
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
              Welcome back
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Sign in to StayBy
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Sign in to continue your journey and manage your stays.
            </p>
          </div>

          {/* Form card */}
          <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5 sm:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[var(--color-text)]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pr-12 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
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

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral-light)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

            </form>

            {/* Register */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
                >
                  Create one
                </Link>
              </p>
            </div>

          </div>

    </AuthShell>
  );
}

export default Login;

