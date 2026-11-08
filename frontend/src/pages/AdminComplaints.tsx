import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileWarning,
  Save,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import {
  getAllComplaints,
  updateComplaintResponse,
  updateComplaintStatus,
  type ComplaintResponse,
} from "../services/complaintService";
import ErrorPopup from "../components/ErrorPopup";

type ComplaintFilter =
  | "ALL"
  | "PENDING"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<
    ComplaintResponse[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<
    number | null
  >(null);

  const [responseText, setResponseText] = useState<
    Record<number, string>
  >({});

  const [savingResponseId, setSavingResponseId] =
    useState<number | null>(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<ComplaintFilter>("ALL");

  async function loadComplaints() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllComplaints();

      setComplaints(data);

      const responses: Record<number, string> = {};

      data.forEach((complaint) => {
        responses[complaint.id] =
          complaint.adminResponse || "";
      });

      setResponseText(responses);
    } catch (err) {
      console.error(
        "Failed to load complaints:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function handleStatusChange(
    complaintId: number,
    status: string
  ) {
    const complaint = complaints.find(
      (item) => item.id === complaintId
    );

    if (!complaint) {
      return;
    }

    const currentResponse =
      responseText[complaintId] || "";

    /*
     * When moving from IN_REVIEW to RESOLVED/REJECTED,
     * the response currently written in the textarea
     * becomes the final response.
     */
    if (
      (status === "RESOLVED" ||
        status === "REJECTED") &&
      !currentResponse.trim()
    ) {
      setError(
        "Please provide an admin response before resolving or rejecting the complaint."
      );
      setSuccessMessage("");
      return;
    }

    try {
      setUpdatingId(complaintId);
      setError("");
      setSuccessMessage("");

      /*
       * If the complaint is being closed, first save
       * the latest response from the textarea.
       */
      let updatedComplaint = complaint;

      if (
        (status === "RESOLVED" ||
          status === "REJECTED") &&
        currentResponse.trim() !==
          (complaint.adminResponse || "").trim()
      ) {
        updatedComplaint =
          await updateComplaintResponse(
            complaintId,
            currentResponse.trim()
          );
      }

      /*
       * Now update the complaint status.
       */
      updatedComplaint =
        await updateComplaintStatus(
          complaintId,
          status
        );

      setComplaints((current) =>
        current.map((item) =>
          item.id === complaintId
            ? updatedComplaint
            : item
        )
      );

      setResponseText((current) => ({
        ...current,
        [complaintId]:
          updatedComplaint.adminResponse || "",
      }));

      setSuccessMessage(
        status === "RESOLVED"
          ? "Complaint resolved successfully."
          : status === "REJECTED"
            ? "Complaint rejected successfully."
            : "Complaint status updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update complaint:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update complaint."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveResponse(
    complaintId: number
  ) {
    const complaint = complaints.find(
      (item) => item.id === complaintId
    );

    if (!complaint) {
      return;
    }

    /*
     * Closed complaints cannot be edited.
     */
    if (
      complaint.status === "RESOLVED" ||
      complaint.status === "REJECTED"
    ) {
      setError(
        "This complaint is closed and its response cannot be changed."
      );
      setSuccessMessage("");
      return;
    }

    const response =
      responseText[complaintId] || "";

    if (!response.trim()) {
      setError(
        "Admin response cannot be empty."
      );
      setSuccessMessage("");
      return;
    }

    try {
      setSavingResponseId(complaintId);
      setError("");
      setSuccessMessage("");

      const updatedComplaint =
        await updateComplaintResponse(
          complaintId,
          response.trim()
        );

      setComplaints((current) =>
        current.map((item) =>
          item.id === complaintId
            ? updatedComplaint
            : item
        )
      );

      setResponseText((current) => ({
        ...current,
        [complaintId]:
          updatedComplaint.adminResponse || "",
      }));

      setSuccessMessage(
        "Admin response saved successfully."
      );
    } catch (err) {
      console.error(
        "Failed to save admin response:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save admin response."
      );
    } finally {
      setSavingResponseId(null);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "RESOLVED":
        return (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        );

      case "REJECTED":
        return (
          <XCircle className="h-5 w-5 text-red-600" />
        );

      case "IN_REVIEW":
        return (
          <AlertCircle className="h-5 w-5 text-blue-600" />
        );

      default:
        return (
          <Clock3 className="h-5 w-5 text-amber-600" />
        );
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "RESOLVED":
        return "border-green-200 bg-green-50 text-green-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      case "IN_REVIEW":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }

  function getAvailableStatuses(
    status: string,
    hasResponse: boolean
  ) {
    switch (status) {
      case "PENDING":
        return [
          {
            value: "PENDING",
            label: "Pending",
          },
          {
            value: "IN_REVIEW",
            label: "In Review",
          },
        ];

      case "IN_REVIEW":
        if (!hasResponse) {
          return [
            {
              value: "IN_REVIEW",
              label: "In Review",
            },
          ];
        }

        return [
          {
            value: "IN_REVIEW",
            label: "In Review",
          },
          {
            value: "RESOLVED",
            label: "Resolved",
          },
          {
            value: "REJECTED",
            label: "Rejected",
          },
        ];

      case "RESOLVED":
        return [
          {
            value: "RESOLVED",
            label: "Resolved",
          },
        ];

      case "REJECTED":
        return [
          {
            value: "REJECTED",
            label: "Rejected",
          },
        ];

      default:
        return [
          {
            value: status,
            label: status.replace("_", " "),
          },
        ];
    }
  }

  const complaintCounts = useMemo(() => {
    return {
      ALL: complaints.length,

      PENDING: complaints.filter(
        (complaint) =>
          complaint.status === "PENDING"
      ).length,

      IN_REVIEW: complaints.filter(
        (complaint) =>
          complaint.status === "IN_REVIEW"
      ).length,

      RESOLVED: complaints.filter(
        (complaint) =>
          complaint.status === "RESOLVED"
      ).length,

      REJECTED: complaints.filter(
        (complaint) =>
          complaint.status === "REJECTED"
      ).length,
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    if (activeFilter === "ALL") {
      return complaints;
    }

    return complaints.filter(
      (complaint) =>
        complaint.status === activeFilter
    );
  }, [complaints, activeFilter]);

  const filters: {
    value: ComplaintFilter;
    label: string;
    count: number;
  }[] = [
    {
      value: "ALL",
      label: "All",
      count: complaintCounts.ALL,
    },
    {
      value: "PENDING",
      label: "Pending",
      count: complaintCounts.PENDING,
    },
    {
      value: "IN_REVIEW",
      label: "In Review",
      count: complaintCounts.IN_REVIEW,
    },
    {
      value: "RESOLVED",
      label: "Resolved",
      count: complaintCounts.RESOLVED,
    },
    {
      value: "REJECTED",
      label: "Rejected",
      count: complaintCounts.REJECTED,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Complaints &amp; Reports
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Review and manage traveler complaints.
          </p>
        </div>

        <ErrorPopup message={error} onClose={() => setError("")} />

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {!loading && complaints.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              {filters.map((filter) => {
                const isActive =
                  activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setActiveFilter(
                        filter.value
                      )
                    }
                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#172B4D] text-white"
                        : "text-gray-600 hover:bg-[#FAF9F6]"
                    }`}
                  >
                    {filter.label}

                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-10 text-center">
              <FileWarning className="mx-auto mb-3 h-9 w-9 text-gray-400" />

              <p className="font-medium text-gray-600">
                No complaints found.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                New traveler complaints will appear here.
              </p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-10 text-center">
              <FileWarning className="mx-auto mb-3 h-9 w-9 text-gray-400" />

              <p className="font-medium text-gray-600">
                No{" "}
                {activeFilter
                  .toLowerCase()
                  .replace("_", " ")}{" "}
                complaints.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Try selecting another filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredComplaints.map(
                (complaint) => {
                  const isClosed =
                    complaint.status ===
                      "RESOLVED" ||
                    complaint.status ===
                      "REJECTED";

                  const hasResponse = Boolean(
                    (
                      responseText[
                        complaint.id
                      ] ||
                      complaint.adminResponse ||
                      ""
                    ).trim()
                  );

                  const availableStatuses =
                    getAvailableStatuses(
                      complaint.status,
                      hasResponse
                    );

                  return (
                    <div
                      key={complaint.id}
                      className="p-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-400">
                              Complaint #
                              {complaint.id}
                            </span>

                            <span className="text-xs text-gray-400">
                              •
                            </span>

                            <span className="text-xs text-gray-400">
                              Booking #
                              {complaint.bookingId}
                            </span>
                          </div>

                          <h2 className="mt-2 text-lg font-semibold text-[#172B4D]">
                            {complaint.subject}
                          </h2>

                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">
                              Traveler:
                            </span>{" "}
                            {complaint.travelerName}
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-medium">
                              Email:
                            </span>{" "}
                            {complaint.travelerEmail}
                          </div>
                        </div>

                        <div
                          className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {getStatusIcon(
                            complaint.status
                          )}

                          {complaint.status.replace(
                            "_",
                            " "
                          )}
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-[#FAF9F6] p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Traveler Complaint
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                          {
                            complaint.description
                          }
                        </p>
                      </div>

                      {/* ADMIN RESPONSE */}

                      <div className="mt-5">
                        <label
                          htmlFor={`response-${complaint.id}`}
                          className="mb-2 block text-sm font-semibold text-[#172B4D]"
                        >
                          {complaint.status ===
                          "IN_REVIEW"
                            ? "Admin Response"
                            : complaint.status ===
                                "RESOLVED"
                              ? "Final Resolution"
                              : complaint.status ===
                                  "REJECTED"
                                ? "Final Decision"
                                : "Admin Response"}
                        </label>

                        {isClosed ? (
                          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                              {
                                complaint.adminResponse
                              }
                            </p>

                            <p className="mt-3 text-xs text-gray-400">
                              Final response. This
                              complaint is closed and
                              cannot be changed.
                            </p>
                          </div>
                        ) : (
                          <>
                            <textarea
                              id={`response-${complaint.id}`}
                              value={
                                responseText[
                                  complaint.id
                                ] || ""
                              }
                              onChange={(event) =>
                                setResponseText(
                                  (current) => ({
                                    ...current,
                                    [complaint.id]:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              maxLength={2000}
                              rows={4}
                              placeholder={
                                complaint.status ===
                                "IN_REVIEW"
                                  ? "Write your response or update the response before resolving or rejecting..."
                                  : "Write what was investigated, what action was taken, or why the complaint was rejected..."
                              }
                              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#E76F51] focus:ring-2 focus:ring-[#FCE9E4]"
                            />

                            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                              <p className="text-xs text-gray-400">
                                {
                                  (
                                    responseText[
                                      complaint.id
                                    ] || ""
                                  ).length
                                }
                                /2000 characters
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveResponse(
                                    complaint.id
                                  )
                                }
                                disabled={
                                  savingResponseId ===
                                    complaint.id ||
                                  !(
                                    responseText[
                                      complaint.id
                                    ] || ""
                                  ).trim()
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E76F51] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d95f42] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Save size={16} />

                                {savingResponseId ===
                                complaint.id
                                  ? "Saving..."
                                  : complaint.adminResponse
                                    ? "Update Response"
                                    : "Save Response"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* STATUS */}

                      <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="text-xs text-gray-400">
                          Submitted{" "}
                          {new Date(
                            complaint.createdAt
                          ).toLocaleString()}
                        </div>

                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`status-${complaint.id}`}
                            className="text-sm font-medium text-gray-600"
                          >
                            Status
                          </label>

                          {isClosed ? (
                            <div
                              className={`rounded-lg border px-3 py-2 text-sm font-medium ${getStatusStyle(
                                complaint.status
                              )}`}
                            >
                              {complaint.status ===
                              "RESOLVED"
                                ? "Resolved"
                                : "Rejected"}
                            </div>
                          ) : (
                            <select
                              id={`status-${complaint.id}`}
                              value={
                                complaint.status
                              }
                              disabled={
                                updatingId ===
                                complaint.id
                              }
                              onChange={(event) =>
                                handleStatusChange(
                                  complaint.id,
                                  event.target.value
                                )
                              }
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#E76F51] focus:ring-2 focus:ring-[#FCE9E4] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {availableStatuses.map(
                                (option) => (
                                  <option
                                    key={
                                      option.value
                                    }
                                    value={
                                      option.value
                                    }
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>
                          )}
                        </div>
                      </div>

                      {!isClosed &&
                        complaint.status ===
                          "IN_REVIEW" &&
                        !hasResponse && (
                          <p className="mt-2 text-right text-xs text-[#E76F51]">
                            Add an admin response before
                            resolving or rejecting this
                            complaint.
                          </p>
                        )}

                      {isClosed && (
                        <p className="mt-2 text-right text-xs text-gray-400">
                          This complaint is closed and
                          cannot be changed.
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}