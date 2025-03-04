
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute w-full h-full border-4 border-bgs-blue/10 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-t-bgs-orange border-l-bgs-orange border-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-bgs-blue">Chargement du projet</h3>
              <p className="text-bgs-blue/70 max-w-md">
                Nous récupérons les informations détaillées du projet. Merci de patienter un instant...
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
