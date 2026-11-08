import { useEffect, useState } from "react";

/*
 * Photo background with a cream wash, used behind the login / sign-up form.
 * Uses the same pictures as the landing page (frontend/public/hero/).
 * Missing pictures are skipped; with none, nothing is drawn.
 */
const IMAGES = [
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
  "/hero/hero-1.jpg",
];

const SLIDE_MS = 7500;

function PhotoBackdrop() {
  const [available, setAvailable] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const found: string[] = [];
    let pending = IMAGES.length;

    const done = () => {
      if (--pending === 0 && !cancelled) {
        setAvailable(IMAGES.filter((s) => found.includes(s)));
      }
    };

    IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        found.push(src);
        done();
      };
      img.onerror = done;
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

      {/* Strong cream glow behind the form column, photo shows at the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_75%_at_50%_50%,rgba(250,249,246,0.94)_0%,rgba(250,249,246,0.78)_55%,rgba(250,249,246,0.4)_100%)]" />
    </div>
  );
}

export default PhotoBackdrop;