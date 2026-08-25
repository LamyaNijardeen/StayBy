import {
  CalendarCheck,
  Search,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    description:
      "Tell us where you're going, when you're staying, and what you're looking for.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Choose",
    description:
      "Explore stays that match your plans and compare the options that feel right.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Stay",
    description:
      "Book your stay with the details you need and get ready for your trip.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            How it works
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Finding your stay, made simple.
          </h2>

          <p className="mt-4 text-[var(--color-text-secondary)]">
            From your first search to your final booking, StayBy keeps
            the experience straightforward.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-14 grid gap-8 md:grid-cols-3">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative text-center"
              >
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+48px)] right-[calc(-50%+48px)] top-6 hidden border-t border-dashed border-[var(--color-border)] md:block" />
                )}

                {/* Icon */}
                <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-coral)] text-white shadow-sm">
                  <Icon size={21} strokeWidth={1.8} />
                </div>

                {/* Number */}
                <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-[var(--color-coral)]">
                  {step.number}
                </p>

                {/* Title */}
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-navy)]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
                  {step.description}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;