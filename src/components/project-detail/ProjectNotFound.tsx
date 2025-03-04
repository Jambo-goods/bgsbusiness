
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, AlertTriangle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={36} className="text-bgs-orange" />
            </div>
            <h1 className="text-3xl font-bold text-bgs-blue mb-4">Projet non trouvé</h1>
            <p className="text-bgs-blue/70 mb-8 text-lg">
              Le projet que vous recherchez n'existe pas ou a été supprimé. Veuillez vérifier l'URL ou explorer nos autres opportunités d'investissement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/projects" className="btn-primary inline-flex items-center justify-center">
                <ArrowLeft size={18} className="mr-2" />
                Retour aux projets
              </Link>
              <Link to="/" className="btn-secondary inline-flex items-center justify-center">
                <Search size={18} className="mr-2" />
                Découvrir d'autres opportunités
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
