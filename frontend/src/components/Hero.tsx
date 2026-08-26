import {
  CalendarDays,
  Compass,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">

        {/* Hero content */}
        <div className="mx-auto max-w-4xl text-center">

          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-coral)]">
            Stay somewhere that feels right
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-[var(--color-navy)] sm:text-6xl lg:text-7xl">
            Find it.
            <br />
            Stay by it.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">
            The right place, closer to you.
            Find comfortable and affordable stays
            wherever you need to be.
          </p>

        </div>

{/* Search box */}
<div className="mx-auto mt-12 max-w-5xl">
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg shadow-black/5">

    <div className="grid grid-cols-1 gap-2 md:grid-cols-4">

      {/* Destination */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[var(--color-background)]">
        <MapPin
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-[var(--color-coral)]"
        />

        <div className="min-w-0 text-left">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Where
          </p>

          <input
            type="text"
            placeholder="City or destination"
            className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Dates */}
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[var(--color-background)]"
      >
        <CalendarDays
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-[var(--color-coral)]"
        />

        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            When
          </p>

          <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
            Add dates
          </p>
        </div>
      </button>

      {/* Purpose */}
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[var(--color-background)]"
      >
<Compass
  size={20}
  strokeWidth={1.8}
  className="shrink-0 text-[var(--color-coral)]"
/>

        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Purpose
          </p>

          <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
            Any purpose
          </p>
        </div>
      </button>

      {/* Guests */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[var(--color-background)]">
        <Users
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-[var(--color-coral)]"
        />

        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Guests
          </p>

          <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
            1 guest
          </p>
        </div>

<Link
  to="/search"
  className="rounded-full bg-[var(--color-coral)] p-3 text-white transition hover:bg-[var(--color-navy-dark)]"
  aria-label="Search stays"
>
  <Search size={18} strokeWidth={2} />
</Link>
      </div>

    </div>
  </div>
</div>

      </div>
    </section>
  );
}

export default Hero;