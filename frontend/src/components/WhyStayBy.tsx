import {
  Compass,
  MapPin,
  ShieldCheck,
  Target,
} from "lucide-react";
import Reveal from "./Reveal";
import SectionDecor from "./SectionDecor";

const benefits = [
  {
    icon: Target,
    title: "Search by purpose",
    description:
      "Find accommodation based on why you're travelling, whether it's for education, work, healthcare, travel, or other needs.",
    tile: "bg-[#FCE9E4]",
    iconColor: "text-[#E76F51]",
    bar: "from-[#E76F51] to-[#F4A261]",
    hover: "hover:border-[#E76F51]/60 hover:shadow-[#E76F51]/20",
  },
  {
    icon: MapPin,
    title: "Find the right location",
    description:
      "Discover stays near the places that matter to your journey, with property locations available on the map.",
    tile: "bg-[#E1F3F0]",
    iconColor: "text-[#2A9D8F]",
    bar: "from-[#2A9D8F] to-[#6CC6BA]",
    hover: "hover:border-[#2A9D8F]/60 hover:shadow-[#2A9D8F]/20",
  },
  {
    icon: ShieldCheck,
    title: "Book with confidence",
    description:
      "View clear property and room information, availability, booking details, and updates throughout your stay.",
    tile: "bg-[#FEF1E3]",
    iconColor: "text-[#E08A3C]",
    bar: "from-[#F4A261] to-[#F7C873]",
    hover: "hover:border-[#F4A261]/70 hover:shadow-[#F4A261]/25",
  },
  {
    icon: Compass,
    title: "Keep it simple",
    description:
      "From searching to booking and managing your stay, StayBy keeps the experience straightforward and easy to follow.",
    tile: "bg-[#E4E9F2]",
    iconColor: "text-[#172B4D]",
    bar: "from-[#172B4D] to-[#4A6FA5]",
    hover: "hover:border-[#172B4D]/40 hover:shadow-[#172B4D]/15",
  },
];

function WhyStayBy() {
  return (
    <section
      id="why-stayby"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-[#FFF8F3] to-white"
    >
      <SectionDecor tone="cool" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Why StayBy?
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            More than finding a place to{" "}
            <span className="bg-gradient-to-r from-[#E76F51] to-[#F4A261] bg-clip-text text-transparent">
              stay.
            </span>
          </h2>

          <p className="mt-4 text-[var(--color-text-secondary)]">
            StayBy brings purpose, location, and a simple booking experience
            together to help you find accommodation that fits your journey.
          </p>
        </Reveal>

        {/* Benefits */}
        <Reveal
          stagger
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className={`group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white/90 p-7 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl ${benefit.hover}`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${benefit.bar}`}
                />

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${benefit.tile} transition duration-300 group-hover:-rotate-6 group-hover:scale-110`}
                >
                  <Icon
                    size={23}
                    strokeWidth={1.9}
                    className={benefit.iconColor}
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
        </Reveal>

      </div>
    </section>
  );
}

export default WhyStayBy;