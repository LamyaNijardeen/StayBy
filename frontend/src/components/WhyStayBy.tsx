import {
  CheckCircle,
  Compass,
  ShieldCheck,
} from "lucide-react";

const benefits = [
  {
    icon: Compass,
    title: "Find the right place",
    description:
      "Search stays based on where you're going, when you're staying, and what you need.",
  },
  {
    icon: ShieldCheck,
    title: "Stay with confidence",
    description:
      "Discover properties with clear information so you can make your decision with confidence.",
  },
  {
    icon: CheckCircle,
    title: "Simple and transparent",
    description:
      "Keep the booking experience straightforward, with the important details easy to understand.",
  },
];

function WhyStayBy() {
  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Why StayBy?
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Finding a place should feel simple.
          </h2>

          <p className="mt-4 text-[var(--color-text-secondary)]">
            Everything you need to find a stay that fits your plans,
            without making the process complicated.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
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