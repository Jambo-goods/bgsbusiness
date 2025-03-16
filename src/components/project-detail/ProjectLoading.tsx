
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
              <h3 className="text-xl font-semibold text-bgs-blue">Chargement du projet</h3>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-bgs-blue text-white rounded hover:bg-bgs-blue/90"
                >
                  Rafraîchir la page
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
