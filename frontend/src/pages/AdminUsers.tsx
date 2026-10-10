import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  User,
  ShieldCheck,
  Building2,
  CalendarDays,
} from "lucide-react";

import AdminNavbar from "../components/AdminNavbar";
import {
  getAdminUsers,
  type AdminUser,
} from "../services/adminService";

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load admin users:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
          <ShieldCheck size={13} />
          Administrator
        </span>
      );
    }

    if (role === "OWNER") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Building2 size={13} />
          Owner
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <User size={13} />
        Traveler
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* HEADER */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            User Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            View and manage users registered on the StayBy platform.
          </p>
        </div>

        {/* SUMMARY */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Total Users
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {users.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <Users
                  size={21}
                  className="text-[var(--color-coral)]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Travelers
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {users.filter(
                    (user) => user.role === "TRAVELER"
                  ).length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <User
                  size={21}
                  className="text-green-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Owners
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {users.filter(
                    (user) => user.role === "OWNER"
                  ).length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Building2
                  size={21}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Administrators
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {users.filter(
                    (user) => user.role === "ADMIN"
                  ).length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                <ShieldCheck
                  size={21}
                  className="text-purple-600"
                />
              </div>
            </div>
          </div>

        </section>

        {/* FILTERS */}
        <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full md:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-sm text-[var(--color-navy)] outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] outline-none transition focus:border-[var(--color-coral)]"
            >
              <option value="ALL">
                All roles
              </option>

              <option value="TRAVELER">
                Travelers
              </option>

              <option value="OWNER">
                Owners
              </option>

              <option value="ADMIN">
                Administrators
              </option>
            </select>

          </div>

        </section>

        {/* USERS TABLE */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">

          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-navy)]">
                  Registered Users
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1
                    ? "user"
                    : "users"}{" "}
                  found
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center px-6 py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-coral)]" />

                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                  Loading users...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users
                size={32}
                className="mx-auto text-[var(--color-text-secondary)]"
              />

              <p className="mt-3 text-sm font-semibold text-[var(--color-navy)]">
                No users found
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[#FAF9F6]">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      User
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Email
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Role
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Registered
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[#FAF9F6]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                            <User
                              size={17}
                              className="text-[var(--color-coral)]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[var(--color-navy)]">
                              {user.name}
                            </p>

                            <p className="text-xs text-[var(--color-text-secondary)]">
                              ID #{user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <CalendarDays size={15} />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default AdminUsers;

