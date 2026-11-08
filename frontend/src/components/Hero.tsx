import {
  CalendarDays,
  Compass,
  Landmark,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandmarkSearchInput from "./LandmarkSearchInput";

const NEAR_IDEAS = [
  "hospitals",
  "universities",
  "beaches",
  "temples",
  "city centres",
  "railway stations",
  "tourist spots",
];

const ROTATING_REASONS = [
  "a medical visit",
  "your studies",
  "a business trip",
  "a family gathering",
  "a beach holiday",
  "a wedding",
  "a day trip",
];

/*
 * Background photos for the landing page. Put your own pictures in
 * frontend/public/hero/ with these names (1920px wide, under ~400 KB each).
 * Pictures that are missing are skipped; with none, the page looks plain.
 */
const HERO_IMAGES = [
  "/hero/hero-1.jpg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
];

const SLIDE_MS = 6500;

function HeroBackground() {
  const [available, setAvailable] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  // Keep only the pictures that actually exist and load.
  useEffect(() => {
    let cancelled = false;
    const found: string[] = [];
    let pending = HERO_IMAGES.length;

    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        found.push(src);
        if (--pending === 0 && !cancelled) {
          setAvailable(HERO_IMAGES.filter((s) => found.includes(s)));
        }
      };
      img.onerror = () => {
        if (--pending === 0 && !cancelled) {
          setAvailable(HERO_IMAGES.filter((s) => found.includes(s)));
        }
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (available.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % available.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [available.length]);

  if (available.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {available.map((src, index) => {
        const isActive = index === active;
        return (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? "scale(1.08)" : "scale(1)",
              transition: isActive
                ? "opacity 1600ms ease, transform 9000ms linear"
                : "opacity 1600ms ease, transform 1600ms ease",
            }}
          />
        );
      })}

      {/* Soft cream wash keeps the text readable and fades into the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_38%,rgba(250,249,246,0.92)_0%,rgba(250,249,246,0.7)_50%,rgba(250,249,246,0.25)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF9F6]" />
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [landmark, setLandmark] = useState("");

  const [reasonIndex, setReasonIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setReasonIndex(
        (current) => (current + 1) % ROTATING_REASONS.length
      );
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

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

    if (landmark.trim()) {
      params.set("landmark", landmark.trim());
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden">

      <HeroBackground />

      {/* Soft moving colour glows (decorative) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="blob-coral animate-drift absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full" />
        <div
          className="blob-navy animate-drift absolute -right-40 top-10 h-[32rem] w-[32rem] rounded-full"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28">

        {/* Hero content */}
        <div className="mx-auto max-w-4xl text-center">

          <p
            className="animate-fade-up mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-coral)] [text-shadow:0_0_14px_rgba(250,249,246,0.95)] sm:mb-5 sm:text-sm sm:tracking-[0.2em]"
          >
            Stay somewhere that feels right
          </p>

          <h1
            className="animate-fade-up text-[2.75rem] font-bold leading-[1.1] tracking-tight text-[var(--color-navy)] [text-shadow:0_0_24px_rgba(250,249,246,0.9)] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            <span className="relative inline-block">
              <span aria-hidden="true" className="journey-dot" />
              Find it.
              <br />
              <span className="relative inline-block">
              <span className="text-sheen">Stay by it.</span>

              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full"
              >
                <path
                  d="M3 9 Q 75 1 150 7 T 297 6"
                  fill="none"
                  stroke="var(--color-coral)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="draw-line"
                />
              </svg>
              </span>
            </span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-2xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 font-medium text-[var(--color-navy)]/85 [text-shadow:0_0_14px_rgba(250,249,246,0.95)] sm:text-xl"
            style={{ animationDelay: "260ms" }}
          >
            Find accommodation based on where you're going,
            when you're staying, and why you're travelling.
          </p>

          <p
            className="animate-fade-up mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] sm:mt-6 sm:px-5 sm:text-sm font-medium text-[var(--color-navy)]/80 shadow-sm"
            style={{ animationDelay: "380ms" }}
          >
            Staying for
            <span className="inline-block min-w-[8.5rem] text-left sm:min-w-[9.5rem] font-semibold text-[var(--color-coral)]">
              <span
                key={reasonIndex}
                className="animate-word-in"
              >
                {ROTATING_REASONS[reasonIndex]}
              </span>
            </span>
          </p>

        </div>

        {/* Search box */}
        <div
          className="animate-fade-up mx-auto mt-8 max-w-5xl sm:mt-12"
          style={{ animationDelay: "500ms" }}
        >
          <div className="beam-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg shadow-black/5 transition-shadow sm:p-3 duration-300 focus-within:shadow-xl focus-within:shadow-black/10">

            <div className="grid grid-cols-2 gap-1 sm:gap-2 xl:grid-cols-4">

              {/* Destination */}
              <div className="col-span-2 flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--color-background)] sm:px-4 sm:py-3 xl:col-span-1">

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
              <div className="col-span-2 flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--color-background)] sm:px-4 sm:py-3 xl:col-span-1">

                <CalendarDays
                  size={20}
                  strokeWidth={1.8}
                  className="shrink-0 text-[var(--color-coral)]"
                />

                <div className="min-w-0 flex-1 text-left">

                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    When
                  </p>

                  <div className="mt-1 flex items-center gap-2">

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
                      className="w-full min-w-0 bg-transparent text-[13px] font-medium text-[var(--color-text)] outline-none max-sm:[&::-webkit-calendar-picker-indicator]:hidden sm:text-sm"
                      aria-label="Check-in date"
                    />

                    <span className="shrink-0 text-[var(--color-text-secondary)]">
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
                      className="w-full min-w-0 bg-transparent text-[13px] font-medium text-[var(--color-text)] outline-none max-sm:[&::-webkit-calendar-picker-indicator]:hidden sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Check-out date"
                    />

                  </div>

                </div>

              </div>

              {/* Purpose */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition hover:bg-[var(--color-background)] sm:gap-3 sm:px-4 sm:py-3">

                <Compass
                  size={20}
                  strokeWidth={1.8}
                  className="hidden shrink-0 text-[var(--color-coral)] sm:block"
                />

                <div className="min-w-0 flex-1 text-left">

                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Purpose
                  </p>

                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1 w-full cursor-pointer bg-transparent text-[13px] font-medium text-[var(--color-text)] outline-none sm:text-sm"
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
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition hover:bg-[var(--color-background)] sm:gap-3 sm:px-4 sm:py-3">

                <Users
                  size={20}
                  strokeWidth={1.8}
                  className="hidden shrink-0 text-[var(--color-coral)] sm:block"
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
                    className="mt-1 w-full cursor-pointer bg-transparent text-[13px] font-medium text-[var(--color-text)] outline-none sm:text-sm"
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
                  className="hidden shrink-0 rounded-full bg-[var(--color-coral)] p-3 text-white transition hover:bg-[var(--color-navy-dark)] xl:block"
                  aria-label="Search stays"
                >
                  <Search
                    size={18}
                    strokeWidth={2}
                  />
                </button>

              </div>

              {/* Phones: big search button */}
              <button
                type="button"
                onClick={handleSearch}
                className="col-span-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] xl:hidden"
              >
                <Search size={17} strokeWidth={2.2} />
                Search stays
              </button>

            </div>

            {/* Landmark / destination purpose */}
            <div className="mt-1 flex items-center gap-3 rounded-xl border-t border-[var(--color-border)] px-3 py-2.5 transition hover:bg-[var(--color-background)] sm:mt-2 sm:px-4 sm:py-3">

              <Landmark
                size={20}
                strokeWidth={1.8}
                className="shrink-0 text-[var(--color-coral)]"
              />

              <div className="min-w-0 flex-1 text-left">

                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Staying near (optional)
                </p>

                <LandmarkSearchInput
                  value={landmark}
                  onChange={setLandmark}
                  onEnter={handleSearch}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none placeholder:text-gray-400"
                />

              </div>

            </div>

          </div>
        </div>

        {/* Slow line of ideas for what to stay near */}
        <div
          aria-hidden="true"
          className="fade-edges animate-fade-up mx-auto mt-8 max-w-3xl overflow-hidden sm:mt-10"
          style={{ animationDelay: "650ms" }}
        >
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap text-[13px] font-medium text-[var(--color-text-secondary)] sm:gap-10 sm:text-sm">
            {[...NEAR_IDEAS, ...NEAR_IDEAS].map((idea, index) => (
              <span
                key={index}
                className="flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-coral)]" />
                Near {idea}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;