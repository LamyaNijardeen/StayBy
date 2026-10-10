import {
  ArrowRight,
  Heart,
  MapPin,
  Users,
  Target,
} from "lucide-react";

function SocialImpact() {
  return (
    <section
      id="impact"
      className="bg-[var(--color-navy)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Content */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              The idea behind StayBy
            </p>

            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find a place that fits your reason to stay.
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
          </div>

          {/* Visual */}
          <div className="relative">

            {/* Main card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">

              <div className="grid grid-cols-2 gap-4">

                {/* Location */}
                <div className="rounded-2xl bg-white p-6">
                  <MapPin
                    size={24}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Right location
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Find accommodation closer to the places that matter.
                  </p>
                </div>

                {/* Purpose */}
                <div className="rounded-2xl bg-white p-6">
                  <Target
                    size={24}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Right purpose
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Discover stays suited to the reason behind your journey.
                  </p>
                </div>

                {/* People */}
                <div className="rounded-2xl bg-white p-6">
                  <Users
                    size={24}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    For different needs
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    From individual trips to family gatherings and events.
                  </p>
                </div>

                {/* Purpose-built */}
                <div className="rounded-2xl bg-white p-6">
                  <Heart
                    size={24}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Built with purpose
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Making suitable accommodation easier to discover.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default SocialImpact;