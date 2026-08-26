import { ArrowLeft, Eye, EyeOff, MapPin } from "lucide-react";
import { useState } from "react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <MapPin
              size={20}
              strokeWidth={2}
              className="text-[var(--color-coral)]"
            />

            <span className="text-xl font-bold tracking-tight text-[var(--color-navy)]">
              StayBy
            </span>
          </div>

          <div className="w-14" />
        </div>
      </header>

      {/* Login */}
      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

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

            <form className="space-y-5">

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
                  placeholder="you@example.com"
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

                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral-light)] focus:ring-offset-2"
              >
                Sign in
              </button>

            </form>

            {/* Register */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
                >
                  Create one
                </button>
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Login;