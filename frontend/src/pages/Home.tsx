import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PopularDestinations from "../components/PopularDestinations";
import FeaturedStays from "../components/FeaturedStays";
import WhyStayBy from "../components/WhyStayBy";
import HowItWorks from "../components/HowItWorks";
import SocialImpact from "../components/SocialImpact";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <main>
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