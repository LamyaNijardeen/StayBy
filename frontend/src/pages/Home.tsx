import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PopularDestinations from "../components/PopularDestinations";
import FeaturedStays from "../components/FeaturedStays";
import WhyStayBy from "../components/WhyStayBy";
import HowItWorks from "../components/HowItWorks";
import SocialImpact from "../components/SocialImpact";
import Footer from "../components/Footer";

function Home() {
  const { hash } = useLocation();

  /*
   * Footer links such as "/#featured" arrive here from other pages.
   * Scroll to the section once the page has rendered.
   */
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }

    const timer = window.setTimeout(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <main className="no-page-enter">
        <Hero />
        <PopularDestinations />
        <FeaturedStays />
        <WhyStayBy />
        <HowItWorks />
        <SocialImpact />
      </main>
      <Footer />
    </div>
  );
}

export default Home;