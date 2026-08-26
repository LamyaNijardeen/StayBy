import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Users,
} from "lucide-react";

function Booking() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <MapPin
              size={21}
              className="text-[var(--color-coral)]"
            />

            <span className="text-xl font-bold tracking-tight text-[var(--color-navy)]">
              StayBy
            </span>
          </div>

          <div className="w-14" />

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

        {/* Heading */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Almost there
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Confirm your stay
          </h1>

          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Review your booking details before continuing.
          </p>
        </div>

        {/* Content */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Left */}
          <div className="space-y-6">

            {/* Stay summary */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">

              <div className="flex gap-5">

                <img
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=500&q=80"
                  alt="Harbor View Residence"
                  className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-40"
                />

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Apartment
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[var(--color-navy)]">
                    Harbor View Residence
                  </h2>

                  <p className="mt-2 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                    <MapPin size={14} />
                    Colombo, Sri Lanka
                  </p>

                  <p className="mt-2 text-sm font-medium text-[var(--color-coral)]">
                    ★ 4.8 · 124 reviews
                  </p>
                </div>

              </div>

            </section>

            {/* Your trip */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Your trip
              </h2>

              <div className="mt-6 divide-y divide-[var(--color-border)]">

                {/* Dates */}
                <div className="flex items-center justify-between py-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-[var(--color-coral-light)] p-2.5">
                      <CalendarDays
                        size={19}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        DATES
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                        Add your dates
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--color-coral)]"
                  >
                    Edit
                  </button>

                </div>

                {/* Guests */}
                <div className="flex items-center justify-between py-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-[var(--color-coral-light)] p-2.5">
                      <Users
                        size={19}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        GUESTS
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                        1 guest
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--color-coral)]"
                  >
                    Edit
                  </button>

                </div>

              </div>

            </section>

            {/* Guest details */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Guest details
              </h2>

              <div className="mt-5 space-y-5">

                <div>
                  <label
                    htmlFor="booking-name"
                    className="text-sm font-semibold text-[var(--color-text)]"
                  >
                    Full name
                  </label>

                  <input
                    id="booking-name"
                    type="text"
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="text-sm font-semibold text-[var(--color-text)]"
                  >
                    Email address
                  </label>

                  <input
                    id="booking-email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                  />
                </div>

              </div>

            </section>

          </div>

          {/* Right - Price summary */}
          <aside>

            <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5">

              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Price details
              </h2>

              <div className="mt-6 space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    $45 × 1 night
                  </span>

                  <span>$45</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">
                    Service fee
                  </span>

                  <span>$5</span>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">

                  <div className="flex justify-between font-semibold text-[var(--color-navy)]">
                    <span>Total</span>
                    <span>$50</span>
                  </div>

                </div>

              </div>

              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
              >
                <CheckCircle2 size={18} />
                Confirm booking
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[var(--color-text-secondary)]">
                You won't be charged yet. This is a preview of the booking
                experience.
              </p>

            </div>

          </aside>

        </div>

      </main>
    </div>
  );
}

export default Booking;