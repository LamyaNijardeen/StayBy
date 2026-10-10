import {
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import OwnerNavbar from "../components/OwnerNavbar";
import {
  getCurrentUser,
  updateCurrentUser,
  type CurrentUserResponse,
} from "../services/userService";

function OwnerProfile() {
  const [user, setUser] =
    useState<CurrentUserResponse | null>(null);

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getCurrentUser();

      setUser(data);
      setPhone(data.phone || "");

      // Keep localStorage user data updated
      const existingUser =
        localStorage.getItem("user");

      if (existingUser) {
        const parsedUser = JSON.parse(existingUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsedUser,
            ...data,
          })
        );
      }
    } catch (err) {
      console.error(
        "Failed to load profile:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePhone() {
    const trimmedPhone = phone.trim();

    // Validate before sending to the backend
    if (
      trimmedPhone !== "" &&
      !/^(0\d{9}|\+94\d{9})$/.test(trimmedPhone)
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedUser =
        await updateCurrentUser(trimmedPhone);

      setUser(updatedUser);
      setPhone(updatedUser.phone || "");

      const existingUser =
        localStorage.getItem("user");

      if (existingUser) {
        const parsedUser = JSON.parse(existingUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsedUser,
            ...updatedUser,
          })
        );
      }

      setSuccess(
        "Phone number updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update phone:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update phone number."
      );
    } finally {
      setSaving(false);
    }
  }

  const displayName =
    user?.name || "Owner";

  const displayEmail =
    user?.email || "No email available";

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <OwnerNavbar />

      <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Owner profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            View your account information and manage your
            StayBy owner activity.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-secondary)]">
            Loading profile...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Profile card */}
        {!loading && user && (
          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

            {/* Profile header */}
            <div className="border-b border-[var(--color-border)] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)] text-2xl font-bold text-[var(--color-coral)]">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                {/* User information */}
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-[var(--color-navy)]">
                    {displayName}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Mail size={16} />

                    <span className="break-all">
                      {displayEmail}
                    </span>
                  </div>

                  <span className="mt-3 inline-flex rounded-full bg-[var(--color-coral-light)] px-3 py-1 text-xs font-semibold text-[var(--color-coral)]">
                    Property Owner
                  </span>
                </div>
              </div>
            </div>

            {/* Account information */}
            <div className="p-6 sm:p-8">

              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Account information
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                {/* Name */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <User
                        size={17}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Name
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                        {displayName}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <Mail
                        size={17}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Email
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-[var(--color-navy)]">
                        {displayEmail}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Phone */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                      <Phone
                        size={17}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Phone number
                      </p>

                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => {
                          const value = event.target.value;

                          // Allow only digits and one leading +
                          if (!/^\+?\d*$/.test(value)) {
                            return;
                          }

                          // + is allowed only at the beginning
                          if (
                            value.includes("+") &&
                            !value.startsWith("+")
                          ) {
                            return;
                          }

                          // Maximum 10 digits for local format
                          // Maximum 12 characters for +94 format
                          if (value.startsWith("+")) {
                            if (value.length > 12) {
                              return;
                            }
                          } else {
                            if (value.length > 10) {
                              return;
                            }
                          }

                          setPhone(value);
                          setError("");
                          setSuccess("");
                        }}
                        placeholder="0771234567"
                        maxLength={12}
                        inputMode="tel"
                        className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                      />

                      {/* Validation message */}
                      {phone.length > 0 &&
                        !/^(0\d{9}|\+94\d{9})$/.test(phone) && (
                          <p className="mt-1.5 text-xs text-red-600">
                            Please enter a valid Sri Lankan phone number.
                          </p>
                        )}

                      {phone.length === 0 && (
                        <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                          Enter a 10-digit Sri Lankan mobile number.
                        </p>
                      )}

                    </div>

                  </div>
                </div>

                {/* Role */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <Building2
                        size={17}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Account type
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                        Property Owner
                      </p>
                    </div>

                  </div>
                </div>

                {/* Account status */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Account status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-green-700">
                        Active
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* Save phone */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePhone}
                  disabled={
                    saving ||
                    (phone.trim() !== "" &&
                      !/^(0\d{9}|\+94\d{9})$/.test(
                        phone.trim()
                      ))
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save phone number"}
                </button>
              </div>

              {/* Owner activity */}
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Owner activity
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <Link
                  to="/owner/properties"
                  className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-coral)] hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                    <Building2
                      size={20}
                      className="text-[var(--color-coral)]"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-[var(--color-navy)]">
                      My properties
                    </h4>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Manage your properties and rooms
                    </p>
                  </div>
                </Link>

                <Link
                  to="/owner/bookings"
                  className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-coral)] hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <CalendarDays
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-[var(--color-navy)]">
                      Bookings
                    </h4>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Review and manage booking requests
                    </p>
                  </div>
                </Link>

              </div>

            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default OwnerProfile;