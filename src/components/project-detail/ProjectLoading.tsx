
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
            <div className="glass-card p-6 w-full max-w-md text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute w-full h-full border-4 border-bgs-blue/5 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-t-bgs-orange border-r-bgs-orange border-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-bgs-blue">Chargement du projet</h3>
              <p className="text-sm text-bgs-blue/70">
                Nous récupérons les informations détaillées du projet...
              </p>
              
              <div className="space-y-3 mt-6">
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
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
