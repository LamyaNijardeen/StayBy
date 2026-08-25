import { ArrowRight, Heart, Star } from "lucide-react";

const stays = [
  {
    name: "Cozy City Stay",
    location: "Colombo",
    rating: "4.8",
    reviews: "24",
    price: "$25",
    image:
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Hill View Home",
    location: "Kandy",
    rating: "4.7",
    reviews: "18",
    price: "$32",
    image:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Galle Haven",
    location: "Galle",
    rating: "4.9",
    reviews: "31",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
  },
];

function FeaturedStays() {
  return (
    <section className="bg-[var(--color-background)]">
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
              Handpicked stays that balance comfort, convenience, and value.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 self-start text-sm font-semibold text-[var(--color-navy)] transition hover:text-[var(--color-coral)] sm:self-auto"
          >
            View all stays
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Stay cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stays.map((stay) => (
            <article
              key={stay.name}
              className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={stay.image}
                  alt={stay.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {/* Favorite */}
                <button
                  type="button"
                  aria-label={`Save ${stay.name}`}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow-sm backdrop-blur transition hover:bg-white hover:text-[var(--color-coral)]"
                >
                  <Heart size={18} strokeWidth={1.8} />
                </button>
              </div>

              {/* Details */}
              <div className="p-5">

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <Star
                    size={15}
                    fill="currentColor"
                    className="text-[var(--color-coral)]"
                  />

                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {stay.rating}
                  </span>

                  <span className="text-sm text-[var(--color-text-secondary)]">
                    ({stay.reviews})
                  </span>
                </div>

                {/* Name */}
                <h3 className="mt-3 text-lg font-semibold text-[var(--color-navy)]">
                  {stay.name}
                </h3>

                {/* Location */}
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {stay.location}
                </p>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-[var(--color-navy)]">
                    {stay.price}
                  </span>

                  <span className="text-sm text-[var(--color-text-secondary)]">
                    / night
                  </span>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedStays;