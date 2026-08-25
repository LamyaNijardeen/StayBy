import {
  ArrowRight,
  Heart,
  MapPin,
  Users,
} from "lucide-react";

function SocialImpact() {
  return (
    <section className="bg-[var(--color-navy)]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Content */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              The idea behind StayBy
            </p>

            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Stay closer to where life happens.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Whether it's education, work, travel, or family,
              finding the right place to stay can make everyday
              journeys a little easier.
            </p>

            <button
              type="button"
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

                <div className="rounded-2xl bg-white p-6">
                  <MapPin
                    size={24}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    Closer stays
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Find accommodation near the places that matter.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6">
                  <Users
                    size={24}
                    strokeWidth={1.8}
                    className="text-[var(--color-coral)]"
                  />

                  <p className="mt-5 text-sm font-semibold text-[var(--color-navy)]">
                    For everyone
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Designed around different reasons people need a stay.
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl bg-[var(--color-coral)] p-6">
                  <Heart
                    size={24}
                    strokeWidth={1.8}
                    className="text-white"
                  />

                  <p className="mt-5 text-sm font-semibold text-white">
                    Built with purpose
                  </p>

                  <p className="mt-2 max-w-md text-xs leading-5 text-white/80">
                    StayBy is designed to make finding suitable
                    accommodation feel simpler and more accessible.
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