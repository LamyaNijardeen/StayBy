import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  getImageUrl,
  getPropertyById,
  getPropertyImages,
  type PropertySearchResponse,
  type RoomResponse,
} from "../services/propertyService";
import {
  formatLandmarkDistance,
  getPropertyLandmarks,
  type LandmarkResponse,
} from "../services/landmarkService";

import { API_BASE_URL } from "../config";

interface AdminPropertyDetailsProps {
  propertyId: number;
  busy: boolean;
  onClose: () => void;
  onVerify: (propertyId: number) => void;
  onReject: (propertyId: number) => void;
}

/**
 * Everything the admin needs to review a property before verifying it:
 * photos, description, location, purposes, amenities, rooms, nearby
 * places and the owner's contact details.
 */
function AdminPropertyDetails({
  propertyId,
  busy,
  onClose,
  onVerify,
  onReject,
}: AdminPropertyDetailsProps) {
  const [property, setProperty] =
    useState<PropertySearchResponse | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [landmarks, setLandmarks] = useState<LandmarkResponse[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const [propertyData, imageData, landmarkData, roomData] =
          await Promise.all([
            getPropertyById(propertyId),
            getPropertyImages(propertyId).catch(() => []),
            getPropertyLandmarks(propertyId).catch(() => []),
            fetch(`${API_BASE_URL}/api/properties/${propertyId}/rooms`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((response) =>
                response.ok ? response.json() : []
              )
              .catch(() => []),
          ]);

        if (cancelled) return;

        setProperty(propertyData);
        setImages(imageData.map((image) => getImageUrl(image.imageUrl)));
        setLandmarks(landmarkData);
        setRooms(roomData);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load property details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const mapUrl =
    property && property.latitude != null && property.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`
      : null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[var(--color-navy-dark)]/50 backdrop-blur-sm sm:items-center sm:px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Property details"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Review property
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-[var(--color-navy)]">
              {property?.name ?? "Loading..."}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2
                size={28}
                className="animate-spin text-[var(--color-coral)]"
              />
            </div>
          )}

          {!loading && error && (
            <p className="py-10 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && property && (
            <div className="space-y-7">
              {/* Photos */}
              {images.length > 0 ? (
                <div>
                  <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[var(--color-background)]">
                    <img
                      src={images[activeImage]}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {images.length > 1 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {images.map((image, index) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setActiveImage(index)}
                          aria-label={`Photo ${index + 1}`}
                          className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                            index === activeImage
                              ? "border-[var(--color-coral)]"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                  The owner has not uploaded any photos yet.
                </div>
              )}

              {/* Summary */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--color-coral-light)] px-3 py-1 text-xs font-semibold text-[var(--color-coral)]">
                    {property.propertyType}
                  </span>

                  {property.verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <ShieldCheck size={13} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      <Clock3 size={13} />
                      Pending review
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>
                    {property.address}, {property.city}
                  </span>
                </div>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-coral)] hover:underline"
                  >
                    View on map
                    <ExternalLink size={14} />
                  </a>
                )}

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--color-text-secondary)]">
                  {property.description || "No description provided."}
                </p>
              </div>

              {/* Purposes + amenities */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-navy)]">
                    Suitable for
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.suitablePurposes?.length ? (
                      property.suitablePurposes.map((purpose) => (
                        <span
                          key={purpose}
                          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-navy)]"
                        >
                          {purpose}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        None selected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[var(--color-navy)]">
                    Amenities
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.amenities?.length ? (
                      property.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-navy)]"
                        >
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        None listed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h3 className="text-sm font-bold text-[var(--color-navy)]">
                  Rooms ({rooms.length})
                </h3>

                {rooms.length === 0 ? (
                  <p className="mt-2 text-sm text-orange-700">
                    No rooms added yet. Guests cannot book this property
                    until the owner adds a room.
                  </p>
                ) : (
                  <div className="mt-2 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-navy)]">
                            {room.name}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <Users size={13} />
                            Up to {room.capacity} guests
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-[var(--color-navy)]">
                          LKR {Number(room.pricePerNight).toLocaleString()}
                          <span className="font-normal text-[var(--color-text-secondary)]">
                            {" "}
                            / night
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nearby places */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
                  <Landmark size={16} className="text-[var(--color-coral)]" />
                  Nearby places
                </h3>

                {landmarks.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    No nearby places found yet.
                  </p>
                ) : (
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {landmarks.slice(0, 8).map((landmark) => (
                      <li
                        key={landmark.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-background)] px-3 py-2 text-sm"
                      >
                        <span className="truncate text-[var(--color-navy)]">
                          {landmark.name}
                        </span>

                        <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                          {formatLandmarkDistance(landmark.distanceKm)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Owner */}
              <div>
                <h3 className="text-sm font-bold text-[var(--color-navy)]">
                  Owner
                </h3>

                <div className="mt-2 space-y-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm">
                  <p className="flex items-center gap-2 text-[var(--color-navy)]">
                    <User size={15} className="text-[var(--color-text-secondary)]" />
                    {property.owner.name}
                  </p>

                  <p className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Mail size={15} />
                    {property.owner.email}
                  </p>

                  <p className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Phone size={15} />
                    {property.owner.phone || "No phone number given"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!loading && !error && property && (
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
            >
              Close
            </button>

            {property.verified ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onReject(property.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={16} />
                {busy ? "Updating..." : "Reject"}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => onVerify(property.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                {busy ? "Updating..." : "Verify property"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPropertyDetails;
