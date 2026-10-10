import { ArrowRight, Heart, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllProperties,
  getPropertyImages,
  getImageUrl,
  getFavorites,
  addFavorite,
  removeFavorite,
  type PropertySearchResponse,
  type FavoriteResponse,
} from "../services/propertyService";

function FeaturedStays() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<
    PropertySearchResponse[]
  >([]);

  const [propertyImages, setPropertyImages] = useState<
    Record<number, string>
  >({});

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState<
    number | null
  >(null);

  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  const user = userString
    ? JSON.parse(userString)
    : null;

  const isLoggedIn = Boolean(token && user);

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setLoading(true);

        /*
         * Only verified properties are shown on the
         * public Home page.
         */
        const propertyData = await getAllProperties(true);

        /*
         * Keep the Home page compact.
         * The Search page remains the place to see
         * the complete property list.
         */
        const featured = propertyData.slice(0, 6);

        setProperties(featured);

        /*
         * Load the first property image for each
         * featured property.
         */
        const imageResults = await Promise.all(
          featured.map(async (property) => {
            try {
              const images = await getPropertyImages(
                property.id
              );

              if (images.length > 0) {
                return {
                  propertyId: property.id,
                  imageUrl: getImageUrl(
                    images[0].imageUrl
                  ),
                };
              }
            } catch (error) {
              console.warn(
                `Failed to load image for property ${property.id}:`,
                error
              );
            }

            return null;
          })
        );

        const imageMap: Record<number, string> = {};

        imageResults.forEach((result) => {
          if (result) {
            imageMap[result.propertyId] =
              result.imageUrl;
          }
        });

        setPropertyImages(imageMap);

        /*
         * Favorites are only loaded for logged-in users.
         */
        if (isLoggedIn && user?.id) {
          try {
            const favorites: FavoriteResponse[] =
              await getFavorites(user.id);

            setFavoriteIds(
              favorites.map(
                (favorite) => favorite.property.id
              )
            );
          } catch (error) {
            console.warn(
              "Failed to load favorites:",
              error
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load featured properties:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProperties();
  }, []);

  const handleFavorite = async (
    propertyId: number
  ) => {
    if (!isLoggedIn || !user?.id) {
      navigate("/login");
      return;
    }

    try {
      setFavoriteLoading(propertyId);

      const isFavorite =
        favoriteIds.includes(propertyId);

      if (isFavorite) {
        await removeFavorite(
          propertyId,
          user.id
        );

        setFavoriteIds((current) =>
          current.filter(
            (id) => id !== propertyId
          )
        );
      } else {
        await addFavorite(
          propertyId,
          user.id
        );

        setFavoriteIds((current) => [
          ...current,
          propertyId,
        ]);
      }
    } catch (error) {
      console.error(
        "Failed to update favorite:",
        error
      );
    } finally {
      setFavoriteLoading(null);
    }
  };

  const handleViewAll = () => {
    navigate("/search");
  };

  return (
    <section
  id="featured"
  className="bg-[var(--color-background)] scroll-mt-24"
>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Section heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Featured
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Places worth staying
            </h2>

            <p className="mt-3 max-w-xl text-[var(--color-text-secondary)]">
              Discover verified accommodation available
              through StayBy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleViewAll}
            className="flex items-center gap-2 self-start text-sm font-semibold text-[var(--color-navy)] transition hover:text-[var(--color-coral)] sm:self-auto"
          >
            View all stays
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={28}
              className="animate-spin text-[var(--color-coral)]"
            />
          </div>
        )}

        {/* Empty */}
        {!loading && properties.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
            <p className="text-sm font-medium text-[var(--color-navy)]">
              No featured properties available yet.
            </p>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Check back soon as more properties are added.
            </p>
          </div>
        )}

        {/* Property cards */}
        {!loading && properties.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const isFavorite =
                favoriteIds.includes(property.id);

              return (
                <article
                  key={property.id}
                  onClick={() =>
                    navigate(
                      `/property/${property.id}`
                    )
                  }
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-background)]">
                    {propertyImages[property.id] ? (
                      <img
                        src={
                          propertyImages[
                            property.id
                          ]
                        }
                        alt={property.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MapPin
                          size={36}
                          strokeWidth={1.5}
                          className="text-[var(--color-coral)]"
                        />
                      </div>
                    )}

                    {/* Favorite */}
                    <button
                      type="button"
                      aria-label={
                        isFavorite
                          ? `Remove ${property.name} from favorites`
                          : `Save ${property.name}`
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        handleFavorite(
                          property.id
                        );
                      }}
                      disabled={
                        favoriteLoading ===
                        property.id
                      }
                      className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${
                        isFavorite
                          ? "bg-[var(--color-coral)] text-white"
                          : "bg-white/90 text-[var(--color-navy)] hover:bg-white hover:text-[var(--color-coral)]"
                      }`}
                    >
                      {favoriteLoading ===
                      property.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Heart
                          size={18}
                          strokeWidth={1.8}
                          fill={
                            isFavorite
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )}
                    </button>

                    {/* Verified */}
                    {property.verified && (
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm backdrop-blur">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[var(--color-navy)]">
                      {property.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                      <MapPin size={15} />
                      <span>
                        {property.city}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                      {property.propertyType}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-navy)]">
                        View property
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-[var(--color-coral)] transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

export default FeaturedStays;
