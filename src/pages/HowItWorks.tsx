
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/howItWorks/HeroSection";
import InvestmentProcess from "@/components/howItWorks/InvestmentProcess";
import BusinessModel from "@/components/howItWorks/BusinessModel";
import FAQ from "@/components/howItWorks/FAQ";

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Comment ça marche | BGS Business Club";
  }, []);
  
  return (
    <div className="min-h-screen page-transition bg-white">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Hero section */}
        <HeroSection />
        
        {/* Investment Process */}
        <InvestmentProcess />
        
        {/* Business model explanation */}
        <BusinessModel />
        
        {/* FAQ section */}
        <FAQ />
      </main>
      
      <Footer />
    </div>
  );
}
