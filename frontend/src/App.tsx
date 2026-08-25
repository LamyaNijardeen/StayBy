import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PopularDestinations from "./components/PopularDestinations";
import FeaturedStays from "./components/FeaturedStays";
import WhyStayBy from "./components/WhyStayBy";
import HowItWorks from "./components/HowItWorks";
import SocialImpact from "./components/SocialImpact";
import Footer from "./components/Footer";

function App() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <PopularDestinations />
      <FeaturedStays />
      <WhyStayBy />
      <HowItWorks />
      <SocialImpact />
      <Footer />
    </main>
  );
}

export default App;