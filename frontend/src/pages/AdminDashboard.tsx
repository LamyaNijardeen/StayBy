import { useEffect, useState } from "react";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DoorOpen,
  ShieldCheck,
  Users,
  UserCog,
  XCircle,
} from "lucide-react";

import { getAdminDashboardStats } from "../services/adminService";
import type { AdminDashboardStats } from "../services/adminService";
import AdminNavbar from "../components/AdminNavbar";

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--color-navy)]">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)] text-[var(--color-coral)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-[var(--color-navy)]">
        {value}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] =
    useState<AdminDashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboardStats();

      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-coral)]" />

            <p className="mt-4 text-sm text-slate-500">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle size={26} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[var(--color-navy)]">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-5 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Monitor StayBy platform activity and performance.
            </p>
          </div>
        </div>

        {/* =====================================================
            MAIN STATISTICS
        ===================================================== */}

        <section className="mt-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              description="Registered platform users"
              icon={<Users size={21} />}
            />

            <StatCard
              title="Properties"
              value={stats.totalProperties}
              description="Properties listed"
              icon={<Building2 size={21} />}
            />

            <StatCard
              title="Rooms"
              value={stats.totalRooms}
              description="Rooms available"
              icon={<DoorOpen size={21} />}
            />

            <StatCard
              title="Bookings"
              value={stats.totalBookings}
              description="Total platform bookings"
              icon={<CalendarCheck size={21} />}
            />

          </div>
        </section>

        {/* =====================================================
            TWO-COLUMN OVERVIEW
        ===================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Users */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-navy)]">
                  Users
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  User distribution by role
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[var(--color-navy)]">
                <UserCog size={20} />
              </div>
            </div>

            <div className="mt-5">

              <StatusRow
                label="Travelers"
                value={stats.totalTravelers}
                icon={<Users size={17} />}
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatusRow
                label="Owners"
                value={stats.totalOwners}
                icon={<Building2 size={17} />}
                iconClass="bg-purple-50 text-purple-600"
              />

              <StatusRow
                label="Administrators"
                value={stats.totalAdmins}
                icon={<ShieldCheck size={17} />}
                iconClass="bg-[var(--color-coral-light)] text-[var(--color-coral)]"
              />

            </div>
          </div>

          {/* Properties */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-navy)]">
                  Properties
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Property verification overview
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[var(--color-navy)]">
                <Building2 size={20} />
              </div>
            </div>

            <div className="mt-5">

              <StatusRow
                label="Total properties"
                value={stats.totalProperties}
                icon={<Building2 size={17} />}
                iconClass="bg-slate-100 text-slate-600"
              />

              <StatusRow
                label="Verified"
                value={stats.verifiedProperties}
                icon={<CheckCircle2 size={17} />}
                iconClass="bg-green-50 text-green-600"
              />

              <StatusRow
                label="Pending verification"
                value={stats.pendingProperties}
                icon={<Clock3 size={17} />}
                iconClass="bg-orange-50 text-orange-600"
              />

            </div>
          </div>

        </section>

        {/* =====================================================
            BOOKING OVERVIEW
        ===================================================== */}

        <section className="mt-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-[var(--color-navy)]">
                  Booking Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current booking status across the platform
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-coral-light)] text-[var(--color-coral)]">
                <CalendarCheck size={20} />
              </div>

            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-xs font-medium text-orange-600">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-700">
                  {stats.pendingBookings}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-600">
                  Confirmed
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-700">
                  {stats.confirmedBookings}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-xs font-medium text-green-600">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-green-700">
                  {stats.completedBookings}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Cancelled
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-700">
                  {stats.cancelledBookings}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs font-medium text-red-600">
                  Rejected
                </p>

                <p className="mt-2 text-2xl font-bold text-red-700">
                  {stats.rejectedBookings}
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

