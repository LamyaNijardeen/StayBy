import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Mail } from "lucide-react";
import RoleNavbar from "../components/RoleNavbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";

/*
 * Where the contact form sends messages. Set VITE_SUPPORT_EMAIL in your
 * (git-ignored) frontend .env file. The address is never shown on the
 * page; it is only used to open the visitor's email app. If it is not set,
 * the form is hidden and visitors are pointed to Complaints instead.
 */
const SUPPORT_EMAIL: string = import.meta.env.VITE_SUPPORT_EMAIL || "";

interface Section {
  heading: string;
  body: string;
}

interface Faq {
  q: string;
  a: string;
}

const ABOUT: Section[] = [
  {
    heading: "Why StayBy exists",
    body: "Most booking sites ask where you want to sleep. StayBy asks why you are travelling. A person visiting a hospital, sitting an exam, attending a wedding or going on a pilgrimage needs a stay that is close to that place, not just any room in the same city.",
  },
  {
    heading: "How it works",
    body: "Search by destination, dates, purpose, or by a landmark such as a hospital, a university or a famous beach. StayBy shows the stays that match everything you asked for first, and every other available stay after them.",
  },
  {
    heading: "For owners",
    body: "Owners list their property and rooms, say which purposes it suits, and StayBy automatically finds the important places around it so the right guests can find it.",
  },
];

const HELP: Section[] = [
  {
    heading: "Finding a stay",
    body: "Use the search box on the home page. Everything is optional: leave it empty to browse all stays, or fill in a destination, dates, purpose and a landmark to see the best matches first.",
  },
  {
    heading: "Booking and paying",
    body: "Open a stay, choose your dates and a room, then confirm. Once the owner accepts your request you can pay securely by card or by bank transfer, and you will receive a payment slip by email.",
  },
  {
    heading: "Cancelling and refunds",
    body: "You can cancel a booking from My Bookings. Whether you are refunded depends on how close the check-in date is. Refund status and the refund slip are shown on the booking page.",
  },
  {
    heading: "Forgot your password?",
    body: "Choose “Forgot password?” on the login page. We email a 6-digit code that is valid for 10 minutes.",
  },
  {
    heading: "Something went wrong",
    body: "If you have a problem with a stay or a booking, log in and send a complaint from the Complaints page. Our team reviews every one.",
  },
];

const FAQS: Faq[] = [
  {
    q: "Do I need an account to search?",
    a: "No. Anyone can browse and search. You need an account to book, save favourites or message an owner.",
  },
  {
    q: "What does “Staying near” do?",
    a: "Type the name of a place, such as a hospital, university or beach. StayBy lists the stays closest to it first.",
  },
  {
    q: "Why do I see stays that don't match my search?",
    a: "We show the best matches first, then every other stay you can still book, so you never see an empty page.",
  },
  {
    q: "Are the distances exact?",
    a: "They are straight-line distances from the stay to the landmark, so the real travel distance by road can be longer.",
  },
  {
    q: "How do I pay?",
    a: "By card through our secure payment partner, or by bank transfer once the owner has accepted your booking.",
  },
  {
    q: "How do I list my property?",
    a: "Register as an owner, add your property and rooms, and wait for an admin to verify it. Verified stays appear in search.",
  },
];

const PRIVACY: Section[] = [
  {
    heading: "What we collect",
    body: "Your name, email, phone number, booking details and payment status. We never see or store your full card number; card payments are handled by our payment partner.",
  },
  {
    heading: "How we use it",
    body: "To run your bookings, send confirmations and payment slips, let owners contact you about a stay, and keep the platform safe.",
  },
  {
    heading: "Who sees it",
    body: "The owner of a stay you book can see your name, contact details and booking. We do not sell your data.",
  },
  {
    heading: "Your choices",
    body: "You can update your profile at any time. To delete your account, contact us.",
  },
];

