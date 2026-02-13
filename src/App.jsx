import Footer from "./components/layout/Footer";
import TopNav from "./components/layout/TopNav";
import { useBusinessStatus } from "./hooks/useBusinessStatus";
import ContactSection from "./sections/ContactSection";
import HeroSection from "./sections/HeroSection";
import PortfolioSection from "./sections/PortfolioSection";
import ServicesSection from "./sections/ServicesSection";

const baseUrl = import.meta.env.BASE_URL;
const image1 = `${baseUrl}assets/images/1.jpg`;
const image2 = `${baseUrl}assets/images/2.jpg`;
const image3 = `${baseUrl}assets/images/3.jpg`;
const containerClass = "mx-auto w-[min(1120px,calc(100%-2rem))] max-[760px]:w-[min(1120px,calc(100%-1.2rem))]";

export default function App() {
  const businessStatus = useBusinessStatus();

  return (
    <>
      <TopNav containerClass={containerClass} />

      <main id="home" className="bg-[#212529] text-slate-50">
        <HeroSection containerClass={containerClass} backgroundImageUrl={image2} />
        <ServicesSection containerClass={containerClass} />
        <PortfolioSection containerClass={containerClass} />
        <ContactSection
          containerClass={containerClass}
          image1={image1}
          image2={image2}
          image3={image3}
          businessStatus={businessStatus}
        />
      </main>

      <Footer />
    </>
  );
}
