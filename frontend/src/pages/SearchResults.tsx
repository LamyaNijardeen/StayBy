import {
  ChevronDown,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const stays = [
  {
    id: 1,
    name: "Harbor View Residence",
    location: "Colombo, Sri Lanka",
    price: 45,
    rating: 4.8,
    reviews: 124,
    type: "Apartment",
    image:
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Palm Grove Stay",
    location: "Kandy, Sri Lanka",
    price: 52,
    rating: 4.6,
    reviews: 89,
    type: "Guesthouse",
    image:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "The Garden House",
    location: "Nuwara Eliya, Sri Lanka",
    price: 38,
    rating: 4.9,
    reviews: 156,
    type: "Villa",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "City Corner Residence",
    location: "Colombo, Sri Lanka",
    price: 48,
    rating: 4.7,
    reviews: 73,
    type: "Apartment",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Hilltop Haven",
    location: "Ella, Sri Lanka",
    price: 41,
    rating: 4.8,
    reviews: 102,
    type: "Guesthouse",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Coastal Escape",
    location: "Galle, Sri Lanka",
    price: 56,
    rating: 4.9,
    reviews: 211,
    type: "Villa",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80",
  },
];
function SearchResults() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          <div className="flex items-center gap-2">
            <MapPin
              size={21}
              className="text-[var(--color-coral)]"
            />

            <span className="text-xl font-bold tracking-tight text-[var(--color-navy)]">
              StayBy
            </span>
          </div>

          <button
            type="button"
            className="rounded-full border border-[var(--color-border)] p-2.5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
          >
            <Heart size={19} />
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Search bar */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">

          <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">

            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-background)] px-4 py-3">
              <MapPin
                size={19}
                className="text-[var(--color-coral)]"
              />

              <div>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Where
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                  Colombo
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-3 rounded-xl bg-[var(--color-background)] px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Dates
              </span>

              <span className="text-sm font-medium text-[var(--color-text)]">
                Add dates
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 rounded-xl bg-[var(--color-background)] px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Guests
              </span>

              <span className="text-sm font-medium text-[var(--color-text)]">
                1 guest
              </span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
            >
              <Search size={18} />
              Search
            </button>

          </div>
        </div>

        {/* Heading */}
        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Colombo · Sri Lanka
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-navy)] sm:text-3xl">
              24 stays found
            </h1>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)]"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)]"
            >
              Recommended
              <ChevronDown size={16} />
            </button>

          </div>
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {stays.map((stay) => (
<Link
  key={stay.id}
  to={`/property/${stay.id}`}
  className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
>

              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">

                <img
                  src={stay.image}
                  alt={stay.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <button
                  type="button"
                  aria-label={`Save ${stay.name}`}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 text-[var(--color-navy)] shadow-sm backdrop-blur transition hover:bg-white"
                >
                  <Heart size={18} />
                </button>

              </div>

              {/* Details */}
              <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {stay.type}
                    </p>

                    <h2 className="mt-1 font-semibold text-[var(--color-navy)]">
                      {stay.name}
                    </h2>

                    <p className="mt-1 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                      <MapPin size={14} />
                      {stay.location}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Star
                      size={15}
                      fill="currentColor"
                      className="text-[var(--color-coral)]"
                    />

                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {stay.rating}
                    </span>
                  </div>

                </div>

                <div className="mt-5 flex items-end justify-between border-t border-[var(--color-border)] pt-4">

                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {stay.reviews} reviews
                  </p>

                  <p className="text-[var(--color-navy)]">
                    <span className="text-lg font-bold">
                      ${stay.price}
                    </span>{" "}
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      / night
                    </span>
                  </p>

                </div>

              </div>
            </Link>
          ))}

        </div>

      </main>
    </div>
  );
}

export default SearchResults;