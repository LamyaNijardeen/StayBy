import {
  CalendarDays,
  Heart,
  Mail,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import TravelerNavbar from "../components/TravelerNavbar";

function Profile() {
  const navigate = useNavigate();

  let user: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  } = {};

  try {
    const userData = localStorage.getItem("user");

    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error("Failed to read user data:", error);
  }

  const displayName = user.name || "User";
  const displayEmail = user.email || "No email available";
  const displayRole = user.role || "Traveler";

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">

      {/* =====================================================
          HEADER
      ===================================================== */}
<TravelerNavbar />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8">

        {/* Page heading */}

        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-[var(--color-coral)]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)]">
            Your profile
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Manage your StayBy account and access your saved stays
            and bookings.
          </p>
        </div>

        {/* =====================================================
            PROFILE CARD
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

          {/* Profile top */}

          <div className="border-b border-[var(--color-border)] p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)] text-2xl font-bold text-[var(--color-coral)]">
                {displayName.charAt(0).toUpperCase()}
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

                <span className="mt-3 inline-flex rounded-full bg-[var(--color-coral-light)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-coral)]">
                  {displayRole.toLowerCase()}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

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

            </div>

            {/* =================================================
                QUICK LINKS
            ================================================= */}

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Your activity
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* My bookings */}

              <Link
                to="/my-bookings"
                className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-coral)] hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                  <CalendarDays
                    size={20}
                    className="text-[var(--color-coral)]"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--color-navy)]">
                    My bookings
                  </h4>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    View and manage your bookings
                  </p>
                </div>
              </Link>

              {/* Favorites */}

              <Link
                to="/favorites"
                className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-coral)] hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                  <Heart
                    size={20}
                    className="text-[var(--color-coral)]"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--color-navy)]">
                    Favorites
                  </h4>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    View your saved properties
                  </p>
                </div>
              </Link>

            </div>
          

          </div>

        </section>

      </main>
    </div>
  );
}

export default Profile;

