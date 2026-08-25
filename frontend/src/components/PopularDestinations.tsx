import { ArrowRight } from "lucide-react";

const destinations = [
  {
    name: "Colombo",
    stays: "120+ stays",
    image:
      "https://images.unsplash.com/photo-1586613830220-3f4b2b7c9f6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kandy",
    stays: "80+ stays",
    image:
      "https://images.unsplash.com/photo-1588598198321-9735fd524a0d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Galle",
    stays: "65+ stays",
    image:
      "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ella",
    stays: "40+ stays",
    image:
      "https://images.unsplash.com/photo-1588598198321-9735fd524a0d?auto=format&fit=crop&w=800&q=80",
  },
];

function PopularDestinations() {
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
              Discover comfortable places to stay wherever you're headed.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 self-start text-sm font-semibold text-[var(--color-navy)] transition hover:text-[var(--color-coral)] sm:self-auto"
          >
            Explore all
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Destination cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <article
              key={destination.name}
              className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[var(--color-navy)]">
                  {destination.name}
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {destination.stays}
                </p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default PopularDestinations;