import { ArrowRight } from "lucide-react";
function Navbar() {
  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        
        {/* Logo */}
        <a
          href="#"
          className="text-2xl font-bold tracking-tight text-[var(--color-navy)]"
        >
          StayBy
        </a>

        {/* Navigation */}
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden text-sm font-medium text-[var(--color-navy)] sm:block">
            Sign in
          </button>

<button className="flex items-center gap-2 rounded-full bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-dark)]">
  Get started
  <ArrowRight size={16} strokeWidth={2} />
</button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;