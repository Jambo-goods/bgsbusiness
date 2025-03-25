
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import HeaderSection from "@/components/ui/HeaderSection";
import Footer from "@/components/layout/Footer";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import CallToAction from "@/components/home/CallToAction";

export default function Index() {
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("Index page loaded and visible");
  }, []);
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main>
        <HeaderSection 
          title="Investissez dans des actifs physiques en Afrique"
          subtitle="BGS Business Club vous permet d'acheter des machines et équipements pour les louer à des entreprises africaines et percevoir une part des bénéfices générés."
        />
        
        {/* Featured Projects */}
        <FeaturedProjects />
        
        {/* How it works */}
        <HowItWorksSection />
        
        {/* Benefits */}
        <BenefitsSection />
        
        {/* CTA */}
        <CallToAction />
        
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
