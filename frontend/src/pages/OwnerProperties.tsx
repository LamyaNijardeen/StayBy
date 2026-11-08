import { showAlert, showConfirm } from "../services/dialog";
import { useEffect, useState } from "react";
import {
  Building2,
  Eye,
  EyeOff,
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getMyProperties,
  getPropertyImages,
  deleteProperty,
  setPropertyListed,
  type OwnerPropertyResponse,
  type PropertyImageResponse,
} from "../services/ownerPropertyService";

import {
  getPropertyReviews,
  type ReviewResponse,
} from "../services/reviewService";

import OwnerNavbar from "../components/OwnerNavbar";
import ErrorPopup from "../components/ErrorPopup";

import { API_BASE_URL } from "../config";

function OwnerProperties() {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState<
    OwnerPropertyResponse[]
  >([]);

  const [propertyImages, setPropertyImages] = useState<
    Record<number, PropertyImageResponse[]>
  >({});

  const [propertyReviews, setPropertyReviews] = useState<
    Record<number, ReviewResponse[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPropertyReviews, setSelectedPropertyReviews] =
    useState<{
      propertyId: number;
      propertyName: string;
      reviews: ReviewResponse[];
    } | null>(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProperties();

      setProperties(data);

      /*
       * Load images and reviews for each property.
       */
      const results = await Promise.all(
        data.map(async (property) => {
          let images: PropertyImageResponse[] = [];
          let reviews: ReviewResponse[] = [];

          try {
            images = await getPropertyImages(property.id);
          } catch {
            images = [];
          }

          try {
            reviews = await getPropertyReviews(property.id);

            console.log(
              "REVIEWS FOR PROPERTY",
              property.id,
              reviews
            );
          } catch (error) {
            console.error(
              "FAILED TO LOAD REVIEWS FOR PROPERTY",
              property.id,
              error
            );

            reviews = [];
          }

          return {
            propertyId: property.id,
            images,
            reviews,
          };
        })
      );

      const imageMap: Record<
        number,
        PropertyImageResponse[]
      > = {};

      const reviewMap: Record<
        number,
        ReviewResponse[]
      > = {};

      results.forEach((result) => {
        imageMap[result.propertyId] = result.images;
        reviewMap[result.propertyId] = result.reviews;
      });

      setPropertyImages(imageMap);
      setPropertyReviews(reviewMap);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [location.state?.refreshReviews]);

  const handleToggleListed = async (
    propertyId: number,
    listed: boolean
  ) => {
    const confirmed = await showConfirm(
      listed
        ? "Hide this property? It will no longer appear in search and cannot receive new bookings. Existing bookings are not affected. You can show it again at any time."
        : "Show this property in search again?",
      {
        title: listed ? "Hide property" : "Show property",
        confirmLabel: listed ? "Hide" : "Show",
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      const updated = await setPropertyListed(
        propertyId,
        !listed
      );

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? { ...property, listed: updated.listed }
            : property
        )
      );
    } catch (err) {
      await showAlert(
        err instanceof Error
          ? err.message
          : "Failed to update the property.",
        { tone: "error" }
      );
    }
  };

  const handleDelete = async (propertyId: number) => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProperty(propertyId);

      setProperties((currentProperties) =>
        currentProperties.filter(
          (property) => property.id !== propertyId
        )
      );

      setPropertyImages((currentImages) => {
        const updatedImages = { ...currentImages };
        delete updatedImages[propertyId];
        return updatedImages;
      });

      setPropertyReviews((currentReviews) => {
        const updatedReviews = { ...currentReviews };
        delete updatedReviews[propertyId];
        return updatedReviews;
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete property.";

      setError(message);

      void showAlert(message, {
        tone: "error",
        title: "Couldn't delete property",
      });
    }
  };

  const openReviews = (
    propertyId: number,
    propertyName: string
  ) => {
    setSelectedPropertyReviews({
      propertyId,
      propertyName,
      reviews: propertyReviews[propertyId] || [],
    });
  };

  const closeReviews = () => {
    setSelectedPropertyReviews(null);
  };

  const calculateAverageRating = (
    reviews: ReviewResponse[]
  ) => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return (total / reviews.length).toFixed(1);
  };

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Main Navbar */}
      <OwnerNavbar />

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <ErrorPopup message={error} onClose={() => setError("")} />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Owner dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              My properties
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Manage your listings, rooms and visibility in search.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/owner/properties/new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            Add property
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Loading your properties...
            </p>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                <Building2
                  size={26}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[var(--color-navy)]">
                No properties yet
              </h2>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Add your first property to start managing your stays.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/properties/new")
                }
                className="mt-6 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
              >
                Add your first property
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => {
              const images =
                propertyImages[property.id] || [];

              const reviews =
                propertyReviews[property.id] || [];

              const mainImage =
                images.length > 0
                  ? images[0].imageUrl
                  : null;

              const imageUrl = mainImage
                ? `${API_BASE_URL}${mainImage}`
                : null;

              const averageRating =
                calculateAverageRating(reviews);

              return (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
                >
                  {/* Property Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-coral-light)]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2
                          size={42}
                          className="text-[var(--color-coral)]"
                        />
                      </div>
                    )}

                    {property.listed === false && (
                      <span className="absolute left-3 top-3 rounded-full bg-gray-800/80 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        Hidden
                      </span>
                    )}

                    {/* Verification Badge */}
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${property.verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {property.verified
                        ? "Verified"
                        : "Pending verification"}
                    </span>
                  </div>

                  {/* Property Top */}
                  <div className="border-b border-[var(--color-border)] p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                        <Building2
                          size={21}
                          className="text-[var(--color-coral)]"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-[var(--color-navy)]">
                          {property.name}
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          {property.propertyType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <p className="line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {property.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-5 flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {property.address}, {property.city}
                      </span>
                    </div>

                    {/* Reviews Summary */}
                    <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-coral-light)]">
                            <Star
                              size={18}
                              className="fill-[var(--color-coral)] text-[var(--color-coral)]"
                            />
                          </div>

                          <div>
                            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                              Rating
                            </p>

                            {averageRating ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-[var(--color-navy)]">
                                  {averageRating}
                                </span>

                                <span className="text-xs text-[var(--color-text-secondary)]">
                                  ({reviews.length}{" "}
                                  {reviews.length === 1
                                    ? "review"
                                    : "reviews"})
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                No reviews yet
                              </span>
                            )}
                          </div>
                        </div>

                        {reviews.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              openReviews(
                                property.id,
                                property.name
                              )
                            }
                            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                          >
                            View reviews
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/owner/properties/${property.id}/rooms`
                          )
                        }
                        className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-xs font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                      >
                        Rooms
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/owner/properties/${property.id}/edit`
                          )
                        }
                        className="flex items-center justify-center gap-1 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-xs font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(property.id)
                        }
                        className="flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleListed(
                          property.id,
                          property.listed !== false
                        )
                      }
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-xs font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                    >
                      {property.listed === false ? (
                        <>
                          <Eye size={14} />
                          Show in search
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          Hide from search
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Reviews Modal */}
      {selectedPropertyReviews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={closeReviews}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                  Reviews & Ratings
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {selectedPropertyReviews.propertyName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviews}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
                aria-label="Close reviews"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reviews */}
            <div className="max-h-[65vh] overflow-y-auto p-6">
              {selectedPropertyReviews.reviews.length ===
                0 ? (
                <div className="py-12 text-center">
                  <Star
                    size={32}
                    className="mx-auto text-[var(--color-text-secondary)]"
                  />

                  <p className="mt-3 text-sm font-medium text-[var(--color-navy)]">
                    No reviews yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPropertyReviews.reviews.map(
                    (review) => (
                      <div
                        key={review.id}
                        className="rounded-xl border border-[var(--color-border)] p-5"
                      >
                        {/* Reviewer */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-navy)]">
                              {review.userName}
                            </p>

                            <div className="mt-1 flex items-center gap-1">
                              {Array.from({
                                length: 5,
                              }).map((_, index) => (
                                <Star
                                  key={index}
                                  size={15}
                                  className={
                                    index <
                                      review.rating
                                      ? "fill-[var(--color-coral)] text-[var(--color-coral)]"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                            {formatReviewDate(
                              review.createdAt
                            )}
                          </span>
                        </div>

                        {/* Comment */}
                        {review.comment ? (
                          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                            {review.comment}
                          </p>
                        ) : (
                          <p className="mt-4 text-sm italic text-[var(--color-text-secondary)]">
                            No written comment.
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerProperties;