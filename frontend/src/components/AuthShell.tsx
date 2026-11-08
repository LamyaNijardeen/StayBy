import { ArrowLeft } from "lucide-react";
import Logo from "./Logo";
import PhotoBackdrop from "./PhotoBackdrop";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  /** Where the Back link goes. */
  backTo: string;
  children: ReactNode;
}

/**
 * Animated map: a route that keeps flowing towards a pulsing "stay"
 * pin, with orbiting dots and twinkling stars. Pure SVG + CSS.
 */
function AuthMapScene() {
  const route =
    "M50 255 C 100 240, 130 190, 180 180 S 215 168, 230 165 " +
    "S 330 150, 360 110 S 400 80, 415 70";

  const stars = [
    [40, 40], [120, 30], [200, 55], [290, 28], [380, 150],
    [430, 210], [330, 300], [150, 300], [30, 170], [260, 240],
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 460 330"
      className="mx-auto h-auto max-h-[36vh] w-full max-w-md"
    >
      <defs>
        <pattern
          id="auth-grid"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30 0H0V30"
            fill="none"
            stroke="white"
            strokeOpacity="0.08"
          />
        </pattern>

        <radialGradient id="auth-fade" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        <mask id="auth-mask">
          <rect width="460" height="330" fill="url(#auth-fade)" />
        </mask>

        <radialGradient id="auth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E76F51" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E76F51" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* map grid, fading out at the edges */}
      <rect
        width="460"
        height="330"
        fill="url(#auth-grid)"
        mask="url(#auth-mask)"
      />

      {/* glow behind the stay */}
      <circle cx="230" cy="165" r="120" fill="url(#auth-glow)" />

      {/* stars */}
      {stars.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={index % 3 === 0 ? 2 : 1.4}
          fill="white"
          className="svg-twinkle"
          style={{ animationDelay: `${index * 0.45}s` }}
        />
      ))}

      {/* orbits around the stay */}
      <g
        className="svg-orbit"
        style={{ transformOrigin: "230px 165px" }}
      >
        <circle
          cx="230"
          cy="165"
          r="62"
          fill="none"
          stroke="white"
          strokeOpacity="0.2"
          strokeDasharray="3 7"
        />
        <circle cx="292" cy="165" r="4.5" fill="#E76F51" />
        <circle cx="168" cy="165" r="3" fill="white" fillOpacity="0.8" />
      </g>

      <g
        className="svg-orbit-rev"
        style={{ transformOrigin: "230px 165px" }}
      >
        <circle
          cx="230"
          cy="165"
          r="104"
          fill="none"
          stroke="white"
          strokeOpacity="0.14"
          strokeDasharray="2 9"
        />
        <circle cx="230" cy="61" r="3.5" fill="white" fillOpacity="0.85" />
        <circle cx="334" cy="165" r="3" fill="#E76F51" />
        <circle cx="156" cy="239" r="2.5" fill="white" fillOpacity="0.6" />
      </g>

      {/* the route */}
      <path
        d={route}
        fill="none"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d={route}
        fill="none"
        stroke="#E76F51"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="svg-dash"
      />

      {/* side pins */}
      {[
        [50, 255, 0.4],
        [415, 70, 1.2],
        [352, 262, 2],
        [96, 92, 2.8],
      ].map(([x, y, delay]) => (
        <g key={`${x}-${y}`}>
          <circle
            cx={x}
            cy={y}
            r="7"
            fill="none"
            stroke="#E76F51"
            strokeWidth="1.5"
            className="svg-ring"
            style={{ animationDelay: `${delay}s` }}
          />
          <circle
            cx={x}
            cy={y}
            r="6"
            fill="white"
            className="svg-pin"
            style={{ animationDelay: `${Number(delay) * 0.25}s` }}
          />
          <circle cx={x} cy={y} r="2.6" fill="#E76F51" />
        </g>
      ))}

      {/* the main stay pin */}
      {[0, 1.2, 2.4].map((delay) => (
        <circle
          key={delay}
          cx="230"
          cy="165"
          r="9"
          fill="none"
          stroke="#E76F51"
          strokeWidth="2"
          className="svg-ring"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      <circle cx="230" cy="165" r="13" fill="#E76F51" fillOpacity="0.3" />
      <circle cx="230" cy="165" r="9" fill="#E76F51" />
      <circle cx="230" cy="165" r="3.6" fill="white" />

      {/* the traveller moving along the route */}
      <circle r="11" fill="#E76F51" fillOpacity="0.25">
        <animateMotion dur="8s" repeatCount="indefinite" path={route} />
      </circle>
      <circle r="5" fill="white">
        <animateMotion dur="8s" repeatCount="indefinite" path={route} />
      </circle>
    </svg>
  );
}

/**
 * Shared frame for Login, Register, Verify email and Password reset.
 * Large screens: a navy brand panel on the left, the form on the right.
 * Phones: just the form, with the same soft glows.
 */
function AuthShell({ backTo, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] lg:grid lg:grid-cols-[1.05fr_1fr]">

      {/* =====================================================
          BRAND PANEL (large screens)
      ===================================================== */}
      <aside className="relative hidden overflow-hidden bg-[var(--color-navy)] p-12 lg:flex lg:flex-col lg:justify-between">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="blob-coral animate-drift absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full" />
          <div
            className="blob-coral animate-drift absolute -bottom-52 -right-40 h-[34rem] w-[34rem] rounded-full opacity-70"
            style={{ animationDelay: "-8s" }}
          />
        </div>

        <Logo to="/" tone="light" className="relative" />

        <div className="relative">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-coral)]">
            Stay somewhere that feels right
          </p>

          <h2
            className="animate-fade-up mt-5 text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            Find it.
            <br />
            Stay by it.
          </h2>

          <p
            className="animate-fade-up mt-6 max-w-md text-base leading-7 text-white/70"
            style={{ animationDelay: "240ms" }}
          >
            Find accommodation based on where you're going, when
            you're staying, and why you're travelling.
          </p>

          <div
            className="animate-fade-up mt-8"
            style={{ animationDelay: "360ms" }}
          >
            <AuthMapScene />

            <p className="mt-2 max-w-md text-center text-sm text-white/60">
              Close to the places that matter to your journey.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          &copy; {new Date().getFullYear()} StayBy
        </p>
      </aside>

      {/* =====================================================
          FORM SIDE
      ===================================================== */}
      <div className="relative flex min-h-screen flex-col overflow-hidden">

        <PhotoBackdrop />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="blob-coral animate-drift absolute -right-40 -top-32 h-[26rem] w-[26rem] rounded-full" />
          <div
            className="blob-navy animate-drift absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full"
            style={{ animationDelay: "-7s" }}
          />
        </div>

        <header className="relative flex items-center justify-between px-6 py-5 lg:px-10">

          <Link
            to={backTo}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <div className="lg:hidden">
            <Logo to="/" />
          </div>

          <div className="w-14" />
        </header>

        <main className="relative flex flex-1 items-center justify-center px-6 py-10">
          <div className="animate-fade-up w-full max-w-md">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default AuthShell;