const TERMS: Section[] = [
  {
    heading: "Using StayBy",
    body: "StayBy connects travellers with property owners. You must give accurate information and keep your password private.",
  },
  {
    heading: "Bookings",
    body: "A booking is confirmed only after the owner accepts it and payment is completed. The stay itself is provided by the owner.",
  },
  {
    heading: "Cancellations and refunds",
    body: "Refunds follow the cancellation rules shown at the time of booking.",
  },
  {
    heading: "Owners",
    body: "Owners must describe their property honestly and honour confirmed bookings. Listings can be removed if they break these rules.",
  },
  {
    heading: "Landmark distances",
    body: "Nearby places and distances come from open map data and are only a guide.",
  },
];

function Sections({ items }: { items: Section[] }) {
  return (
    <div className="space-y-8">
      {items.map((s) => (
        <div key={s.heading}>
          <h2 className="text-lg font-semibold text-[var(--color-navy)]">
            {s.heading}
          </h2>
          <p className="mt-2 leading-7 text-[var(--color-text-secondary)]">
            {s.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {FAQS.map((f, i) => (
        <div key={f.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-[var(--color-navy)]"
          >
            {f.q}
            <ChevronDown
              size={18}
              className={`shrink-0 text-[var(--color-coral)] transition ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {open === i && (
            <p className="px-5 pb-4 leading-7 text-[var(--color-text-secondary)]">
              {f.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ContactBlock() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const send = () => {
    const subject = encodeURIComponent("StayBy enquiry");
    const body = encodeURIComponent(`${message}\n\n— ${name}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <p className="leading-7 text-[var(--color-text-secondary)]">
        Questions, feedback or a problem with a booking? Write to us and we
        will get back to you.
      </p>

      {!SUPPORT_EMAIL && (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm leading-6 text-[var(--color-text-secondary)]">
          <Mail size={18} className="mt-0.5 shrink-0 text-[var(--color-coral)]" />
          <p>
            Have a problem with a stay or a booking? Log in and send it from{" "}
            <Link to="/complaints" className="font-medium text-[var(--color-coral)] underline">
              Complaints
            </Link>
            , and our team will review it.
          </p>
        </div>
      )}

      {SUPPORT_EMAIL && (
      <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--color-coral)]"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="How can we help?"
          className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--color-coral)]"
        />
        <button
          type="button"
          onClick={send}
          disabled={!message.trim()}
          className="rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Send message
        </button>
        <p className="text-xs text-[var(--color-text-secondary)]">
          This opens your email app with the message ready to send. Already
          have a booking problem? Use{" "}
          <Link to="/complaints" className="text-[var(--color-coral)] underline">
            Complaints
          </Link>
          .
        </p>
      </div>
      )}
    </div>
  );
}

const PAGES: Record<
  string,
  { title: string; intro: string; render: () => React.ReactNode }
> = {
  "/about": {
    title: "About StayBy",
    intro: "Find it. Stay by it.",
    render: () => <Sections items={ABOUT} />,
  },
  "/contact": {
    title: "Contact us",
    intro: "We'd love to hear from you.",
    render: () => <ContactBlock />,
  },
  "/help": {
    title: "Help center",
    intro: "Quick answers for travellers and owners.",
    render: () => <Sections items={HELP} />,
  },
  "/faqs": {
    title: "Frequently asked questions",
    intro: "The things people ask us most.",
    render: () => <FaqList />,
  },
  "/privacy": {
    title: "Privacy policy",
    intro: "How StayBy treats your information.",
    render: () => <Sections items={PRIVACY} />,
  },
  "/terms": {
    title: "Terms of use",
    intro: "The simple rules for using StayBy.",
    render: () => <Sections items={TERMS} />,
  },
};

function InfoPage() {
  const { pathname } = useLocation();
  const page = PAGES[pathname] ?? PAGES["/about"];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <RoleNavbar />

      <main>
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-coral)]">
              {page.intro}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-5xl">
              {page.title}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <Reveal>{page.render()}</Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default InfoPage;