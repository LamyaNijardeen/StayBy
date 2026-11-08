import {
  CalendarCheck,
  Search,
  Sparkles,
} from "lucide-react";
import Reveal from "./Reveal";
import SectionDecor from "./SectionDecor";

const steps = [
  {
    number: "01",
    grad: "from-[#E76F51] to-[#F4A261]",
    glow: "bg-[#E76F51]",
    text: "from-[#E76F51] to-[#F4A261]",
    icon: Search,
    title: "Search",
    description:
      "Tell us where you're going, when you're staying, and what you're looking for.",
  },
  {
    number: "02",
    grad: "from-[#F4A261] to-[#E9C46A]",
    glow: "bg-[#F4A261]",
    text: "from-[#E08A3C] to-[#E9C46A]",
    icon: Sparkles,
    title: "Choose",
    description:
      "Explore stays that match your plans and compare the options that feel right.",
  },
  {
    number: "03",
    grad: "from-[#2A9D8F] to-[#6CC6BA]",
    glow: "bg-[#2A9D8F]",
    text: "from-[#2A9D8F] to-[#4DB6A9]",
    icon: CalendarCheck,
    title: "Stay",
    description:
      "Book your stay with the details you need and get ready for your trip.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#FFF1E8] to-[#FAF9F6]"
    >
      <SectionDecor tone="sunny" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
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
        </Reveal>

        {/* Steps */}
        <Reveal
          stagger
          className="relative mt-14 grid gap-8 md:grid-cols-3"
        >

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-3xl border border-white/70 bg-white/70 px-6 py-8 text-center shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="dash-flow absolute left-[calc(100%-8px)] w-[calc(2rem+16px)] top-14 hidden md:block" />
                )}

                {/* Icon */}
                <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={`pulse-ring absolute inset-0 rounded-full ${step.glow}`}
                    style={{ animationDelay: `${index * 0.8}s` }}
                  />

                  <span className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${step.grad} text-white shadow-md`}>
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                </div>

                {/* Number */}
                <p className={`mt-5 bg-gradient-to-r ${step.text} bg-clip-text text-2xl font-extrabold tracking-[0.12em] text-transparent`}>
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

        </Reveal>
      </div>
    </section>
  );
}

export default HowItWorks;