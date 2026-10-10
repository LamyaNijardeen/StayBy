import {
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllProperties,
  getPropertyImages,
  getImageUrl,
  type PropertySearchResponse,
} from "../services/propertyService";

interface Destination {
  name: string;
  stays: number;
  image: string;
}

function PopularDestinations() {
  const navigate = useNavigate();

  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);

        const properties =
          await getAllProperties(true);

        /*
         * Group properties by city.
         */
        const cityMap = new Map<
          string,
          PropertySearchResponse[]
        >();

        properties.forEach((property) => {
          const city = property.city?.trim();

          if (!city) {
            return;
          }

          const existing =
            cityMap.get(city) || [];

          existing.push(property);

          cityMap.set(city, existing);
        });

        /*
         * Sort cities by number of properties.
         * Most available properties appear first.
         */
        const sortedCities = Array.from(
          cityMap.entries()
        )
          .sort(
            (a, b) =>
              b[1].length - a[1].length
          )
          .slice(0, 4);

        /*
         * Use the first property's image as the
         * destination image.
         */
        const destinationResults =
          await Promise.all(
            sortedCities.map(
              async ([city, cityProperties]) => {
                let image = "";

                try {
                  const images =
                    await getPropertyImages(
                      cityProperties[0].id
                    );

                  if (images.length > 0) {
                    image = getImageUrl(
                      images[0].imageUrl
                    );
                  }
                } catch (error) {
                  console.warn(
                    `Failed to load image for ${city}:`,
                    error
                  );
                }

                return {
                  name: city,
                  stays: cityProperties.length,
                  image,
                };
              }
            )
          );

        setDestinations(
          destinationResults
        );
      } catch (error) {
        console.error(
          "Failed to load destinations:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  const handleDestinationClick = (
    city: string
  ) => {
    navigate(
      `/search?city=${encodeURIComponent(
        city
      )}`
    );
  };

  const handleExploreAll = () => {
    navigate("/search");
  };

  return (
    <section
      id="explore"
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Section heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Explore
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Popular destinations
            </h2>

            <p className="mt-3 max-w-xl text-[var(--color-text-secondary)]">
              Explore destinations based on real
              accommodation available on StayBy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExploreAll}
            className="flex items-center gap-2 self-start text-sm font-semibold text-[var(--color-navy)] transition hover:text-[var(--color-coral)] sm:self-auto"
          >
            Explore all
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
        {!loading &&
          destinations.length === 0 && (
            <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--color-navy)]">
                No destinations available yet.
              </p>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Destinations will appear as properties
                are added.
              </p>
            </div>
          )}

        {/* Destination cards */}
        {!loading &&
          destinations.length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.map(
                (destination) => (
                  <article
                    key={destination.name}
                    onClick={() =>
                      handleDestinationClick(
                        destination.name
                      )
                    }
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-background)]">
                      {destination.image ? (
                        <img
                          src={destination.image}
                          alt={destination.name}
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
                    </div>

                    {/* Content */}
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-navy)]">
                          {destination.name}
                        </h3>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {destination.stays}{" "}
                          {destination.stays === 1
                            ? "stay"
                            : "stays"}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-coral-light)] transition group-hover:bg-[var(--color-coral)]">
                        <ArrowRight
                          size={16}
                          className="text-[var(--color-coral)] transition group-hover:text-white"
                        />
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}

      </div>
    </section>
  );
}

export default PopularDestinations;

