import { Link } from "react-router-dom";

interface LogoProps {
  /** Where the logo links to. */
  to?: string;
  onClick?: () => void;
  /** "dark" text for light backgrounds, "light" text for navy backgrounds. */
  tone?: "dark" | "light";
  className?: string;
}

/**
 * The one StayBy logo, used by every navbar, the footer and the
 * login / sign-up screens so the brand looks the same everywhere.
 *
 * Mark: a map pin (Find it) with a roof inside it (Stay by it),
 * on a coral tile.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="stayby-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F28B6D" />
          <stop offset="1" stopColor="#E76F51" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="11" fill="url(#stayby-logo-bg)" />

      {/* soft highlight */}
      <path
        d="M0 14C0 6 6 0 14 0h12c8 0 14 6 14 14v-1C28 12 12 14 0 22z"
        fill="#fff"
        opacity="0.12"
      />

      <g transform="translate(20 20) scale(1.18) translate(-20 -20.5)">
      {/* pin */}
      <path
        d="M20 7.5c-5.2 0-9 3.9-9 8.8 0 6.2 7.2 12.6 8.2 13.5.5.4 1.1.4 1.6 0 1-.9 8.2-7.3 8.2-13.5 0-4.9-3.8-8.8-9-8.8z"
        fill="#fff"
      />

      {/* roof + door inside the pin */}
      <path
        d="M14.8 17.2 20 12.8l5.2 4.4"
        fill="none"
        stroke="#E76F51"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.8 16.6v5.1h6.4v-5.1"
        fill="none"
        stroke="#E76F51"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      </g>
    </svg>
  );
}

function Logo({
  to = "/",
  onClick,
  tone = "dark",
  className = "",
}: LogoProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label="StayBy home"
      className={`group flex shrink-0 items-center gap-2.5 ${className}`}
    >
      <LogoMark />

      <span
        className={`text-2xl font-bold tracking-tight ${
          tone === "light" ? "text-white" : "text-[var(--color-navy)]"
        }`}
      >
        Stay
        <span className="text-[var(--color-coral)]">By</span>
      </span>
    </Link>
  );
}

export default Logo;