import {
  CalendarDays,
  Compass,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [purpose, setPurpose] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      return;
    }

    const params = new URLSearchParams();

    if (city.trim()) {
      params.set("city", city.trim());
    }

    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("guests", guests.toString());

    if (purpose) {
      params.set("purpose", purpose);
    }

    navigate(`/search?${params.toString()}`);
  };

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
            Find accommodation based on where you're going,
            when you're staying, and why you're travelling.
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

                <div className="min-w-0 flex-1 text-left">

                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Where
                  </p>

                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City or destination"
                    className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none placeholder:text-gray-400"
                  />

                </div>

              </div>

              {/* Dates */}
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[var(--color-background)]">

                <CalendarDays
                  size={20}
                  strokeWidth={1.8}
                  className="shrink-0 text-[var(--color-coral)]"
                />

                <div className="min-w-0 flex-1 text-left">

                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    When
                  </p>

                  <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center">

                    <input
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={(e) => {
                        setCheckIn(e.target.value);

                        if (
                          checkOut &&
                          checkOut <= e.target.value
                        ) {
                          setCheckOut("");
                        }
                      }}
                      className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
                      aria-label="Check-in date"
                    />

                    <span className="hidden text-[var(--color-text-secondary)] sm:inline">
                      →
                    </span>

                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || today}
                      disabled={!checkIn}
                      onChange={(e) =>
                        setCheckOut(e.target.value)
                      }
                      className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--color-text)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Check-out date"
                    />

                  </div>

                </div>

              </div>

              {/* Purpose */}
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-[var(--color-background)]">

                <Compass
                  size={20}
                  strokeWidth={1.8}
                  className="shrink-0 text-[var(--color-coral)]"
                />

                <div className="min-w-0 flex-1 text-left">

                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Purpose
                  </p>

                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1 w-full cursor-pointer bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
                  >
                    <option value="">
                      Any purpose
                    </option>

                    <option value="Medical Visit">
                      Medical visit
                    </option>

                    <option value="Education">
                      Education
                    </option>

                    <option value="Work / Business">
                      Work / Business
                    </option>

                    <option value="Tour / Vacation">
                      Tour / Vacation
                    </option>

                    <option value="Picnic / Day Trip">
                      Picnic / Day Trip
                    </option>

                    <option value="Family Gathering">
                      Family gathering
                    </option>

                    <option value="Wedding / Event">
                      Wedding / Event
                    </option>

                    <option value="Visiting Family / Friends">
                      Visiting family / friends
                    </option>

                    <option value="Religious / Cultural Visit">
                      Religious / Cultural visit
                    </option>

                    <option value="Sports / Competition">
                      Sports / competition
                    </option>

                    <option value="Festival / Celebration">
                      Festival / celebration
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

              </div>

              {/* Guests + Search */}
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

                  <select
                    value={guests}
                    onChange={(e) =>
                      setGuests(Number(e.target.value))
                    }
                    className="mt-1 w-full cursor-pointer bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
                  >
                    {Array.from(
                      { length: 10 },
                      (_, index) => index + 1
                    ).map((number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        {number}{" "}
                        {number === 1
                          ? "guest"
                          : "guests"}
                      </option>
                    ))}
                  </select>

                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="shrink-0 rounded-full bg-[var(--color-coral)] p-3 text-white transition hover:bg-[var(--color-navy-dark)]"
                  aria-label="Search stays"
                >
                  <Search
                    size={18}
                    strokeWidth={2}
                  />
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;