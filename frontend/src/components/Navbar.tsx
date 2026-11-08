import Logo from "./Logo";
import {
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="flex h-20 items-center justify-between">

          {/* =====================================================
              LOGO
          ===================================================== */}

          <Logo to="/" onClick={closeMenu} />

          {/* =====================================================
              DESKTOP NAVIGATION
          ===================================================== */}

          <div className="hidden items-center gap-0.5 whitespace-nowrap lg:flex xl:gap-1">

            <a
              href="#explore"
              className="group relative rounded-lg px-3 py-2.5 text-sm font-semibold xl:px-4 text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
            >
              Explore

              <span className="absolute bottom-1 left-3 right-3 xl:left-4 xl:right-4 h-0.5 origin-center scale-x-0 rounded-full bg-[var(--color-navy)] transition-transform duration-200 group-hover:scale-x-100" />
            </a>

            <a
              href="#featured"
              className="group relative rounded-lg px-3 py-2.5 text-sm font-semibold xl:px-4 text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
            >
              Featured

              <span className="absolute bottom-1 left-3 right-3 xl:left-4 xl:right-4 h-0.5 origin-center scale-x-0 rounded-full bg-[var(--color-navy)] transition-transform duration-200 group-hover:scale-x-100" />
            </a>

            <a
              href="#why-stayby"
              className="group relative rounded-lg px-3 py-2.5 text-sm font-semibold xl:px-4 text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
            >
              Why StayBy?

              <span className="absolute bottom-1 left-3 right-3 xl:left-4 xl:right-4 h-0.5 origin-center scale-x-0 rounded-full bg-[var(--color-navy)] transition-transform duration-200 group-hover:scale-x-100" />
            </a>

            <a
              href="#how-it-works"
              className="group relative rounded-lg px-3 py-2.5 text-sm font-semibold xl:px-4 text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
            >
              How It Works

              <span className="absolute bottom-1 left-3 right-3 xl:left-4 xl:right-4 h-0.5 origin-center scale-x-0 rounded-full bg-[var(--color-navy)] transition-transform duration-200 group-hover:scale-x-100" />
            </a>

            <a
              href="#impact"
              className="group relative rounded-lg px-3 py-2.5 text-sm font-semibold xl:px-4 text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
            >
              Our Purpose

              <span className="absolute bottom-1 left-3 right-3 xl:left-4 xl:right-4 h-0.5 origin-center scale-x-0 rounded-full bg-[var(--color-navy)] transition-transform duration-200 group-hover:scale-x-100" />
            </a>

          </div>

          {/* =====================================================
              DESKTOP ACTIONS
          ===================================================== */}

          <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex xl:gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl border-2 border-[var(--color-coral)] px-4 py-2.5 text-sm font-semibold text-[var(--color-coral)] transition-all duration-200 hover:bg-[var(--color-navy)] hover:border-[var(--color-navy)] hover:text-white"
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-navy)]"
            >
              Sign up
            </Link>

          </div>

          {/* =====================================================
              MOBILE BUTTON
          ===================================================== */}

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-lg p-2 text-[var(--color-navy)] transition-all duration-200 hover:bg-[var(--color-background)] lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {isMenuOpen && (
          <div className="border-t border-[var(--color-border)] py-4 lg:hidden">

            <div className="flex flex-col gap-1">

              <a
                href="#explore"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Explore
              </a>

              <a
                href="#featured"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Featured
              </a>

              <a
                href="#why-stayby"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Why StayBy?
              </a>

              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                How It Works
              </a>

              <a
                href="#impact"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-all duration-200 hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Our Purpose
              </a>

              <div className="my-2 border-t border-[var(--color-border)]" />

              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--color-coral)] transition-all duration-200 hover:bg-[var(--color-navy)] hover:text-white"
              >
                <LogIn size={17} />
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="mt-1 rounded-lg bg-[var(--color-coral)] px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-navy)]"
              >
                Sign up
              </Link>

            </div>

          </div>
        )}

      </nav>
    </header>
  );
}

export default Navbar;