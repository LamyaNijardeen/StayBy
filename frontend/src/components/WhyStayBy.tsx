import {
  Compass,
  MapPin,
  ShieldCheck,
  Target,
} from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Search by purpose",
    description:
      "Find accommodation based on why you're travelling, whether it's for education, work, healthcare, travel, or other needs.",
  },
  {
    icon: MapPin,
    title: "Find the right location",
    description:
      "Discover stays near the places that matter to your journey, with property locations available on the map.",
  },
  {
    icon: ShieldCheck,
    title: "Book with confidence",
    description:
      "View clear property and room information, availability, booking details, and updates throughout your stay.",
  },
  {
    icon: Compass,
    title: "Keep it simple",
    description:
      "From searching to booking and managing your stay, StayBy keeps the experience straightforward and easy to follow.",
  },
];

function WhyStayBy() {
  return (
    <section
  id="why-stayby"
  className="bg-[var(--color-surface)] scroll-mt-24"
>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Why StayBy?
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            More than finding a place to stay.
          </h2>

          <p className="mt-4 text-[var(--color-text-secondary)]">
            StayBy brings purpose, location, and a simple booking experience
            together to help you find accommodation that fits your journey.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-[var(--color-navy)]">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default WhyStayBy;