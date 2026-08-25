import {
  ArrowUpRight,
  Globe,
  MessageCircle,
  Share2,
} from "lucide-react";

const footerLinks = {
  Explore: ["Destinations", "Featured stays"],
  Company: ["About StayBy", "Contact"],
  Support: ["Help center", "FAQs"],
};

function Footer() {
  return (
    <footer className="bg-[var(--color-navy-dark)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {/* Main footer */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              StayBy
            </h2>

            <p className="mt-3 text-sm font-medium text-white/80">
              Find it. Stay by it.
            </p>

            <p className="mt-2 max-w-xs text-sm leading-6 text-white/50">
              The right place, closer to you.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
              >
                <Globe size={17} />
              </button>

              <button
                type="button"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
              >
                <MessageCircle size={17} />
              </button>

              <button
                type="button"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
              >
                <Share2 size={17} />
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">
                {category}
              </h3>

              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="group flex items-center gap-1 text-sm text-white/50 transition hover:text-white"
                    >
                      {link}

                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 StayBy. All rights reserved.
          </p>

          <div className="flex gap-6">
            <button
              type="button"
              className="transition hover:text-white"
            >
              Privacy
            </button>

            <button
              type="button"
              className="transition hover:text-white"
            >
              Terms
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;