import { useEffect, useState } from "react";
import {
  GraduationCap,
  Landmark,
  Loader2,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Stethoscope,
  Church,
  Train,
  Trash2,
  Umbrella,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  deletePropertyLandmark,
  formatLandmarkDistance,
  getPropertyLandmarks,
  landmarkMatches,
  refreshPropertyLandmarks,
} from "../services/landmarkService";
import type { LandmarkResponse } from "../services/landmarkService";

interface NearbyPlacesProps {
  propertyId: number;
  /** Owner mode: shows Refresh and Remove buttons. */
  editable?: boolean;
  /** Landmark the traveler searched for; that row is highlighted. */
  highlight?: string;
}

export function getLandmarkIcon(
  category: string,
  size = 18
): ReactNode {
  switch (category) {
    case "Hospital":
      return <Stethoscope size={size} />;
    case "Education":
      return <GraduationCap size={size} />;
    case "Beach":
      return <Umbrella size={size} />;
    case "Tourist place":
      return <Landmark size={size} />;
    case "Transport":
      return <Train size={size} />;
    case "Religious":
      return <Church size={size} />;
    case "Shopping":
      return <ShoppingBag size={size} />;
    default:
      return <MapPin size={size} />;
  }
}

function NearbyPlaces({
  propertyId,
  editable = false,
  highlight = "",
}: NearbyPlacesProps) {
  const [places, setPlaces] = useState<LandmarkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getPropertyLandmarks(propertyId);

        if (!cancelled) {
          setPlaces(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load nearby places."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      setPlaces(await refreshPropertyLandmarks(propertyId));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh nearby places."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemove = async (landmarkId: number) => {
    try {
      setRemovingId(landmarkId);
      setError("");

      await deletePropertyLandmark(propertyId, landmarkId);

      setPlaces((current) =>
        current.filter((place) => place.id !== landmarkId)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove this place."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      {editable && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Found automatically from your saved map location.
            Remove anything that is not useful for guests.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-navy)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {refreshing ? "Looking up..." : "Refresh nearby places"}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Loading nearby places...
        </p>
      ) : places.length === 0 ? (
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          {editable
            ? "No nearby places yet. Save the property with its map location, wait a few seconds, then press Refresh."
            : "Nearby places have not been added for this property yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {places.map((place) => {
            const isHighlighted = landmarkMatches(highlight, place);

            return (
              <div
                key={place.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  isHighlighted
                    ? "border-[var(--color-coral)] bg-[var(--color-coral-light)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
              >
                <span className="shrink-0 text-[var(--color-coral)]">
                  {getLandmarkIcon(place.category)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-navy)]">
                    {place.name}
                  </p>

                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {place.category}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold text-[var(--color-navy)]">
                  {formatLandmarkDistance(place.distanceKm)}
                </span>

                {editable && (
                  <button
                    type="button"
                    onClick={() => handleRemove(place.id)}
                    disabled={removingId === place.id}
                    aria-label={`Remove ${place.name}`}
                    className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-secondary)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[11px] text-[var(--color-text-secondary)]">
        Distances are in a straight line from the property. Place data
        &copy; OpenStreetMap contributors.
      </p>
    </div>
  );
}

export default NearbyPlaces;