import { showAlert } from "../services/dialog";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import AdminNavbar from "../components/AdminNavbar";
import AdminPropertyDetails from "../components/AdminPropertyDetails";
import {
  getAdminProperties,
  type AdminProperty,
} from "../services/adminService";
import { apiError } from "../services/apiError";

import { API_BASE_URL } from "../config";

function AdminProperties() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  /* Property currently open in the review pop-up. */
  const [detailsId, setDetailsId] = useState<number | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminProperties();
        setProperties(data);
      } catch (err) {
        console.error("Failed to load admin properties:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load properties."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        property.name.toLowerCase().includes(search) ||
        property.city.toLowerCase().includes(search) ||
        property.ownerName.toLowerCase().includes(search) ||
        property.ownerEmail.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "VERIFIED" && property.verified) ||
        (statusFilter === "PENDING" && !property.verified);

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  const verifiedCount = properties.filter(
    (property) => property.verified
  ).length;

  const pendingCount = properties.filter(
    (property) => !property.verified
  ).length;

  const handleVerify = async (propertyId: number) => {
    try {
      setActionLoading(propertyId);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as an administrator.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${propertyId}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw await apiError(response, "Failed to verify property.");
      }

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? {
                ...property,
                verified: true,
              }
            : property
        )
      );
    } catch (err) {
      console.error("Failed to verify property:", err);

      showAlert(
        err instanceof Error
          ? err.message
          : "Failed to verify property."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (propertyId: number) => {
    try {
      setActionLoading(propertyId);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as an administrator.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${propertyId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw await apiError(response, "Failed to reject property.");
      }

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? {
                ...property,
                verified: false,
              }
            : property
        )
      );
    } catch (err) {
      console.error("Failed to reject property:", err);

      showAlert(
        err instanceof Error
          ? err.message
          : "Failed to reject property."
      );
    } finally {
      setActionLoading(null);
    }
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
            Property Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Review properties submitted by owners and manage their verification status.
          </p>
        </div>

        {/* SUMMARY */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">

          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Total Properties
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {properties.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <Building2
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
                  Verified
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {verifiedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2
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
                  Pending Verification
                </p>

                <p className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                <Clock3
                  size={21}
                  className="text-orange-500"
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
                placeholder="Search by property, city, or owner..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-sm text-[var(--color-navy)] outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] outline-none transition focus:border-[var(--color-coral)]"
            >
              <option value="ALL">
                All properties
              </option>

              <option value="VERIFIED">
                Verified
              </option>

              <option value="PENDING">
                Pending verification
              </option>
            </select>

          </div>

        </section>

        {/* PROPERTY LIST */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">

          <div className="border-b border-[var(--color-border)] px-6 py-5">
            <h2 className="text-lg font-bold text-[var(--color-navy)]">
              Properties
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1
                ? "property"
                : "properties"}{" "}
              found
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center px-6 py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-coral)]" />

                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                  Loading properties...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2
                size={32}
                className="mx-auto text-[var(--color-text-secondary)]"
              />

              <p className="mt-3 text-sm font-semibold text-[var(--color-navy)]">
                No properties found
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] text-left">

                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[#FAF9F6]">

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Property
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Location
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Owner
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Registered
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[#FAF9F6]"
                    >

                      {/* PROPERTY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                            <Building2
                              size={18}
                              className="text-[var(--color-coral)]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[var(--color-navy)]">
                              {property.name}
                            </p>

                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {property.propertyType}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* LOCATION */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">

                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]"
                          />

                          <div>
                            <p className="text-sm font-medium text-[var(--color-navy)]">
                              {property.city}
                            </p>

                            <p className="max-w-[180px] text-xs text-[var(--color-text-secondary)]">
                              {property.address}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* OWNER */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[var(--color-navy)]">
                          {property.ownerName}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {property.ownerEmail}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {property.ownerPhone || "No phone"}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">

                        {property.verified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <ShieldCheck size={13} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                            <Clock3 size={13} />
                            Pending
                          </span>
                        )}

                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <CalendarDays size={15} />
                          {formatDate(property.createdAt)}
                        </div>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => setDetailsId(property.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
                          >
                            <Eye size={14} />
                            Details
                          </button>

                          {!property.verified && (
                            <button
                              type="button"
                              onClick={() =>
                                handleVerify(property.id)
                              }
                              disabled={
                                actionLoading === property.id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-navy)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} />

                              {actionLoading === property.id
                                ? "Updating..."
                                : "Verify"}
                            </button>
                          )}

                          {property.verified && (
                            <button
                              type="button"
                              onClick={() =>
                                handleReject(property.id)
                              }
                              disabled={
                                actionLoading === property.id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle size={14} />

                              {actionLoading === property.id
                                ? "Updating..."
                                : "Reject"}
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

            {/* PHONE / SMALL SCREENS: one card per property */}
            <div className="divide-y divide-[var(--color-border)] md:hidden">
              {filteredProperties.map((property) => (
                <div key={property.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-navy)]">
                        {property.name}
                      </p>

                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {property.propertyType}
                      </p>
                    </div>

                    {property.verified ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        <ShieldCheck size={13} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        <Clock3 size={13} />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span>
                      {property.address}, {property.city}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--color-text-secondary)]">
                    <p className="font-medium text-[var(--color-navy)]">
                      {property.ownerName}
                    </p>
                    <p>{property.ownerEmail}</p>
                    <p>{property.ownerPhone || "No phone"}</p>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <CalendarDays size={14} />
                    {formatDate(property.createdAt)}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDetailsId(property.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--color-navy)]"
                    >
                      <Eye size={14} />
                      Details
                    </button>

                    {property.verified ? (
                      <button
                        type="button"
                        onClick={() => handleReject(property.id)}
                        disabled={actionLoading === property.id}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleVerify(property.id)}
                        disabled={actionLoading === property.id}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-navy)] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}

        </section>

      </main>

      {detailsId !== null && (
        <AdminPropertyDetails
          propertyId={detailsId}
          busy={actionLoading === detailsId}
          onClose={() => setDetailsId(null)}
          onVerify={async (id) => {
            await handleVerify(id);
            setDetailsId(null);
          }}
          onReject={async (id) => {
            await handleReject(id);
            setDetailsId(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminProperties;
