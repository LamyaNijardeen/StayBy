/*
 * Decorative background for landing-page sections: soft colour glows and a
 * faint dotted pattern. Pure CSS, no images. Place it as the first child of
 * a section that has "relative overflow-hidden", and give the content
 * "relative" so it sits above.
 */
type Tone = "warm" | "cool" | "sunny" | "dark";

const GLOWS: Record<Tone, [string, string, string]> = {
  // [top-left glow, bottom-right glow, extra glow]
  warm: ["rgba(231,111,81,0.22)", "rgba(244,162,97,0.22)", "rgba(42,157,143,0.10)"],
  cool: ["rgba(42,157,143,0.20)", "rgba(231,111,81,0.14)", "rgba(244,162,97,0.14)"],
  sunny: ["rgba(244,162,97,0.26)", "rgba(231,111,81,0.16)", "rgba(42,157,143,0.12)"],
  dark: ["rgba(231,111,81,0.40)", "rgba(42,157,143,0.30)", "rgba(244,162,97,0.22)"],
};

function SectionDecor({ tone = "warm" }: { tone?: Tone }) {
  const [a, b, c] = GLOWS[tone];
  const dots =
    tone === "dark"
      ? "rgba(255,255,255,0.10)"
      : "rgba(23,43,77,0.10)";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="animate-drift absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full"
        style={{ background: `radial-gradient(circle, ${a}, transparent 70%)` }}
      />
      <div
        className="animate-drift absolute -bottom-48 -right-40 h-[32rem] w-[32rem] rounded-full"
        style={{
          background: `radial-gradient(circle, ${b}, transparent 70%)`,
          animationDelay: "-7s",
        }}
      />
      <div
        className="animate-drift absolute left-1/2 top-1/3 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${c}, transparent 70%)`,
          animationDelay: "-12s",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${dots} 1.5px, transparent 1.5px)`,
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 35%, transparent 65%, black)",
          maskImage:
            "linear-gradient(to bottom, black, transparent 35%, transparent 65%, black)",
        }}
      />
    </div>
  );
}

export default SectionDecor;