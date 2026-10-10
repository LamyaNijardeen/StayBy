import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileWarning,
  Send,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import TravelerNavbar from "../components/TravelerNavbar";
import {
  getMyComplaints,
  createComplaint,
  type ComplaintResponse,
} from "../services/complaintService";
import {
  getMyBookings,
  type BookingResponse,
} from "../services/bookingService";

const SUBJECT_OPTIONS = [
  "Property issue",
  "Room issue",
  "Payment issue",
  "Booking issue",
  "Owner issue",
  "Other",
];

export default function Complaints() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [complaints, setComplaints] = useState<
    ComplaintResponse[]
  >([]);

  const [bookingId, setBookingId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [bookingData, complaintData] =
        await Promise.all([
          getMyBookings(),
          getMyComplaints(),
        ]);

      setBookings(bookingData);
      setComplaints(complaintData);
    } catch (err) {
      console.error(
        "Failed to load complaint data:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load complaint information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!bookingId) {
      setError("Please select a booking.");
      return;
    }

    if (!subject) {
      setError("Please select a complaint subject.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    if (description.trim().length > 2000) {
      setError(
        "Complaint description cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setSubmitting(true);

      await createComplaint(
        Number(bookingId),
        subject,
        description.trim()
      );

      setBookingId("");
      setSubject("");
      setDescription("");

      setSuccess(
        "Your complaint has been submitted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Failed to submit complaint:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit complaint."
      );
    } finally {
      setSubmitting(false);
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
        return "bg-green-50 text-green-700 border-green-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "IN_REVIEW":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <TravelerNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FCE9E4]">
              <FileWarning className="h-5 w-5 text-[#E76F51]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#172B4D]">
                Complaints & Reports
              </h1>

              <p className="text-sm text-gray-500">
                Report an issue related to your StayBy booking.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-[#172B4D]">
            Submit a complaint
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Booking
              </label>

              <select
                value={bookingId}
                onChange={(event) =>
                  setBookingId(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#E76F51] focus:ring-2 focus:ring-[#FCE9E4]"
              >
                <option value="">
                  Select a booking
                </option>

                {bookings.map((booking) => (
                  <option
                    key={booking.id}
                    value={booking.id}
                  >
                    Booking #{booking.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Complaint subject
              </label>

              <select
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#E76F51] focus:ring-2 focus:ring-[#FCE9E4]"
              >
                <option value="">
                  Select a subject
                </option>

                {SUBJECT_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={6}
                maxLength={2000}
                placeholder="Describe the issue you experienced..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#E76F51] focus:ring-2 focus:ring-[#FCE9E4]"
              />

              <div className="mt-1 text-right text-xs text-gray-400">
                {description.length}/2000
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E76F51] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d85f43] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />

              {submitting
                ? "Submitting..."
                : "Submit complaint"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-[#172B4D]">
            My complaints
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">
              Loading complaints...
            </p>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <FileWarning className="mx-auto mb-3 h-8 w-8 text-gray-400" />

              <p className="text-sm font-medium text-gray-600">
                No complaints submitted yet.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Your submitted complaints will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Complaint #{complaint.id} · Booking #
                        {complaint.bookingId}
                      </p>

                      <h3 className="mt-1 font-semibold text-[#172B4D]">
                        {complaint.subject}
                      </h3>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                        complaint.status
                      )}`}
                    >
                      {getStatusIcon(complaint.status)}

                      {complaint.status.replace(
                        "_",
                        " "
                      )}
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {complaint.description}
                  </p>

                  {complaint.adminResponse && (
                    <div className="mt-5 rounded-xl border border-[#FCE9E4] bg-[#FCE9E4]/50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#E76F51]">
                        {complaint.status === "RESOLVED"
                          ? "Resolution"
                          : complaint.status === "REJECTED"
                            ? "Admin Decision"
                            : "Admin Response"}
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {complaint.adminResponse}
                      </p>
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400">
                    Submitted{" "}
                    {new Date(
                      complaint.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}