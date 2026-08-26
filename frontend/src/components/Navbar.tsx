import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto max-w-7xl px-6 py-5 lg:px-8">

        {/* Top row */}
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="text-2xl font-bold tracking-tight text-[var(--color-navy)]"
          >
            StayBy
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#explore"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              Explore
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              How it works
            </a>

            <a
              href="#impact"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              Our impact
            </a>

          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 sm:flex">

            <Link
              to="/login"
              className="text-sm font-medium text-[var(--color-navy)]"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 rounded-full bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-dark)]"
            >
              Get started
              <ArrowRight size={16} strokeWidth={2} />
            </Link>

          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-[var(--color-navy)] transition hover:bg-[var(--color-background)] md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={24} strokeWidth={2} />
            ) : (
              <Menu size={24} strokeWidth={2} />
            )}
          </button>

        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-5 border-t border-[var(--color-border)] pt-5 md:hidden">

            <div className="flex flex-col gap-1">

              <a
                href="#explore"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Explore
              </a>

              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                How it works
              </a>

              <a
                href="#impact"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Our impact
              </a>

              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-dark)]"
              >
                Get started
                <ArrowRight size={16} strokeWidth={2} />
              </Link>

            </div>

          </div>
        )}

      </nav>
    </header>
  );
}

export default Navbar;