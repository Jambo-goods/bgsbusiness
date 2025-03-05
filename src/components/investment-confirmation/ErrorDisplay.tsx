
import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Erreur</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux projets
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
