
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
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-bgs-blue/20 border-t-bgs-blue rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-bgs-blue/70">Chargement du projet...</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
