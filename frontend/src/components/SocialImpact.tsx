import {
  ArrowRight,
  Heart,
  MapPin,
  Users,
  Target,
} from "lucide-react";
import Reveal from "./Reveal";
import SectionDecor from "./SectionDecor";

function SocialImpact() {
  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-gradient-to-br from-[#0F1F38] via-[#172B4D] to-[#1D3A5F]"
    >
      <SectionDecor tone="dark" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Content */}
          <Reveal>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              The idea behind StayBy
            </p>

            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find a place that fits{" "}
              <span className="bg-gradient-to-r from-[#F4A261] to-[#E76F51] bg-clip-text text-transparent">
                your reason to stay.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              A stay can be needed for many reasons — education, work,
              healthcare, travel, family, or special events. StayBy helps
              people discover accommodation based not only on where they are
              going, but also on why they are going.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/search";
              }}
              className="mt-8 flex items-center gap-2 rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[var(--color-navy)]"
            >
              Explore StayBy
              <ArrowRight size={17} />
            </button>
          </Reveal>

          {/* Visual */}
          <Reveal className="relative" delay={150}>

            {/* Main card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">

              <div className="grid grid-cols-2 gap-4">

                {/* Location */}
                <div
                  className="animate-float rounded-2xl bg-white p-6"
                  style={{ animationDelay: "-0.0s" }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#FCE9E4" }}
                  >
                    <MapPin
                      size={22}
                      strokeWidth={1.9}
                      style={{ color: "#E76F51" }}
                    />
                  </span>

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Right location
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Find accommodation closer to the places that matter.
                  </p>
                </div>

                {/* Purpose */}
                <div
                  className="animate-float rounded-2xl bg-white p-6"
                  style={{ animationDelay: "-1.5s" }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#FEF1E3" }}
                  >
                    <Target
                      size={22}
                      strokeWidth={1.9}
                      style={{ color: "#E08A3C" }}
                    />
                  </span>

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Right purpose
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Discover stays suited to the reason behind your journey.
                  </p>
                </div>

                {/* People */}
                <div
                  className="animate-float rounded-2xl bg-white p-6"
                  style={{ animationDelay: "-3.0s" }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#E1F3F0" }}
                  >
                    <Users
                      size={22}
                      strokeWidth={1.9}
                      style={{ color: "#2A9D8F" }}
                    />
                  </span>

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    For different needs
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    From individual trips to family gatherings and events.
                  </p>
                </div>

                {/* Purpose-built */}
                <div
                  className="animate-float rounded-2xl bg-white p-6"
                  style={{ animationDelay: "-4.5s" }}
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#FCE4EC" }}
                  >
                    <Heart
                      size={22}
                      strokeWidth={1.9}
                      style={{ color: "#D6457A" }}
                    />
                  </span>

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Built with purpose
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Making suitable accommodation easier to discover.
                  </p>
                </div>

              </div>

            </div>

          </Reveal>

        </div>
      </div>
    </section>
  );
}

export default SocialImpact;