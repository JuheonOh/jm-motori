import Footer from "./components/layout/Footer";
import TopNav from "./components/layout/TopNav";
import { useBusinessStatus } from "./hooks/useBusinessStatus";
import ContactSection from "./sections/ContactSection";
import HeroSection from "./sections/HeroSection";
import PortfolioSection from "./sections/PortfolioSection";
import ServicesSection from "./sections/ServicesSection";

const baseUrl = import.meta.env.BASE_URL;
const image6 = `${baseUrl}assets/images/hero.webp`;
const containerClass = "site-container";

export default function App() {
  const businessStatus = useBusinessStatus();

  return (
    <>
      <a href="#home" className="skip-link">본문 바로가기</a>
      <TopNav containerClass={containerClass} />

      <main id="home" tabIndex={-1} className="site-main">
        <HeroSection containerClass={containerClass} backgroundImageUrl={image6} />
        <ServicesSection containerClass={containerClass} />
        <PortfolioSection containerClass={containerClass} />
        <ContactSection
          containerClass={containerClass}
          businessStatus={businessStatus}
        />
      </main>

      <Footer />
    </>
  );
}
