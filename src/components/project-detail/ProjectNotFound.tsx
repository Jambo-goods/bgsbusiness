
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-bgs-blue mb-4">Projet non trouvé</h1>
            <p className="text-bgs-blue/70 mb-6">
              Le projet que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link to="/projects" className="btn-primary inline-flex items-center">
              <ArrowLeft size={18} className="mr-2" />
              Retour aux projets
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
