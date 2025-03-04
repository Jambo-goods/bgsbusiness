
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen page-transition bg-gray-50">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="glass-card p-8 w-full max-w-md text-center space-y-6 animate-pulse">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute w-full h-full border-4 border-bgs-blue/5 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-t-bgs-orange border-r-bgs-orange border-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-semibold text-bgs-blue">Chargement du projet</h3>
              <p className="text-bgs-blue/70 max-w-md">
                Nous récupérons les informations détaillées du projet et préparons votre expérience d'investissement. Merci de patienter un instant...
              </p>
              
              <div className="space-y-4 mt-8">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
