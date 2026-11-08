import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

/*
 * Every footer link goes somewhere real.
 * "/#explore" style links scroll to that section of the landing page
 * (Home.tsx handles the scrolling after navigation).
 */
const footerLinks: Record<string, { label: string; to: string }[]> = {
  Explore: [
    { label: "Destinations", to: "/#explore" },
    { label: "Featured stays", to: "/#featured" },
    { label: "Search all stays", to: "/search" },
  ],
  Company: [
    { label: "About StayBy", to: "/about" },
    { label: "Contact", to: "/contact" },
  ],
  Support: [
    { label: "Help center", to: "/help" },
    { label: "FAQs", to: "/faqs" },
  ],
};

function Footer() {
  return (
    <footer className="bg-[var(--color-navy-dark)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo to="/" tone="light" />

            <p className="mt-3 text-sm font-medium text-white/80">
              Find it. Stay by it.
            </p>

            <p className="mt-2 max-w-xs text-sm leading-6 text-white/50">
              The right place, closer to you.
            </p>

          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>

              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-sm text-white/50 transition hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StayBy. All rights reserved.</p>

          <div className="flex gap-6">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;