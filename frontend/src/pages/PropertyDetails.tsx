import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const amenities = [
  "Free Wi-Fi",
  "Air conditioning",
  "Private bathroom",
  "Free parking",
  "Kitchen",
  "Workspace",
];

const gallery = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80",
];

function PropertyDetails() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
          >
            <ArrowLeft size={17} />
            Back to results
          </button>

          <div className="flex items-center gap-2">
            <MapPin
              size={21}
              className="text-[var(--color-coral)]"
            />

            <span className="text-xl font-bold tracking-tight text-[var(--color-navy)]">
              StayBy
            </span>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              aria-label="Share property"
              className="rounded-full border border-[var(--color-border)] p-2.5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              aria-label="Save property"
              className="rounded-full border border-[var(--color-border)] p-2.5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-coral)]"
            >
              <Heart size={18} />
            </button>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Property heading */}
        <div className="mb-6">

          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <span>Colombo</span>
            <span>•</span>
            <span>Sri Lanka</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Harbor View Residence
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">

            <div className="flex items-center gap-1.5">
              <Star
                size={16}
                fill="currentColor"
                className="text-[var(--color-coral)]"
              />

              <span className="font-semibold text-[var(--color-text)]">
                4.8
              </span>

              <span className="text-[var(--color-text-secondary)]">
                · 124 reviews
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <MapPin size={16} />
              Colombo, Sri Lanka
            </div>

          </div>
        </div>

        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-2">

          <div className="h-[360px] overflow-hidden rounded-2xl md:h-[480px]">
            <img
              src={gallery[0]}
              alt="Main view of Harbor View Residence"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">

            {gallery.slice(1).map((image, index) => (
              <div
                key={image}
                className={`overflow-hidden ${index === 0
                    ? "rounded-tr-2xl"
                    : "rounded-br-2xl"
                  }`}
              >
                <img
                  src={image}
                  alt={`Harbor View Residence view ${index + 2}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            <div className="relative overflow-hidden rounded-bl-2xl rounded-br-2xl bg-[var(--color-navy)]">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80"
                alt="Interior of Harbor View Residence"
                className="h-full w-full object-cover opacity-75"
              />

              <button
                type="button"
                className="absolute bottom-4 right-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] shadow-lg"
              >
                View all photos
              </button>
            </div>

          </div>

        </div>

        {/* Content */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">

          {/* Left */}
          <div>

            {/* Intro */}
            <section className="border-b border-[var(--color-border)] pb-8">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral)]">
                  <BedDouble size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                    Comfortable apartment in Colombo
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Entire apartment · 2 guests · 1 bedroom · 1 bed · 1 bathroom
                  </p>
                </div>

              </div>

              <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
                Enjoy a comfortable stay in a convenient Colombo location.
                Harbor View Residence offers a peaceful space with modern
                facilities, easy access to the city, and everything you need
                for a relaxing visit.
              </p>

            </section>

            {/* Amenities */}
            <section className="border-b border-[var(--color-border)] py-8">

              <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                What this place offers
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-sm text-[var(--color-text)]"
                  >
                    <Check
                      size={18}
                      className="text-[var(--color-coral)]"
                    />

                    {amenity}
                  </div>
                ))}

              </div>

            </section>

            {/* Location */}
            <section className="pt-8">

              <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                Where you'll stay
              </h2>

              <div className="mt-5 flex h-56 items-center justify-center rounded-2xl bg-[var(--color-coral-light)]">

                <div className="text-center">

                  <MapPin
                    size={32}
                    className="mx-auto text-[var(--color-coral)]"
                  />

                  <p className="mt-3 font-semibold text-[var(--color-navy)]">
                    Colombo, Sri Lanka
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Exact location provided after booking
                  </p>

                </div>

              </div>

            </section>

          </div>

          {/* Booking card */}
          <aside>

            <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5">

              <div className="flex items-end justify-between">

                <div>
                  <span className="text-2xl font-bold text-[var(--color-navy)]">
                    $45
                  </span>

                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {" "}
                    / night
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Star
                    size={15}
                    fill="currentColor"
                    className="text-[var(--color-coral)]"
                  />

                  <span className="font-semibold">
                    4.8
                  </span>
                </div>

              </div>

              {/* Dates */}
              <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-border)]">

                <div className="grid grid-cols-2">

                  <button
                    type="button"
                    className="border-r border-[var(--color-border)] p-4 text-left transition hover:bg-[var(--color-background)]"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span className="text-xs font-semibold">
                        CHECK-IN
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Add date
                    </p>
                  </button>

                  <button
                    type="button"
                    className="p-4 text-left transition hover:bg-[var(--color-background)]"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span className="text-xs font-semibold">
                        CHECK-OUT
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Add date
                    </p>
                  </button>

                </div>

                <div className="border-t border-[var(--color-border)] p-4">

                  <div className="flex items-center gap-2">
                    <Users size={17} />

                    <span className="text-xs font-semibold">
                      GUESTS
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    1 guest
                  </p>

                </div>

              </div>

              {/* Reserve */}
              <Link
                to="/booking"
                className="mt-5 flex w-full items-center justify-center rounded-xl bg-[var(--color-coral)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
              >
                Reserve
              </Link>

              <p className="mt-3 text-center text-xs text-[var(--color-text-secondary)]">
                You won't be charged yet
              </p>

              {/* Price breakdown */}
              <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-5 text-sm">

                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    $45 × 1 night
                  </span>

                  <span>$45</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Service fee
                  </span>

                  <span>$5</span>
                </div>

                <div className="flex justify-between border-t border-[var(--color-border)] pt-3 font-semibold text-[var(--color-navy)]">
                  <span>Total</span>
                  <span>$50</span>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>
    </div>
  );
}

export default PropertyDetails;